# 🚀 KIYVO v6.0 — Marketplace de Produtos Digitais

<p align="center">
  <strong>O maior marketplace digital do Brasil.</strong><br>
  Compre e venda tudo que é digital: jogos, software, cursos, e-books, templates, gift cards, domínios, APIs e muito mais.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2.29-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-Connect-blueviolet?logo=stripe" alt="Stripe" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Páginas-378-orange" alt="378 Pages" />
</p>

---

## 📋 Stack Técnico

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14.2.29 (pinned) | Framework principal |
| React | 18.3 | UI Library |
| TypeScript | 5.7 | Tipagem forte |
| Supabase | 2.109 | Backend + Auth + DB + Storage + Realtime |
| Stripe | 22.3 | Pagamentos + Connect + Escrow |
| Tailwind CSS | 3.4 | Design System |
| Framer Motion | 11.18 | Animações em 100% dos componentes |
| Zustand | 5.0 | State Management |
| Zod | 4.4 | Validação de schemas |

## 🏗️ Arquitetura

```
src/
├── app/                    # Next.js App Router (378 páginas)
│   ├── api/               # 33 API Routes
│   │   ├── v1/            # API v1 (REST)
│   │   │   ├── admin/     # APIs administrativas (auth required)
│   │   │   ├── security/  # Fraud detection + device fingerprint
│   │   │   ├── vault/     # Cofre Digital (escrow delivery)
│   │   │   └── ...
│   │   ├── cart/          # Carrinho
│   │   ├── checkout/      # Checkout com Stripe Escrow
│   │   ├── search/        # Full-text search
│   │   └── stripe/        # Webhook handler
│   ├── admin/             # Painel administrativo
│   ├── auth/              # Autenticação (login, 2FA, OAuth)
│   ├── ajuda/             # Central de ajuda (30+ artigos)
│   ├── blog/              # Blog com conteúdo dinâmico
│   ├── categoria/         # 32 categorias de produtos
│   ├── conta/             # Área do usuário
│   ├── tutorial/          # Tutoriais e onboarding
│   └── ...
├── components/
│   ├── animations/        # Animações reutilizáveis
│   ├── home/              # Componentes da homepage
│   ├── layout/            # Header + Footer
│   ├── product/           # ProductCard (legado + API)
│   ├── shared/            # PageTransition
│   ├── svgs/              # SVGs animados
│   └── ui/                # Design System (Button, Card, Badge, etc.)
├── lib/
│   ├── auth/              # Auth context + server helpers
│   │   ├── context.tsx    # AuthProvider (client)
│   │   └── server.ts      # requireAuth/Admin/Vendor/OwnerOrAdmin
│   ├── security/          # Rate limiting + fraud detection + sanitização
│   ├── stripe/            # Stripe client + server
│   ├── supabase/          # Supabase client + admin client
│   └── theme/             # Dark mode provider
├── types/                 # TypeScript interfaces
└── middleware.ts           # Segurança: rate limit, anti-bot, CSP, HSTS
```

## 🔒 Segurança

- **Escrow**: Pagamentos retidos até confirmação de entrega
- **KYC**: Verificação de identidade para vendedores
- **2FA**: Autenticação em 2 passos (TOTP)
- **Rate Limiting**: Por IP, fingerprint e path
- **Anti-Fraud**: Detecção de velocity, anomalias e comportamento suspeito
- **CSP**: Content Security Policy rigorosa
- **HSTS**: Strict-Transport-Security com preload
- **RLS**: Row Level Security no Supabase
- **Admin Auth**: `requireAdmin()` em todas as APIs admin
- **OWASP Top 10**: XSS, CSRF, SQL Injection, IDOR, Mass Assignment protegidos

## 📦 Configuração

### Variáveis de Ambiente (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Instalação

```bash
# Instalar dependências
npm install

# PIN do Next.js (obrigatório após qualquer npm install)
npm install next@14.2.29 --save-exact

# Desenvolvimento
npm run dev

# Build de produção
npm run build
```

### Supabase Setup

Execute o schema no SQL Editor do Supabase:
1. `supabase/schema_v5.sql` — Tabelas base
2. `supabase/schema_v6.sql` — Tabelas v6 + enums + triggers + RLS

### Stripe Setup

1. Criar conta Stripe Connect
2. Configurar webhook endpoint: `/api/stripe/webhook`
3. Adicionar `STRIPE_WEBHOOK_SECRET` ao `.env.local`

## 🧪 Quality Gates (CI/CD)

O pipeline GitHub Actions verifica:

1. **Lint & Formatação** — ESLint + Prettier
2. **TypeScript** — `tsc --noEmit --strict`
3. **Segurança** — Verificação de segredos + npm audit
4. **Build** — Verifica mínimo 300 páginas
5. **Quality** — Zero mocks, zero any, zero console.log, zero placeholders

## 📊 Métricas Atuais

| Métrica | Valor |
|---|---|
| Páginas | 378 |
| APIs | 33 rotas |
| Componentes | 24 |
| Mock imports | 0 |
| `any` types | 0 |
| `console.log` | 0 |
| Placeholder pages | 0 |
| TypeScript errors | 0 |
| Build status | ✅ Passing |

## 📝 Convenções

- **Idioma dos comentários**: PT-BR
- **Nomes de variáveis**: EN
- **Paleta**: White/Blue/Black (#2563EB, #0F172A, #FFFFFF)
- **Animações**: Framer Motion em 100% dos componentes
- **Next.js**: Sempre pinned em `14.2.29`
- **Stripe API Version**: `'2026-06-24.dahlia'`

---

**KIYVO** — TUDO digital. Não apenas jogos.
