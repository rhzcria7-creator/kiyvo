import { Plan, FAQ, Order, Listing, Withdrawal } from '@/types'

export const sellerPlans: Plan[] = [
  {
    id: 'silver', name: 'Prata', fee: 9.99, price: 'Grátis',
    features: [
      'Anúncio padrão na listagem',
      'Suporte por ticket',
      'Pagamento via PIX',
      'Retirada em até 2 dias úteis',
    ],
  },
  {
    id: 'gold', name: 'Ouro', fee: 11.99, price: 'Grátis', popular: true,
    features: [
      'Tudo do Prata',
      'Destaque na página principal',
      'Maior visibilidade na busca',
      'Badge de vendedor Ouro',
      'Mais PD Points por venda',
    ],
  },
  {
    id: 'diamond', name: 'Diamante', fee: 12.99, price: 'Grátis',
    features: [
      'Tudo do Ouro',
      'Destaque máximo nas pesquisas',
      'Badge Diamante exclusiva',
      'Suporte prioritário',
      'Máx. PD Points por venda',
      'Relatórios avançados',
    ],
  },
]

export const mockFAQ: FAQ[] = [
  { id: 'f1', category: 'Playdex', question: 'A Playdex é confiável?', answer: 'Com certeza. Somos o marketplace líder em ativos digitais para jogos. Intermediamos todas as transações para garantir que o comprador receba o produto e o vendedor receba o pagamento. Mais de 1 milhão de jogadores confiam na plataforma.' },
  { id: 'f2', category: 'Playdex', question: 'Como funciona a plataforma?', answer: 'O vendedor cria um anúncio, o comprador encontra o produto desejado e clica em Comprar. A Playdex intermedeia o pagamento, garantindo segurança para ambas as partes. Após a confirmação da entrega, liberamos o pagamento ao vendedor.' },
  { id: 'f3', category: 'Comprador', question: 'Como comprar um produto?', answer: 'Basta acessar o anúncio desejado e clicar em "Comprar". Você será direcionado ao checkout, onde pode revisar o pedido, escolher planos de segurança e selecionar a forma de pagamento.' },
  { id: 'f4', category: 'Comprador', question: 'E se eu não receber o produto?', answer: 'Clique em "Tenho um problema" no chat do pedido. Nossa equipe de moderação vai analisar e resolver a situação. Se o produto não for entregue, você recebe seu dinheiro de volta.' },
  { id: 'f5', category: 'Pagamento', question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos PIX (instantâneo), cartão de crédito, boleto bancário, saldo Playdex, PD Points e criptomoedas. PIX e saldo são processados instantaneamente.' },
  { id: 'f6', category: 'Pagamento', question: 'O pagamento é seguro?', answer: 'Sim. A Playdex segura o pagamento e só repassa ao vendedor após a confirmação de entrega. Seus dados de pagamento são criptografados e protegidos.' },
  { id: 'f7', category: 'Vendedor', question: 'Como anunciar meu produto?', answer: 'Crie sua conta e clique em "Anunciar". Preencha as informações do produto, escolha a categoria e adicione imagens. Seu anúncio passará por uma revisão rápida (até 6 horas) e será publicado.' },
  { id: 'f8', category: 'Vendedor', question: 'Quais são as taxas?', answer: 'Oferecemos 3 planos: Prata (9,99%), Ouro (11,99%) e Diamante (12,99%). A taxa só é cobrada quando você vende. Quanto maior o plano, mais visibilidade seu anúncio tem.' },
  { id: 'f9', category: 'Retiradas', question: 'Como retirar meu dinheiro?', answer: 'Após o prazo de liberação, acesse "Minhas Retiradas" e solicite o saque via PIX. Retirada Normal: grátis, até 2 dias úteis. Retirada Turbo: R$ 3,50, instantânea.' },
  { id: 'f10', category: 'Recompensas', question: 'O que são PD Points?', answer: 'PD Points é nosso programa de recompensas. Cada R$1 gasto = 1 PD Point. Você pode acumular e trocar por produtos na plataforma. Cotação: 77 PD Points = R$1.' },
]

export const mockOrders: Order[] = [
  { id: 'PED-2847', product: 'Conta Valorant Diamante', seller: 'PixelKing', price: 89.90, status: 'delivered', date: '14/07/26' },
  { id: 'PED-2846', product: 'Game Pass Ultimate 1 Mês', seller: 'GameVault', price: 14.90, status: 'delivered', date: '13/07/26' },
  { id: 'PED-2845', product: 'Key Steam Elden Ring', seller: 'PixelKing', price: 149.90, status: 'pending', date: '15/07/26' },
  { id: 'PED-2844', product: 'V-Bucks Fortnite 10K', seller: 'DiamondHands', price: 34.90, status: 'delivered', date: '12/07/26' },
]

export const mockListings: Listing[] = [
  { id: 'ANC-101', title: 'Conta Valorant Diamante + 40 Skins', price: 89.90, plan: 'diamond', status: 'active', views: 1234, sales: 234, createdAt: '10/07/26' },
  { id: 'ANC-102', title: 'Game Pass Ultimate 1 Mês', price: 14.90, plan: 'gold', status: 'active', views: 3456, sales: 567, createdAt: '08/07/26' },
  { id: 'ANC-103', title: 'Conta Minecraft Premium', price: 24.90, plan: 'silver', status: 'active', views: 567, sales: 89, createdAt: '05/07/26' },
  { id: 'ANC-104', title: 'Key Steam Wukong', price: 179.90, plan: 'gold', status: 'paused', views: 234, sales: 12, createdAt: '01/07/26' },
]

export const mockWithdrawals: Withdrawal[] = [
  { id: 'SAQ-501', amount: 450.00, method: 'pix', status: 'completed', date: '12/07/26' },
  { id: 'SAQ-500', amount: 230.50, method: 'pix', status: 'completed', date: '10/07/26' },
  { id: 'SAQ-499', amount: 89.90, method: 'pix', status: 'pending', date: '15/07/26' },
]
