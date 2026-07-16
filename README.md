# 🎮 Playdex — Marketplace de Ativos Digitais para Jogos

> Plataforma completa de compra e venda de contas, keys, itens, gold e gift cards para jogos online. Construída com Next.js 14, TypeScript, TailwindCSS, Framer Motion e React Three Fiber.

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18.17+
- **npm** ou **pnpm** (recomendado: pnpm)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/playdex.git
cd playdex

# Instale as dependências
npm install
# ou
pnpm install

# Copie as variáveis de ambiente
cp .env.example .env.local

# Rode em desenvolvimento
npm run dev
# ou
pnpm dev
```

Acesse **http://localhost:3000** no navegador.

---

## 📁 Estrutura do Projeto

```
playdex/
├── public/                    # Assets estáticos
├── src/
│   ├── app/                   # Páginas (App Router Next.js 14)
│   │   ├── layout.tsx         # Layout raiz
│   │   ├── page.tsx           # Home
│   │   ├── login/             # Login
│   │   ├── cadastro/          # Cadastro
│   │   ├── categorias/        # Listagem de categorias
│   │   ├── categoria/[slug]/  # Categoria específica + produtos
│   │   ├── produto/[id]/      # Página de produto
│   │   ├── checkout/          # Checkout com pagamento
│   │   ├── conta/             # Área do cliente
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── compras/       # Minhas compras
│   │   │   ├── vendas/        # Minhas vendas
│   │   │   ├── anuncios/      # Meus anúncios
│   │   │   ├── retiradas/     # Retiradas/saques
│   │   │   └── verificacoes/  # Verificação KYC
│   │   ├── anunciar/          # Criar anúncio
│   │   ├── como-funciona/     # Como funciona
│   │   ├── tarifas/           # Planos e tarifas
│   │   ├── pagamentos/        # Formas de pagamento
│   │   ├── recompensas/       # PD Points
│   │   ├── blog/              # Blog listing
│   │   ├── blog/[slug]/       # Blog post
│   │   ├── faq/               # Perguntas frequentes
│   │   ├── suporte/           # Central de ajuda
│   │   ├── termos/            # Termos de uso
│   │   ├── privacidade/       # Política de privacidade
│   │   └── reembolso/         # Política de reembolso
│   ├── components/
│   │   ├── ui/                # Componentes reutilizáveis (Button, Card, Input, Badge, Modal, Skeleton, SearchBar)
│   │   ├── layout/            # Header, Footer
│   │   ├── home/              # Hero, Hero3D, CategoriesGrid, FeaturedProducts, Reviews, BlogSection
│   │   ├── product/           # ProductCard
│   │   └── shared/            # PageTransition
│   ├── data/                  # Dados mock (products, categories, blog, reviews, FAQ)
│   ├── hooks/                 # Custom hooks (useScrollAnimation)
│   ├── lib/                   # Utilitários (cn, formatPrice, etc.)
│   └── types/                 # TypeScript interfaces
├── package.json
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── README.md
```

---

## 🎨 Design System

### Paleta de Cores

| Token | Cor | Uso |
|-------|-----|-----|
| `brand-600` | `#2563EB` | Cor primária (azul) |
| `brand-500` | `#3B82F6` | Primary light |
| `brand-700` | `#1D4ED8` | Primary dark |
| `surface-0` | `#FFFFFF` | Background principal |
| `surface-50` | `#F8FAFC` | Background de cards/seções |
| `surface-900` | `#0F172A` | Texto principal |
| `surface-500` | `#64748B` | Texto secundário |

### Fontes

- **Display:** Plus Jakarta Sans (700, 800)
- **Body:** Inter (400, 500, 600)
- **Mono:** JetBrains Mono

### Componentes UI

Todos os componentes estão em `/components/ui/` e usam:

- **Glassmorphism:** `.glass` / `.glass-dark`
- **Neumorphism:** `.neu-raised` / `.neu-pressed`
- **Hover 3D:** Cards com `hover:-translate-y-1 hover:shadow-card-hover`
- **Micro-animações:** Framer Motion em todos os botões e cards
- **Skeleton loading:** `.skeleton` com shimmer animado
- **Transições de página:** `PageTransition` wrapper

---

## 🌐 Deploy na Vercel

### Opção 1: Via CLI

```bash
# Instale a Vercel CLI
npm i -g vercel

# Faça deploy
vercel

# Para produção
vercel --prod
```

### Opção 2: Via GitHub

1. Push o código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Clique em "New Project" → Importe o repositório
4. Configure as variáveis de ambiente (se necessário)
5. Deploy!

### Variáveis de Ambiente para Produção

```env
NEXT_PUBLIC_APP_URL=https://playdex.com.br
NEXT_PUBLIC_APP_NAME=Playdex
```

---

## 🛠️ Stack Técnica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 14.2 | Framework React com App Router |
| React | 18.3 | UI library |
| TypeScript | 5.7 | Type safety |
| TailwindCSS | 3.4 | Styling utility-first |
| Framer Motion | 11.18 | Animações e transições |
| React Three Fiber | 8.17 | Elemento 3D no hero |
| @react-three/drei | 9.117 | Helpers R3F |
| Three.js | 0.170 | 3D engine |
| Lucide React | 0.468 | Ícones |
| clsx | 2.1 | Class name merging |

---

## ⚡ Performance

- ✅ **Lazy loading** de imagens com `next/image`
- ✅ **Formatos otimizados** WebP/AVIF via next.config
- ✅ **Code splitting** automático por página
- ✅ **3D carregado dinamicamente** com `next/dynamic` (SSR: false)
- ✅ **CSS otimizado** com Tailwind purge
- ✅ **Fontes otimizadas** com `next/font` (ou Google Fonts)
- ✅ **Skeleton loading** em todas as listagens
- ✅ **Intersection Observer** para animações on-scroll

---

## 📋 Funcionalidades Implementadas

- [x] Home com Hero 3D animado
- [x] Catálogo de categorias com imagens
- [x] Página de categoria com filtros (preço, subcategorias)
- [x] Página de produto com galeria, preço, vendedor, garantias
- [x] Checkout com escolha de pagamento (PIX, cartão, saldo, crypto)
- [x] Planos de segurança (Básico, Plus, Premium)
- [x] Login e Cadastro com autenticação social
- [x] Dashboard da conta com estatísticas
- [x] Minhas Compras, Vendas, Anúncios
- [x] Retiradas com opção Normal/Turbo
- [x] Verificação de conta (KYC)
- [x] Criar Anúncio com escolha de plano
- [x] Como Funciona (3 passos)
- [x] Tarifas e Prazos com tabela
- [x] Formas de Pagamento
- [x] Programa de Recompensas (PD Points)
- [x] Blog com artigos
- [x] FAQ com categorias e accordion
- [x] Central de Ajuda
- [x] Termos de Uso
- [x] Política de Privacidade
- [x] Política de Reembolso
- [x] Busca com autocomplete
- [x] Mobile-first responsivo
- [x] Animações e micro-interações
- [x] Glassmorphism e Neumorphism
- [x] Skeleton loading

---

## 📄 Licença

Este projeto é apenas para fins educacionais e de demonstração. Todos os dados são fictícios (mock).

---

Feito com 💙 por **Playdex**
