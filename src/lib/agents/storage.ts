// Agentes KIYVO — Storage local (JSON) de usage, jobs e suporte
// Usa o mesmo padrão do LocalDB (in-memory + persistência em JSON).
import fs from 'fs'
import path from 'path'
import type { FreelanceJob, FreelanceBid, UsageCounters } from '../agents/types'
import { createEmptyUsage, resetIfNeeded, todayKey } from '../agents/plans'

const CACHE_DIR = path.join(process.cwd(), '.kiyvo-cache')
const FILE = path.join(CACHE_DIR, 'agents-state.json')

interface CustomCounters {
  adoptimizerHoje?: number
  replymasterHoje?: number
  _resetAt?: string
  [k: string]: number | string | undefined
}

interface AgentState {
  usage: Record<string, UsageCounters>    // userId -> counters
  customUsage: Record<string, CustomCounters>
  supportThreads: Record<string, Array<{ role: 'user' | 'assistant'; content: string; at: string }>>
  jobs: FreelanceJob[]
  bids: FreelanceBid[]
}

const EMPTY_STATE: AgentState = {
  usage: {},
  customUsage: {},
  supportThreads: {},
  jobs: [
    {
      id: 'job_demo_1',
      titulo: 'Criar 10 thumbnails de YouTube para canal de jogos',
      categoria: 'design',
      descricao: 'Preciso de thumbnails com cara de YouTube gaming (alto contraste, texto grosso, cara de clickbait). Canal sobre jogos indie. Entrega em até 5 dias. Entregar em PNG 1280x720.',
      orcamentoMin: 80,
      orcamentoMax: 200,
      prazoDias: 5,
      contratanteId: 'oficial',
      contratanteNome: 'KIYVO Oficial',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      habilidades: ['photoshop', 'canva', 'youtube', 'thumbnail'],
    },
    {
      id: 'job_demo_2',
      titulo: 'Copy de 50 descrições de produtos digitais',
      categoria: 'copywriting',
      descricao: 'Escrever descrições para 50 produtos digitais (gift cards, jogos, software) em tom jovem/urgente, com bullets persuasivos. Entrega em até 7 dias.',
      orcamentoMin: 300,
      orcamentoMax: 600,
      prazoDias: 7,
      contratanteId: 'oficial',
      contratanteNome: 'KeysBR Digital',
      status: 'aberto',
      urgente: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      habilidades: ['copy', 'vendas', 'seo'],
    },
    {
      id: 'job_demo_3',
      titulo: 'Configurar 3 campanhas de Meta Ads para loja de moda',
      categoria: 'marketing',
      descricao: 'Loja de moda feminina precisa de gestor para criar e configurar campanhas de Meta Ads (vendas no WhatsApp). Budget de R$1.500/dia, orçamento fixo de R$800 por setup.',
      orcamentoMin: 600,
      orcamentoMax: 1200,
      prazoDias: 4,
      contratanteId: 'cliente1',
      contratanteNome: 'Moda Bella',
      status: 'aberto',
      urgente: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      habilidades: ['meta-ads', 'facebook-ads', 'trafego-pago'],
    },
    {
      id: 'job_demo_4',
      titulo: 'Editar 10 Reels curtos para Instagram (15-30s)',
      categoria: 'video',
      descricao: 'Editar 10 reels a partir de material bruto que eu envio. Adicionar legendas animadas, transições e trilha. Nicho finanças pessoais.',
      orcamentoMin: 250,
      orcamentoMax: 500,
      prazoDias: 7,
      contratanteId: 'cliente2',
      contratanteNome: 'Finança Jovem',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      habilidades: ['capcut', 'premiere', 'edicao-video', 'reels'],
    },
    {
      id: 'job_demo_5',
      titulo: 'Desenvolver landing page de curso em Next.js',
      categoria: 'desenvolvimento',
      descricao: 'Criar landing page de curso (1 página, com vídeo, depoimentos, checkout, FAQ) em Next.js + Tailwind. Integração com KIYVO/Stripe.',
      orcamentoMin: 1500,
      orcamentoMax: 3000,
      prazoDias: 14,
      contratanteId: 'cliente3',
      contratanteNome: 'EduTech Academy',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      habilidades: ['nextjs', 'react', 'tailwind', 'stripe'],
    },
    {
      id: 'job_demo_6',
      titulo: 'Criar logotipo + identidade visual para café',
      categoria: 'design',
      descricao: 'Cafeteria artesanal precisa de logo (2 versões), paleta de cores, tipografia, cartão de visitas e menu. Entrega em AI, PNG e PDF.',
      orcamentoMin: 400,
      orcamentoMax: 900,
      prazoDias: 10,
      contratanteId: 'cliente4',
      contratanteNome: 'Café do Zé',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      habilidades: ['illustrator', 'logo', 'branding', 'identidade-visual'],
    },
    {
      id: 'job_demo_7',
      titulo: 'Traduzir 30 páginas de ebook inglês → português',
      categoria: 'traducao',
      descricao: 'Traduzir ebook de marketing digital (8.000 palavras) do inglês para português brasileiro. Manter tom informal de vendas.',
      orcamentoMin: 200,
      orcamentoMax: 450,
      prazoDias: 7,
      contratanteId: 'cliente5',
      contratanteNome: 'Digital Books BR',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      habilidades: ['traducao', 'ingles', 'copy', 'marketing'],
    },
    {
      id: 'job_demo_8',
      titulo: 'Suporte/atendimento via WhatsApp (20h/semana)',
      categoria: 'suporte',
      descricao: 'Atender clientes da loja de suplementos via WhatsApp (seg-sex, 4h/dia). Treinamento dado. R$600 fixo + comissão.',
      orcamentoMin: 500,
      orcamentoMax: 800,
      prazoDias: 30,
      contratanteId: 'cliente6',
      contratanteNome: 'SupleFit',
      status: 'aberto',
      urgente: true,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      habilidades: ['atendimento', 'whatsapp', 'vendas'],
    },
    {
      id: 'job_demo_9',
      titulo: 'Dublagem de 10 vídeos (VSL em português)',
      categoria: 'audio',
      descricao: 'Dublar 10 VSLs (total ~60min de áudio) com voz masculina ou feminina clara, tom de venda. Qualidade microfone profissional.',
      orcamentoMin: 350,
      orcamentoMax: 900,
      prazoDias: 7,
      contratanteId: 'cliente7',
      contratanteNome: 'Lançamentos Pro',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      habilidades: ['dublagem', 'audio', 'locucao', 'vsl'],
    },
    {
      id: 'job_demo_10',
      titulo: 'Criar 30 posts para Instagram de nutricionista',
      categoria: 'marketing',
      descricao: 'Elaborar 30 posts para nutricionista (carrosséis + posts simples) com legendas, hashtags e artes prontas em Canva. 30 dias de conteúdo.',
      orcamentoMin: 400,
      orcamentoMax: 800,
      prazoDias: 10,
      contratanteId: 'cliente8',
      contratanteNome: 'Nutri Vida Saudável',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      habilidades: ['social-media', 'canva', 'instagram', 'conteudo'],
    },
    {
      id: 'job_demo_11',
      titulo: 'Criar 50 artes de anúncio para produto de emagrecimento',
      categoria: 'design',
      descricao: 'Preciso de 50 criativos de anúncio (feed + stories) para produto de emagrecimento. UGC-style, com texto curto e CTAs fortes.',
      orcamentoMin: 500,
      orcamentoMax: 1200,
      prazoDias: 10,
      contratanteId: 'cliente9',
      contratanteNome: 'Health Brands',
      status: 'aberto',
      urgente: true,
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      habilidades: ['design', 'facebook-ads', 'criativos', 'canva'],
    },
    {
      id: 'job_demo_12',
      titulo: 'Configurar automação de email marketing (Klaviyo/Mailchimp)',
      categoria: 'marketing',
      descricao: 'Criar sequência de boas-vindas (5 emails), abandono (3 emails) e pós-venda (2 emails) em Klaviyo ou Mailchimp. Para e-commerce de moda.',
      orcamentoMin: 400,
      orcamentoMax: 900,
      prazoDias: 7,
      contratanteId: 'cliente10',
      contratanteNome: 'Loja Trendy',
      status: 'aberto',
      urgente: false,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      habilidades: ['email-marketing', 'klaviyo', 'mailchimp', 'automacao'],
    },
  ],
  bids: [],
}

let state: AgentState | null = null
let saving = false
let saveQueued = false

function ensureDir() {
  try { fs.mkdirSync(CACHE_DIR, { recursive: true }) } catch {}
}

function loadState(): AgentState {
  if (state) return state
  ensureDir()
  try {
    if (fs.existsSync(FILE)) {
      const raw = fs.readFileSync(FILE, 'utf-8')
      const parsed = JSON.parse(raw)
      // Garante estrutura
      state = {
        usage: parsed.usage || {},
        customUsage: parsed.customUsage || {},
        supportThreads: parsed.supportThreads || {},
        jobs: Array.isArray(parsed.jobs) ? parsed.jobs : EMPTY_STATE.jobs,
        bids: Array.isArray(parsed.bids) ? parsed.bids : [],
      }
    } else {
      state = structuredClone(EMPTY_STATE)
    }
  } catch {
    state = structuredClone(EMPTY_STATE)
  }
  return state!
}

function saveSoon() {
  if (saving) { saveQueued = true; return }
  saving = true
  setImmediate(() => {
    try {
      ensureDir()
      fs.writeFileSync(FILE, JSON.stringify(state, null, 2), 'utf-8')
    } catch {}
    saving = false
    if (saveQueued) { saveQueued = false; saveSoon() }
  })
}

export function getUsage(userId: string): UsageCounters {
  const s = loadState()
  const u = s.usage[userId] || createEmptyUsage()
  s.usage[userId] = resetIfNeeded(u)
  return s.usage[userId]
}

export function setUsage(userId: string, u: UsageCounters) {
  const s = loadState()
  s.usage[userId] = { ...u, resetAt: todayKey() }
  saveSoon()
}

/** Verifica limite para agentes extras (chave custom como 'adoptimizer') */
export function checkLimit(userId: string, agent: string, limitPerDay: number): boolean {
  if (limitPerDay >= 9999) return true
  const s = loadState()
  if (!s.customUsage[userId]) s.customUsage[userId] = { _resetAt: todayKey() }
  const u = s.customUsage[userId]
  if (u._resetAt !== todayKey()) {
    s.customUsage[userId] = { _resetAt: todayKey() }
    return true
  }
  const key = `${agent}Hoje`
  return Number(u[key] || 0) < limitPerDay
}

/** Incrementa uso do agente custom */
export function trackUsage(userId: string, agent: string) {
  const s = loadState()
  if (!s.customUsage[userId]) s.customUsage[userId] = { _resetAt: todayKey() }
  const u = s.customUsage[userId]
  if (u._resetAt !== todayKey()) {
    s.customUsage[userId] = { _resetAt: todayKey() }
  }
  const key = `${agent}Hoje`
  s.customUsage[userId][key] = Number(s.customUsage[userId][key] || 0) + 1
  saveSoon()
}

export function getThread(userId: string) {
  const s = loadState()
  if (!s.supportThreads[userId]) s.supportThreads[userId] = []
  return s.supportThreads[userId]
}

export function addThreadMessage(userId: string, role: 'user' | 'assistant', content: string) {
  const s = loadState()
  if (!s.supportThreads[userId]) s.supportThreads[userId] = []
  s.supportThreads[userId].push({ role, content, at: new Date().toISOString() })
  // Limita a 50 mensagens
  if (s.supportThreads[userId].length > 50) s.supportThreads[userId] = s.supportThreads[userId].slice(-50)
  saveSoon()
}

export function getJobs(apenasAbertos = true): FreelanceJob[] {
  const s = loadState()
  return apenasAbertos ? s.jobs.filter((j) => j.status === 'aberto') : s.jobs
}

export function getJob(jobId: string): FreelanceJob | null {
  return loadState().jobs.find((j) => j.id === jobId) || null
}

export function createJob(input: Omit<FreelanceJob, 'id' | 'createdAt' | 'status'>): FreelanceJob {
  const s = loadState()
  const job: FreelanceJob = {
    ...input,
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'aberto',
  }
  s.jobs.unshift(job)
  saveSoon()
  return job
}

export function addBid(input: Omit<FreelanceBid, 'id' | 'createdAt' | 'status'>): FreelanceBid {
  const s = loadState()
  const bid: FreelanceBid = {
    ...input,
    id: `bid_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: 'pendente',
  }
  s.bids.unshift(bid)
  saveSoon()
  return bid
}

export function getBids(jobId: string): FreelanceBid[] {
  return loadState().bids.filter((b) => b.jobId === jobId)
}

export function getJobsByContratante(userId: string): FreelanceJob[] {
  return loadState().jobs.filter((j) => j.contratanteId === userId)
}
