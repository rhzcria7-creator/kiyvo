# 🔐 KIYVO — Guia de Configuração das Credenciais

## ✅ O que já está configurado

| Item | Status |
|---|---|
| Supabase URL | ✅ `https://ytiyqkliojawihfnlwzo.supabase.co` |
| Supabase Anon Key | ✅ Configurada no `.env.local` |
| Supabase Service Role | ✅ Configurada no `.env.local` |
| Stripe Live Secret Key | ✅ Configurada no `.env.local` |
| Stripe Live Publishable Key | ✅ Configurada no `.env.local` |
| Site URL | ✅ `http://localhost:3000` (dev) |

---

## ⚠️ PENDENTE: Criar as tabelas no Supabase

O sandbox não consegue conectar ao PostgreSQL diretamente. Você precisa executar o SQL **uma única vez**:

### Opção 1: SQL Editor (MAIS FÁCIL — 30 segundos)
1. Abra: **https://supabase.com/dashboard/project/ytiyqkliojawihfnlwzo/sql**
2. Clique em **"New query"**
3. Copie TODO o conteúdo do arquivo `supabase/schema.sql`
4. Cole no editor
5. Clique em **"Run"** (ou Ctrl+Enter)
6. ✅ Pronto! Todas as 30+ tabelas, RLS policies e triggers foram criados

### Opção 2: Script local (se tiver psql instalado)
```bash
chmod +x setup-database.sh
./setup-database.sh
```

---

## ⚠️ PENDENTE: Configurar Stripe Webhook

1. Abra: **https://dashboard.stripe.com/webhooks**
2. Clique em **"Add endpoint"**
3. URL: `https://seudominio.com/api/stripe/webhook`
4. Selecione estes eventos:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
   - `charge.refunded`
5. Copie o **Signing secret** (começa com `whsec_...`)
6. Adicione ao `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

---

## ⚠️ PENDENTE: Configurar Auth Providers (opcional)

### Google OAuth
1. **Google Cloud Console** → APIs & Services → Credentials → Create OAuth Client ID
2. Redirect URI: `https://ytiyqkliojawihfnlwzo.supabase.co/auth/v1/callback`
3. Cole Client ID + Secret no Supabase: Authentication → Providers → Google

### GitHub OAuth
1. **GitHub Settings** → Developer Settings → OAuth Apps → New OAuth App
2. Callback URL: `https://ytiyqkliojawihfnlwzo.supabase.co/auth/v1/callback`
3. Cole Client ID + Secret no Supabase: Authentication → Providers → GitHub

---

## ⚠️ PENDENTE: Configurar Storage (para upload de documentos KYC)

1. Abra: **https://supabase.com/dashboard/project/ytiyqkliojawihfnlwzo/storage**
2. Clique em **"New bucket"**
3. Nome: `documents`
4. Marque como **Private**
5. Clique em **Create**
6. Vá em **Policies** do bucket → Add policy:
   - Allow authenticated users to upload: `auth.role() = 'authenticated'` — INSERT
   - Allow users to read own docs: `auth.uid()::text = (storage.foldername(name))[1]` — SELECT

---

## 🔒 Segurança

- ✅ `.env.local` está no `.gitignore` — NUNCA commite este arquivo
- ✅ Service Role Key é usada APENAS no server-side
- ⚠️ Suas chaves Stripe são **LIVE** — transações com dinheiro real
- 💡 Para testar pagamentos, use chaves `pk_test_` / `sk_test_` no desenvolvimento

---

## 🧪 Teste rápido após setup

```bash
npm run dev
# Abra http://localhost:3000
# Tente criar uma conta em /cadastro
# Tente fazer login em /login
# Acesse /dashboard
```
