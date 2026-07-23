// FreelanceMatch Agent — Match inteligente de jobs x freelancers
// Sistema de reputação + score de habilidades + orçamento + prazo.
import type { FreelanceJob, FreelanceBid, FreelanceCategory } from './types'

export interface Freelancer {
  id: string
  userId: string
  nome: string
  bio: string
  categorias: FreelanceCategory[]
  habilidades: string[]
  portfolio?: string[]
  avaliacaoMedia: number
  totalTrabalhos: number
  taxaEntregaNoPrazo: number
  precoHora?: number
  badgeVerified?: boolean
  planLevel: 'free' | 'plus' | 'pro' | 'vendor_pro'
  disponivel: boolean
}

export interface MatchScore {
  freelancerId: string
  score: number               // 0-100
  razoes: string[]
  precoCompatível: boolean
  prazoCompatível: boolean
}

const HABILIDADES_CATEGORIA: Record<FreelanceCategory, string[]> = {
  design: ['photoshop', 'illustrator', 'figma', 'canva', 'logo', 'banner', 'identidade visual', 'thumbnail', 'ui', 'ux', '3d'],
  copywriting: ['copy', 'seo', 'legendas', 'roteiro', 'email marketing', 'vendas', 'reels', 'texto', 'anuncio'],
  desenvolvimento: ['nextjs', 'react', 'typescript', 'node', 'api', 'web', 'landing page', 'bot', 'discord', 'telegram', 'supabase', 'stripe'],
  video: ['edicao', 'video', 'after effects', 'premiere', 'reels', 'tiktok', 'youtube', 'shorts', 'animacao'],
  marketing: ['trafego pago', 'meta ads', 'google ads', 'tiktok ads', 'seo', 'growth', 'social media', 'instagram', 'afiliados'],
  traducao: ['ingles', 'espanhol', 'traducao', 'revisao', 'legendas', 'pt-br', 'en-us'],
  audio: ['locucao', 'podcast', 'mixagem', 'masterizacao', 'jingles', 'efeitos', 'voiceover'],
  suporte: ['atendimento', 'suporte', 'whatsapp', 'sac', 'chat', 'moderacao', 'comunidade'],
  outro: ['outro'],
}

export function scoreMatch(job: FreelanceJob, freelancer: Freelancer): MatchScore {
  let score = 0
  const razoes: string[] = []
  let precoOk = true
  let prazoOk = true

  // 1. Categoria bate (20 pts)
  if (freelancer.categorias.includes(job.categoria)) {
    score += 20
    razoes.push('Categoria alinhada')
  }

  // 2. Habilidades (máx 25 pts)
  const habsCat = HABILIDADES_CATEGORIA[job.categoria] || []
  const habilidadesMatch = freelancer.habilidades.filter((h) =>
    job.habilidades.some((req) => h.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(h.toLowerCase())),
  )
  const habScore = Math.min(25, (habilidadesMatch.length / Math.max(1, job.habilidades.length)) * 25)
  if (habScore > 0) {
    score += habScore
    razoes.push(`${habilidadesMatch.length} habilidade(s) batem`)
  }

  // 3. Avaliação (20 pts)
  score += (freelancer.avaliacaoMedia / 5) * 20
  if (freelancer.avaliacaoMedia >= 4.8) razoes.push('Avaliação excelente (≥ 4.8)')
  else if (freelancer.avaliacaoMedia >= 4.5) razoes.push('Ótima avaliação')

  // 4. Entrega no prazo (10 pts)
  score += freelancer.taxaEntregaNoPrazo * 10
  if (freelancer.taxaEntregaNoPrazo >= 0.98) razoes.push('98%+ de entregas no prazo')

  // 5. Total de trabalhos (10 pts — log)
  const trabalhosScore = Math.min(10, Math.log10(freelancer.totalTrabalhos + 1) * 5)
  score += trabalhosScore
  if (freelancer.totalTrabalhos >= 50) razoes.push(`+${freelancer.totalTrabalhos} trabalhos concluídos`)

  // 6. Verificado (5 pts)
  if (freelancer.badgeVerified) {
    score += 5
    razoes.push('Freelancer verificado')
  }

  // 7. Disponibilidade (5 pts)
  if (freelancer.disponivel) {
    score += 5
  } else {
    score -= 15
    razoes.push('Atenção: freelancer indisponível no momento')
  }

  // 8. Preço
  if (freelancer.precoHora) {
    const horasEstimadas = Math.max(4, job.prazoDias * 4)
    const precoEstimado = freelancer.precoHora * horasEstimadas
    if (precoEstimado > job.orcamentoMax) {
      score -= 10
      precoOk = false
      razoes.push('Preço acima do orçamento')
    } else if (precoEstimado >= job.orcamentoMin * 0.8) {
      score += 5
      razoes.push('Preço dentro do orçamento')
    } else {
      score += 3
    }
  }

  return {
    freelancerId: freelancer.id,
    score: Math.max(0, Math.min(100, Math.round(score))),
    razoes,
    precoCompatível: precoOk,
    prazoCompatível: prazoOk,
  }
}

export function rankFreelancers(job: FreelanceJob, pool: Freelancer[]): Array<Freelancer & { match: MatchScore }> {
  return pool
    .map((f) => ({ ...f, match: scoreMatch(job, f) }))
    .filter((f) => f.match.score >= 35)
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 12)
}

export const CATEGORIAS_FREELA: Array<{ id: FreelanceCategory; nome: string; emoji: string; descricao: string }> = [
  { id: 'design', nome: 'Design', emoji: '🎨', descricao: 'Logos, banners, thumbnails, UI/UX' },
  { id: 'copywriting', nome: 'Copywriting', emoji: '✍️', descricao: 'Textos que vendem, anúncios, SEO' },
  { id: 'desenvolvimento', nome: 'Desenvolvimento', emoji: '💻', descricao: 'Sites, bots, automações, landing pages' },
  { id: 'video', nome: 'Vídeo', emoji: '🎬', descricao: 'Edição, reels, animações, After Effects' },
  { id: 'marketing', nome: 'Marketing', emoji: '📣', descricao: 'Tráfego pago, social media, growth' },
  { id: 'traducao', nome: 'Tradução', emoji: '🌍', descricao: 'EN/PT, legendas, revisão' },
  { id: 'audio', nome: 'Áudio & Voz', emoji: '🎙️', descricao: 'Locução, podcast, jingles' },
  { id: 'suporte', nome: 'Suporte', emoji: '💬', descricao: 'SAC, atendimento, moderação' },
  { id: 'outro', nome: 'Outro', emoji: '🧩', descricao: 'Outros serviços digitais' },
]
