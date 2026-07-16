# 🚀 PLAYDEX v2.0 — PLANO COMPLETO DE EXPANSÃO

> **Entregáveis prontos:** Wireframes ✅ | ERD ✅ | Mockup Home ✅
> **Status:** Aguardando aprovação para iniciar código

---

## 📋 SUMÁRIO

1. [Wireframes das 12 Páginas Novas](#1-wireframes)
2. [Diagrama ERD do Banco](#2-diagrama-erd)
3. [Mockup da Nova Home 3D](#3-mockup-home)
4. [Plano de Execução por Fase](#4-plano-de-execucao)
5. [Arquitetura Técnica](#5-arquitetura-tecnica)

---

## 1. WIREFRAMES 📐

**Arquivo:** `/docs/WIREFERAMES_12_PAGINAS.svg`

| # | Página | Funcionalidades Principais |
|---|--------|---------------------------|
| 01 | `/ofertas` | Cronômetro regressivo, banners animados, tabs de categoria, cards com desconto, selo "OFERTA RELÂMPAGO" |
| 02 | `/planos-comparativo` | Toggle mensal/anual, 3 planos lado a lado, tabela comparativa animada, badges de popularidade |
| 03 | `/comunidade` | Feed social, criar post, tabs (Tudo/Dúvidas/Reviews/Dicas), trending sidebar, likes/comentários |
| 04 | `/afiliados` | Dashboard com stats (ganhos/indicações/conversão), link de referência copiável, gráfico de barras, tabela de indicações |
| 05 | `/suporte-ia` | Chat com PlayBot IA, avatar 3D animado, quick actions, botão "falar com humano", mensagens com timestamp |
| 06 | `/blog` | Post destaque hero, categorias filtráveis, grid de posts, autor e tempo de leitura, CMS-ready |
| 07 | `/depoimentos` | Carrossel de vídeo depoimentos, reviews em texto, rating stars, contagem de avaliações |
| 08 | `/onboarding` | Step indicator (4 passos), ilustração 3D animada, escolha de interesses, CTA e opção de pular |
| 09 | `/favoritos` | Lista com drag-and-drop, botão de alerta de preço, heart icon, botão "Comprar Todos" |
| 10 | `/notificacoes` | Agrupadas por data (Hoje/Ontem), badge de não lida, ícones por tipo, marcar todas como lidas |
| 11 | `/configuracoes` | Perfil editável, toggles de notificação, seletor de tema (☀️/🌙/💻), zona de perigo |
| 12 | `/404` | Texto "404" 3D flutuante com partículas, mensagem amigável, CTAs, mini-game opcional |

---

## 2. DIAGRAMA ERD 🗄️

**Arquivo:** `/docs/ERD_DIAGRAM.svg`

### 18 Tabelas no Total

| Grupo | Tabelas |
|-------|---------|
| **Usuários** | `users`, `accounts` (OAuth), `affiliates`, `affiliate_referrals` |
| **Transações** | `orders`, `transactions`, `withdrawals`, `coupons`, `pd_points_transactions`, `subscriptions` |
| **Conteúdo** | `products`, `categories`, `product_images`, `blog_posts`, `community_posts` |
| **Auxiliares** | `reviews`, `messages`, `notifications`, `verifications`, `favorites`, `interventions` |

### Relacionamentos Chave

```
users 1:N products    (vendedor cria produtos)
users 1:N orders      (comprador faz pedidos)
products 1:N orders   (produto é comprado)
orders 1:N messages   (chat do pedido)
orders 1:1 reviews    (avaliação da compra)
users 1:1 affiliates  (programa de afiliados)
affiliates 1:N affiliate_referrals
users 1:N notifications
users 1:N favorites
users 1:N verifications
orders 1:N transactions
categories 1:N products (subcategorias via parent_id)
```

---

## 3. MOCKUP HOME 3D 🎨

**Arquivo:** `/docs/MOCKUP_HOME_3D.png`

### Design Principles
- **Estilo:** Apple + Netflix — clean, premium, com profundidade
- **Hero:** Gem isométrico 3D com órbitas e partículas (R3F)
- **Paleta:** Dark navy (#0F172A) → Blue (#2563EB) → White (#F8FAFC)
- **Glassmorphism** nos cards flutuantes sobre o hero
- **Animações:** Fade+slide de entrada, hover 3D tilt, parallax sutil

---

## 4. PLANO DE EXECUÇÃO 📅

### FASE 1 — Visual & Animação (3-4 dias)
1. Dark/Light mode system com `next-themes` + transição animada
2. Redesign do Hero com novo 3D (gem + partículas + órbitas)
3. Framer Motion em 100% dos componentes (fade, slide, stagger)
4. Hover 3D tilt nos cards (react-tilt custom hook)
5. Botões com ripple effect
6. Skeleton loading animado em todas as listagens
7. Page transitions suaves

### FASE 2 — 12 Páginas Novas (5-6 dias)
1. `/ofertas` — Timer + banners + grid de ofertas
2. `/planos-comparativo` — Toggle + cards + tabela
3. `/comunidade` — Feed + criar post + trending
4. `/afiliados` — Dashboard + chart + tabela
5. `/suporte-ia` — Chat + avatar 3D + quick actions
6. `/blog` — Redesign + CMS structure
7. `/depoimentos` — Video carousel + text reviews
8. `/onboarding` — Steps + interests + 3D
9. `/favoritos` — Drag & drop + alerts
10. `/notificacoes` — Grouped + real-time
11. `/configuracoes` — Profile + toggles + theme
12. `/404` — 3D animated scene

### FASE 3 — Backend (6-8 dias)
1. **Prisma Schema** — 18 tabelas, migrations, seed
2. **NextAuth v5** — Login, cadastro, OAuth (Google, Discord), 2FA
3. **Stripe + PIX** — Checkout, webhooks, assinaturas, cupons
4. **API Routes** — CRUD completo (Next.js Route Handlers)
5. **Painel Admin** — Dashboard com gráficos, CRUD users/products/orders
6. **Busca** — Full text search + filtros + autocomplete
7. **Notificações** — In-app + email (Resend)
8. **Upload** — Cloudflare R2 com presigned URLs
9. **Rate Limit** — Upstash Redis
10. **Swagger** — OpenAPI 3.1 docs

### FASE 4 — Performance & Polish (2-3 dias)
1. Lighthouse audit → meta 95+
2. ISR/SSR nas páginas dinâmicas
3. Image optimization (AVIF/WebP)
4. Bundle analysis + code splitting
5. Testes responsivos (mobile/tablet/desktop)
6. README final + .env.example

---

## 5. ARQUITETURA TÉCNICA 🏗️

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND                           │
│  Next.js 14 App Router + TypeScript + TailwindCSS    │
│  Framer Motion + React Three Fiber + next-themes     │
│  Zustand (state) + React Hook Form + Zod (validação) │
└──────────────┬──────────────────┬────────────────────┘
               │                  │
      ┌────────▼────────┐  ┌─────▼──────────┐
      │   API Routes    │  │   Server       │
      │   (Next.js)     │  │   Components   │
      │   REST + Swagger│  │   SSR/ISR      │
      └────────┬────────┘  └────────────────┘
               │
    ┌──────────▼──────────────────────┐
    │         BACKEND LAYER           │
    │  Prisma ORM → PostgreSQL 16    │
    │  NextAuth v5 (JWT + OAuth)     │
    │  Stripe API + PIX (Asaas)      │
    │  Cloudflare R2 (uploads)       │
    │  Upstash Redis (cache + rate)  │
    │  Resend (emails)               │
    └─────────────────────────────────┘
```

### Novas Dependências (a adicionar)

| Pacote | Uso |
|--------|-----|
| `next-themes` | Dark/Light mode |
| `zustand` | State management |
| `react-hook-form` + `zod` | Formulários + validação |
| `@prisma/client` + `prisma` | ORM + DB |
| `next-auth@beta` | Autenticação v5 |
| `stripe` + `@stripe/stripe-js` | Pagamentos |
| `@upstash/redis` | Rate limiting + cache |
| `resend` | Envio de emails |
| `@uploadthing/react` | Upload de arquivos |
| `recharts` | Gráficos admin |
| `swagger-ui-react` | API docs |
| `@dnd-kit/core` | Drag & drop favoritos |
| `react-tilt` | Hover 3D cards |

---

## ✅ PRÓXIMO PASSO

**Aguardo sua aprovação para:**
1. ✅ Wireframes das 12 páginas
2. ✅ Diagrama ERD (18 tabelas)
3. ✅ Mockup da Home 3D

**Após aprovação, começo a codar na ordem:**
1. Backend (Prisma + Auth + API)
2. Visual redesign + Dark mode
3. 12 páginas novas
4. Admin + Performance

---

*Playdex v2.0 — Aguardando sinal verde 🟢*
