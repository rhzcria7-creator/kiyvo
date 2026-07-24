// Copywriter Agent — Gera títulos, descrições, bullets e CTAs otimizados
// Biblioteca interna de templates de alta conversão. Sem API externa.
import type { CopyRequest, CopyResult } from './types'

// Hooks por público-alvo
const PUBLICO: Record<string, { saudacao: string; dor: string[]; ganho: string[] }> = {
  gamer: {
    saudacao: 'jogador',
    dor: ['sem pagar caro', 'espera eterna por entrega', 'chave inválida'],
    ganho: ['jogue em 30 segundos', 'garantia de ativação', 'suporte 24h'],
  },
  profissional: {
    saudacao: 'profissional',
    dor: ['licenças caras', 'renovação anual', 'sem NF-e'],
    ganho: ['licença vitalícia', 'emissão de nota', 'atualizações inclusas'],
  },
  estudante: {
    saudacao: 'estudante',
    dor: ['preço proibitivo', 'assinatura mensal', 'sem desconto'],
    ganho: ['50% OFF estudantil', 'acesso imediato', 'conta premium'],
  },
  criador: {
    saudacao: 'criador',
    dor: ['limites de exportação', 'marca d\'água', 'plugins caros'],
    ganho: ['exportação ilimitada', 'sem marca d\'água', 'todos os plugins'],
  },
  geral: {
    saudacao: 'cliente',
    dor: ['preços abusivos', 'golpes', 'espera'],
    ganho: ['preço justo', 'garantia KIYVO', 'entrega instantânea'],
  },
}

const TONS: Record<string, { abertura: string[]; fechamento: string[]; adjetivos: string[] }> = {
  urgente: {
    abertura: ['SÓ HOJE', 'ÚLTIMAS VAGAS', 'OFERTA RELÂMPAGO', 'ACABA EM MINUTOS', 'NÃO PERCA'],
    fechamento: ['Clique e garanta o seu antes que acabe', 'Estoque limitado — garanta já', 'A oferta sai em 30 minutos'],
    adjetivos: ['imperdível', 'exclusivo', 'relâmpago', 'limitado'],
  },
  confiavel: {
    abertura: ['GARANTIDO', '100% SEGURO', 'CONFIÁVEL', 'APROVADO', 'VERIFICADO'],
    fechamento: ['Compre com tranquilidade — garantia KIYVO', 'Milhares de clientes satisfeitos', 'Suporte real se precisar'],
    adjetivos: ['confiável', 'seguro', 'comprovado', 'oficial'],
  },
  premium: {
    abertura: ['EXCLUSIVO', 'PREMIUM', 'VIP', 'EDIÇÃO LIMITADA', 'SELECT'],
    fechamento: ['Experimente o padrão premium', 'Para quem exige o melhor', 'Eleve seu nível hoje'],
    adjetivos: ['premium', 'exclusivo', 'sofisticado', 'profissional'],
  },
  jovem: {
    abertura: ['🔥 NOVO', '🚢 HYPE', 'DROP NOVO', 'PEGUEI E APROVEI', 'BROTA'],
    fechamento: ['Corre que tá saindo no preço', 'Chamei a tropa pra compartilhar', 'Bora garantir o seu'],
    adjetivos: ['insano', 'top', 'hype', 'brabo'],
  },
  tecnico: {
    abertura: ['ESPECIFICAÇÕES', 'FICHA TÉCNICA', 'LICENÇA ORIGINAL', 'VERSÃO OFICIAL'],
    fechamento: ['Licença perpétua com chave original', 'Ativação online com suporte técnico', 'Produto 100% original com nota'],
    adjetivos: ['original', 'perpetuo', 'oficial', 'atualizado'],
  },
}

const CATEGORIA_TAGS: Record<string, string[]> = {
  jogos: ['steam key', 'jogo pc', 'gift card steam', 'cd key brasil', 'jogo digital'],
  streaming: ['netflix', 'spotify', 'disney plus', 'youtube premium', 'conta streaming'],
  software: ['licenca software', 'chave ativacao', 'office 365', 'windows key', 'adobe'],
  cursos: ['curso online', 'aprender', 'certificado', 'video aula', 'ead'],
  giftcards: ['gift card brasil', 'cartao presente', 'recarga digital', 'ifood', 'uber'],
  marketing: ['midia social', 'canva pro', 'figma', 'criativo', 'design'],
  musica: ['spotify premium', 'deezer', 'apple music', 'musica sem anuncios'],
  default: ['produto digital', 'entrega instantanea', 'kiyvo', 'conta premium', 'barato'],
}

const CTA_BY_TOM: Record<string, string[]> = {
  urgente: ['GARANTIR AGORA', 'COMPRAR ANTES QUE ACABE', 'QUERO APROVEITAR'],
  confiavel: ['COMPRAR COM GARANTIA', 'QUERO COM SEGURANÇA', 'IR PARA OFERTA'],
  premium: ['QUERO O PREMIUM', 'EXPERIMENTAR AGORA', 'GARANTIR MEU VIP'],
  jovem: ['BORA GARANTIR', 'QUERO ESSA', 'PEGAR AGORA'],
  tecnico: ['COMPRAR LICENÇA', 'ADQUIRIR AGORA', 'QUERO A ORIGINAL'],
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i)
  return Math.abs(h)
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function generateCopy(req: CopyRequest, variantIdx = 0): CopyResult {
  const pub = PUBLICO[req.publico || 'geral'] || PUBLICO.geral
  const tons = TONS[req.tom || 'confiavel'] || TONS.confiavel
  const catKey = (req.categoria || 'default').toLowerCase()
  const catTags = CATEGORIA_TAGS[catKey] || CATEGORIA_TAGS.default
  const seed = hash(req.produto + (req.categoria || '') + variantIdx)

  const adjectives = shuffle(tons.adjetivos, seed)
  const openings = shuffle(tons.abertura, seed + 7)
  const closings = shuffle(tons.fechamento, seed + 13)
  const ctas = shuffle(CTA_BY_TOM[req.tom || 'confiavel'] || CTA_BY_TOM.confiavel, seed + 21)
  const dores = shuffle(pub.dor, seed + 33)
  const ganhos = shuffle(pub.ganho, seed + 45)

  const nome = req.produto.trim()
  const adj1 = adjectives[0] || 'original'
  const adj2 = adjectives[1] || 'exclusivo'

  // Títulos (5 variantes)
  const titulos = [
    `${nome} ${capitalize(adj1)} — ${openings[0]}`,
    `${openings[1] || ''} ${nome} com Garantia KIYVO`.trim(),
    `${nome} ${capitalize(adj2)} | Entrega Instantânea`,
    `Comprar ${nome} — Menor Preço do Brasil`,
    `${nome} Vitalício (entrega em 30 segundos)`,
  ].map((t) => t.replace(/\s+/g, ' ').trim()).slice(0, 5)

  // Subtítulos
  const subtitulos = [
    `${capitalize(nome)} ${adj1} por um preço que você não vê em outro lugar.`,
    `Entrega instantânea, garantia de ativação e suporte ${pub.saudacao} 24h.`,
    `Sem mensalidade, sem pegadinha: receba em 30 segundos no seu e-mail.`,
    `${capitalize(adj1)} e ${adj2}: escolha inteligente para ${pub.saudacao}s.`,
  ].map((s) => s.replace(/\s+/g, ' ').trim())

  // Bullets
  const bullets = [
    `⚡ Entrega instantânea em até 30 segundos após pagamento`,
    `🛡️ Garantia KIYVO de ativação ou seu dinheiro de volta`,
    `✅ Produto 100% original com chave/licença válida`,
    `🧑‍💻 Suporte humano ${pub.saudacao} em português, 7 dias por semana`,
    `💳 Pague em PIX, cartão em até 12x ou boleto`,
    `🎁 Acumule KD Points e use na próxima compra (até 50% OFF)`,
    ...(ganhos.slice(0, 2).map((g) => `🎯 ${capitalize(g)}`)),
    ...(dores.slice(0, 2).map((d) => `❌ Acabe com ${d}`)),
  ]

  // Descrição longa
  const precoTxt = req.preco ? ` por apenas R$ ${req.preco.toFixed(2).replace('.', ',')}` : ''
  const descricaoLonga = [
    `🔥 ${openings[0]}: ${nome} ${adj1}${precoTxt}!`,
    ``,
    `Se você é ${pub.saudacao} e cansou de ${dores[0] || 'preços abusivos'}, chegou ao lugar certo.`,
    `Oferecemos ${nome} ${adj2}, com entrega instantânea direto no seu e-mail após a confirmação do pagamento.`,
    ``,
    `✨ Por que comprar com a KIYVO?`,
    bullets.slice(0, 5).map((b) => `   • ${b.replace(/^[^\s]+\s/, '')}`).join('\n'),
    ``,
    `⚙️ ${capitalize(nome)} é perfeito para quem busca ${ganhos[0] || 'qualidade e preço justo'}.`,
    `Ao comprar, você recebe todos os dados de acesso/licença em até 30 segundos, com instruções claras em português.`,
    ``,
    closings[0] || 'Clique em "Comprar agora" e receba na hora.',
  ].join('\n').replace(/\n{3,}/g, '\n\n')

  const descricaoCurta = `${capitalize(nome)} ${adj1} com entrega instantânea, garantia de ativação e suporte 24h. ${capitalize(ganhos[0] || 'preço justo')} — KIYVO.`

  const hashtags = ['#KIYVO', '#Digital', '#Brasil', '#Oferta', `#${(req.categoria || 'produto').replace(/\s+/g, '')}`]
    .concat(catTags.slice(0, 3).map((t) => '#' + t.replace(/\s+/g, '')))
    .slice(0, 8)

  const tagSet = new Set<string>([
    nome.toLowerCase(),
    ...catTags,
    `${nome.toLowerCase()} barato`,
    `${nome.toLowerCase()} brasil`,
    `comprar ${nome.toLowerCase()}`,
    `${nome.toLowerCase()} digital`,
    `${nome.toLowerCase()} entrega instantanea`,
    'kiyvo',
  ])
  const tagsSeo = Array.from(tagSet).slice(0, 15)

  return {
    titulos,
    subtitulos,
    descricaoLonga,
    descricaoCurta,
    bullets,
    callToAction: ctas[0] || 'COMPRAR AGORA',
    tagsSeo,
    hashtags,
  }
}
