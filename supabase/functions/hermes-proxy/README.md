# Hermes Proxy — Integração segura do Hermes Agent (KIYVO)

Proxy seguro entre o front-end React e o **Hermes Agent** que roda em Docker na
porta `8642`. A API key do Hermes **nunca** chega ao navegador: ela vive nas
variáveis de ambiente da Supabase Edge Function.

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `supabase/functions/hermes-proxy/index.ts` | Edge Function (Deno). Valida o token (Supabase **ou** Firebase) e encaminha para o Hermes. |
| `hooks/useHermes.ts` | Hook React tipado: gerencia `messages`, `loading`, `error` e chama a Edge Function (JSON ou streaming). |
| `components/HermesChat.tsx` | UI de chat (Tailwind Dark Mode + Framer Motion). Só renderiza com `currentUser` do Firebase ativo. |

> Os três arquivos ficam **fora** do `tsconfig.json` do Next.js (excluídos do
> build principal) por design, para não quebrar o build do app. Eles são
> código autônomo (Deno + React) e devem ser copiados/importados conforme abaixo.

## 1. Deploy da Edge Function

```bash
# instale a CLI do Supabase e faça login
supabase login

# deploy (--no-verify-jwt: a validação é feita DENTRO da função)
supabase functions deploy hermes-proxy --no-verify-jwt

# segredos (NUNCA commite a HERMES_API_KEY)
supabase secrets set \
  HERMES_URL="http://SEU_IP_DO_DOCKER:8642" \
  HERMES_API_KEY="sk-xxxxxxxx" \
  SITE_ORIGIN="https://kiyvo.com.br" \
  FIREBASE_PROJECT_ID="kiyvo-66d75"
```

Variáveis lidas pela função (`Deno.env.get`):

- `HERMES_URL` — URL do container do Hermes (ex.: `http://10.0.0.5:8642`).
- `HERMES_API_KEY` — chave do Hermes Agent.
- `SITE_ORIGIN` — origem liberada no CORS (whitelist estrita).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — preenchidas automaticamente pela Supabase.
- `FIREBASE_PROJECT_ID` — usado para validar o ID token do Firebase.

## 2. Autenticação (fluxo duplo)

A função aceita **dois** métodos de autenticação:

1. **JWT do Supabase** — enviado automaticamente pelo `supabase-js` no header
   `Authorization: Bearer ...` (caminho primário quando o usuário loga via Supabase).
2. **ID token do Firebase** — enviado no corpo (`firebaseToken`) quando o usuário
   loga via Firebase. A função verifica a assinatura com as chaves públicas do
   Google (WebCrypto, sem dependências externas), `aud`, `iss` e `exp`.

Se nenhum dos dois for válido → `401`. Assim o chat fica protegido mesmo quando o
login é feito apenas no Firebase.

## 3. Uso no front-end

```tsx
'use client'
import { createClient } from '@supabase/supabase-js'
import { HermesChat } from '@/components/HermesChat'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export function SupportWidget() {
  return (
    <HermesChat
      supabase={supabase}
      assistantName="Kiya"   // exibido na UI (nunca "Hermes")
      stream                 // typing em tempo real (SSE)
    />
  )
}
```

O componente só aparece depois de `onAuthStateChanged` do Firebase confirmar um
`currentUser`. Sem login, mostra o CTA de bloqueio.

## 4. Segurança

- API key do Hermes: só no servidor (Edge Function).
- CORS: `Access-Control-Allow-Origin` fixo em `SITE_ORIGIN`.
- Timeout de 5 min por chamada ao Hermes (`AbortSignal.timeout`).
- Limite de 100 mensagens de histórico por requisição.
- Validação de token antes de qualquer chamada upstream.
- Streaming retornado como `text/event-stream` (formato OpenAI-compatible).
