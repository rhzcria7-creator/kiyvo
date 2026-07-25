# Changelog v13.0

## Backend e entrega

- Adicionado `DeliveryService` com token criptograficamente aleatório, validade padrão de 7 dias, máximo de 5 downloads, revogação e vínculo opcional por IP.
- Adicionada rota segura `GET /api/v1/delivery/[token]`, que valida e consome o token atomicamente antes do stream no bucket privado `delivery`.
- Adicionado schema idempotente `00_MASTER_SCHEMA.sql`: purchases, delivery_assets, download_tokens, ledger_entries, RLS, índices e função atômica de consumo.
- Adicionado guia de migração Supabase e políticas de Storage.

## Financeiro e segurança

- Adicionada função oficial `calculateFee` sem teto: Free 8% + R$0,50, Plus 6,5% + R$0,40, Pro 5% + R$0,30 e Vendor Pro 3% + R$0,20; Free e Vendor Pro são isentos nas primeiras 5.000 vendas.
- Middleware agora preserva o destino protegido em `?redirect=` e libera apenas o endpoint tokenizado de entrega.
- `/api/health` agora testa Supabase e Stripe de modo seguro, sem retornar chaves ou detalhes internos.

## Documentação

- Adicionados `TODO_LIST_DONO.md`, `DEPLOY_GUIDE_V13.md` e este changelog.
