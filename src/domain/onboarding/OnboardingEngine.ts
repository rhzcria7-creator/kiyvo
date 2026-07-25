// ─────────────────────────────────────────────────────────────
// Onboarding Engine v0.0.1 — Tour interativo para novos usuários
// Steps progressivos, dicas contextuais, gamificação
// ─────────────────────────────────────────────────────────────

export interface OnboardingStep {
  id: string
  title: string
  description: string
  targetSelector: string // CSS selector do elemento alvo
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  icon: string
  action?: string // 'next' | 'skip' | 'link'
  linkHref?: string
}

export interface OnboardingTour {
  id: string
  name: string
  trigger: 'first_login' | 'first_purchase' | 'first_sale' | 'milestone'
  steps: OnboardingStep[]
  isActive: boolean
  role: 'buyer' | 'seller' | 'both'
}

const BUYER_TOUR: OnboardingTour = {
  id: 'buyer_onboarding',
  name: 'Primeiros Passos como Comprador',
  trigger: 'first_login',
  steps: [
    {
      id: 'step_welcome',
      title: 'Bem-vindo ao KIYVO! 🎉',
      description: 'O marketplace mais justo de produtos digitais. Taxa zero nas primeiras R$ 5.000 em vendas!',
      targetSelector: '#hero-section',
      position: 'center',
      icon: '👋',
    },
    {
      id: 'step_search',
      title: 'Buscar Produtos',
      description: 'Use a barra de busca para encontrar produtos. Pressione Cmd+K para busca rápida.',
      targetSelector: '[data-search-bar]',
      position: 'bottom',
      icon: '🔍',
    },
    {
      id: 'step_categories',
      title: 'Categorias',
      description: 'Navegue por categorias: Software, Cursos, E-books, Templates e muito mais.',
      targetSelector: '[data-categories]',
      position: 'top',
      icon: '📂',
    },
    {
      id: 'step_cart',
      title: 'Carrinho',
      description: 'Adicione produtos ao carrinho e finalize a compra em poucos cliques.',
      targetSelector: '[data-cart]',
      position: 'left',
      icon: '🛒',
    },
    {
      id: 'step_kiya',
      title: 'Conheça a Kiya 🤖',
      description: 'Nossa assistente IA está disponível 24h para ajudar com dúvidas, recomendações e suporte.',
      targetSelector: '[data-kiya-widget]',
      position: 'left',
      icon: '🤖',
    },
    {
      id: 'step_done',
      title: 'Tudo Pronto! 🚀',
      description: 'Explore o marketplace, encontre produtos incríveis e comece a comprar. Qualquer dúvida, a Kiya está aqui!',
      targetSelector: '#hero-section',
      position: 'center',
      icon: '🎉',
      action: 'link',
      linkHref: '/trending',
    },
  ],
  isActive: true,
  role: 'buyer',
}

const SELLER_TOUR: OnboardingTour = {
  id: 'seller_onboarding',
  name: 'Primeiros Passos como Vendedor',
  trigger: 'first_sale',
  steps: [
    {
      id: 'step_seller_welcome',
      title: 'Vender no KIYVO 💰',
      description: 'Taxa zero até R$ 5.000 em vendas! Crie seu primeiro produto agora.',
      targetSelector: '[data-seller-dashboard]',
      position: 'center',
      icon: '💰',
    },
    {
      id: 'step_create_product',
      title: 'Criar Produto',
      description: 'Cadastre seu produto digital. Aceitamos softwares, cursos, e-books, templates e mais.',
      targetSelector: '[data-create-product]',
      position: 'bottom',
      icon: '📦',
    },
    {
      id: 'step_fees',
      title: 'Taxas Transparentes',
      description: 'Veja exatamente quanto você ganha por venda. Calculadora de taxas disponível.',
      targetSelector: '[data-fee-calculator]',
      position: 'top',
      icon: '📊',
    },
    {
      id: 'step_boost',
      title: 'Impulsione suas Vendas',
      description: 'Use o Boost para destacar seus produtos. Pacotes de 6h, 24h, 7d e 30d.',
      targetSelector: '[data-boost-section]',
      position: 'top',
      icon: '🚀',
    },
    {
      id: 'step_withdraw',
      title: 'Saques via PIX',
      description: 'Receba suas vendas em 1 dia útil via PIX. Mínimo de R$ 30 para saque.',
      targetSelector: '[data-withdraw-section]',
      position: 'top',
      icon: '💳',
    },
    {
      id: 'step_done_seller',
      title: 'Bora Vender! 🚀',
      description: 'Seu primeiro produto está a poucos cliques. Comece agora e aproveite taxa zero!',
      targetSelector: '#hero-section',
      position: 'center',
      icon: '🎉',
      action: 'link',
      linkHref: '/seller/products/new',
    },
  ],
  isActive: true,
  role: 'seller',
}

export class OnboardingEngine {
  /**
   * Retorna tour baseado no trigger
   */
  getTour(trigger: OnboardingTour['trigger'], role: 'buyer' | 'seller'): OnboardingTour | null {
    if (role === 'buyer' && trigger === 'first_login') return BUYER_TOUR
    if (role === 'seller' && trigger === 'first_sale') return SELLER_TOUR
    return null
  }

  /**
   * Retorna step específico
   */
  getStep(tour: OnboardingTour, stepId: string): OnboardingStep | undefined {
    return tour.steps.find(s => s.id === stepId)
  }

  /**
   * Calcula progresso do tour
   */
  getProgress(tour: OnboardingTour, currentStepIndex: number): { percent: number; current: number; total: number } {
    return {
      percent: Math.round((currentStepIndex / tour.steps.length) * 100),
      current: currentStepIndex + 1,
      total: tour.steps.length,
    }
  }

  /**
   * Gera dica contextual baseada na página
   */
  getContextualHint(pathname: string, userRole: 'buyer' | 'seller'): string | null {
    const hints: Record<string, Record<string, string>> = {
      buyer: {
        '/': 'Explore os destaques e ofertas do dia!',
        '/search': 'Use filtros para encontrar exatamente o que precisa.',
        '/cart': 'Revise seu carrinho antes de finalizar a compra.',
        '/checkout': 'Escolha PIX para pagamento mais rápido!',
        '/account/orders': 'Acompanhe seus pedidos e entregas aqui.',
      },
      seller: {
        '/': 'Crie seu primeiro produto e comece a vender!',
        '/seller/products': 'Gerencie seus produtos e veja as vendas.',
        '/seller/analytics': 'Acompanhe métricas de vendas em tempo real.',
        '/seller/withdraw': 'Saque seus ganhos via PIX.',
      },
    }

    const roleHints = hints[userRole]
    if (!roleHints) return null

    for (const [path, hint] of Object.entries(roleHints)) {
      if (pathname.startsWith(path)) return hint
    }

    return null
  }
}

export const onboardingEngine = new OnboardingEngine()
