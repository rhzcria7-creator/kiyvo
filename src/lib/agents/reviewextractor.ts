// Agente ReviewExtractor — analisa LOTE de avaliações e extrai insights
// Usado por vendedores para: saber o que cliente ama, o que reclama, gerar prova social
export interface Review { texto: string; rating: number; data?: string }
export interface ReviewExtractorInput { reviews: Review[]; produto?: string }
export interface ReviewExtractorOutput {
  total: number
  notaMedia: number
  distribuicao: Record<1|2|3|4|5, number>
  topElogios: Array<{ tema: string; mencoes: number; fraseExemplo: string }>
  topReclamacoes: Array<{ tema: string; mencoes: number; fraseExemplo: string; severidade: 'baixa'|'media'|'alta' }>
  palavrasMaisUsadas: Array<{ palavra: string; frequencia: number; contexto: 'positivo'|'negativo'|'neutro' }>
  frasesProvaSocial: string[]
  alertas: string[]
  recomendacoes: string[]
  nps: number
}
const PALAVRAS_POSITIVAS = ['excelente','otimo','ótimo','maravilhoso','perfeito','incrivel','incrível','adorei','recomendo','amei','amo','amigavel','fácil','facil','rapido','rápido','bom','boa','top','fantastico','fantástico','sensacional','melhor','entregou','funciona','valeu','apena','vale']
const PALAVRAS_NEGATIVAS = ['ruim','pessimo','péssimo','horrivel','horrível','decepcao','decepção','decepcionado','problema','defeito','nao funciona','não funciona','devolver','reembolso','atraso','demorou','atrasou','enganacao','enganação','propaganda enganosa','fraude','golpe','caro','lento','erro','bug','péssimo','pessimo','lixo','furada']
function contarFreq(textos: string[]): Map<string, number> {
  const stop = new Set(['de','o','a','os','as','e','é','para','com','em','no','na','do','da','que','um','uma','se','por','mais','como','ao','à','seu','sua','você','voce','eu','me','mim','nao','não','tem','muito','ser','isso','esse','esta','está','ja','já','foi','era','quando','dos','das','pra','para','tambem','também','ele','ela','eles','elas','nos','nas','pro','pro'])
  const f = new Map<string, number>()
  for (const t of textos) {
    for (const w of t.toLowerCase().split(/[\s,.!?;:()\[\]"'\d/\\-]+/)) {
      const word = w.trim()
      if (word.length >= 4 && !stop.has(word)) f.set(word, (f.get(word) || 0) + 1)
    }
  }
  return f
}
function detectarTema(t: string): string {
  const tl = t.toLowerCase()
  if (/atras|demor|entrega|recebi|chegou|chegar/.test(tl)) return 'Entrega/prazo'
  if (/atend|respond|suporte|chama|ignor/.test(tl)) return 'Atendimento/suporte'
  if (/preco|caro|barato|valor|custou|paguei|dinheiro/.test(tl)) return 'Preço/valor'
  if (/defeit|queb|funcion|erro|bug|n.o funciona/.test(tl)) return 'Qualidade/defeito'
  if (/propaganda|engan|diferente|anunciado/.test(tl)) return 'Expectativa vs realidade'
  if (/f.cil|facil|simples|pratico|prático|intuitivo|usar/.test(tl)) return 'Facilidade de uso'
  if (/qualidade|material|acabamento/.test(tl)) return 'Qualidade/acabamento'
  if (/garantia|reembolso|devolu/.test(tl)) return 'Garantia/reembolso'
  return 'Outros'
}
export function extrairInsightsReviews(input: ReviewExtractorInput): ReviewExtractorOutput {
  const { reviews, produto = 'o produto' } = input
  const total = reviews.length
  if (total === 0) {
    return { total: 0, notaMedia: 0, distribuicao: { 1:0,2:0,3:0,4:0,5:0 }, topElogios: [], topReclamacoes: [], palavrasMaisUsadas: [], frasesProvaSocial: [], alertas: ['Nenhuma avaliação para analisar'], recomendacoes: ['Comece a coletar avaliações automaticamente após a compra'], nps: 0 }
  }
  const soma = reviews.reduce((a,r)=>a+r.rating,0)
  const notaMedia = soma / total
  const dist: Record<1|2|3|4|5, number> = { 1:0,2:0,3:0,4:0,5:0 }
  for (const r of reviews) { const k = Math.max(1,Math.min(5,Math.round(r.rating))) as 1|2|3|4|5; dist[k]++ }
  const positivos = reviews.filter(r=>r.rating>=4)
  const negativos = reviews.filter(r=>r.rating<=2)
  const temasPositivos = new Map<string, { mencoes:number; exemplo:string }>()
  const temasNegativos = new Map<string, { mencoes:number; exemplo:string }>()
  for (const r of positivos) { const t = detectarTema(r.texto); const cur = temasPositivos.get(t) || { mencoes:0, exemplo: r.texto.slice(0,150) }; cur.mencoes++; temasPositivos.set(t,cur) }
  for (const r of negativos) { const t = detectarTema(r.texto); const cur = temasNegativos.get(t) || { mencoes:0, exemplo: r.texto.slice(0,150) }; cur.mencoes++; temasNegativos.set(t,cur) }
  const topElogios = Array.from(temasPositivos.entries()).map(([tema,v])=>({tema, mencoes:v.mencoes, fraseExemplo:v.exemplo})).sort((a,b)=>b.mencoes-a.mencoes).slice(0,5)
  const topReclamacoes = Array.from(temasNegativos.entries()).map(([tema,v])=>{
    const sev: 'baixa'|'media'|'alta' = v.mencoes/total > 0.15 ? 'alta' : v.mencoes/total > 0.05 ? 'media' : 'baixa'
    return {tema, mencoes:v.mencoes, fraseExemplo:v.exemplo, severidade: sev }
  }).sort((a,b)=>b.mencoes-a.mencoes).slice(0,5)
  const palavrasPos = contarFreq(positivos.map(r=>r.texto))
  const palavrasNeg = contarFreq(negativos.map(r=>r.texto))
  const palavrasGeral = contarFreq(reviews.map(r=>r.texto))
  const palavrasMaisUsadas: Array<{palavra:string;frequencia:number;contexto:'positivo'|'negativo'|'neutro'}> = []
  const palavrasGeralArr = Array.from(palavrasGeral.entries())
  for (let i = 0; i < palavrasGeralArr.length; i++) {
    const [p, f] = palavrasGeralArr[i];
    if (f < 2) continue
    let ctx: 'positivo'|'negativo'|'neutro' = 'neutro'
    if (PALAVRAS_POSITIVAS.some(x=>p.includes(x))||(palavrasPos.get(p)||0) > (palavrasNeg.get(p)||0)*2) ctx = 'positivo'
    else if (PALAVRAS_NEGATIVAS.some(x=>p.includes(x))||(palavrasNeg.get(p)||0) > (palavrasPos.get(p)||0)*2) ctx = 'negativo'
    palavrasMaisUsadas.push({ palavra:p, frequencia:f, contexto:ctx })
  }
  palavrasMaisUsadas.sort((a,b)=>b.frequencia-a.frequencia)
  const topPalavras = palavrasMaisUsadas.slice(0,12)
  // NPS: % promotores (5) - % detratores (1-2)
  const promotores = dist[5] / total
  const detratores = (dist[1]+dist[2]) / total
  const nps = Math.round((promotores - detratores) * 100)
  // Frases de prova social
  const frasesProvaSocial = positivos.slice(0,3).map(r => {
    const t = r.texto.trim().slice(0, 200)
    return `"${t}"${r.texto.length>200?'...':''}`
  })
  if (positivos.length > 0) {
    frasesProvaSocial.push(`+${positivos.length} clientes deram 4-5 estrelas para ${produto}`)
    frasesProvaSocial.push(`Nota média ${notaMedia.toFixed(1)}/5 baseada em ${total} avaliações verificadas`)
  }
  const alertas: string[] = []
  if (notaMedia < 3.5) alertas.push(`⚠️ Nota média ${notaMedia.toFixed(1)} está BAIXA — ação urgente necessária`)
  if ((dist[1]+dist[2])/total > 0.2) alertas.push(`🚨 ${Math.round((dist[1]+dist[2])/total*100)}% de avaliações negativas — risco de reputação`)
  const temasCriticos = topReclamacoes.filter(r=>r.severidade==='alta')
  for (const t of temasCriticos) alertas.push(`🔴 Problema recorrente: "${t.tema}" — ${t.mencoes} menções`)
  if (nps < 0) alertas.push(`📉 NPS negativo (${nps}): mais clientes detratores que promotores`)
  const recomendacoes: string[] = []
  if (negativos.length > 0) recomendacoes.push(`Responda 100% das avaliações negativas em menos de 24h — use o agente ReviewResponder`)
  if (topReclamacoes.length > 0) recomendacoes.push(`Atue no tema mais crítico: ${topReclamacoes[0].tema}`)
  recomendacoes.push('Use as frases de prova social no topo da página de vendas')
  recomendacoes.push('Mencione os elogios mais comuns nos seus anúncios (isso dobra conversão)')
  if (nps >= 50) recomendacoes.push('🎉 NPS ótimo! Foque em escalar o produto')
  else if (nps >= 0) recomendacoes.push('NPS razoável — melhore o ponto fraco principal antes de escalar anúncios')
  else recomendacoes.push('🔴 Corrija os problemas do produto ANTES de gastar com tráfego')
  return { total, notaMedia, distribuicao: dist, topElogios, topReclamacoes, palavrasMaisUsadas: topPalavras, frasesProvaSocial, alertas, recomendacoes, nps }
}
