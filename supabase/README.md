# Supabase — execução segura KIYVO v13

1. Crie o projeto na região **South America (São Paulo)**.
2. Em **SQL Editor**, execute `KIYVO_V10_COMPLETE.sql` e depois `00_MASTER_SCHEMA.sql`.
3. Confira em Storage os buckets `documents` (privado), `delivery` (privado), `avatars` (público) e `product-images` (público).
4. Copie URL, anon key e service role key para `.env.local` e Vercel. A service role nunca pode ser exposta no navegador.
5. Em Auth > URL Configuration, defina a URL pública e seus redirects.

## Policies de Storage recomendadas

`delivery` é lido apenas pelo servidor: não crie policy de leitura pública. O endpoint `/api/v1/delivery/[token]` valida prazo, revogação, limite e IP antes de fazer streaming do arquivo.

Para documentos KYC, use a pasta do usuário e aplique:

```sql
create policy "kyc owner uploads" on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kyc owner reads" on storage.objects for select to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
```

## Verificação após migração

- `select * from public.download_tokens limit 1;`
- `select public.consume_download_token('00000000-0000-0000-0000-000000000000');`
- Faça upload de um arquivo no bucket privado `delivery` e associe o caminho a `delivery_assets`.

O app preserva o modo demo quando as chaves não estão configuradas.
