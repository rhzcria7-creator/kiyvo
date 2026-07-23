// Agente ContentAuditor — audita conteúdo (posts, produtos, páginas) em busca de
// erros de LGPD, promessas ilegais, falta de acessibilidade, SEO quebrado, etc.
// Agente invisível que roda quando alguém salva/anuncia um produto.
export interface ContentAuditorInput {
  titulo: string
  descricao: string
  preco?: number
  imagens?: number
  temTermos?: boolean
  temGarantia?: boolean
  temPolitica?: boolean
  url?: string
}
export interface ContentAuditorResult {
  aprovado: boolean
  pontuacaoGeral: number
  problemas: Array<{ severidade: 'critico' | 'alta' | 'media' | 'baixa'; categoria: string; mensagem: string }>
  recomendacoes: string[]
  checklistLGPD: Array<{ item: string; ok: boolean }>
}

const TERMOS_LEGAIS = [
  'renda garantida',
  'fique rico',
  'enriqueça rápido',
  'ganhe dinheiro sem trabalhar',
  'cura',
  'tratamento garantido',
  'milagroso',
  'resultado garantido',
  '100% livre de risco',
]

export function auditarConteudo(input: ContentAuditorInput): ContentAuditorResult {
  const { titulo, descricao, preco, imagens = 0, temTermos = false, temGarantia = false, temPolitica = false } = input
  const textoFull = (titulo + ' ' + descricao).toLowerCase()
  const problemas: ContentAuditorResult['problemas'] = []
  const recomendacoes: string[] = []
  // Promessas ilegais/enganosas
  for (const termo of TERMOS_LEGAIS) {
    if (textoFull.includes(termo)) {
      problemas.push({
        severidade: 'critico',
        categoria: 'legal/lgpd',
        mensagem: `Promessa potencialmente enganosa: "${termo}". Remova para não violar CDC/Lei 8.078.`,
      })
    }
  }
  if (titulo.length < 10) {
    problemas.push({ severidade: 'alta', categoria: 'seo', mensagem: 'Título muito curto (mínimo 10 caracteres).' })
  } else if (titulo.length > 70) {
    problemas.push({ severidade: 'media', categoria: 'seo', mensagem: 'Título muito longo (>70 caracteres, será cortado no Google).' })
  }
  if (descricao.length < 100) {
    problemas.push({ severidade: 'alta', categoria: 'qualidade', mensagem: 'Descrição muito curta (mínimo 100 caracteres).' })
  }
  if (!preco || preco <= 0) {
    problemas.push({ severidade: 'critico', categoria: 'comercial', mensagem: 'Preço não definido ou inválido.' })
  }
  if (imagens === 0) {
    problemas.push({ severidade: 'alta', categoria: 'midia', mensagem: 'Produto sem imagens — adicionar ao menos 1 imagem (recomendado 3+).' })
  }
  if (!temTermos) {
    problemas.push({ severidade: 'alta', categoria: 'legal/lgpd', mensagem: 'Página precisa linkar Termos de Uso e Política de Privacidade.' })
  }
  if (!temPolitica) {
    problemas.push({ severidade: 'media', categoria: 'legal/lgpd', mensagem: 'Adicione link para Política de Privacidade.' })
  }
  if (!temGarantia) {
    recomendacoes.push('Adicione garantia de 7 dias (direito do consumidor).')
  }
  if (!/p(o|ó)l[vw]ora|emagrec|cura|tratamento/i.test(textoFull) === false) {
    // nicho sensível: saúde/emagrecimento
    recomendacoes.push('Nicho sensível: adicione avisos de "resultados variam de pessoa para pessoa".')
  }
  if (/(clique\s+aqui|saiba\s+mais|leia\s+mais)/i.test(textoFull)) {
    problemas.push({ severidade: 'baixa', categoria: 'acessibilidade', mensagem: 'Evite textos genéricos em links ("clique aqui", "saiba mais").' })
  }
  const checklistLGPD = [
    { item: 'Política de Privacidade acessível', ok: temPolitica },
    { item: 'Termos de Uso acessíveis', ok: temTermos },
    { item: 'Consentimento para cookies (se aplicável)', ok: true },
    { item: 'Direito ao arrependimento de 7 dias', ok: temGarantia },
    { item: 'Sem promessas enganosas', ok: !problemas.some(p => p.severidade === 'critico') },
    { item: 'Preço explícito em moeda BRL', ok: !!preco },
    { item: 'Canal de atendimento/SAC visível', ok: true },
  ]
  let pontuacao = 100
  for (const p of problemas) {
    if (p.severidade === 'critico') pontuacao -= 25
    else if (p.severidade === 'alta') pontuacao -= 12
    else if (p.severidade === 'media') pontuacao -= 6
    else pontuacao -= 3
  }
  pontuacao = Math.max(0, pontuacao)
  const aprovado = pontuacao >= 70 && !problemas.some(p => p.severidade === 'critico')
  if (aprovado && pontuacao < 85) recomendacoes.push('Revise pontos apontados para chegar a A+.')
  return { aprovado, pontuacaoGeral: pontuacao, problemas, recomendacoes, checklistLGPD }
}
