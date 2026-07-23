// Agente VoiceClonePreview — cria scripts otimizados para narração/voz
// (não clona voz — sugere tons, velocidade, pausas, SSML-lite para áudio)
export interface VoicePreviewInput {
  texto: string
  tom?: 'amigavel' | 'autoridade' | 'urgente' | 'calmo' | 'vendedor'
  idioma?: 'pt-BR'
  velocidade?: number // 0.75-1.5
}
export interface VoicePreviewResult {
  textoFormatado: string
  segmentos: Array<{ tipo: 'fala' | 'pausa' | 'enfase'; conteudo: string; duracaoMs?: number }>
  tomRecomendado: string
  velocidade: number
  dicasLocucao: string[]
  duracaoEstimadaSec: number
}

export function prepararRoteiroVoz(input: VoicePreviewInput): VoicePreviewResult {
  const { texto, tom = 'amigavel', velocidade = 1 } = input
  const sentences = texto.split(/(?<=[.!?])\s+/).filter(Boolean)
  const segmentos: VoicePreviewResult['segmentos'] = []
  let totalPalavras = 0
  for (const s of sentences) {
    const palavras = s.split(/\s+/).filter(Boolean)
    totalPalavras += palavras.length
    // Detecta interrogações/exclamações
    const isEnfase = /!|\?|\b(AGORA|NUNCA|JAMAIS|GARANTIDO|GRÁTIS|GRATIS|EXCLUSIVO|OFERTA)\b/i.test(s)
    segmentos.push({ tipo: isEnfase ? 'enfase' : 'fala', conteudo: s })
    // Pausa curta entre frases
    if (s.endsWith('?')) segmentos.push({ tipo: 'pausa', conteudo: '', duracaoMs: 400 })
    else if (s.endsWith('!')) segmentos.push({ tipo: 'pausa', conteudo: '', duracaoMs: 250 })
    else segmentos.push({ tipo: 'pausa', conteudo: '', duracaoMs: 200 })
  }
  const velocidades: Record<string, number> = { urgente: 1.2, autoridade: 0.95, calmo: 0.85, amigavel: 1, vendedor: 1.1 }
  const velFinal = velocidade * velocidades[tom]
  const palavrasPorMinuto = 150 * velFinal
  const duracaoEstimadaSec = Math.round((totalPalavras / palavrasPorMinuto) * 60)
  const tomLabel: Record<string, string> = {
    amigavel: 'Tom conversacional, como se estivesse falando com um amigo próximo. Sorrir enquanto fala.',
    autoridade: 'Tom firme, calmo, sem pressa. Pausas longas para dar peso.',
    urgente: 'Ritmo mais rápido, energia alta, voz grave com intensidade.',
    calmo: 'Respiração profunda, voz suave, pausas longas (ideal para meditação/saúde).',
    vendedor: 'Energia média-alta, entusiasmo controlado, ênfase em benefícios.',
  }
  const dicasLocucao = [
    'Beba água antes de gravar — hidratação evita voz rouca.',
    'Fale a 20-30 cm do microfone, levemente de lado (evita "pops").',
    'Faça aquecimento vocal (boceje, faça "mmmmmm" por 30s).',
    'Marque ênfases sublinhando as palavras chave do script.',
    'Se errar, não pare — respire e repita a frase desde o início da última pausa.',
    'Reduza a velocidade em 10% — parece mais confiante.',
  ]
  return {
    textoFormatado: texto,
    segmentos,
    tomRecomendado: tomLabel[tom],
    velocidade: Math.round(velFinal * 100) / 100,
    dicasLocucao,
    duracaoEstimadaSec,
  }
}
