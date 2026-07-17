# CHANGELOG — Kiyvo

## [6.0.0] — 2026-07-17 — COLOSSO BRASIL: Cofre Digital + KYC + Gamificação

### 🔥 NOVAS FUNCIONALIDADES

#### Cofre Digital (VaultEngine)
- **VaultEngine v6.0** — Motor de encriptação AES-256-GCM para ativos digitais
- Encriptação/descriptação via Web Crypto API (AES-256-GCM com PBKDF2)
- Reserva atômica de assets via `SELECT ... FOR UPDATE SKIP LOCKED`
- Entrega decriptada APENAS após confirmação de pagamento (service_role)
- Bulk upload de ativos (até 500 itens por requisição)
- Estatísticas do Cofre por produto
- Liberação automática de reservas expiradas (30 min)

#### Fluxo KYC Completo (4 passos)
- Passo 1: CPF/CNPJ com máscara + validação algorítmica + BrasilAPI
- Passo 2: Upload de documento (frente/verso) → bucket privado `vendor-docs`
- Passo 3: Selfie com documento via webcam (MediaDevices API) ou upload
- Passo 4: Comprovante de residência + busca automática de CEP (ViaCEP)
- Bucket `vendor-docs`: vendedor NÃO pode ler após upload (anti-fraude)
- API `/api/v1/kyc/upload` com SHA-256 hash + auditoria

#### Gamificação de Vendedores (vendor_metrics)
- 5 níveis: Bronze (10%) → Prata (8%) → Ouro (6%) → Diamante (5%) → Platina (3%)
- Auto-upgrade via trigger quando `total_sales` atinge threshold
- Notificação automática ao subir de nível
- Comissão dinâmica refletida no `current_commission_rate`

#### PIX + Escrow Aprimorado
- Campos `pix_code`, `pix_qrcode_url`, `pix_expires_at` na tabela orders
- `escrow_released_at` + `escrow_release_scheduled_at` para timeline
- `auto_confirm_at` para auto-confirmação após 7 dias
- Função `auto_confirm_expired_orders()` para pg_cron

### 📄 NOVAS PÁGINAS (107 total)

#### Área do Comprador (/buyer)
- `/buyer/dashboard` — Painel com stats, pedidos recentes, ações rápidas
- `/buyer/library` — Biblioteca digital (revelar/copiar keys com Framer Motion)
- `/buyer/orders` — Lista de pedidos com status coloridos
- `/buyer/orders/[id]` — Detalhes + progress bar + revelar assets + disputa
- `/buyer/disputes` — Central de disputas com Proteção Kiyvo
- `/buyer/favorites` — Lista de desejos
- `/buyer/settings` — 2FA, senha, zona de perigo (excluir conta)

#### Área do Vendedor (/vendor)
- `/vendor/dashboard` — Painel com receita, lucro, nível, vendas recentes
- `/vendor/products` — Catálogo com badge do Cofre (qtd de assets)
- `/vendor/inventory/[id]` — Gestão do Cofre Digital (bulk upload TXT)
- `/vendor/finance` — Saldo disponível vs retido (Escrow) + saque
- `/vendor/chat` — Inbox com compradores (Supabase Realtime ready)
- `/vendor/onboarding/kyc` — Fluxo KYC 4 passos com webcam

#### Perfil Público
- `/c/[slug]` — Vitrines dinâmicas (Jogos, Software, Cursos...)
- `/p/[slug]` — Página do produto (galeria, preço, comprar REAL, reviews, selos)
- `/v/[slug]` — Perfil do vendedor (emblemas, stats, produtos)

#### Institucional (SEO)
- `/institucional/protecao-comprador` — Explica Escrow + 7 dias
- `/institucional/termos` — Termos de Uso completos (LGPD-ready)
- `/institucional/privacidade` — Política de Privacidade (LGPD)
- `/institucional/tarifas` — Tabela comparativa Kiyvo vs concorrência
- `/institucional/como-funciona` — Landing explicativa comprador/vendedor

#### Admin
- `/admin/kyc-review` — Aprovar/rejeitar documentos KYC
- `/admin/disputes` — Mediação de conflitos

#### Afiliados
- `/affiliate/dashboard` — Link de referência, cliques, conversões, comissões

### 🔌 NOVAS APIs (17 total)

- `GET /api/v1/vault?productId=xxx` — Lista assets do Cofre (sem dados encriptados!)
- `POST /api/v1/vault/bulk` — Bulk upload de ativos encriptados
- `GET /api/v1/vault/deliver?orderItemId=xxx` — Entrega decriptada (apenas comprador)
- `GET /api/v1/vendors?slug=xxx` — Perfil público do vendedor
- `POST /api/v1/vendors` — Cria vendor + Stripe Connect account
- `POST /api/v1/kyc/upload` — Upload de documentos KYC (bucket privado)

### 🗃️ SCHEMA V6 (supabase/schema_v6.sql)
- 12 novas tabelas: `digital_inventory`, `vendor_metrics`, `kyc_documents`, `escrow_timeline`, `chat_conversations`, `chat_messages`, `favorites`, `security_events`, `rate_limit_tracking`, `coupon_usage`
- 5 novos enums: `kyc_status`, `inventory_asset_status`, `vendor_level`, `payment_method`, `asset_type`
- Campos PIX na tabela `orders`
- Trigger de auto-upgrade de nível do vendor
- Função `reserve_inventory_asset()` (FOR UPDATE SKIP LOCKED)
- Função `mark_asset_sold()` (após pagamento)
- Função `auto_confirm_expired_orders()` (pg_cron)
- Storage policies para `vendor-docs` (privado, anti-fraude)
- RLS bancário em TODAS as novas tabelas

### 🏗️ DOMAIN LAYER (7 engines)
- `VaultEngine.ts` — 500+ linhas — Cofre Digital com AES-256-GCM
- `FeeEngine.ts` — 481 linhas — Motor de Taxas
- `LedgerEngine.ts` — 646 linhas — Partidas Dobradas
- `OrderStateMachine.ts` — 321 linhas — Máquina de Estados
- `DeliveryEngine.ts` — 502 linhas — Motor de Entrega
- `CartStore.ts` — 179 linhas — Zustand + persist

### 📊 BUILD
- ✅ 107 páginas, 17 APIs, 331 arquivos TypeScript
- ✅ Next.js 14.2.29 (pinado)
- ✅ Zero erros de compilação
- ✅ 119 rotas estáticas geradas

---

## [5.0.0] — 2026-07-17 — ARQUITETURA BANCÁRIA

### 🔥 MUDANÇA ESTRUTURAL: Vendor Motor + Stripe Connect + Escrow

Esta versão MUTA a arquitetura de "vendedores genéricos" para o modelo **Vendor (Loja)** com Stripe Connect e sistema de **Escrow** (custódia de fundos).

### 🏗️ Schema v5 — Banco de Dados Definitivo (`supabase/schema_v5.sql`)

**21 tabelas core com RLS bancário:**

| Tabela | Função | RLS |
|--------|--------|-----|
| `profiles` | Identidade com `role` (buyer/vendor/admin), `trust_score` | Leitura pública, escrita próprio |
| `wallets` | Cache visual (fonte da verdade = Stripe) | **Só dono lê, NINGUÉM escreve direto** |
| `vendors` | Lojas com `stripe_account_id`, `commission_rate` | Leitura pública, escrita dono |
| `categories` | Auto-referencing (subcategorias) | Pública |
| `products` | Com `search_vector` (tsvector FTS) | **Publicado = público, escrita = vendor dono** |
| `product_variants` | SKUs com `attributes` JSONB | Vendor dono |
| `product_images` | Storage URLs | Público leitura, vendor escrita |
| `orders` | Escrow via `stripe_payment_intent_id` | **Buyer vê buyer_id, Vendor vê vendor_id** |
| `order_items` | Com `digital_delivery_url`, `license_key` | Participantes do pedido |
| `reviews` | Avaliações verificadas (1 por compra) | Público leitura, buyer cria |
| `affiliates` | Código de referência (ex: JOHN2026) | Próprio lê/escreve |
| `affiliate_clicks` | Tracking profundo | Insert livre (incl. anônimos) |
| `affiliate_conversions` | Comissões (pending/cleared/cancelled) | Próprio |
| `download_tokens` | URLs assinadas com expiração + limite | Buyer dono |
| `notifications` | Push + in-app | Próprio |
| `disputes` | Com evidence (Storage URLs) | Participantes + admin |
| `coupons` | Global ou por vendor | Público leitura |
| `audit_log` | Imutável | **Só admin** |
| `ledger_accounts` | 10 contas seed | **Só admin** |
| `ledger_transactions` | Partidas dobradas | **Só admin** |
| `ledger_entries` | Débito/Crédito | **Só admin** |

**Enums:** `user_role`, `product_status`, `order_status`, `affiliate_conv_status`, `verification_status`

**Triggers:** 
- Auto-create profile on signup
- Auto-create wallet on profile
- Auto-update `search_vector` via `tsvector_update_trigger`
- Auto-update `updated_at`

**Índice GIN** em `products.search_vector` para Full Text Search O(log n)

**20 categorias seed** com emojis

### 💳 Stripe Connect — Motor Financeiro Real (`src/lib/stripe/connect.ts`)

- **`createConnectAccount()`** — Cria Stripe Express Account para vendor
- **`createOnboardingLink()`** — Link de onboarding Stripe (KYC bancário)
- **`createDashboardLink()`** — Acesso ao dashboard Stripe do vendor
- **`createEscrowCheckout()`** — Checkout com CUSTÓDIA:
  - Dinheiro vai para conta da plataforma
  - `transfer_data` NÃO é automático
  - Fundos ficam em HOLD até buyer confirmar
  - Metadata: `escrow: 'true'`, `platform_fee_cents`, `vendor_net_cents`
- **`transferToVendor()`** — Libera fundos após confirmação do comprador
- **`refundAndReverse()`** — Reembolso com reversão
- **`checkOnboardingStatus()`** — Verifica se vendor completou KYC
- **`verifyWebhookSignature()`** — Verificação criptográfica de webhook
- **`calculatePaymentSplit()`** — Calcula platform_fee, vendor_net, affiliate_fee, stripe_fee

### 📡 Webhook Handler v2 (`src/app/api/stripe/webhook/route.ts`)

Eventos processados:
- `checkout.session.completed` → Cria order + order_items + affiliate_conversion + audit_log + notifications
- `checkout.session.expired` → Marca order como pending_payment
- `charge.dispute.created` → Marca order como disputed + cria dispute record + notifica vendor
- `charge.refunded` → Marca order como refunded
- `transfer.created` → Registra payout no audit_log

### 📄 Novas Páginas (7)

| Página | Função |
|--------|--------|
| `/cart` | Carrinho multi-vendedor com FeeEngine |
| `/fees` | Landing de taxas com exemplos e tabela comparativa |
| `/fees/calculator` | Simulador interativo de taxas |
| `/library` | Biblioteca do comprador (downloads, chaves, acessos) |
| `/download/[token]` | Download seguro com validação de token |
| `/store/[slug]` | Página da loja do vendor com produtos |
| `/vendor/onboarding` | Onboarding 3 etapas (criar loja → Stripe → vender) |

### 📡 Novas APIs (2)

| Rota | Método | Função |
|------|--------|--------|
| `/api/v1/fees/simulate` | GET/POST | Simulação de taxas com FeeEngine |
| `/api/v1/search` | GET | Full Text Search com tsvector + filtros + paginação |

### 🏗️ Domain Layer (5 motores)

| Motor | Arquivo | Linhas |
|-------|---------|--------|
| FeeEngine | `src/domain/fees/FeeEngine.ts` | 481 |
| LedgerEngine | `src/domain/ledger/LedgerEngine.ts` | 646 |
| OrderStateMachine | `src/domain/orders/OrderStateMachine.ts` | 321 |
| DeliveryEngine | `src/domain/delivery/DeliveryEngine.ts` | 502 |
| CartStore | `src/domain/cart/CartStore.ts` | 179 |

### ✅ BUILD: PASSA SEM ERROS
- 83 páginas
- 12 API routes
- 301 TS/TSX files
- Next.js 14.2.29

### 📋 PRÓXIMOS PASSOS CRÍTICOS

1. **Executar `schema_v5.sql` no Supabase** — Todo o banco depende disso
2. **Configurar Stripe Webhook** — `STRIPE_WEBHOOK_SECRET` no `.env.local`
3. **Configurar Stripe Connect** — Ativar Connect no dashboard Stripe
4. **Criar Storage Buckets** — `product-images` (público) + `digital-files` (privado)
5. **Wire APIs ao Supabase real** — Substituir mock data por queries com RLS

## [4.0.0] — 2026-07-17
- Domain Layer (FeeEngine, LedgerEngine, OrderStateMachine, DeliveryEngine, CartStore)
- Fee simulator, cart, library, download pages
- Schema expansion v4 (+47 tabelas)

## [3.1.0] — 2026-07-16
- 76 páginas, 10 APIs, Supabase auth, Stripe checkout, security suite v2.0

## [1.0.0] — 2026-07-14
- Projeto inicial Next.js 14 + design system + mock data
