// Agente LegacyPolisher — polidor de textos antigos.
// Melhora copy legada, atualiza linguagem, remove termos quebrados e aplica tom KIYVO.
// Usado pelo agente interno AutoPilot para manter páginas atualizadas.
export interface PolisherInput {
  texto: string
  tom?: 'moderno' | 'urgencia' | 'amigavel' | 'premium' | 'viral'
}
export interface PolisherOutput {
  textoPolido: string
  melhorias: string[]
  problemasDetectados: string[]
  scoreOriginal: number
  scorePolido: number
}
const TERMOS_RUINS = [
  { ru: 'clique aqui', bom: 'quero agora' },
  { ru: 'confira', bom: 'descubra' },
  { ru: 'saiba mais', bom: 'ver agora' },
  { ru: 'não perca', bom: 'garanta antes que acabe' },
  { ru: 'nao perca', bom: 'garanta antes que acabe' },
  { ru: 'melhor do mercado', bom: 'escolha de +10mil brasileiros' },
  { ru: 'garantia total', bom: 'garantia incondicional de 7 dias' },
  { ru: 'fácil e rápido', bom: 'pronto em 2 minutos' },
  { ru: 'facil e rapido', bom: 'pronto em 2 minutos' },
  { ru: 'super desconto', bom: 'oferta exclusiva' },
  { ru: 'o melhor preço', bom: 'preço justo + entrega na hora' },
  { ru: 'o melhor preco', bom: 'preço justo + entrega na hora' },
]
const PALAVROES_FRACAS = ['muito', 'bastante', 'coisa', 'negócio', 'negocio', 'tipo', 'literalmente', 'basicamente', 'simplesmente']
function temEmojiExcesso(texto: string): boolean {
  let emojisSeguidos = 0
  for (let i = 0; i < texto.length; i++) {
    const code = texto.codePointAt(i) || 0
    if (code > 0x2600 && (code < 0x2C00 || code > 0x1F000)) {
      emojisSeguidos++
      if (emojisSeguidos >= 4) return true
    } else if (texto[i] !== ' ' && texto[i] !== '\n') {
      emojisSeguidos = 0
    }
  }
  return false
}
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
export function polirTexto(input: PolisherInput): PolisherOutput {
  const { texto, tom = 'moderno' } = input
  let polido = texto
  const melhorias: string[] = []
  const problemas: string[] = []
  let scoreOriginal = 100
  for (const { ru } of TERMOS_RUINS) {
    if (polido.toLowerCase().includes(ru)) { problemas.push(`Termo desgastado: "${ru}"`); scoreOriginal -= 4 }
  }
  for (const p of PALAVROES_FRACAS) {
    const r = new RegExp(`\\b${escapeRegex(p)}\\b`, 'gi')
    const m = polido.match(r)
    if (m && m.length > 2) { problemas.push(`Palavra fraca repetida: "${p}" (${m.length}x)`); scoreOriginal -= 2 }
  }
  if (temEmojiExcesso(polido)) { problemas.push('Excesso de emojis em sequência'); scoreOriginal -= 5 }
  if (polido.length < 60) { problemas.push('Texto curto demais'); scoreOriginal -= 8 }
  if (!/você|teu|tua|seu|sua|voce/i.test(polido)) { problemas.push('Não fala diretamente com o leitor'); scoreOriginal -= 6 }
  if (!/[!]/.test(polido) && tom !== 'premium') { problemas.push('Pouca energia (sem exclamação)'); scoreOriginal -= 3 }
  for (const { ru, bom } of TERMOS_RUINS) {
    const re = new RegExp(escapeRegex(ru), 'gi')
    if (re.test(polido)) {
      polido = polido.replace(re, bom)
      melhorias.push(`"${ru}" → "${bom}"`)
    }
  }
  polido = polido.replace(/\.([^\n])/g, '. $1').replace(/\s{2,}/g, ' ')
  if (tom === 'viral' && !polido.includes('🔥')) { polido = '🔥 ' + polido; melhorias.push('Adicionado hook emoji no início') }
  if (tom === 'urgencia' && !polido.includes('⏰')) { polido = '⏰ ' + polido; melhorias.push('Adicionado urgência no início') }
  if (tom === 'premium') {
    polido = polido.replace(/!/g, '.').replace(/🔥|⚡|🚨|💣/g, '•')
    melhorias.push('Tom premium: emojis de hype removidos')
  }
  if (!/você|teu|tua|voce/i.test(polido)) {
    polido = polido.replace(/O produto|Este produto/, 'Você vai amar este produto')
    melhorias.push('Direcionado ao leitor ("você")')
  }
  let scorePolido = 100
  for (const { ru } of TERMOS_RUINS) if (polido.toLowerCase().includes(ru)) scorePolido -= 6
  scorePolido = Math.max(40, Math.min(98, scorePolido + 20 - problemas.length * 3))
  scoreOriginal = Math.max(5, Math.min(95, scoreOriginal))
  if (melhorias.length === 0) melhorias.push('Texto já está bom, pequenos ajustes de espaçamento')
  return { textoPolido: polido.trim(), melhorias, problemasDetectados: problemas, scoreOriginal, scorePolido }
}
