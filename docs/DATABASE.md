# 🗄️ KIYVO — Setup do Banco de Dados (Supabase)

## Ordem de Execução

Execute os arquivos SQL no **SQL Editor** do Supabase Dashboard, nesta ordem:

### 1. Schema Principal
```sql
-- Execute o conteúdo de: supabase/schema_v6.sql
-- Este arquivo contém TODAS as tabelas, enums, triggers, RLS, funções e índices
```

### 2. Verificação
Após executar, verifique se as tabelas foram criadas:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deve retornar 21+ tabelas.

## Tabelas Criadas

| Tabela | Uso |
|--------|-----|
| `profiles` | Perfil de usuário (role, kyc, 2FA, plano) |
| `vendors` | Dados do vendedor (loja, Stripe, comissão) |
| `products` | Produtos digitais |
| `product_images` | Imagens dos produtos |
| `product_variants` | Variações de produto |
| `categories` | Categorias de produto |
| `orders` | Pedidos com escrow |
| `order_items` | Itens do pedido |
| `digital_inventory` | Cofre Digital — estoque de chaves/arquivos |
| `disputes` | Disputas e chargebacks |
| `reviews` | Avaliações de produto |
| `favorites` | Lista de desejos |
| `notifications` | Notificações in-app e email |
| `chat_conversations` | Conversas entre buyer/vendor |
| `chat_messages` | Mensagens do chat |
| `affiliates` | Programa de afiliados |
| `affiliate_conversions` | Conversões de afiliados |
| `audit_log` | Log de auditoria (todas as ações) |
| `coupons` | Cupons de desconto |
| `rate_limit_tracking` | Rate limiting persistente |
| `blog_posts` | Posts do blog |

## Storage Buckets

Crie no Supabase Dashboard → Storage:

| Bucket | Acesso | Uso |
|--------|--------|-----|
| `product-images` | Público | Imagens de produto |
| `avatars` | Público | Avatares de usuário |
| `digital-files` | Privado | Arquivos digitais vendidos (signed URL only) |
| `vendor-docs` | Privado | Documentos KYC do vendedor |

## RLS (Row Level Security)

Todas as tabelas têm RLS habilitado. Políticas principais:

- **profiles**: usuário pode ler próprio perfil, admin pode ler todos
- **products**: published são públicos, draft só vendor dono
- **orders**: buyer e vendor podem ler suas orders
- **digital_inventory**: só vendor dono e admin
- **chat_messages**: só participantes da conversa
- **audit_log**: só admin pode ler

## Funções PostgreSQL

| Função | Uso |
|--------|-----|
| `generate_order_number()` | Gera número sequencial de pedido |
| `increment_affiliate_earnings()` | Incrementa ganhos do afiliado |
| `update_updated_at_column()` | Trigger para updated_at automático |

## Índices

- `products_fts_idx` — Full Text Search em produtos (GIN index)
- `idx_products_vendor` — Busca por vendor_id
- `idx_products_category` — Busca por category_id
- `idx_orders_buyer` — Busca por buyer_id
- `idx_chat_messages_conversation` — Busca por conversation_id
