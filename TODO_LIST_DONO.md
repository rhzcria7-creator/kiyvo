# Ações do dono — ativar produção KIYVO v13

O site continua utilizável no modo demo sem estas configurações. Para pagamentos, banco e downloads reais:

1. Crie um projeto Supabase em **South America (São Paulo)** com o nome `kiyvo`.
2. No SQL Editor, execute `supabase/KIYVO_V10_COMPLETE.sql` e depois `supabase/00_MASTER_SCHEMA.sql`.
3. Confira os buckets: `documents` (privado), `delivery` (privado), `avatars` (público), `product-images` (público).
4. Em Settings > API, copie URL, anon key e service role key.
5. Na Vercel, cadastre `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e `NEXT_PUBLIC_SITE_URL`.
6. Opcional Stripe: adicione `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`; crie webhook em `/api/stripe/webhook` para `checkout.session.completed` e `payment_intent.succeeded`.
7. Opcional PIX: configure `KIYVO_PIX_KEY` e `KIYVO_PIX_HOLDER`.
8. Opcional e-mail: cadastre `RESEND_API_KEY`. Gere `TOTP_ENCRYPTION_KEY` com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
9. Em Supabase Auth, defina Site URL e Redirect URLs do domínio Vercel.
10. Faça um pedido de teste: o endpoint de entrega é `/api/v1/delivery/[token]`; ele exige arquivo no bucket `delivery` e asset associado no banco.

Nunca coloque chaves service role, Stripe secret ou TOTP no frontend ou em commits.
