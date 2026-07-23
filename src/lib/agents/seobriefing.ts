// Agente SEOBriefing — gera briefing completo de SEO para páginas/blog posts
export interface SEOBriefingInput {
  palavraChave: string
  nicho?: string
  objetivo?: string
  tipo?: 'blog' | 'pagina_produto' | 'landing' | 'categoria'
  linguagem?: 'pt-BR'
}
export interface SEOBriefingResult {
  tituloSEO: string
  metaDescription: string
  slug: string
  urlSugerida: string
  palavrasChaveRelacionadas: string[]
  perguntasFrequentes: string[]
  estruturaConteudo: Array<{ h2: string; h3?: string[]; dica: string; palavras?: string[] }>
  pontosChave: string[]
  linksInternos: string[]
  duracaoLeituraMin: number
  tamanhoIdealPalavras: number
  jsonld: Record<string, unknown>
}

export function gerarSEOBriefing(input: SEOBriefingInput): SEOBriefingResult {
  const { palavraChave, nicho = 'digital', tipo = 'blog' } = input
  const k = palavraChave.trim()
  const slug = k.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  const ano = new Date().getFullYear()
  const tituloSEO = tipo === 'blog'
    ? `${k}: Guia Completo e Atualizado (${ano})`
    : `${k} — Compre em até 12x | KIYVO`
  const metaDescription = tipo === 'blog'
    ? `Aprenda tudo sobre ${k} em ${ano}: guia passo a passo atualizado, com dicas práticas, exemplos e erros comuns para você acertar em cheio.`
    : `Confira ${k} na KIYVO. Entrega instantânea, garantia de 7 dias e pagamento seguro via PIX, cartão e boleto.`
  const relacionadasBase = [
    `${k} como funciona`,
    `${k} para iniciantes`,
    `${k} passo a passo`,
    `melhor ${k}`,
    `${k} vale a pena`,
    `${k} preço`,
    `${k} grátis`,
    `como aprender ${k}`,
    `${k} em Portugal`,
    `${k} ${ano}`,
    `dicas de ${k}`,
    `${k} online`,
  ]
  const perguntas = [
    `O que é ${k}?`,
    `${k} realmente funciona?`,
    `Quanto custa ${k}?`,
    `Como começar com ${k} do zero?`,
    `${k} vale a pena em ${ano}?`,
    `Quanto tempo demora para ver resultado?`,
    `Quais os riscos?`,
    `Preciso de investimento para começar?`,
  ]
  const estrutura = [
    { h2: `O que é ${k}?`, h3: [`Definição simples`, `Por que está em alta em ${ano}`], dica: 'Parágrafo curto (<3 linhas) respondendo à dúvida principal.', palavras: [k, 'o que é', nicho] },
    { h2: `Como ${k} funciona na prática`, h3: [`Passo 1`, `Passo 2`, `Passo 3`, `Erros comuns`], dica: 'Lista numerada, use prints/exemplos.' },
    { h2: `Benefícios de aplicar ${k}`, h3: [`Para iniciantes`, `Para quem já tem experiência`], dica: 'Bullets começando com verbos.' },
    { h2: `Quanto custa ${k} em ${ano}`, h3: [`Opção grátis`, `Opção paga`, `Custo-benefício`], dica: 'Tabela de preços comparativa.' },
    { h2: `Dúvidas frequentes sobre ${k}`, h3: [], dica: 'Schema FAQ obrigatório.' },
    { h2: `Conclusão: ${k} vale a pena?`, h3: [], dica: 'CTA claro no final.' },
  ]
  const pontosChave = [
    `Palavra-chave "${k}" deve aparecer nos 100 primeiros caracteres.`,
    'Use H1 único, H2s e H3s hierárquicos (não pule níveis).',
    'Adicione links internos para conteúdos relacionados.',
    'Imagens com ALT text contendo palavra-chave.',
    'CTA claro no final da página (comentário, compra, cadastro).',
    'Schema.org (FAQ, Product, Article) para rich snippets.',
    'Carregamento mobile em menos de 2s.',
  ]
  const linksInternos = [`/categorias/${nicho.replace(/\s+/g, '-')}`, `/blog`, `/ajuda`, `/planos`]
  const tamanhoIdeal = tipo === 'blog' ? 1800 : tipo === 'landing' ? 1200 : 500
  const duracaoLeitura = Math.max(3, Math.round(tamanhoIdeal / 220))
  const jsonld = tipo === 'blog'
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: tituloSEO,
        description: metaDescription,
        author: { '@type': 'Organization', name: 'KIYVO' },
        publisher: { '@type': 'Organization', name: 'KIYVO' },
        datePublished: new Date().toISOString().split('T')[0],
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: k,
        description: metaDescription,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL', availability: 'https://schema.org/InStock' },
      }
  return {
    tituloSEO: tituloSEO.slice(0, 60),
    metaDescription: metaDescription.slice(0, 160),
    slug,
    urlSugerida: `/${tipo === 'blog' ? 'blog' : tipo}/${slug}`,
    palavrasChaveRelacionadas: relacionadasBase,
    perguntasFrequentes: perguntas,
    estruturaConteudo: estrutura,
    pontosChave,
    linksInternos,
    duracaoLeituraMin: duracaoLeitura,
    tamanhoIdealPalavras: tamanhoIdeal,
    jsonld,
  }
}
