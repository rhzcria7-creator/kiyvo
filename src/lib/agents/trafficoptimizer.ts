// Agente TrafficOptimizer — distribuição de orçamento de tráfego entre canais
export interface Canal { nome: string; ctr: number; cpa: number; conversao: number; custoPorClick: number; volume: number; criativoExausto?: boolean; scoreQualidade: number }
export interface TrafficInput { orcamentoTotal: number; nicho?: string; canais?: Canal[]; objetivo?: 'vendas'|'leads'|'audiencia'|'remarketing' }
export interface Recomendacao { canal: string; orcamento: number; orcamentoPct: number; acao: string; criativo: string; publico: string }
export interface TrafficOutput { distribuicao: Recomendacao[]; roasEstimado: number; cpaEstimado: number; ctrMedio: number; avisos: string[]; dicas: string[]; distribuicao7d: Array<{dia: number; investimento: number}> }
const CANAIS_PADRAO: Canal[] = [
  { nome: 'Meta Reels (Instagram/Facebook)', ctr: 1.8, cpa: 12, conversao: 2.5, custoPorClick: 0.45, volume: 90, scoreQualidade: 8 },
  { nome: 'TikTok Ads', ctr: 2.2, cpa: 9, conversao: 1.9, custoPorClick: 0.35, volume: 70, scoreQualidade: 7 },
  { nome: 'Google Search', ctr: 3.5, cpa: 18, conversao: 4.2, custoPorClick: 1.20, volume: 60, scoreQualidade: 9 },
  { nome: 'YouTube Ads', ctr: 1.2, cpa: 22, conversao: 2.0, custoPorClick: 0.80, volume: 50, scoreQualidade: 7 },
  { nome: 'Pinterest', ctr: 2.5, cpa: 8, conversao: 1.8, custoPorClick: 0.30, volume: 25, scoreQualidade: 6 },
  { nome: 'Remarketing (all)', ctr: 4.5, cpa: 5, conversao: 6.8, custoPorClick: 0.60, volume: 100, scoreQualidade: 10 },
]
export function otimizarTrafego(input: TrafficInput): TrafficOutput {
  const { orcamentoTotal, objetivo = 'vendas', canais = CANAIS_PADRAO } = input
  // Score = (conversao / cpa) * volume * scoreQualidade / 100
  const scored = canais.map(c => {
    let peso = (c.conversao / Math.max(0.1, c.cpa)) * c.volume * c.scoreQualidade
    if (c.criativoExausto) peso *= 0.4
    if (objetivo === 'audiencia') peso = (c.ctr / c.custoPorClick) * c.volume
    if (objetivo === 'leads') peso = (c.conversao / c.cpa) * c.volume * 0.8 + (c.ctr/c.custoPorClick)*0.2
    return { c, peso }
  })
  const pesoTotal = scored.reduce((s, x) => s + x.peso, 0)
  let distribuicao = scored.map(x => ({
    canal: x.c.nome,
    orcamento: (x.peso/pesoTotal)*orcamentoTotal,
    orcamentoPct: (x.peso/pesoTotal)*100,
    acao: '',
    criativo: '',
    publico: '',
  }))
  // Ações
  for (const r of distribuicao) {
    if (r.orcamentoPct > 25) { r.acao = 'Escalar. Criar 3 novos criativos por semana e testar públicos.' }
    else if (r.orcamentoPct > 10) { r.acao = 'Manter e otimizar. Testar 2 criativos novos por semana.' }
    else if (r.orcamentoPct > 3) { r.acao = 'Testar com orçamento mínimo. Medir CPA antes de aumentar.' }
    else { r.acao = 'Desligar ou cortar orçamento. Canal não está performando.' }
    if (r.canal.toLowerCase().includes('remarketing')) r.acao = 'Manter SEMPRE ligado. Maior ROAS de todos os canais.'
  }
  distribuicao[0].criativo = 'Vídeos curtos de 15s com hook nos 3 primeiros segundos'
  distribuicao[0].publico = 'Público frio + lookalike 1% de compradores'
  const avisos: string[] = []
  for (const c of canais) {
    if (c.criativoExausto) avisos.push(`⚠️ ${c.nome}: criativos exaustos (fadiga de anúncio). Renovar URGENTEMENTE.`)
    if (c.ctr < 1) avisos.push(`📉 ${c.nome}: CTR muito baixo (${c.ctr}%). Rever thumbnail e hook.`)
    if (c.cpa > 30) avisos.push(`💸 ${c.nome}: CPA alto (R$ ${c.cpa}). Rever público e oferta.`)
  }
  if (!canais.some(c => c.nome.toLowerCase().includes('remarketing'))) avisos.push('🔴 Remarketing está DESLIGADO! É o canal com melhor ROAS. Ligue IMEDIATAMENTe (20-30% do orçamento).')
  const dicas = [
    '💡 Regra 80/20: 80% do orçamento nos 2-3 canais lucrativos',
    '🧪 Teste pelo menos 3 ângulos DIFERENTES de criativo, não só variações',
    '📊 Sempre espere 50 conversões antes de matar um conjunto',
    '🔁 Remarketing SEMPRE ligado (maior ROAS)',
    '🎯 CPA ideal ≤ ticket médio × margem líquida',
    '🚫 Não escale um anúncio antes de 24h de dados',
  ]
  const ctrMedio = canais.reduce((s,c)=>s+c.ctr,0)/canais.length
  const cpaEstimado = canais.reduce((s,c)=>s+c.cpa,0)/canais.length
  const roasEstimado = objetivo === 'vendas' ? 2.8 : objetivo === 'leads' ? 3.2 : 2.0
  // Distribuição 7 dias (crescente para aprendizagem)
  const distribuicao7d = Array.from({length:7},(_,i) => ({
    dia: i+1,
    investimento: orcamentoTotal*(i<2?0.08:i<4?0.12:i<6?0.18:0.25),
  }))
  return { distribuicao, roasEstimado, cpaEstimado, ctrMedio, avisos, dicas, distribuicao7d }
}
