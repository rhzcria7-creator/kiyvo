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
      'Mais KD Points por venda',
    ],
  },
  {
    id: 'diamond', name: 'Diamante', fee: 12.99, price: 'Grátis',
    features: [
      'Tudo do Ouro',
      'Destaque máximo nas pesquisas',
      'Badge Diamante exclusiva',
      'Suporte prioritário',
      'Máx. KD Points por venda',
      'Relatórios avançados',
    ],
  },
]

export const mockFAQ: FAQ[] = [
  { id: 'f1', category: 'Kiyvo', question: 'A Kiyvo é confiável?', answer: 'Com certeza. Somos o marketplace líder em produtos digitais. Intermediamos todas as transações para garantir que o comprador receba o produto e o vendedor receba o pagamento. Mais de 1 milhão de usuários confiam na plataforma.' },
  { id: 'f2', category: 'Kiyvo', question: 'O que posso comprar e vender na Kiyvo?', answer: 'Tudo que é digital! Jogos, contas, keys, software, licenças, cursos online, e-books, templates, gift cards, domínios, APIs, serviços freelance e muito mais. Se é digital, você encontra e vende aqui.' },
  { id: 'f3', category: 'Comprador', question: 'Como comprar um produto?', answer: 'Basta acessar o anúncio desejado e clicar em "Comprar". Você será direcionado ao checkout, onde pode revisar o pedido, escolher planos de segurança e selecionar a forma de pagamento.' },
  { id: 'f4', category: 'Comprador', question: 'E se eu não receber o produto?', answer: 'Clique em "Tenho um problema" no chat do pedido. Nossa equipe de moderação vai analisar e resolver a situação. Se o produto não for entregue, você recebe seu dinheiro de volta.' },
  { id: 'f5', category: 'Pagamento', question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos PIX (instantâneo), cartão de crédito, boleto bancário, saldo Kiyvo, KD Points e criptomoedas. PIX e saldo são processados instantaneamente.' },
  { id: 'f6', category: 'Pagamento', question: 'O pagamento é seguro?', answer: 'Sim. A Kiyvo segura o pagamento e só repassa ao vendedor após a confirmação de entrega. Seus dados de pagamento são criptografados e protegidos.' },
  { id: 'f7', category: 'Vendedor', question: 'Como anunciar meu produto?', answer: 'Crie sua conta e clique em "Anunciar". Preencha as informações do produto, escolha a categoria e adicione imagens. Seu anúncio passará por uma revisão rápida (até 6 horas) e será publicado.' },
  { id: 'f8', category: 'Vendedor', question: 'Quais são as taxas?', answer: 'Oferecemos 3 planos: Prata (9,99%), Ouro (11,99%) e Diamante (12,99%). A taxa só é cobrada quando você vende. Quanto maior o plano, mais visibilidade seu anúncio tem.' },
  { id: 'f9', category: 'Retiradas', question: 'Como retirar meu dinheiro?', answer: 'Após o prazo de liberação, acesse "Minhas Retiradas" e solicite o saque via PIX. Retirada Normal: grátis, até 2 dias úteis. Retirada Turbo: R$ 3,50, instantânea.' },
  { id: 'f10', category: 'Recompensas', question: 'O que são KD Points?', answer: 'KD Points é nosso programa de recompensas. Cada R$1 gasto = 1 PD Point. Você pode acumular e trocar por produtos na plataforma. Cotação: 77 KD Points = R$1.' },
]

export const mockOrders: Order[] = [
  { id: 'PED-2847', product: 'Windows 11 Pro Licença', seller: 'SoftVault', price: 49.90, status: 'delivered', date: '14/07/26' },
  { id: 'PED-2846', product: 'Curso Full Stack 120h', seller: 'EduPro', price: 34.90, status: 'delivered', date: '13/07/26' },
  { id: 'PED-2845', product: 'Pack Templates Canva', seller: 'DesignLab', price: 19.90, status: 'pending', date: '15/07/26' },
  { id: 'PED-2844', product: 'Netflix Premium 1 Ano', seller: 'CloudNinja', price: 79.90, status: 'delivered', date: '12/07/26' },
]

export const mockListings: Listing[] = [
  { id: 'ANC-101', title: 'Windows 11 Pro — Licença Vitalícia', price: 49.90, plan: 'diamond', status: 'active', views: 1234, sales: 5678, createdAt: '10/07/26' },
  { id: 'ANC-102', title: 'Pack 500+ Templates Canva', price: 19.90, plan: 'gold', status: 'active', views: 3456, sales: 3456, createdAt: '08/07/26' },
  { id: 'ANC-103', title: 'Curso Full Stack 120h', price: 34.90, plan: 'silver', status: 'active', views: 567, sales: 1890, createdAt: '05/07/26' },
  { id: 'ANC-104', title: 'Plugin SEO Pro WordPress', price: 39.90, plan: 'gold', status: 'paused', views: 234, sales: 789, createdAt: '01/07/26' },
]

export const mockWithdrawals: Withdrawal[] = [
  { id: 'SAQ-501', amount: 1450.00, method: 'pix', status: 'completed', date: '12/07/26' },
  { id: 'SAQ-500', amount: 630.50, method: 'pix', status: 'completed', date: '10/07/26' },
  { id: 'SAQ-499', amount: 289.90, method: 'pix', status: 'pending', date: '15/07/26' },
]
