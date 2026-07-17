# 🎮 KIYVO — Marketplace de Produtos Digitais

> O marketplace de **tudo que é digital**. Compre e venda jogos, software, cursos, e-books, templates, gift cards, domínios, APIs e muito mais.

![Kiyvo v3.1](https://img.shields.io/badge/version-3.1-blue?style=for-the-badge)
![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-green?style=flat-square&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=flat-square&logo=stripe)

---

## 📊 Números

| Métrica | Valor |
|---|---|
| **Páginas** | 70+ |
| **API Routes** | 10 |
| **Arquivos TSX/TS** | 180+ |
| **Tabelas no banco** | 30+ |
| **Loading states** | 100% cobertura |
| **Error boundaries** | 100% cobertura |
| **Dark mode** | 90%+ das páginas |

---

## 🛠️ Stack

- **Frontend:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + Framer Motion (100% animado)
- **3D:** React Three Fiber + Drei
- **Backend:** Supabase (Auth + Database + Storage + Realtime)
- **Pagamentos:** Stripe (PIX, Cartão, Boleto)
- **Security:** CSRF, Rate Limiting, Bot Detection, Fraud Scoring, Device Fingerprint

---

## 🚀 Quick Start

```bash
# Clone o repo
git clone https://github.com/rhzcria7-creator/KIYVO.git
cd KIYVO

# Instale dependências
npm install

# Configure o .env.local (veja .env.example)
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Rode o projeto
npm run dev
```

### Setup automático
1. Abra `http://localhost:3000/setup`
2. Veja o status de todas as integrações
3. Clique em "Criar categorias" e "Criar cupons"

### Setup manual (SQL)
1. Abra o SQL Editor no Supabase
2. Cole o conteúdo de `supabase/schema.sql`
3. Execute

---

## 🔑 Variáveis de Ambiente

| Variável | Onde pegar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks |
| `NEXT_PUBLIC_SITE_URL` | Seu domínio |

---

## 📁 Estrutura

```
src/
├── app/              # 70+ páginas (App Router)
│   ├── admin/        # Painel administrativo
│   ├── api/          # 10 API routes
│   ├── auth/         # Login, cadastro, recuperação
│   ├── checkout/     # Fluxo de pagamento Stripe
│   └── ...           # Todas as páginas públicas
├── components/
│   ├── animations/   # Framer Motion components
│   ├── home/         # Hero, Categories, Products
│   ├── layout/       # Header, Footer
│   ├── product/      # ProductCard
│   ├── shared/       # PageTransition
│   ├── svgs/         # AnimatedSVGs
│   └── ui/           # Button, Card, Input, CommandK, ThemeToggle
├── data/             # Mock data
├── lib/
│   ├── auth/         # AuthProvider + useAuth
│   ├── security/     # Rate limit, CSRF, fraud, sanitization
│   ├── stripe/       # Client + Server
│   ├── supabase/     # Client + Server + Middleware
│   └── theme/        # ThemeProvider + useTheme (dark/light)
├── types/            # TypeScript interfaces
└── middleware.ts      # Security + Auth middleware
```

---

## 🔒 Segurança

- ✅ CSRF Protection (Origin header validation)
- ✅ Rate Limiting com auto-block IP
- ✅ Bot Detection (bloqueia bots de rotas sensíveis)
- ✅ Fraud Scoring (4 níveis: low/medium/high/critical)
- ✅ Device Fingerprinting
- ✅ Security Headers (CSP, HSTS, X-Frame-Options, CORS)
- ✅ Input Sanitization (XSS, SQL Injection, Event Handlers)
- ✅ CPF Validation
- ✅ Password Strength Checker
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ KYC Verification (4 passos)
- ✅ .env.local no .gitignore (credenciais protegidas)

---

## 🌙 Dark Mode

- Toggle no Header (animado Sun ↔ Moon)
- Seletor em Configurações (Light / System / Dark)
- Persistido no localStorage
- Transições animadas

---

## 🔍 Features

- **Command-K** (Cmd/Ctrl+K) — busca global
- **Onboarding** — guia passo a passo
- **Health Check** — `/api/health` + `/status`
- **Auto Setup** — `/setup` + `/api/setup`
- **SEO** — sitemap.xml, robots.txt, Open Graph, JSON-LD
- **PWA** — manifest.json
- **Wallet** — carteira digital do vendedor
- **Export** — CSV/PDF de dados
- **Admin Analytics** — charts e KPIs em tempo real

---

## 📄 Licença

Projeto proprietário. Todos os direitos reservados.
