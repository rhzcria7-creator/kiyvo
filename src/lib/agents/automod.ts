// Agente Automod — moderação automática de conteúdo em tempo real
// Agente invisível (sistema): analisa comentários, reviews e mensagens
// em busca de spam, discurso de ódio, tentativas de golpe, vazamento de contato, etc.

export interface AutomodInput {
  texto: string
  contexto?: 'comentario' | 'review' | 'mensagem' | 'perfil' | 'anuncio'
}

export interface AutomodResult {
  aprovado: boolean
  motivoBloqueio?: string
  score: number // 0-100 (0 limpo, 100 ataque)
  categorias: string[]
  sugestao?: string
  versoes_limpas?: string[]
}

const BLOQUEIO: Array<{ re: RegExp; cat: string; peso: number; motivo: string }> = [
  { re: /(w(?:hats|pp|zap|hatsapp)?[\s\-.]?(?:\d[\d\s.\-()]{7,}))/i, cat: 'contato_externo', peso: 80, motivo: 'Número de WhatsApp detectado — mantenha a conversa dentro da plataforma.' },
  { re: /(telegram|t\.me\/|@\w{3,})/i, cat: 'contato_externo', peso: 70, motivo: 'Link de Telegram detectado.' },
  { re: /(instagram\.com\/|@[a-zA-Z0-9_.]{4,})/i, cat: 'contato_externo', peso: 40, motivo: 'Perfil do Instagram detectado — evite compartilhar externamente.' },
  { re: /(pix[\s:]*\d|chave[\s-]?pix|cnpj|cpf[\s:]*\d)/i, cat: 'pagamento_externo', peso: 90, motivo: 'Tentativa de pagamento externo via PIX/CPF — usar checkout da KIYVO.' },
  { re: /(golpe|scam|fraude|engana[cç][aã]o)/i, cat: 'palavras_ofensivas', peso: 20, motivo: null as unknown as string },
  { re: /(put[ao]|filho\s+da\s+put|cacet|caralh|porr|bucet|viad|bich[ao]|retardad|idiot)/i, cat: 'palavras_ofensivas', peso: 75, motivo: 'Linguagem imprópria. Edite o texto para ser respeitoso.' },
  { re: /(compre\s+fora|fora\s+da\s+plataforma|me\s+chama\s+no|chama\s+privado)/i, cat: 'redirecionamento', peso: 85, motivo: 'Redirecionamento para fora da plataforma — não permitido.' },
  { re: /([A-ZÀ-Ú0-9\s!?.,]{30,})/, cat: 'caixa_alta', peso: 30, motivo: null as unknown as string },
  { re: /(gr(a|@)tis|fr(e|3)e|free.*?money|ganhe.*?r\$|clique\s+aqui)/i, cat: 'spam_promocional', peso: 50, motivo: 'Texto parece spam promocional.' },
  { re: /(https?:\/\/[^\s]+)/i, cat: 'link_externo', peso: 60, motivo: 'Link externo detectado.' },
  { re: /(vai\s+se\s+f|seu\s+lixo|seu\s+merda)/i, cat: 'ameaça', peso: 95, motivo: 'Ameaça ou ofensa grave detectada.' },
]

export function automodAnalisar(input: AutomodInput): AutomodResult {
  const { texto, contexto = 'comentario' } = input
  if (!texto || texto.trim().length < 2) {
    return { aprovado: true, score: 0, categorias: [] }
  }
  const categorias = new Set<string>()
  let score = 0
  let motivos: string[] = []
  for (const regra of BLOQUEIO) {
    if (regra.re.test(texto)) {
      categorias.add(regra.cat)
      score = Math.min(100, score + regra.peso)
      if (regra.motivo) motivos.push(regra.motivo)
    }
  }
  // Detecta repetição excessiva (spam)
  const palavras = texto.toLowerCase().split(/\s+/).filter(Boolean)
  const unicas = new Set(palavras)
  if (palavras.length > 10 && unicas.size / palavras.length < 0.4) {
    categorias.add('repeticao')
    score = Math.min(100, score + 40)
    motivos.push('Texto com repetição excessiva de palavras (spam).')
  }
  // Limite de links
  const links = (texto.match(/https?:\/\//g) || []).length
  if (links > 2) {
    categorias.add('muitos_links')
    score = Math.min(100, score + 30)
  }
  // Contexto mais rigoroso
  if (contexto === 'mensagem' && categorias.has('contato_externo')) score += 5
  const aprovado = score < 70
  let sugestao: string | undefined
  if (!aprovado) {
    let limpo = texto
    limpo = limpo.replace(/\b(?:whatsapp|whats|zap|wpp)\s*[:-]?\s*\d[\d\s.\-()]{7,}/gi, '[contato via plataforma]')
    limpo = limpo.replace(/https?:\/\/\S+/gi, '[link removido]')
    limpo = limpo.replace(/\b(pix|chave[- ]?pix)\s*[:#]?\s*[\d.\-]{6,}/gi, '[pagamento via KIYVO]')
    limpo = limpo.replace(/@([a-zA-Z0-9_.]{4,})/g, '[menção]')
    sugestao = limpo
  }
  return {
    aprovado,
    score,
    categorias: Array.from(categorias),
    motivoBloqueio: motivos[0] || undefined,
    sugestao,
  }
}
