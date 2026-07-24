// supabase/functions/hermes-proxy/index.ts
// -----------------------------------------------------------------------------
// Proxy SEGURO entre o front-end (React) e o Hermes Agent (Docker :8642).
//
// - Valida o JWT do Supabase OU o ID token do Firebase enviado pelo front-end.
// - Lê segredos (URL do Hermes + API key) das variáveis de ambiente do Supabase.
// - Encaminha a requisição para o container do Hermes e retorna stream (SSE)
//   ou JSON para o front-end (formato OpenAI-compatible /v1/chat/completions).
// - CORS restrito ao domínio do site (whitelist por origem).
//
// Deploy:   supabase functions deploy hermes-proxy --no-verify-jwt
// Secrets:  supabase secrets set \
//             HERMES_URL="http://SEU_IP:8642" \
//             HERMES_API_KEY="sk-..." \
//             SITE_ORIGIN="https://kiyvo.com.br" \
//             FIREBASE_PROJECT_ID="kiyvo-66d75"
//
// Observação: --no-verify-jwt é usado porque a validação é feita DENTRO da
// função (Supabase OU Firebase), e não pelo gateway padrão do Supabase.
// -----------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---- Configuração (variáveis de ambiente do Supabase) ------------------------
const HERMES_URL = (Deno.env.get('HERMES_URL') ?? 'http://SEU_IP_DO_DOCKER:8642').replace(/\/+$/, '')
const HERMES_API_KEY = Deno.env.get('HERMES_API_KEY') ?? ''
const SITE_ORIGIN = Deno.env.get('SITE_ORIGIN') ?? 'https://kiyvo.com.br'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? 'kiyvo-66d75'

const FIREBASE_CERT_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
const HERMES_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutos

// ---- CORS --------------------------------------------------------------------
function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin === SITE_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowed ? (origin as string) : SITE_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function json(body: unknown, status = 200, extra: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  })
}

// ---- Verificação do ID token do Firebase (WebCrypto, sem dependências) -------
interface FirebaseCertCache {
  keys: Record<string, CryptoKey>
  fetchedAt: number
}

let certCache: FirebaseCertCache | null = null

async function getFirebasePublicKeys(): Promise<Record<string, CryptoKey>> {
  const now = Date.now()
  if (certCache && now - certCache.fetchedAt < 60 * 60 * 1000) return certCache.keys

  const res = await fetch(FIREBASE_CERT_URL)
  if (!res.ok) throw new Error('Falha ao buscar chaves públicas do Firebase')
  const certs = (await res.json()) as Record<string, string>

  const keys: Record<string, CryptoKey> = {}
  for (const [kid, pem] of Object.entries(certs)) {
    keys[kid] = await importX509(pem)
  }
  certCache = { keys, fetchedAt: now }
  return keys
}

async function importX509(pem: string): Promise<CryptoKey> {
  const clean = pem
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\s+/g, '')
  const der = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'spki',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )
}

function b64urlDecode(input: string): Uint8Array {
  const pad = '='.repeat((4 - (input.length % 4)) % 4)
  const b = (input + pad).replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
}

function decodeJwt(token: string): DecodedJwt {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Token malformado')
  const [h, p] = parts
  const decode = (s: string): Record<string, unknown> =>
    JSON.parse(new TextDecoder().decode(b64urlDecode(s)))
  return { header: decode(h as string), payload: decode(p as string) }
}

async function verifyFirebaseToken(token: string): Promise<string | null> {
  try {
    const { header, payload } = decodeJwt(token)

    if (payload.aud !== FIREBASE_PROJECT_ID) return null
    if (payload.iss !== `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`) return null
    const exp = payload.exp
    if (typeof exp !== 'number' || exp * 1000 < Date.now()) return null

    const keys = await getFirebasePublicKeys()
    const kid = header.kid
    const key = kid ? keys[kid as string] : undefined
    if (!key) return null

    const raw = `${token.split('.')[0]}.${token.split('.')[1]}`
    const data = new TextEncoder().encode(raw)
    const sig = b64urlDecode(token.split('.')[2] as string)
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, data)
    return ok ? ((payload.sub as string) ?? null) : null
  } catch {
    return null
  }
}

// ---- Orquestração de autenticação -------------------------------------------
interface AuthResult {
  userId: string | null
}

async function authorize(req: Request, body: { firebaseToken?: unknown }): Promise<AuthResult> {
  // 1) Tenta JWT do Supabase (caminho primário usado pelo supabase-js).
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      })
      const { data, error } = await supabase.auth.getUser(token)
      if (!error && data.user) return { userId: data.user.id }
    } catch {
      // cai no fallback do Firebase abaixo
    }
  }

  // 2) Fallback: ID token do Firebase enviado no corpo da requisição.
  const fbToken = typeof body.firebaseToken === 'string' ? body.firebaseToken : ''
  if (fbToken) {
    const uid = await verifyFirebaseToken(fbToken)
    if (uid) return { userId: uid }
  }

  return { userId: null }
}

// ---- Handler -----------------------------------------------------------------
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 204, headers: cors })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido' }, 405, cors)
  }

  try {
    const payload = (await req.json()) as Record<string, unknown>
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Corpo da requisição inválido' }, 400, cors)
    }

    // Validação de autenticação (Supabase OU Firebase).
    const { userId } = await authorize(req, payload)
    if (!userId) {
      return json({ error: 'Não autenticado: token inválido ou expirado' }, 401, cors)
    }

    // Proteção simples: limita o tamanho do histórico enviado ao Hermes.
    const incomingMessages = Array.isArray(payload.messages) ? payload.messages : []
    if (incomingMessages.length > 100) {
      return json({ error: 'Histórico muito longo' }, 413, cors)
    }

    // Encaminha para o Hermes Agent (a API key NUNCA sai do servidor).
    const wantStream = Boolean(payload.stream)
    const upstream = await fetch(`${HERMES_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HERMES_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(HERMES_TIMEOUT_MS),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      return json(
        { error: 'Falha ao chamar o Hermes Agent', detail: detail.slice(0, 1000) },
        upstream.status,
        cors,
      )
    }

    // Stream (SSE) ou JSON de volta ao front-end.
    if (wantStream && upstream.body) {
      return new Response(upstream.body, {
        status: 200,
        headers: {
          ...cors,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      })
    }

    const data = await upstream.json()
    return json(data, 200, cors)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno no proxy'
    return json({ error: message }, 500, cors)
  }
})
