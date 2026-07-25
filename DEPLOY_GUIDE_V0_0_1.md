# Deploy KIYVO v0.0.1

1. No Supabase, execute primeiro `KIYVO_V10_COMPLETE.sql` para compatibilidade atual, depois `00_MASTER_V0_0_1.sql`.
2. Crie buckets privados `documents` e `delivery`; deixe apenas `avatars` e `product-images` públicos.
3. Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`. Para cobrança, adicione as variáveis Stripe; nunca exponha secrets no navegador.
4. Valide antes do deploy:

```bash
npm install next@14.2.29 --save-exact
./node_modules/.bin/next build
npm test -- --runInBand
```

5. Verifique `/api/health`, redirecionamento de `/checkout`, webhook Stripe assinado e token de entrega em ambiente de teste.

O modo demo continua com proteções locais, mas pagamentos/Storage/escrow reais exigem as credenciais acima.
