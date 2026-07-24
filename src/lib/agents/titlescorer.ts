// Agente TitleScorer — pontua títulos (0-100) e sugere melhorias
export interface TitleScorerInput {
  titulo: string
  nicho?: string
}
export interface TitleScorerResult {
  pontuacao: number
  nota: 'ruim' | 'regular' | 'bom' | 'excelente'
  forcas: string[]
  fraquezas: string[]
  variantesMelhoradas: string[]
  checklist: Array<{ item: string; ok: boolean }>
}

const POWER_WORDS = ['novo', 'grátis', 'gratis', 'exclusivo', 'garantido', 'prova', 'passo', 'definitivo', 'completo', 'rápido', 'rapido', 'fácil', 'facil', 'secreto', 'método', 'metodo', 'bumbum', 'rendimento', 'viral', 'ultra', 'premium', 'pro', 'absoluto', '2025', '2026']
const PALAVRAS_FRACAS = ['coisa', 'legal', 'bom', 'interessante', 'muito', 'algo', 'pode', 'talvez', 'um pouco', 'nosso', 'meu']
const PALAVRAS_PROIBIDAS = ['cura', 'milagroso', 'garantido enriquecer', 'fique rico', 'ganhe dinheiro fácil']

export function pontuarTitulo(input: TitleScorerInput): TitleScorerResult {
  const { titulo, nicho = 'geral' } = input
  const t = titulo.trim()
  const chars = t.length
  const words = t.split(/\s+/).filter(Boolean)
  const temNumero = /\d/.test(t)
  // Detecta caracteres não-letra/número/espaço/pontuação básicos (sem flag u)
  const temEmoji = /[^\x20-\x7EÀ-ÿ\s]/.test(t) && t.split('').some(ch => { const c = ch.charCodeAt(0); return c > 0x2300 || (ch >= '😀' && ch <= '🙏'); })
  const minusculas = t.toLowerCase()
  const forcas: string[] = []
  const fraquezas: string[] = []
  const checklist: Array<{ item: string; ok: boolean }> = []
  let score = 50
  // Tamanho
  checklist.push({ item: 'Título entre 30 e 60 caracteres', ok: chars >= 30 && chars <= 60 })
  if (chars >= 30 && chars <= 60) { score += 15; forcas.push(`Tamanho ideal (${chars} caracteres, ótimo para SEO e anúncios).`) }
  else if (chars < 30) { score -= 10; fraquezas.push('Título muito curto (falta informação).') }
  else { score -= 8; fraquezas.push('Título longo demais (é cortado em buscas).') }
  // Números
  checklist.push({ item: 'Contém um número ou dado concreto', ok: temNumero })
  if (temNumero) { score += 8; forcas.push('Números concretos aumentam cliques em até 36%.') }
  // Power words
  const powerEncontradas = POWER_WORDS.filter(p => minusculas.includes(p))
  checklist.push({ item: 'Pelo menos uma palavra de impacto', ok: powerEncontradas.length > 0 })
  if (powerEncontradas.length >= 1) { score += 10; forcas.push(`Palavra de impacto detectada: ${powerEncontradas.slice(0, 2).join(', ')}.`) }
  // Palavras fracas
  const fracasEncontradas = PALAVRAS_FRACAS.filter(p => new RegExp(`\\b${p}\\b`, 'i').test(t))
  checklist.push({ item: 'Evita palavras fracas (bom, legal, coisa)', ok: fracasEncontradas.length === 0 })
  if (fracasEncontradas.length > 0) { score -= 5 * fracasEncontradas.length; fraquezas.push(`Palavras fracas: ${fracasEncontradas.join(', ')}.`) }
  // CAIXA ALTA
  const caixaAlta = (t.match(/[A-ZÀ-Ú]/g) || []).length
  const ratioAlta = chars > 0 ? caixaAlta / chars : 0
  checklist.push({ item: 'Não é TODO EM CAIXA ALTA', ok: ratioAlta < 0.5 })
  if (ratioAlta > 0.5) { score -= 15; fraquezas.push('Muitas letras maiúsculas (grito, cai em spam).') }
  // Pontos de interrogação funcionam bem
  if (t.includes('?')) { score += 3; forcas.push('Perguntas geram curiosidade (bom abridor).') }
  checklist.push({ item: 'Sem promessas milagrosas', ok: !PALAVRAS_PROIBIDAS.some(p => minusculas.includes(p)) })
  if (PALAVRAS_PROIBIDAS.some(p => minusculas.includes(p))) { score -= 20; fraquezas.push('Promessas milagrosas detectadas (risco de bloqueio).') }
  // Nicho específico
  if (nicho && nicho !== 'geral' && minusculas.includes(nicho.toLowerCase())) { score += 5; forcas.push('Menciona o nicho alvo explicitamente.') }
  checklist.push({ item: 'Menciona nicho/público', ok: nicho !== 'geral' && minusculas.includes(nicho.toLowerCase()) })
  score = Math.max(0, Math.min(100, score))
  let nota: TitleScorerResult['nota'] = 'regular'
  if (score >= 85) nota = 'excelente'
  else if (score >= 70) nota = 'bom'
  else if (score < 45) nota = 'ruim'
  // Gerar variantes
  const base = t.replace(/[?!.]+$/g, '').replace(/\s+/g, ' ').trim()
  const variantes: string[] = []
  const num = Math.floor(Math.random() * 3) + 3
  variantes.push(`${num} Erros que te impedem de ${base.toLowerCase()}`)
  variantes.push(`${base}: Guia Definitivo (${new Date().getFullYear()})`)
  variantes.push(`Como ${base.toLowerCase()} em 7 dias (mesmo que você seja iniciante)`)
  variantes.push(`${base} — O Método Completo que Funciona`)
  return { pontuacao: score, nota, forcas, fraquezas, variantesMelhoradas: variantes, checklist }
}
