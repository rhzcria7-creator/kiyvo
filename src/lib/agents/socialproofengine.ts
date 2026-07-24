// Agente SocialProofEngine — gera mensagens de prova social dinâmicas
// (tipo: "Fulano de São Paulo comprou há 2 minutos")
export interface SocialProofInput {
  produtoNome: string
  produtoPreco: number
  cenario?: 'checkout' | 'produto' | 'carrinho' | 'home'
  quantidade?: number
  vendasRecentes?: number
  visualizacoesHoje?: number
  avaliacao?: number
  totalReviews?: number
  ultimaCompraMinAtras?: number
  cidadeOrigem?: string
}
export interface SocialProofResult {
  mensagens: Array<{ texto: string; tipo: 'compra' | 'visualizacao' | 'review' | 'estoque' | 'urgencia' }>
  badgeConfianca: string
  contagemVivas: { online: number; comprandoAgora: number }
}

const CIDADES_BR = ['São Paulo','Rio de Janeiro','Belo Horizonte','Porto Alegre','Curitiba','Salvador','Recife','Fortaleza','Brasília','Goiânia','Manaus','Florianópolis','Campinas','Vitória','Sete Lagoas']
const NOMES_BR = ['João','Maria','Pedro','Ana','Lucas','Juliana','Carlos','Beatriz','Rafael','Fernanda','Gustavo','Larissa','Marcos','Camila','Thiago','Amanda']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export function gerarProvaSocial(input: SocialProofInput): SocialProofResult {
  const { produtoNome, produtoPreco, cenario = 'produto', quantidade = 20, vendasRecentes = Math.floor(Math.random() * 80) + 20,
    visualizacoesHoje = Math.floor(Math.random() * 300) + 50, avaliacao = 4.8, totalReviews = Math.floor(Math.random() * 500) + 50,
    ultimaCompraMinAtras = Math.floor(Math.random() * 15) + 1, cidadeOrigem } = input
  const mensagens: SocialProofResult['mensagens'] = []
  const precoFmt = `R$ ${produtoPreco.toFixed(2).replace('.', ',')}`
  for (let i = 0; i < Math.min(quantidade, 8); i++) {
    const nome = pick(NOMES_BR)
    const cid = cidadeOrigem || pick(CIDADES_BR)
    const min = Math.max(1, ultimaCompraMinAtras + i * Math.floor(Math.random() * 15 + 1))
    mensagens.push({
      texto: `${nome} de ${cid} comprou "${produtoNome}" há ${min} min`,
      tipo: 'compra',
    })
  }
  mensagens.push({ texto: `${visualizacoesHoje} pessoas visualizaram este produto hoje`, tipo: 'visualizacao' })
  mensagens.push({ texto: `⭐ ${avaliacao}/5 — ${totalReviews} avaliações verificadas`, tipo: 'review' })
  if (vendasRecentes > 10) {
    mensagens.push({ texto: `🔥 ${vendasRecentes} vendas nas últimas 24h`, tipo: 'visualizacao' })
  }
  if (cenario === 'checkout' || cenario === 'carrinho') {
    mensagens.push({ texto: '⚡ Vagas limitadas — garanta agora antes que acabe', tipo: 'estoque' })
    mensagens.push({ texto: '🎉 Mais de 3.000 alunos/clientes já garantiram', tipo: 'urgencia' })
  }
  return {
    mensagens,
    badgeConfianca: `🔒 Compra 100% segura na KIYVO · Garantia de 7 dias · ${avaliacao}/5 ⭐ por ${totalReviews}+ compradores`,
    contagemVivas: { online: Math.floor(Math.random() * 40) + 15, comprandoAgora: Math.floor(Math.random() * 8) + 2 },
  }
}
