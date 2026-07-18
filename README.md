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
  <img src="https://img.shields.io/badge/Páginas-387-orange" alt="387 Pages" />
  <img src="https://img.shields.io/badge/Testes-249_passed-brightgreen" alt="249 Tests" />
  <img src="https://img.shields.io/badge/Coverage-9_suites-blue" alt="9 Test Suites" />
</p>

---

## 📋 Stack Técnico

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Next.js | 14.2.29 (PINNED) | Framework principal — NÃO atualizar para v15/v16 |
| React | 18.x | UI e Server Components |
| TypeScript | 5.x | Type safety rigorosa, zero `any` |
| Supabase | Latest | Auth, Database, Storage, Realtime |
| Stripe | API 2026-06-24.dahlia | Payments, Connect, Escrow |
| Tailwind CSS | 3.4 | Styling utility-first |
| Framer Motion | 11.x | Animações em 100% dos componentes |
| Jest | 29.x | Testes unitários |

---

## 🏗️ Arquitetura

```
src/
├── app/                    # Next.js App Router (387 páginas)
│   ├── page.tsx            # Home — Hero, Categorias, Produtos, Stats
│   ├── p/[slug]/           # Página de produto (detalhes, compra)
│   ├── categorias/         # Catálogo de categorias
│   ├── busca/              # Busca com Full Text Search
│   ├── conta/              # Área do comprador
│   ├── vendedor/           # Área do vendedor
│   ├── admin/              # Painel administrativo
│   ├── 2fa/                # Setup e verificação 2FA
│   └── api/                # API Routes (40+ endpoints)
│       ├── v1/             # APIs versionadas
│       │   ├── 2fa/        # 2FA: setup, verify, disable, backup-codes
│       │   ├── admin/      # Dashboard, disputes, KYC, rate-limits
│       │   ├── chat/       # Conversas e mensagens
│       │   ├── upload/     # Image, avatar, digital
│       │   ├── notifications/ # Notificações in-app
│       │   └── ...         # affiliate, blog, categories, coupons, etc.
│       ├── checkout/       # Stripe Checkout com Escrow
│       ├── stripe/webhook/ # Webhook de eventos Stripe
│       └── health/         # Health check monitorado
├── components/             # Componentes React
│   ├── home/               # Hero, Categories, Featured, Reviews, Blog
│   ├── product/            # ProductCard, ProductCardAPI
│   ├── ui/                 # Button, Card, Input, Modal, Badge
│   ├── shared/             # PageTransition, LoadingStates
│   ├── animations/         # FadeInOnScroll, ScaleInOnScroll, AnimatedCounter
│   └── svgs/               # AnimatedSVGs, WaveDivider
├── lib/                    # Lógica de negócio
│   ├── auth/               # Server helpers + Client context + 2FA TOTP
│   ├── security/           # Rate limiting, sanitização, fraude, CSRF
│   ├── supabase/           # Client, Server, Middleware configs
│   ├── stripe/             # Server + Connect + Escrow
│   ├── chat/               # Realtime subscriptions + hooks
│   ├── email/              # Templates HTML + provider (Resend/SMTP)
│   ├── storage/            # Upload seguro (imagens, digital, docs, avatar)
│   ├── validation/         # Input validation server-side (OWASP)
│   ├── rate-limit/         # Rate limiting persistente via Supabase
│   ├── observability/      # Logger estruturado + métricas + health
│   └── utils/              # formatPrice, slugify, cn, etc.
└── __tests__/              # Testes unitários (136 testes)
```

---

## 🔒 Segurança (OWASP Top 10)

| Ameaça | Proteção |
|--------|----------|
| **XSS** | CSP headers, input sanitization, no dangerouslySetInnerHTML |
| **SQL Injection** | Supabase parameterized queries, search query sanitization |
| **CSRF** | Token-based CSRF protection, SameSite cookies |
| **Brute Force** | Rate limiting (5 req/5min auth, 200 req/min global, 3 req/5min checkout) |
| **Bot Detection** | UA pattern matching, honeypot fields, device fingerprinting |
| **Fraud Detection** | Multi-factor risk scoring (amount, velocity, disputes, account age) |
| **Data Exposure** | RLS policies on all tables, admin-only API routes |
| **Broken Auth** | 2FA TOTP, session management, ban detection |
| **Sensitive Data** | .env.local in .gitignore, no secrets in code, encrypted TOTP secrets |
| **Rate Limiting** | In-memory + Supabase persistent, auto-block at 3x limit |

---

## 🔐 2FA (Autenticação de Dois Fatores)

Implementação completa do TOTP (RFC 6238):

- **Gerador de segredo** Base32 com URI otpauth:// para QR Code
- **Verificação** com janela de tolerância (±30s)
- **Códigos de backup** de uso único (10 códigos, formato XXXX-XXXX)
- **Hash de backup codes** para armazenamento seguro
- **Auto-alerta** quando restam ≤3 códigos de backup
- **APIs**: `/api/v1/2fa/setup`, `/verify`, `/disable`, `/backup-codes`
- **UI funcional**: stepper com QR Code, input OTP 6 dígitos, download de códigos

---

## 💰 Sistema Financeiro (Escrow)

```
Comprador → Stripe Checkout → Conta da Plataforma (ESCROW)
                                        ↓
                        Comprador confirma recebimento
                                        ↓
                              Transfer to Vendor
```

- **Dinheiro fica em custódia** na conta da plataforma
- **Transferência ao vendor** APENAS após confirmação do comprador
- **Auto-confirmação** após período de disputa
- **Chargeback** detectado via webhook → status `disputed`
- **Split financeiro**: plataforma (10%), afiliado (5%), vendor (líquido)

---

## 📊 Testes

```bash
npm test              # Rodar todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Com coverage
```

### Cobertura atual (249 testes, 9 suites):

| Suite | Testes | Descrição |
|-------|--------|-----------|
| utils.test.ts | 16 | formatPrice, slugify, cn, getDiscount, formatNumber |
| two-factor.test.ts | 18 | TOTP, backup codes, encryption, base32 |
| security.test.ts | 53 | Rate limit, sanitização, CPF, fraude, CSRF, password |
| validation.test.ts | 49 | Email, password, username, CPF, checkout, chat, review |
| storage-validation.test.ts | 27 | Product create, checkout, review, XSS, phone |
| integration.test.ts | 19 | Cross-module integration tests |
| email.test.ts | 30 | Email templates, HTML validation, security checks |
| observability.test.ts | 18 | Logger, API logging, metrics, measureTime |
| storage.test.ts | 19 | File validation, MIME types, size limits, XSS |

---

## 🚀 Setup Local

```bash
# 1. Clone
git clone https://github.com/rhzcria7-creator/kiyvo.git
cd kiyvo

# 2. Instalar deps (SEMPRE pin next@14.2.29)
npm install
npm install next@14.2.29 --save-exact

# 3. Configurar .env.local
cp .env.example .env.local
# Preencha com suas chaves Supabase + Stripe

# 4. Executar schema no Supabase
# Abra o SQL Editor do Supabase e execute:
# - supabase/schema_v6.sql

# 5. Configurar Supabase Storage Buckets
# - product-images (public)
# - digital-files (private)
# - vendor-docs (private)
# - avatars (public)

# 6. Rodar
npm run dev
```

---

## 📋 Checklist de Configuração (Produção)

- [ ] Schema v6 executado no Supabase SQL Editor
- [ ] STRIPE_WEBHOOK_SECRET configurado (Stripe Dashboard → Webhooks)
- [ ] Stripe Connect ativado no Stripe Dashboard
- [ ] Supabase Storage buckets criados (4 buckets)
- [ ] OAuth providers configurados (Google/GitHub no Supabase Dashboard)
- [ ] Email service configurado (Resend API key ou SMTP)
- [ ] RATE_LIMIT_DB=true para rate limiting persistente
- [ ] `generate_order_number` function criada no Supabase
- [ ] Webhook endpoint no Stripe apontando para `/api/stripe/webhook`

---

## 🎨 Design System

**Paleta**: White / Blue (#2563EB) / Black (#0F172A) — Apple + Netflix + 3D

- **Font**: `font-display` (Sora) para títulos, `font-sans` (Inter) para corpo
- **Cards**: `card-base` com `hover:shadow-card-hover` e `dark:shadow-dark-glow`
- **Botões**: `.btn-primary`, `.btn-secondary` com gradientes e transições
- **Animações**: Framer Motion em todos os componentes (`FadeInOnScroll`, `ScaleInOnScroll`)
- **Dark mode**: `darkMode: 'class'` no Tailwind
- **Mobile-first**: Responsive grid, touch-friendly

---

## 📦 CI/CD Pipeline

6 quality gates no GitHub Actions:

1. **Lint & Formatação** — ESLint + Prettier
2. **Type Check** — `tsc --noEmit --strict`
3. **Testes Unitários** — Jest com coverage
4. **Segurança** — Secrets scanning + npm audit
5. **Build** — Produção com 387+ páginas
6. **Quality Gates** — Zero mocks, zero `any`, zero console.log, zero placeholders

---

## ⚠️ Regras Críticas

| Regra | Motivo |
|-------|--------|
| **Next.js 14.2.29 PINNED** | v15/v16 quebra o projeto |
| **Nunca apagar código** | "SÓ EVOLUIR E ADICIONAR" |
| **Zero `any` types** | Type safety rigorosa |
| **Zero `console.log`** | Usar logger estruturado |
| **Zero TODOs** | Completar ou não incluir |
| **Comentários em PT-BR** | Variáveis em EN |
| **Todos os estados** | loading/error/empty/success/disabled |
| **Mobile-first** | Responsive obrigatório |
| **Stripe apiVersion** | `'2026-06-24.dahlia'` |

---

## 📄 Licença

Proprietário — KIYVO © 2024-2026
