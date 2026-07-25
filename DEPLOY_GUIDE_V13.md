# Deploy Vercel — KIYVO v13

## Pré-requisitos

- Node compatível com Next **14.2.29**.
- Projeto Supabase migrado conforme `supabase/README.md`.
- Variáveis de ambiente cadastradas na Vercel (Production, Preview e Development conforme necessário).

## Variáveis

Obrigatórias para backend real: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.

Opcionais: Stripe (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`), PIX (`KIYVO_PIX_KEY`, `KIYVO_PIX_HOLDER`), e-mail (`RESEND_API_KEY`) e IA (`GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`). Veja `.env.example`.

## Verificação de release

```bash
npm install next@14.2.29 --save-exact
./node_modules/.bin/next build
npm test
```

Após o deploy, valide:

- `GET /api/health` retorna `status: ok` ou `degraded` com motivo de configuração, sem segredos.
- `/checkout` sem `kiyvo_session` redireciona para `/login?redirect=%2Fcheckout`.
- Um token de download expira em 7 dias e limita 5 downloads.
- O webhook Stripe aponta para `https://SEU_DOMINIO/api/stripe/webhook`.

## Segurança operacional

Mantenha o bucket `delivery` privado. A rota de entrega usa service role somente no servidor, valida o token e faz streaming sem URL pública. Rotacione imediatamente qualquer segredo exposto.
