// ─────────────────────────────────────────────────────────────
// KIYVO Agents — Sistema de Agentes IA Internos
// Não depende de APIs externas (funciona 100% offline).
// Heurísticas, templates, geradores determinísticos +
// componentes de aleatoriedade controlada para variedade.
// ─────────────────────────────────────────────────────────────

export type AgentId =
  | 'support'        // Suporte KIYVO 24h — ilimitado
  | 'bannerforge'    // Gera banners/logos PNG a partir de ideias
  | 'copywriter'     // Escreve títulos e descrições que vendem
  | 'pricemaster'    // Sugere preço ótimo e descontos
  | 'producthunter'  // Descobre produtos virais e importa pra loja
  | 'reviewshield'   // Moderação automática (spam, fraude, IA detect)
  | 'adoptimizer'    // Otimiza títulos/palavras-chave para SEO
  | 'freelancematch' // Match de freelancers x jobs

export interface AgentDef {
  id: AgentId
  nome: string
  tagline: string
  icone: string
  descricao: string
  cor: string
  gratis: boolean           // funciona no plano free?
  requiresPro?: boolean
  staffOnly?: boolean
  exemploInput?: string
  exemploOutput?: string
}

export interface PlanDef {
  id: 'free' | 'plus' | 'pro' | 'vendor_pro' | 'staff'
  nome: string
  preco: number
  cor: string
  limites: PlanLimits
  beneficios: string[]
}

export interface PlanLimits {
  bannersPorDia: number
  copiesPorDia: number
  pricingPorDia: number
  hunterPorDia: number
  freelanceJobsAbertos: number
  freelanceBidsPorDia: number
  suportePrioritario: boolean
  autoPublicarHunter: boolean
}

export interface UsageCounters {
  bannersHoje: number
  copiesHoje: number
  pricingHoje: number
  hunterHoje: number
  bidsHoje: number
  jobsAbertos: number
  resetAt: string // ISO date (YYYY-MM-DD)
}

export interface BannerRequest {
  titulo: string
  subtitulo?: string
  categoria?: string
  cores?: { primaria?: string; secundaria?: string; fundo?: string }
  estilo?: 'hero' | 'quadrado' | 'story' | 'logo' | 'card' | 'anuncio'
  largura?: number
  altura?: number
}

export interface BannerResult {
  png: Buffer
  svg: string
  width: number
  height: number
  paleta: { primaria: string; secundaria: string; fundo: string; texto: string }
}

export interface CopyRequest {
  produto: string
  categoria?: string
  publico?: 'gamer' | 'profissional' | 'estudante' | 'criador' | 'geral'
  tom?: 'urgente' | 'confiavel' | 'premium' | 'jovem' | 'tecnico'
  beneficios?: string[]
  preco?: number
}

export interface CopyResult {
  titulos: string[]
  subtitulos: string[]
  descricaoLonga: string
  descricaoCurta: string
  bullets: string[]
  callToAction: string
  tagsSeo: string[]
  hashtags: string[]
}

export interface PricingRequest {
  produto: string
  categoria: string
  custoFornecedor?: number
  concorrentes?: number[]
  isDigital?: boolean
  regiao?: string
}

export interface PricingResult {
  precoSugerido: number
  precoMinimo: number
  precoMaximo: number
  precoPromocional: number
  margemLiquida: number
  estrategia: 'penetracao' | 'premium' | 'psicologico' | 'skimming' | 'competitivo'
  justificativa: string
}

export interface HunterSuggestion {
  id: string
  titulo: string
  categoria: string
  scoreViral: number        // 0-100
  precoSugerido: number
  margemEstimada: number
  fonte: string
  razao: string
  tags: string[]
  risco: 'baixo' | 'medio' | 'alto'
}

export interface FreelanceJob {
  id: string
  titulo: string
  categoria: FreelanceCategory
  descricao: string
  orcamentoMin: number
  orcamentoMax: number
  prazoDias: number
  contratanteId: string
  contratanteNome: string
  status: 'aberto' | 'em_andamento' | 'concluido' | 'cancelado'
  urgente: boolean
  createdAt: string
  habilidades: string[]
}

export type FreelanceCategory =
  | 'design'
  | 'copywriting'
  | 'desenvolvimento'
  | 'video'
  | 'marketing'
  | 'traducao'
  | 'audio'
  | 'suporte'
  | 'outro'

export interface FreelanceBid {
  id: string
  jobId: string
  freelancerId: string
  freelancerNome: string
  valor: number
  prazoDias: number
  mensagem: string
  portfolioUrl?: string
  status: 'pendente' | 'aceito' | 'recusado'
  createdAt: string
}

// Tipos genéricos para agentes
export interface AgentContext {
  userId: string
  plan?: { id: string; nome: string; preco: number; cor: string } | null
}

export interface AgentResult<T = any> {
  ok: boolean
  data?: T
  error?: string
}
