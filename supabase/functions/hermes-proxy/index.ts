// supabase/functions/hermes-proxy/index.ts
// Proxy SEGURO entre o front-end (React) e o Hermes Agent (Docker :8642).
//
// - Valida o JWT do Supabase enviado pelo cliente (supabase.auth.getUser).
// - Lê segredos (URL do Hermes + API key) das variáveis de ambiente do Supabase.
// - Encaminha a requisição para o container do Hermes e retorna stream (SSE) ou JSON.
// - CORS restrito ao domínio do site (whitelist por origem).
//
// Deploy: supabase functions deploy hermes-proxy
// Secrets: supabase secrets set HERMES_URL=http://SEU_IP:8642 HERMES_API_KEY=xxx SITE_ORIGIN=https://seu-site.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const HERMES_URL = (Deno.env.get('HERMES_URL') ?? 'http://SEU_IP_DO_DOCKER:8642').replace(/\/$/, '')
const HERMES_API_KEY = Deno.env.get('HERMES_API_KEY') ?? ''
const SITE_ORIGIN = Deno.env.get('SITE_ORIGIN') ?? 'https://kiyvo.com.br'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

function corsHeaders(origin: string | null): HeadersInit {
  // Whitelist estrita: só a origem do site recebe CORS aberto.
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

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin')
  const cors = corsHeaders(origin)

  // Preflight CORS
  if (req.method === 'OPTIONS') return new Response('ok', { status: 204, headers: cors })
  if (req.method !== 'POST') return json({ error: 'Método não permitido' }, 405, cors)

  try {
    // 1) Validar JWT do Supabase enviado pelo front-end
    const auth = req.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (!token) return json({ error: 'Não autenticado' }, 401, cors)

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: userData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !userData.user) {
      return json({ error: 'Token inválido ou expirado' }, 401, cors)
    }

    // 2) Corpo da requisição (formato OpenAI-compatible esperado pelo Hermes)
    const payload = await req.json()
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Corpo da requisição inválido' }, 400, cors)
    }

    // 3) Encaminhar para o Hermes Agent (sem expor a API key no front-end)
    const wantStream = Boolean((payload as { stream?: boolean }).stream)
    const upstream = await fetch(`${HERMES_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${HERMES_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) {
      const detail = await upstream.text()
      return json({ error: 'Falha ao chamar o Hermes Agent', detail }, upstream.status, cors)
    }

    // 4) Retornar stream (SSE) ou JSON para o front-end
    if (wantStream) {
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
