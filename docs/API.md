# 📡 KIYVO API v1 — Documentação

## Autenticação

Todas as APIs protegidas requerem sessão Supabase válida via cookies.

```
Cookie: sb-<ref>-auth-token=<jwt>
```

### Helpers disponíveis

| Helper | Uso | Retorna |
|--------|-----|---------|
| `requireAuth()` | Rotas autenticadas | user, supabase, adminClient |
| `requireAdmin()` | Rotas admin | user (is_admin=true), supabase, adminClient |
| `requireVendor()` | Rotas de vendedor | user (role=vendor/admin), supabase, adminClient |
| `requireOwnerOrAdmin(resourceUserId)` | Recursos do próprio usuário | user (owner ou admin), supabase, adminClient |

---

## Endpoints

### 🔐 2FA

#### POST `/api/v1/2fa/setup`
Inicia configuração do 2FA. Retorna URI para QR Code e códigos de backup.

**Auth**: requerida

**Response**:
```json
{
  "success": true,
  "uri": "otpauth://totp/KIYVO:user@email.com?secret=...",
  "backupCodes": ["ABCD-EFGH", "IJKL-MNOP", ...]
}
```

#### POST `/api/v1/2fa/verify`
Verifica código TOTP ou backup. Ativa 2FA se purpose=setup.

**Auth**: requerida

**Body**:
```json
{
  "code": "123456",
  "purpose": "setup" | "login"
}
```

#### POST `/api/v1/2fa/disable`
Desativa 2FA. Requer código TOTP ou backup para confirmar.

**Auth**: requerida

**Body**:
```json
{
  "code": "123456"
}
```

#### POST `/api/v1/2fa/backup-codes`
Gera novos códigos de backup. Invalida os anteriores.

**Auth**: requerida

**Body**:
```json
{
  "totp_code": "123456"
}
```

---

### 💳 Checkout

#### POST `/api/checkout`
Cria Stripe Checkout Session com Escrow.

**Auth**: requerida

**Body**:
```json
{
  "product_id": "uuid",
  "variant_id": "uuid?",
  "affiliate_code": "string?",
  "success_url": "string?",
  "cancel_url": "string?"
}
```

**Response**:
```json
{
  "url": "https://checkout.stripe.com/...",
  "session_id": "cs_...",
  "escrow": true,
  "breakdown": {
    "subtotal": 99.90,
    "platformFee": 9.99,
    "affiliateFee": 0,
    "vendorNet": 89.91
  }
}
```

---

### 💬 Chat

#### GET `/api/v1/chat/conversations`
Lista conversas do usuário autenticado.

#### GET `/api/v1/chat/messages?conversation_id=uuid&limit=50`
Busca mensagens de uma conversa. Marca como lidas.

#### POST `/api/v1/chat/messages`
Envia mensagem. Cria notificação para o destinatário.

**Body**:
```json
{
  "conversation_id": "uuid",
  "content": "Olá, tudo bem?",
  "message_type": "text"
}
```

---

### 📤 Upload

#### POST `/api/v1/upload/image`
Upload de imagem de produto. **Auth**: vendor

**Form Data**:
- `file`: File (JPEG, PNG, WebP, GIF — máx 5MB)
- `product_id`: string (UUID)
- `index`: number (posição da imagem)

#### POST `/api/v1/upload/avatar`
Upload de avatar. **Auth**: qualquer usuário

**Form Data**:
- `file`: File (JPEG, PNG, WebP, GIF — máx 5MB)

#### POST `/api/v1/upload/digital`
Upload de arquivo digital. **Auth**: vendor

**Form Data**:
- `file`: File (máx 500MB)
- `product_id`: string (UUID)

---

### 🔔 Notificações

#### GET `/api/v1/notifications?limit=20&offset=0&unread_only=false`
Lista notificações do usuário.

#### PATCH `/api/v1/notifications`
Marca notificações como lidas.

**Body**:
```json
{ "notification_ids": ["uuid1", "uuid2"] }
// ou
{ "mark_all_read": true }
```

#### PUT `/api/v1/notifications`
Atualiza preferências de notificação.

**Body**:
```json
{
  "email_notifications": true,
  "push_notifications": false
}
```

---

### 🛡️ Admin

#### GET `/api/v1/admin/dashboard`
Dashboard com estatísticas. **Auth**: admin

#### GET `/api/v1/admin/disputes`
Lista disputas. **Auth**: admin

#### GET `/api/v1/admin/rate-limits`
Lista IPs/identifiers bloqueados. **Auth**: admin

#### DELETE `/api/v1/admin/rate-limits`
Desbloqueia identifier. **Auth**: admin

**Body**:
```json
{ "identifier": "192.168.1.1", "action": "login" }
```

#### POST `/api/v1/admin/rate-limits`
Limpa entradas expiradas. **Auth**: admin

---

### ❤️ Health Check

#### GET `/api/health`
Status do sistema com checks de Supabase, Stripe, Auth e Webhook.

---

## Rate Limiting

| Endpoint | Limite | Janela |
|----------|--------|--------|
| Global | 200 req/min | 60s |
| API routes | 30 req/min | 60s |
| Auth (login/cadastro) | 5 req/5min | 300s |
| Checkout | 3 req/5min | 300s |
| 2FA verify | 5 req/5min | 300s |
| Chat messages | 30 req/min | 60s |

Auto-block após 3x o limite excedido na mesma janela.
