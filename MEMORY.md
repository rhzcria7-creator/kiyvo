# KIYVO — Memória Oficial do Projeto

> **Importante**: Este arquivo é a fonte única da verdade sobre a plataforma KIYVO.
> Agentes e desenvolvedores DEVEM lê-lo integralmente antes de modificar qualquer código.
> Atualize este arquivo sempre que adicionar features significativas ou corrigir bugs críticos.

---

## 📋 Índice

1. [Visão Geral da Plataforma](#1-visão-geral-da-plataforma)
2. [Stack Técnica e Dependências](#2-stack-técnica-e-dependências)
3. [Regras Absolutas (Não Quebrar)](#3-regras-absolutas-não-quebrar)
4. [Identidade Visual e Design System](#4-identidade-visual-e-design-system)
5. [Arquitetura de Pastas e Código](#5-arquitetura-de-pastas-e-código)
6. [Autenticação e Segurança](#6-autenticação-e-segurança)
7. [Persistência e Stores](#7-persistência-e-stores)
8. [Catálogo e Produtos](#8-catálogo-e-produtos)
9. [Inteligência Artificial e Agentes](#9-inteligência-artificial-e-agentes)
10. [Fluxos de Compra e Pagamento](#10-fluxos-de-compra-e-pagamento)
11. [Fluxo do Vendedor](#11-fluxo-do-vendedor)
12. [Sistema de Pontos (KD Points)](#12-sistema-de-pontos-kd-points)
13. [Boost de Produtos (Destaques Pagos)](#13-boost-de-produtos-destaques-pagos)
14. [KD Points, Cupons e Promoções](#14-kd-points-cupons-e-promoções)
15. [Notificações e Comunicação](#15-notificações-e-comunicação)
16. [Rotas Públicas e Protegidas (Middleware)](#16-rotas-públicas-e-protegidas-middleware)
17. [Bugs Conhecidos e Dívidas Técnicas](#17-bugs-conhecidos-e-dívidas-técnicas)
18. [Roadmap e Próximas Features](#18-roadmap-e-próximas-features)
19. [Credenciais e Fallbacks](#19-credenciais-e-fallbacks)
20. [Deploy e Ambientes](#20-deploy-e-ambientes)
21. [Performance Mobile (Crítico)](#21-performance-mobile-crítico)
22. [Contas e Seeds Administrativas](#22-contas-e-seeds-administrativas)
23. [Convenções de Código](#23-convenções-de-código)

---

## 1. Visão Geral da Plataforma

**KIYVO** é um marketplace brasileiro de produtos digitais, concorrente direto de Hotmart, Kiwify, Monetizze e Eduzz, com diferenciais claros:

- **Taxa Zero** nas primeiras 5.000 vendas para novos vendedores (0% de comissão nesse período).
- **Taxas mais baixas** do mercado mesmo após o período de isenção.
- **Saque em 1 dia útil via PIX** (concorrentes demoram 7-30 dias).
- **203 agentes de IA** gratuitos integrados para auxiliar vendedores e compradores.
- **KD Points**: programa de recompensas onde usuários ganham pontos ao comprar, avaliar e indicar amigos — 100 KD = R$1,00 de desconto em compras futuras (máx. 50% do valor).
- **Sem pegadinhas**: sem mensalidade, sem taxas escondidas, sem lock-in.
- **Experiência premium Apple+Netflix+3D**, mobile-first, em português do Brasil.
- **Marketplace de TUDO que é digital**: cursos, e-books, templates, software, licenças, serviços freelance, artes, prompts de IA, contas streaming, games, consultorias.

**Dados públicos da plataforma** (atualizar quando mudar):
- 789 produtos cadastrados no catálogo demo oficial.
- 60 lojas de vendedores verificadas.
- 203 agentes de IA com personas personalizadas.
- Taxas: Free (8% + R$0,50, teto R$50), Plus (6,5% + R$0,40, teto R$40), Pro (5% + R$0,30, teto R$30), Vendor Pro (3% + R$0,20, teto R$20 + 5k vendas isentas).
- Saque mínimo R$30, taxa fixa R$0,99, PIX em 1 dia útil, saldo após 7 dias da venda.
- Garantia de 7 dias para todas as compras.

---

## 2. Stack Técnica e Dependências

### Core
- **Next.js 14.2.29 PINNADO** — App Router, Server Components e Client Components.
  ⚠️ NUNCA atualize o Next para versões 15.x ou superior. Use sempre `npm install next@14.2.29 --save-exact`.
- **React 18.3.x**
- **TypeScript 5.x** (strict mode, sem `any`).
- **Tailwind CSS 3.4.x**
- **Framer Motion 11.x** (animações OBRIGATÓRIAS em todos componentes interativos).

### Bibliotecas Principais
| Biblioteca | Uso |
|---|---|
| `@supabase/supabase-js` | Banco de dados e auth server-side (quando chaves reais disponíveis). |
| `@supabase/ssr` | Cookies SSR seguros. |
| `firebase` | Autenticação client-side (Google, GitHub, Apple, email/senha, Magic Link). Projeto `kiyvo-66d75`. |
| `stripe` | Pagamentos (apiVersion fixa `'2026-06-24.dahlia'`). |
| `@stripe/stripe-js` | Checkout client-side. |
| `zustand` | Gerenciamento de estado global client-side, todos stores de carrinho/favoritos/KD/etc. |
| `react-hot-toast` | Toasts/notificações bonitas. |
| `react-hook-form` + `@hookform/resolvers` + `zod` | Formulários e validação. |
| `lucide-react` | Ícones (padrão oficial). |
| `date-fns` | Datas (em PT-BR). |
| `clsx` | Classes condicionais. |
| `qrcode` | Geração de QR Code PIX. |
| `three`, `@react-three/fiber`, `@react-three/drei` | Efeitos 3D no hero (usar com moderação em mobile). |
| `next-themes` | Dark/light mode.

### Ferramentas de Desenvolvimento
- `jest` + `@testing-library/jest-dom` + `@testing-library/react` — testes unitários.
- `eslint` + `eslint-config-next` — lint.
- `postcss` + `autoprefixer` — CSS pipeline.

---

## 3. Regras Absolutas (Não Quebrar)

Essas regras são as mais importantes do projeto. Descumprir uma delas é considerado bug crítico.

1. **NÃO APAGUE NADA DO CÓDIGO ATUAL. SÓ EVOLUA E ADICIONE.**
   Não remova rotas, páginas, componentes ou features que já existem. Se precisar refatorar, mantenha a funcionalidade.
2. **Next.js 14.2.29 SEMPRE PINNADO.**
   O node_modules NÃO persiste entre turnos de agentes. Antes de QUALQUER build, rode `npm install next@14.2.29 --save-exact`.
3. **Zero `any` types no TypeScript.**
   Use `unknown`, tipos genéricos, interfaces explícitas. `eslint` com `no-explicit-any`.
4. **Zero `console.log`, `console.error`, `console.warn` em produção.**
   Use apenas o logger interno em `src/lib/observability` ou omita logs.
5. **Zero comentários TODO/FIXME/HACK soltos.** Resolva ou documente em MEMORY.md.
6. **Zero dados mockados quebrados.** Fallbacks demo são permitidos DESDE QUE funcionem de verdade (ex: localStorage, LocalDB).
7. **Comentários em PORTUGUÊS DO BRASIL.** Variáveis, funções e componentes em INGLÊS.
8. **Todos os componentes interativos devem usar Framer Motion** (hover, tap, initial, animate, exit quando aplicável).
9. **Todos os estados devem ser tratados**: loading, error, empty, success, disabled. NUNCA deixe um botão sem loading ou uma lista sem estado vazio.
10. **Mobile-first responsivo SEMPRE.** Comece o design por telas de 320px e expanda para sm (640), md (768), lg (1024), xl (1280).
11. **Stripe API version fixa:** `'2026-06-24.dahlia'`.
12. **Validação client-side E server-side** em todos os inputs (formulários, APIs, uploads).
13. **AUTO-PUSH após modificações:**
    ```bash
    cd /home/user/kiyvo
    npm install next@14.2.29 --save-exact
    ./node_modules/.bin/next build    # garantir 0 erros antes de push
    git add -A
    git -c user.email="arena@kiyvo.com.br" -c user.name="KIYVO Arena" commit -m "vX.Y: descrição curta e objetiva"
    git push origin arena/019f75ba-kiyvo:main --force
    git remote set-url origin "https://github.com/rhzcria7-creator/kiyvo.git"
    ```
14. **Branch fixa de trabalho:** `arena/019f75ba-kiyvo`. Produção: `main` (push force).
15. **O usuário (dono) fala português do Brasil, com frases curtas e erros de digitação.** Interprete a intenção e execute. Não peça esclarecimentos óbvios. Quando ele diz "quero mais", "ta feio", "melhora", "travando", adicione MUITAS melhorias — não só uma coisinha.

---

## 4. Identidade Visual e Design System

### Paleta de Cores Oficial

| Token | Hex | Uso |
|---|---|---|
| `brand-500` | `#2563EB` | Cor primária azul KIYVO (botões, links, destaques). |
| `brand-600` | `#1D4ED8` | Hover primário. |
| `cta-dark` | `#0F172A` | Preto-azulado profundo para CTAs principais e textos. |
| `light-bg` | `#FAFAFA` | Fundo padrão no modo claro. |
| `card-light` | `#FFFFFF` | Cards no modo claro. |
| `dark-bg` | `#0B0F1A` | Fundo padrão no modo escuro. |
| `dark-card` | `#111827` | Cards no modo escuro. |
| `emerald-500` | `#10B981` | Sucesso, "Taxa Zero", PIX. |
| `red-500` | `#EF4444` | Erro, descontos percentuais altos. |
| `amber-500` | `#F59E0B` | KD Points, ouro, estrelas de avaliação, boosts. |
| `violet-500` | `#8B5CF6` | Destaques secundários, magia, IA. |
| `slate-*` | várias | Textos secundários, bordas, divisores. |

### Tipografia
- **Fonte principal:** Plus Jakarta Sans (display, font-black para títulos).
- **Fonte secundária/body:** Inter (font-medium a font-black para corpo).
- **Fonte código:** JetBrains Mono (código, IDs de pedido).
- Títulos grandes sempre em `font-black` (peso 900).
- Labels e metadados: `text-[11px] font-black uppercase tracking-widest text-[#64748B]`.

### Componentes Padrão
- **Botão primário:** `bg-[#0F172A] text-white rounded-full px-6 py-4 font-black shadow-xl shadow-brand-500/20` (claro) / `bg-white text-[#0F172A]` (escuro).
- **Botão secundário:** `bg-transparent border-2 border-slate-200 rounded-full px-6 py-3 font-bold`.
- **Card:** `bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm` com `hover:shadow-2xl hover:shadow-brand-500/15 hover:border-brand-200`.
- **Inputs:** `rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 px-4 py-3.5 text-sm font-medium focus:border-brand-600 outline-none`.
- **Badges:** `rounded-full text-[10px] font-black uppercase tracking-wider px-2 py-1`.

### Animações e Classes Utilitárias Globais
- `.kiyvo-gradient-text`: texto com gradiente animado de 7 cores (GPU acelerado, não pausa).
- `.kiyvo-brand-pulse`: pulse azul para CTAs principais.
- `.kiyvo-shine`: brilho horizontal passando em botões/cards.
- `.skeleton-robust`: shimmer de loading com GPU.
- `.pulse-glow`: pulse de foco azul.
- `.animate-floaty`: flutuação suave de 6s.
- `.cta-wiggle`: wiggle sutil no botão principal.
- `.animate-blob`: morphing de blobs do hero.
- `.soft-ping`: ping de notificação mais suave que o nativo.

---

## 5. Arquitetura de Pastas e Código

```
/home/user/kiyvo/
├── public/                     # Assets estáticos (favicon, og-image, logos)
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── layout.tsx          # Root layout (ThemeProvider, AuthProvider, KYCProvider, etc.)
│   │   ├── page.tsx            # Página inicial (Home)
│   │   ├── globals.css         # CSS global + animações + design system
│   │   ├── loading.tsx         # Loading global
│   │   ├── error.tsx           # Error boundary global (PT-BR, bonito)
│   │   ├── middleware.ts       # NÃO ESTA AQUI — está na raiz de src/
│   │   ├── api/                # API Routes server-side
│   │   │   ├── agent/          # POST { slug, message, history } — endpoint genérico de agente
│   │   │   ├── agents/[slug]/  # 203 rotas de agentes específicos (usam askAgent do brain.ts)
│   │   │   ├── hermes/         # Endpoint Kiya (responde como assistente padrão)
│   │   │   ├── ai/run          # Copiloto (sem badges de provider)
│   │   │   ├── auth/firebase   # Troca token Firebase por cookie kiyvo_session
│   │   │   ├── auth/*          # Outros endpoints de autenticação
│   │   │   ├── checkout/*      # Stripe checkout, confirmação, PIX
│   │   │   ├── products/       # CRUD produtos
│   │   │   ├── v1/             # API pública v1 (produtos, categorias, cupons, boost, pedidos, segurança)
│   │   │   └── health, setup...# Utilitários
│   │   ├── (páginas)/          # Todas as rotas da aplicação (ver seção 16)
│   ├── components/
│   │   ├── layout/             # Header, Footer, UpdateBanner, etc.
│   │   ├── home/               # Seções da página inicial (HomeHero, HomeNumeros, DailyDeals, TrendingNow, etc.)
│   │   ├── product/            # ProductCard, ProductPageClient
│   │   ├── cart/               # MiniCart (drawer lateral), CartProvider
│   │   ├── ui/                 # Componentes reutilizáveis (ClickSpark, SimpleConfetti, ShimmerButton, etc.)
│   │   ├── kyc/KYCProvider.tsx # Inicializa TODOS os stores zustand (NOVOS stores devem ser adicionados aqui)
│   │   ├── favorites/          # FavoritesProvider
│   │   ├── checkout/           # StripeCheckout, PixCheckout, etc.
│   │   ├── support/KiyaWidget  # Widget flutuante verde da Kiya
│   │   ├── svgs/               # SVGs customizados e decorativos
│   │   ├── brand/              # Logo oficial e variações
│   │   └── ...
│   ├── lib/
│   │   ├── agents/brain.ts     # 🧠 CÉREBRO ÚNICO — askAgent(slug, pergunta, historico), 203 personas
│   │   ├── ai/                 # Motor de IA multi-provider (NVIDIA NIM, Gemini, Groq, OpenRouter, DuckDuckGo)
│   │   │   ├── orchestrator.ts # Orquestrador multi-provider (invisível na UI)
│   │   │   └── hermes.ts       # Motor interno (NUNCA mencionar "Hermes" na UI)
│   │   ├── firebase/client.ts  # Firebase Auth (Google, GitHub, Apple, email/senha, Magic Link, reset)
│   │   ├── auth/               # Context, guards, two-factor, useProtectedAction
│   │   ├── cart/store.ts       # Carrinho (zustand + localStorage kiyvo_cart)
│   │   ├── kd/store.ts         # KD Points (ganhar/gastar/calcularDesconto/resgatarCupom)
│   │   ├── favorites/store.ts  # Favoritos
│   │   ├── purchases/store.ts  # Compras / biblioteca com arquivos download
│   │   ├── reviews/store.ts    # Reviews com mídia (fotos/arquivos) e likes
│   │   ├── notifications/      # Notificações (kiyvo_notifications)
│   │   ├── recent/store.ts     # Produtos recentemente vistos (max 12)
│   │   ├── boost/store.ts      # Boosts pagos (6h/24h/7d/30d)
│   │   ├── catalog/            # DEMO_PRODUCTS, GG_PRODUCTS, MEGA_PRODUCTS, STORES
│   │   ├── search/quickSearch  # Busca client-side ⌘K (789 produtos)
│   │   ├── security/           # Anti-fraude client+server, anti-clone, CSRF, rate-limit
│   │   ├── coupons/store.ts    # Cupons do vendedor
│   │   ├── shorts/store.ts     # KIYVO Shorts (vídeos curtos tipo TikTok)
│   │   ├── recommendations/   # Recomendações personalizadas
│   │   ├── localdb/            # DB em memória + arquivo .kiyvo-cache/db.json (seeds admin/ceo/cto/demo)
│   │   ├── stripe/             # Config Stripe client e server
│   │   ├── supabase/           # Client Supabase
│   │   ├── theme/              # ThemeProvider (light/dark)
│   │   ├── userProducts/       # Produtos publicados pelo usuário logado
│   │   ├── kyc/store.ts        # Dados KYC (conta bancária, documentos, perfil vendedor)
│   │   ├── backend/            # Serviços server-side
│   │   ├── utils.ts            # Funções utilitárias (formatar moeda, data, CPF, etc.)
│   │   ├── badges.ts           # Sistema de badges/conquistas
│   │   └── changelog.ts        # Changelog interno
│   ├── domain/                 # Lógica de negócio pura (FeeEngine, cálculos de taxas, sem dependências React)
│   ├── hooks/                  # Hooks customizados
│   ├── types/                  # Tipos TypeScript compartilhados
│   └── middleware.ts           # Whitelist de rotas públicas, redirecionamentos
├── supabase/                   # Schemas SQL e migrations (00_RUN_THIS_FIRST_COMPLETE.sql)
├── scripts/                    # Scripts de geração/infra (agent pages, SEO pages)
├── docs/                       # Documentação adicional
├── .env.example                # Variáveis de ambiente de exemplo
├── package.json                # Dependências (next: 14.2.29 exact)
├── next.config.js              # Next config
├── tailwind.config.ts          # Tailwind (brand colors, fontes, animações)
├── tsconfig.json
├── jest.config.js
└── MEMORY.md                   # ESTE ARQUIVO
```

---

## 6. Autenticação e Segurança

### Métodos de Login Suportados (via Firebase projeto kiyvo-66d75)
Credenciais Firebase REAIS estão embutidas em `src/lib/firebase/client.ts` — NÃO precisam de .env para funcionar:
- **Google OAuth** (signInWithPopup)
- **GitHub OAuth** (signInWithPopup)
- **Apple OAuth** (signInWithPopup com provider apple.com)
- **Email e senha** (signInWithEmailAndPassword / createUserWithEmailAndPassword)
- **Magic Link por email** (sendSignInLinkToEmail → callback em `/auth/magic-link`)
- **Recuperação de senha** (sendPasswordResetEmail)
- **Verificação de email** (sendEmailVerification após cadastro)

### Fluxo de Login
1. Usuário clica em provedor → Firebase abre popup → recebe `idToken`.
2. Frontend faz POST para `/api/auth/firebase` com `{ token, email }`.
3. Backend valida token (fallback LocalDB para o modo demo) → seta cookie httpOnly `kiyvo_session`.
4. Cookie é enviado em todas requisições; middleware valida.

### Sessão
- Cookies **httpOnly**, seguros, sameSite=Lax.
- Nome: `kiyvo_session`.
- Secrets de sessão em `src/lib/auth/`.
- 2FA disponível em `src/lib/auth/two-factor.ts`.

### Segurança
- **Anti-fraude client-side**: `src/lib/security/clientAntiFraud.ts` — bloqueia domínios de email temporário, cartões teste (4242 4242...), padrões suspeitos.
- **Anti-clonagem/anti-descompilação**: `src/lib/security/antiClone.ts`.
- **Rate-limiting**: `src/lib/rate-limit.ts` (máx. requisições por IP).
- **CSRF**: tokens em formulários sensíveis.
- **LGPD em todas as páginas** (política de privacidade, cookies, exclusão de conta em `/deletar-conta`).
- Whitelist CORS/domínios em `next.config.js` e middleware.

---

## 7. Persistência e Stores

O projeto usa uma arquitetura de persistência em camadas:

1. **Server-side (Supabase/Stripe)** — quando chaves reais disponíveis; o código tem fallbacks.
2. **Local Memory DB** (src/lib/localdb/) — roda em memória + salva em `.kiyvo-cache/db.json`, usado como fallback se não houver Supabase. Inclui seeds de admin, ceo, cto e demo.
3. **LocalStorage (zustand stores)** — dados do usuário (carrinho, favoritos, KD, reviews, etc.). Cada store tem um nome de chave único em `localStorage`:

| Store | Key | Descrição |
|---|---|---|
| cart | `kiyvo_cart` | Itens do carrinho, qty. |
| favorites | `kiyvo_favorites` | Favoritos do usuário. |
| kd | `kiyvo_kd_points` | Pontos KD, transações, saldo. |
| purchases | `kiyvo_purchases` | Produtos comprados (biblioteca) com arquivos p/ download. |
| reviews | `kiyvo_reviews` | Avaliações de produtos (com fotos). |
| notifications | `kiyvo_notifications` | Notificações não-lidas. |
| recent | `kiyvo_recent` | Produtos recentemente vistos (max 12). |
| boosts | `kiyvo_boosts` | Boosts ativos comprados. |
| shorts | `kiyvo_shorts/*` | Visualizações e likes de shorts. |
| kyc | `kiyvo_kyc` | Dados do perfil vendedor. |
| userProducts | `kiyvo_user_products` | Produtos publicados pelo usuário. |
| sellerCoupons | `kiyvo_seller_coupons` | Cupons criados pelo vendedor. |
| platformRecs | `kiyvo_platform_recs` | Recomendações da plataforma. |
| searchHistory | `kiyvo_search_history` | Histórico de busca ⌘K. |
| follows | `kiyvo_store_follows` | Seguimento de lojas. |
| demoAccepted | `kiyvo_demo_accepted` | Consentimento do modo demo. |

**Importante:** todos os stores são inicializados pelo `KYCProvider.tsx` que envolve a aplicação no root layout. Ao criar um NOVO store, adicione a inicialização dele no `KYCProvider`.

---

## 8. Catálogo e Produtos

### Fontes de Catálogo (total: 789 produtos)
- **DEMO_PRODUCTS** (src/lib/catalog/demoProducts.ts) — 58 produtos base (d-001 a d-058) com dados ricos.
- **GG_PRODUCTS** (src/lib/catalog/ggmaxProducts.ts) — 50 produtos de games/streaming/licenças.
- **MEGA_PRODUCTS** (src/lib/catalog/megaCatalog.ts) — 681 produtos variados, o grosso do catálogo.

### Lojas
60 lojas em `src/lib/catalog/stores.ts` (STORES array), cada uma com:
- `id`: ID único.
- `name`: Nome da loja.
- `handle`: @handle (URL amigável `/loja/handle`).
- `verified`: boolean (selo de verificação).
- `followers`, `rating`, etc.

### Interface de Produto (Product)
Campos padronizados (usados em ProductCard, buscas, páginas):
```ts
interface Product {
  id: string
  slug?: string
  titulo: string
  descricao_curta?: string
  descricao?: string
  preco: number
  preco_de?: number | null       // preço original para mostrar desconto
  categoria?: string
  vendedor_nome?: string
  vendor_id?: string
  store_id?: string
  verificado?: boolean
  imagem_capa?: string | null
  gradient?: string              // classe tailwind "from-x to-y" para fundo
  emoji?: string                 // emoji mostrado se não houver imagem
  rating?: number                // 0-5
  total_reviews?: number
  total_vendas?: number
  boost?: boolean                // destaque manual
  tipo?: string                  // 'digital', 'service', etc.
  entrega_automatica?: boolean
}
```

### ProdutoPageClient
Página completa em `src/components/product/ProductPageClient.tsx`:
- Galeria (emoji/gradient/imagem), badges, preços, parcelamento.
- Descrição com "O que você recebe".
- Reviews com upload de até 4 fotos + likes.
- Botões "Adicionar ao carrinho", "Comprar agora", "Favoritar", "Compartilhar".
- Produtos relacionados (4, mesma categoria).
- Cupom exclusivo gerado automaticamente (5-15% OFF dependendo do preço).
- Seleção de vendedor e botão "Ver loja" real (linka para `/loja/{handle}`).
- Barra flutuante mobile fixa no bottom com CTA + preço PIX.
- Confete ao clicar em comprar.

---

## 9. Inteligência Artificial e Agentes

### 🚨 REGRAS CRÍTICAS DE MARCA
- **"Hermes" NUNCA pode aparecer na interface do usuário.**
- O assistente padrão se chama **Kiya** (com emoji 🤖/✨).
- O **orquestrador é 100% invisível** — nem admin nem o dono devem ver.
- **NÃO** mostre badges de provider (NVIDIA/Gemini/Groq/OpenRouter) em lugar nenhum.
- O usuário pode ver "muitos agentes" (203 personas), mas por baixo é o mesmo cérebro único com memória e personalidade diferentes por slug.
- A página secreta `/mtrx/console` é invisível (código de acesso: `KIYVO-MATRIX-2026-OMEGA`).

### Cérebro Único (src/lib/agents/brain.ts)
Função `askAgent(agentSlug: string, pergunta: string, historico?: Array<{role,content}>)` — gera resposta contextualizada usando o orquestrador multi-provider. Cada agente tem persona própria (tom, emoji, cor, especialidade).

### 203 Agentes
- Endpoint individual: `/api/agents/{slug}` (cada slug tem seu route.ts que usa askAgent).
- Endpoint genérico: `POST /api/agent { slug, message, history }`.
- Copiloto: `/api/ai/run` (sem menção a providers, sempre mostra só "Online · Responde em segundos").
- Kiya widget: botão verde flutuante em todas as páginas (src/components/support/KiyaWidget.tsx).
- Página `/hermes` renomeada visualmente para "Kiya — Assistente KIYVO" (rota mantida por compatibilidade).
- Página `/copiloto` — copiloto de vendas sem badges de provider.

### Motor IA (src/lib/ai/)
- `orchestrator.ts`: multi-provider com fallback em cascata (NVIDIA NIM grátis → Gemini grátis → Groq → OpenRouter → DuckDuckGo web search).
- `hermes.ts`: motor interno — NUNCA mencionar "Hermes" nas respostas, sempre responder como Kiya.

---

## 10. Fluxos de Compra e Pagamento

### Página de Checkout (`/checkout`)
Local: `src/app/checkout/page.tsx`

Fluxo:
1. **Gate de login obrigatório**: se não logado, redireciona para `/login?redirect=...`.
2. Dados pessoais: nome completo, email, CPF (com validação), telefone (opcional).
3. Método de pagamento:
   - **PIX** (5% de desconto à vista).
   - **Cartão de crédito** (até 12x sem juros, parcela mínima R$5).
   - **Boleto** (compensação em 1-2 dias).
4. Cupom de desconto (códigos válidos: BEMVINDO10, BLACKFRIDAY 60%, KIYVO5, PRIMEIRACOMPRA 15%).
5. **KD Points como desconto real** (slider 0..máx permitido, botão "Usar máximo", cálculo de 50% do valor).
6. Anti-fraude client-side em tempo real (detecta email temporário, CPF inválido, cartão teste).
7. Ao confirmar:
   - Simula processamento (1.8s) — em produção conecta ao Stripe.
   - Debita KD Points se usados.
   - Salva compra no store de purchases (com bloco de texto como arquivo de entrega baixável).
   - Ganha 5 KD por R$1 gasto + notificações (compra confirmada + KD ganhos).
   - Dispara confete (SimpleConfetti).
   - Mostra tela de sucesso com número do pedido, botão de download do comprovante/arquivo e CTAs para biblioteca/início.

### Cupons
- Cupons do sistema hardcoded no checkout (para fallback).
- Cupons do vendedor via `src/lib/coupons/`.
- Resgate de cupom por KD Points via `useKD.getState().resgatarCupom(R$)`.

### Carrinho
- MiniCart lateral (`src/components/cart/MiniCart.tsx`) abre ao clicar no ícone do header (desktop e mobile).
- Funções: mostrar itens, alterar qty (+/-), remover, limpar, subtotal, desconto PIX 5%, CTA para checkout.
- Página `/carrinho` completa também existe.
- Provider: `src/components/cart/CartProvider.tsx`.

### Biblioteca (Compras)
- Páginas: `/library` e alias `/biblioteca`.
- Mostra produtos comprados com botão de download (gera blob URL com as instruções de acesso).

---

## 11. Fluxo do Vendedor

### Rota `/vender`
- **Gate duplo**: primeiro login, depois KYC. Se não completou KYC redireciona para `/vendor/onboarding/kyc`.
- Formulário de anúncio com:
  - Título, descrição, categoria, preço, preço de (desconto).
  - Tipo: anúncio único ou dinâmico.
  - **Upload de arquivo do produto** (o produto digital a ser entregue).
  - Toggle de entrega automática.
  - Cupom obrigatório entre 2% e 70%.
  - Validações client+server.

### Dashboard do Vendedor
- `/vendor/dashboard` — visão geral, vendas, ganhos.
- `/vendor/products` — listagem dos produtos.
- `/vendor/finance` — retiradas, saldo pendente, saldo disponível.
- `/vendor/onboarding/kyc` — onboarding KYC (upload de documento, dados bancários, perfil).
- `/vendor/chat` — chat com compradores.

### Taxas (domínio puro em `src/domain/fees/FeeEngine.ts`)
| Plano | Taxa % | Taxa fixa | Teto por venda | Taxa Zero |
|---|---|---|---|---|
| Free | 8% | R$0,50 | R$50 | 5.000 primeiras vendas |
| Plus | 6,5% | R$0,40 | R$40 | — |
| Pro | 5% | R$0,30 | R$30 | — |
| Vendor Pro | 3% | R$0,20 | R$20 | +5k vendas 0% |

### Saque (`/saque`, `/conta/retiradas`)
- Mínimo R$30.
- Taxa fixa R$0,99 por saque.
- PIX em 1 dia útil.
- Saldo disponível após 7 dias da venda (janela de garantia).
- Formulário: chave PIX (cpf/email/celular/aleatória), valor, tipo de chave.

### Boost (`/boost`)
- Seletor de produto (meus produtos publicados).
- 4 pacotes (ver seção 13).
- Pagamento via cartão/PIX ou KD Points.
- Atualiza em tempo real a lista de boosts ativos com tempo restante.

---

## 12. Sistema de Pontos (KD Points)

Persistência: `kiyvo_kd_points` no localStorage.

- **100 KD = R$ 1,00 de desconto.**
- **Máximo de 50% do valor** do pedido (calculado por `maxKDPara(valor)`).
- **Bônus de boas-vindas:** 150 KD no primeiro acesso (R$1,50).
- **Ganha KD:**
  - Compra: 5 KD por R$1 gasto (mínimo 10).
  - Review sem foto: +25 KD.
  - Review com foto: +50 KD.
  - Indicação (indique-ganhe): bônus futuro.
  - KYC completo: bônus futuro.
- **Gasta KD:**
  - Desconto no checkout (via slider).
  - Compra de Boost (6h=490KD, 24h=1490KD, 7d=6990KD, 30d=19990KD).
  - Resgate de cupom (conversão 100KD → R$1,00 em cupom).
- Transações com tipo: `compra | review | indicacao | boasvindas | saque | ajuste | cupom_resgate`.

### Loja de Recompensas (`/recompensas`)
Mostra saldo KD, histórico de transações, cupons disponíveis para resgate, regras do programa.

### Badge KD no Header
Ícone de moeda dourada ao lado do sino de notificações/carrinho, com o saldo atual em tempo real.

---

## 13. Boost de Produtos (Destaques Pagos)

Arquivo: `src/lib/boost/store.ts`.

Pacotes oficiais:
| ID | Duração | Preço R$ | Preço KD | Multiplicador de views | Selo |
|---|---|---|---|---|---|
| `boost_6h` | 6 horas | 4,90 | 490 | 1.8x | 🔥 RELÂMPAGO |
| `boost_24h` | 24 horas | 14,90 | 1.490 | 2.5x | ⭐ DESTAQUE (recomendado) |
| `boost_7d` | 7 dias | 69,90 | 6.990 | 3.5x | 👑 ESCOLHA DA SEMANA |
| `boost_30d` | 30 dias | 199,90 | 19.990 | 5x | 💎 PREMIUM |

### Efeitos visuais de boost em produtos
- Badge dourado/laranja "Destaque" com ícone de raio.
- Borda âmbar no card.
- Anel de pulso âmbar animado ao redor do card (`box-shadow` pulse).
- Aparece primeiro em buscas e carrosseis (TrendingNow, DailyDeals).
- Produtos boostados aparecem na Home "Em Alta 🔥".

### Limpeza automática
Boosts expirados são removidos no `init()` da store e em `removerExpirados()` para não acumular.

---

## 14. KD Points, Cupons e Promoções

### Barra de Ofertas Relâmpago (`FlashSaleBar`)
Abaixo do header em todas as páginas:
- Gradiente vermelho/laranja/âmbar com shine animado.
- Contador regressivo até meia-noite (HH:MM:SS).
- Ofertas rotativas (a cada 5s) sobre black friday, taxa zero, KD Points.
- Botão dismissível (lembrança na sessionStorage).

### DailyDeals (Ofertas do Dia)
- Seção da Home com carrossel horizontal.
- Mostra os 12 produtos com MAIOR desconto percentual do catálogo.
- Contador regressivo VERMELHO até meia-noite.
- Cards com borda vermelha e badge de desconto grande.

### TrendingNow (Em Alta 🔥)
- Carrossel horizontal com produtos boostados + mais vendidos.
- Badge de "Destaque" em dourado para produtos boostados.
- Mostra vendas totais e rating.

---

## 15. Notificações e Comunicação

### Sistema de Notificações (src/lib/notifications/store.ts)
Tipos de notificação:
- `compra` — compra confirmada, produto liberado.
- `venda` — você vendeu um produto.
- `review` — alguém avaliou seu produto.
- `kd` — ganhou ou gastou KD Points.
- `cupom` — cupom aplicado/resgatado.
- `follow` — alguém seguiu sua loja.
- `afiliado` — comissão de afiliado.
- `freela` — proposta de freelance.
- `sistema` — mensagens da plataforma.

Componentes:
- **Sino no header** com badge vermelho de contagem e dropdown.
- Página `/notificacoes` completa com lista, ícones por tipo, tempo relativo, marcar como lida, limpar.

### Widget Kiya
Botão verde flutuante no canto inferior direito (ajustado para não cobrir botão de voltar ao topo).
- Abre chat com a Kiya.
- Resposta em tempo real via `/api/hermes`.

### Telegram Support
Ícone/link para o Telegram de suporte.

---

## 16. Rotas Públicas e Protegidas (Middleware)

Middleware em `src/middleware.ts` com whitelist de rotas públicas.

### Rotas PÚBLICAS (não precisa estar logado)
Incluem mas não se limitam a:
- `/` (home)
- `/p/[slug]`, `/produto/[id]`, `/v/[slug]`, `/c/...` (produtos)
- `/loja/[handle]`, `/lojas`
- `/categoria/[slug]`, `/categorias`
- `/buscar`
- `/login`, `/cadastro`, `/auth/**` (magic-link, forgot, reset)
- `/planos`, `/comparar-planos`, `/tarifas`, `/fees`, `/calcular-taxas`, `/calculadora-lucro`
- `/como-funciona`, `/sobre`, `/blog`, `/blog/[slug]`, `/depoimentos`, `/changelog`
- `/ofertas`, `/blackfriday`, `/taxa-zero`
- `/ajuda`, `/faq`, `/suporte`, `/contato`
- `/termos`, `/privacidade`, `/cookies`, `/lgpd`, `/reembolso`, `/direitos-autorais`, `/dmca`, `/acordos-juridicos`, `/codigo-conduta`
- `/biblioteca`, `/library` (podem ver, mas comprar é só logado)
- `/recompensas` (visualização)
- `/recomendacoes`
- `/shorts`
- `/afiliados` (página pública)
- `/trafego-pago`
- `/freelance`
- `/copiloto`
- `/hermes` (página da Kiya)
- `/agentes`, `/agentes/[slug]`
- `/api/agents/**`, `/api/agent`, `/api/hermes`, `/api/ai/run`, `/api/health`, `/api/v1/**` (pública), `/api/products`, `/api/categories`, `/api/setup`
- `/comunidade`, `/eventos`, `/imprensa`, `/investidores`, `/carreiras`, `/institucional`
- `/verificacao` (páginas de confirmação)
- `/status`, `/erro`, `/garantia`, `/seguranca`, `/conexao-segura`, `/conferencia-identidade`
- `/r/[code]` (links de indicação)
- `/indique-ganhe`
- `/vender-guia`, `/comprar-guia`, `/tutorial/**`
- `/melhor-plataforma-*`, `/renda-extra`, `/melhor-plataforma-produtos-digitais` (páginas SEO)
- `/configuracoes`, `/feedback`, `/denunciar`, `/ajuda`, `/help`
- `/doar`
- `/novidades`, `/conquistas`, `/desafios`, `/certificacoes`
- `/backup-dados`, `/exportar-dados`, `/exportar`, `/deletar-conta` (algumas exigem sessão via redirecionamento)
- `/bug-bounty`, `/blacklist`, `/dlp`, `/criptografia`, `/anti-fraude`, `/compliance`
- `/conversor-moeda`
- `/mtrx/console` (página secreta, acesso por código)

### Rotas PROTEGIDAS (precisa login — middleware + páginas verificam)
- `/checkout`, `/checkout/sucesso`, `/checkout/cancelado`
- `/conta/**` (perfil, compras, vendas, retiradas, anúncios, emblemas)
- `/vendor/**` (dashboard do vendedor)
- `/admin/**` (exige papel admin)
- `/wallet`, `/pagamentos`
- `/biblioteca` downloads (baixar arquivos exige sessão)
- `/conta/suspensa` (página de banimento)
- `/afiliados/dashboard`, `/affiliate/dashboard`
- `/boost` (compra de boost)
- `/api/favorites/**`, `/api/reviews/**`, `/api/users/me/**`, `/api/checkout/**`, `/api/orders/**`

### Páginas de Erro e Loading
Todas as rotas devem ter `error.tsx` e `loading.tsx` com design bonito e mensagem em PT-BR.
- Não deve aparecer "Acesso bloqueado por excesso de requisições" — usar página bonita com ilustração e botão "Tentar novamente" / "Voltar ao início".

---

## 17. Bugs Conhecidos e Dívidas Técnicas

Esta seção é atualizada constantemente com bugs a corrigir:

### Críticos (corrigir PRIMEIRO antes de adicionar features)
- [ ] **Performance mobile**: em celulares de baixo custo a página pode travar. Causas prováveis:
  - Muitas partículas/canvas/meteors no Hero (reduzir drasticamente em <768px: max 6 partículas, 3 meteors).
  - Animações contínuas (floaty, blobs) em muitos elementos ao mesmo tempo no mobile.
  - ClickSpark deve ter count=6, duration=400 no mobile (ao invés de 12/650).
  - Backdrop-filter em excesso em elementos mobile (desligar onde não for essencial).
  - Imports dinâmicos com `ssr:false` para componentes pesados (ParticleField, BackgroundBeams, Hero3D).
  - Listas muito longas sem virtualização (limitar itens visíveis no mobile).
- [ ] **Gate de login**: verificar rotas privadas não podem ser acessadas sem cookie kiyvo_session. Testar `/checkout`, `/conta`, `/vendor/*`.
- [ ] **Erros de requisição**: revisar todos `/api/*.ts` com try/catch, respostas JSON com status HTTP corretos, sem "Unhandled promise rejection".
- [ ] **Polimento UI mobile**:
  - Área de toque mínima de 44x44px em botões/links clicáveis.
  - Inputs com `font-size: 16px` no mobile para evitar zoom iOS (já existe no CSS global, mas conferir).
  - Espaçamentos adequados em formulários.
  - Header mobile não pode ficar cheio (manter enxuto: logo, busca ⌘K, sino, carrinho, menu).
  - Drawers/modais devem ter `overscroll-behavior: contain` e fechar ao clicar fora.

### Médios
- [ ] Produtos demo antigos (d-001..d-058) ainda podem ter vendedores genéricos em vez de `store_id` atrelado às 60 lojas oficiais.
- [ ] Review dá KD Points, mas poderia também dar pontos para o vendedor quando recebe review positiva.
- [ ] /boost visualmente poderia ter mais destaque quando um produto está boostado (ex: selo maior, animação mais visível).
- [ ] Algumas páginas de agente individuais além da route podem ainda ter conteúdo estático (verificar se /agentes/[slug]/page.tsx consome a API `/api/agents/[slug]`).
- [ ] Página `/indique-ganhe` precisa de lógica real de geração de código/link e recompensa.
- [ ] Dark mode pode ter cores hardcoded em algumas páginas (verificar uso de `dark:` variant).
- [ ] MiniCart deve fechar automaticamente ao mudar de rota.

### Baixa prioridade
- [ ] PWA (manifest.json e service worker para instalar como app).
- [ ] Notificações push do navegador.
- [ ] Temas adicionais (alto contraste).

---

## 18. Roadmap e Próximas Features

Prioridade ao corrigir bugs da seção 17 PRIMEIRO. Depois, implementar:

1. **Indique e Ganhe funcional**:
   - Geração de código único por usuário (`/r/CODIGO`).
   - Quando indicado se cadastra e compra, indicador ganha 500 KD + 5% da primeira venda em KD.
   - Indicado ganha 10% de desconto na primeira compra.
2. **Saque 100% funcional**:
   - Tela com saldo pendente vs disponível.
   - Cadastro de chave PIX validada.
   - Solicitação de saque com senha transacional de 6 dígitos.
   - Histórico de saques com status (processando, pago, cancelado).
3. **KYC aprimorado**:
   - Upload selfie + documento (CNF/RG frente e verso) via FileReader → base64 localStorage.
   - Validação de dados bancários.
   - Status de análise (em análise, aprovado, reprovado).
4. **Comparador de produtos** (`/comparar`):
   - Selecionar até 4 produtos.
   - Tabela com preço, rating, vendedor, desconto, categoria, tipo de entrega.
5. **Sistema de afiliados completo**:
   - Link de afiliado por produto.
   - Comissão percentual definida pelo vendedor.
   - Dashboard de afiliado com cliques, vendas, comissões a receber.
6. **KIYVO Shorts aprimorado**:
   - Player vertical como TikTok/Reels.
   - Upload de vídeos curtos de demonstração de produtos.
   - Like, compartilhar, link para produto no canto.
7. **Pull-to-refresh em listas mobile**.
8. **Skeleton screens em todas as listas** (produtos, reviews, notificações, biblioteca).
9. **Filtros avançados na busca** (preço mínimo/máximo, categoria, avaliação mínima, entrega automática, taxa zero).
10. **Página `/ofertas` com abas**: mais descontados, taxa zero, releases novos.
11. **Toast de adicionar ao carrinho** com CTA "Ver carrinho".
12. **Contador animado no ícone do carrinho** (sempre que add item, bounce).
13. **Confirmação de email com botão reenviar e contador regressivo**.
14. **Dark mode auditado** em TODAS as páginas (pode haver páginas sem dark: variants).
15. **Acessibilidade WCAG AA**: ARIA labels, navegação por teclado, foco visível, contraste 4.5:1.

---

## 19. Credenciais e Fallbacks

### Firebase (Autenticação)
Credenciais REAIS embutidas no código, NÃO precisa de .env para funcionar:
```js
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAjE9-hudrvbc8ORijo2EiT1wLMa2Zs3lM",
  authDomain: "kiyvo-66d75.firebaseapp.com",
  projectId: "kiyvo-66d75",
  storageBucket: "kiyvo-66d75.firebasestorage.app",
  messagingSenderId: "295832431053",
  appId: "1:295832431053:web:9533b01713ff962839fc84",
  measurementId: "G-HQHTBFQ5Y5"
}
```

### Supabase (fallback demo quando sem chaves)
- URL: `https://ytiyqkliojawihfnlwzo.supabase.co` (região São Paulo).
- Chaves são opcionais; sem elas o LocalDB é usado como fallback.

### Stripe
- Sem chave real configurada atualmente (modo simulação).
- apiVersion fixa: `'2026-06-24.dahlia'`.
- Webhook secreto configurável por env.

### GitHub App para OAuth (quando quiser ativar login próprio direto)
Criar em https://github.com/settings/apps/new com estas configurações:
- **App name**: KIYVO Login
- **Homepage URL**: https://kiyvo.com.br
- **Callback URLs**:
  - `https://kiyvo.com.br/api/auth/callback/github`
  - `https://kiyvo.vercel.app/api/auth/callback/github`
  - `http://localhost:3000/api/auth/callback/github` (desenvolvimento)
- **Expire user authorization tokens**: ✅ ligado
- **Request OAuth during installation**: ✅ ligado
- **Webhooks**: ❌ desligado (Active = false)
- **Where can be installed**: Any account
- **Account permissions**:
  - Email addresses: Read-only
  - Profile: Read-only
  - Todas as outras: No access
- **Repository/Organization permissions**: todas No access
- **Events**: nenhum inscrito

Após criar, colocar Client ID e Client Secret no `.env.local` como `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`.

---

## 20. Deploy e Ambientes

### Produção
- **URL principal**: https://kiyvo.vercel.app/ (Vercel).
- **Domínio alvo**: kiyvo.com.br (quando DNS propagar).
- **Deploy por push force para branch `main`**:
  ```bash
  git push origin arena/019f75ba-kiyvo:main --force
  ```
- **Sempre resetar remote após push**:
  ```bash
  git remote set-url origin "https://github.com/rhzcria7-creator/kiyvo.git"
  ```

### Desenvolvimento Local
```bash
npm install next@14.2.29 --save-exact
npm run dev          # http://localhost:3000
npm run build        # build produção
npm run start        # iniciar servidor produção
npm run lint         # lint
npm test             # jest
```

### Variáveis de Ambiente (.env.local)
Nenhuma é ESTRITAMENTE necessária para rodar o app (há fallbacks demo). Para ativar funcionalidades reais:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `NVIDIA_API_KEY` / `GEMINI_API_KEY` / `GROQ_API_KEY` / `OPENROUTER_API_KEY` (provedores IA)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (OAuth GitHub próprio)
- `NEXT_PUBLIC_SITE_URL` (padrão `https://kiyvo.com.br`)

---

## 21. Performance Mobile (Crítico)

O dono reclamou de travamentos no celular. ESTA É A PRIORIDADE NÚMERO 1.

### Diretrizes obrigatórias de performance:
1. **Renderização condicional por viewport:**
   ```tsx
   const [isMobile, setIsMobile] = useState(false)
   useEffect(() => {
     const check = () => setIsMobile(window.innerWidth < 768)
     check()
     window.addEventListener('resize', check)
     return () => window.removeEventListener('resize', check)
   }, [])
   ```
   Em mobile, desligue:
   - ParticleField, Meteors, BackgroundBeams → substitua por um gradiente simples.
   - Blobs animados com scale/translate contínuo → deixe 1 só, mais lento.
   - ClickSpark com `count={isMobile ? 6 : 12}`, `duration={isMobile ? 400 : 650}`, `showRipple={!isMobile}`.
   - Efeitos 3D do @react-three/fiber.
   - backdrop-filter em elementos não-essenciais.

2. **IntersectionObserver com margem conservadora:**
   - Usar `viewport={{ once: true, margin: '80px' }}` (não carregar animações muito antes de entrar).
   - Evitar `margin: '-20%'` em mobile (muitas animações disparando ao mesmo tempo).

3. **Lazy loading de componentes pesados:**
   ```tsx
   const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
     ssr: false,
     loading: () => null
   })
   ```

4. **Memoização:**
   - `React.memo` em componentes de lista que não mudam frequentemente (ProductCard no carrossel).
   - `useMemo` em cálculos pesados (filtragem/sort de listas grandes).
   - `useCallback` em handlers passados para componentes filhos.

5. **CSS:**
   - Usar `transform: translateZ(0)` e `will-change` APENAS em elementos que estão ANIMANDO ativamente (não em tudo).
   - Evitar `box-shadow` muito grandes em vários elementos no mobile.
   - Usar `contain: layout style paint` em listas grandes.

6. **Event listeners:**
   - SEMPRE remover event listeners e intervals/timeouts no return do useEffect.
   - Throttle em handlers de scroll/resize (16ms ou usar requestAnimationFrame).

7. **Imagens:**
   - Usar o componente `next/image` com tamanhos explícitos.
   - `loading="lazy"` em imagens abaixo da dobra.
   - Placeholder blur ou gradient fallback.

---

## 22. Contas e Seeds Administrativas

### Contas admin (do LocalDB) — NUNCA EXIBIR PUBLICAMENTE
- `admin@kiyvo.com.br` / senha `Kiyvo@2025` (admin master)
- `ceo@kiyvo.com` / senha `Kiyvo@2025`
- `cto@kiyvo.com.br` / senha `Kiyvo@2025`

### Conta demo (para testes)
- `demo@kiyvo.com.br` / senha `demo123`
- Usuário precisa aceitar o aviso de "modo demo" para entrar.
- Os dados são armazenados em localStorage e podem ser perdidos ao limpar o cache.

---

## 23. Convenções de Código

### Nomenclatura
- **Componentes:** PascalCase (ex: `ProductCard.tsx`, `MiniCart.tsx`).
- **Hooks:** use[Algo].ts (ex: `useProtectedAction.tsx`).
- **Utils/stores:** camelCase (ex: `clientAntiFraud.ts`, `quickSearch.ts`).
- **Páginas:** kebab-case (ex: `minha-conta`), parâmetros em colchetes `[slug]`.
- **Variáveis:** camelCase em inglês.
- **Comentários:** português do Brasil, claros, marcando seções com `// ──── NOME ────`.

### Estrutura de componente
```tsx
'use client' // OBRIGATÓRIO em todo componente com interatividade
// Comentário curto explicando o que faz.
import { ... } from '...'

interface Props { ... }

export function MeuComponente({ prop1, prop2 }: Props) {
  // 1. Hooks (useState, useRef, useEffect, useRouter, useAuth, etc.)
  // 2. Derivações de estado (useMemo)
  // 3. Handlers
  // 4. Retorno JSX
  return (
    <motion.div initial={{...}} whileInView={{...}} ...>
      ...
    </motion.div>
  )
}
```

### Framer Motion
- Sempre use `initial`, `whileInView`/`animate` para entradas.
- `whileHover={{ scale: 1.02, y: -2 }}` em cards/botões (valores pequenos para não distrair).
- `whileTap={{ scale: 0.97 }}` em todos os botões.
- `viewport={{ once: true }}` para animações que disparam só na primeira entrada.
- Prefira `transition={{ type: 'spring', stiffness: 200, damping: 22 }}` para micro-interações naturais.

### Tratamento de Erros
- Toda chamada de API/função async deve ter try/catch com feedback visual (toast).
- Páginas devem ter `error.tsx` com boundary bonito.
- Componentes que podem quebrar devem ser embrulhados em ErrorBoundary quando apropriado.

### Acessibilidade
- Todo input tem `<label>` associado (htmlFor) ou aria-label.
- Botões sem texto devem ter `aria-label`.
- Links que abrem em nova aba devem informar "abre em nova janela" em aria-label ou texto visível.
- Foco visível mantido (não remover outlines sem substituir por anéis customizados).
- Cores com contraste mínimo 4.5:1 (checar com devtools).

### Tradução/Texto
- Todo texto visível em PORTUGUÊS DO BRASIL.
- Erros em PT-BR amigáveis (não técnicos pro usuário final).
- Formato de moeda: `R$ 99,90` (vírgula como decimal).
- Datas: formatação `toLocaleDateString('pt-BR')` ou `toLocaleString('pt-BR')`.
- CPF, telefone, CEP com máscaras nos inputs.

---

## Atualizações da Memória

Última atualização desta memória: v12.3.1 (24/07/2026)
- Adicionadas seções completas de: Performance Mobile, Bugs Conhecidos, Roadmap, Credenciais GitHub App.
- Documentado Magic Link, KD no checkout, Boost real, DailyDeals, TrendingNow, FlashSaleBar.
- Reorganização geral do índice e seções.
- Próxima atualização: após varredura completa de bugs mobile.
