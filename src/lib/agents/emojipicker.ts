// Agente EmojiPicker — escolhe emojis relevantes por nicho/contexto
// (sem usar regex \p{} para evitar problemas de unicode no TS target)
export interface EmojiInput {
  texto: string
  quantidade?: number
  posicao?: 'inicio' | 'final' | 'bullet'
}
export interface EmojiResult {
  emojis: string[]
  textoFormatado: string
  dicas: string[]
}

const EMOJI_MAP: Array<{ palavras: string[]; emojis: string[] }> = [
  { palavras: ['marketing', 'vendas', 'negocio', 'negócio', 'empreendedor'], emojis: ['📈', '💼', '🚀', '💰', '🎯'] },
  { palavras: ['dinheiro', 'financeiro', 'financa', 'finanças', 'renda', 'faturar'], emojis: ['💰', '💵', '🤑', '📊', '🏦'] },
  { palavras: ['estudo', 'curso', 'aula', 'aprender', 'educa', 'escola'], emojis: ['📚', '🎓', '✏️', '📖', '🧠'] },
  { palavras: ['saude', 'saúde', 'fitness', 'academia', 'treino', 'emagrec'], emojis: ['💪', '🏃', '🥗', '🔥', '❤️'] },
  { palavras: ['beleza', 'maquiagem', 'cabelo', 'skincare'], emojis: ['💄', '💅', '✨', '💋', '🌸'] },
  { palavras: ['tecnologia', 'programa', 'dev', 'software', 'código', 'codigo', 'ia'], emojis: ['💻', '🤖', '⚡', '🚀', '🧑‍💻'] },
  { palavras: ['receita', 'comida', 'culinaria', 'gastronomia', 'cozinha'], emojis: ['🍕', '👨‍🍳', '🍔', '🥘', '🥗'] },
  { palavras: ['viagem', 'viagens', 'turismo'], emojis: ['✈️', '🌍', '🏝️', '🧳', '🗺️'] },
  { palavras: ['amor', 'relacionamento', 'namoro'], emojis: ['❤️', '💕', '💑', '🌹', '💘'] },
  { palavras: ['jogo', 'games', 'gamer'], emojis: ['🎮', '🕹️', '🎯', '🏆', '👾'] },
  { palavras: ['musica', 'música', 'som'], emojis: ['🎵', '🎶', '🎤', '🎧', '🎸'] },
  { palavras: ['foto', 'fotografia', 'foto'], emojis: ['📸', '📷', '🎨', '🖼️'] },
  { palavras: ['livro', 'livros', 'leitura'], emojis: ['📚', '📖', '📕', '✨'] },
  { palavras: ['carro', 'moto', 'veiculo'], emojis: ['🚗', '🏍️', '🚙', '🔧'] },
  { palavras: ['casa', 'decor', 'moveis'], emojis: ['🏠', '🛋️', '🪴', '🔑'] },
  { palavras: ['alerta', 'atenção', 'atencao', 'urgente', 'importante'], emojis: ['⚠️', '🚨', '🔥', '⚡'] },
  { palavras: ['novo', 'lancamento', 'lançamento'], emojis: ['🆕', '✨', '🎉', '🚀'] },
  { palavras: ['promoção', 'promocao', 'desconto', 'oferta', 'grátis', 'gratis'], emojis: ['🎁', '🔥', '💥', '⚡', '🎉'] },
  { palavras: ['segredo', 'ninguem', 'ninguém', 'descubra'], emojis: ['🤫', '🤐', '🔓', '✨'] },
]

const DEFAULT_EMOJIS = ['✨', '🔥', '💡', '🚀', '⭐', '👇', '✅']

function codePointCount(s: string): number {
  // Conta code points (sem regex Unicode)
  let n = 0; let i = 0
  while (i < s.length) {
    const c = s.codePointAt(i)
    n++
    if (c && c > 0xffff) i += 2; else i++
  }
  return n
}

function startsWithEmoji(s: string): boolean {
  if (!s) return false
  const cp = s.codePointAt(0) || 0
  return cp > 0x2300
}

export function escolherEmojis(input: EmojiInput): EmojiResult {
  const { texto, quantidade = 3, posicao = 'bullet' } = input
  const low = texto.toLowerCase()
  let emojis: string[] = []
  for (const grupo of EMOJI_MAP) {
    if (grupo.palavras.some(p => low.includes(p))) {
      emojis.push(...grupo.emojis)
    }
  }
  if (emojis.length === 0) emojis = [...DEFAULT_EMOJIS]
  // Seleciona sem repetir
  const unicos = Array.from(new Set(emojis))
  const escolhidos = unicos.slice(0, quantidade)
  let textoFormatado = texto
  if (posicao === 'bullet') {
    // Linhas: coloca emoji antes de cada linha que não comece com emoji
    const linhas = texto.split(/\n/)
    const comEmoji = linhas.map((linha, idx) => {
      const l = linha.trim()
      if (!l) return linha
      if (startsWithEmoji(l)) return linha
      const e = escolhidos[idx % escolhidos.length] || '•'
      return `${e} ${l}`
    })
    textoFormatado = comEmoji.join('\n')
  } else if (posicao === 'inicio') {
    textoFormatado = `${escolhidos[0] || '✨'} ${texto}`
  } else {
    textoFormatado = `${texto} ${escolhidos.join('')}`
  }
  return {
    emojis: escolhidos,
    textoFormatado,
    dicas: [
      'Use no máximo 5 emojis por texto para não poluir.',
      'Emojis aumentam engajamento, mas em excesso parecem spam.',
      'Teste versões com e sem emojis (use ABTester).',
      `Caracteres Unicode detectados: ${codePointCount(texto)}`,
    ],
  }
}
