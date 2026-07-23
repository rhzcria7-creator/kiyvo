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
      descricao: 'Preciso de thumbnails com cara de YouTube gaming (alto contraste, texto grosso, cara de clickbait). Canal sobre jogos indie. Entrega em até 5 dias.',
      orcamentoMin: 80,
      orcamentoMax: 200,
      prazoDias: 5,
      contratanteId: 'oficial',
      contratanteNome: 'KIYVO Oficial',
      status: 'aberto',
      urgente: false,
      createdAt: new Date().toISOString(),
      habilidades: ['photoshop', 'canva', 'youtube', 'thumbnail'],
    },
    {
      id: 'job_demo_2',
      titulo: 'Copy de 50 descrições de produtos digitais',
      categoria: 'copywriting',
      descricao: 'Escrever descrições para 50 produtos digitais (gift cards, jogos, software) em tom jovem/urgente, com bullets persuasivos.',
      orcamentoMin: 300,
      orcamentoMax: 600,
      prazoDias: 7,
      contratanteId: 'oficial',
      contratanteNome: 'KIYVO Oficial',
      status: 'aberto',
      urgente: true,
      createdAt: new Date().toISOString(),
      habilidades: ['copy', 'vendas', 'seo'],
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
