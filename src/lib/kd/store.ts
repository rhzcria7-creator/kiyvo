'use client'
// Store de KD Points — programa de recompensas real da KIYVO.
// 100 KD = R$1 de desconto. Limite de 50% do valor da compra.
// Usuários ganham KD Points ao comprar, avaliar produtos, indicar amigos, etc.
// Persiste em localStorage (kiyvo_kd_points).
// Comentários em PT-BR.
import { create } from 'zustand'

export interface KDTransaction {
  id: string
  tipo: 'compra' | 'review' | 'indicacao' | 'boasvindas' | 'saque' | 'ajuste' | 'cupom_resgate'
  pontos: number       // positivo = ganha, negativo = gasta
  descricao: string
  data: string
  refId?: string
}

interface KDStore {
  pontos: number
  totalGanho: number
  totalGasto: number
  transacoes: KDTransaction[]
  loaded: boolean
  init: () => void
  ganhar: (pontos: number, descricao: string, refId?: string) => void
  gastar: (pontos: number, descricao: string, refId?: string) => boolean
  calcularDesconto: (valor: number, kdUsados: number) => { desconto: number; kdEfetivos: number }
  maxKDPara: (valor: number) => number
  resgatarCupom: (valor: number) => { ok: boolean; codigo?: string; erro?: string }
}

const STORAGE_KEY = 'kiyvo_kd_points'
const BONUS_BOASVINDAS = 150 // R$1,50 de boas-vindas
const KD_POR_REAL_COMPRA = 5 // 5 KD por R$1 gasto
const MAX_PCT_DESCONTO = 0.5 // 50% do valor

function save(s: Partial<KDStore> & { pontos: number; totalGanho: number; totalGasto: number; transacoes: KDTransaction[] }) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch {}
}
function uid() { return 'kd-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5) }

export const useKD = create<KDStore>((set, get) => ({
  pontos: 0,
  totalGanho: 0,
  totalGasto: 0,
  transacoes: [],
  loaded: false,

  init: () => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        set({
          pontos: data.pontos ?? 0,
          totalGanho: data.totalGanho ?? 0,
          totalGasto: data.totalGasto ?? 0,
          transacoes: data.transacoes ?? [],
          loaded: true,
        })
      } else {
        // Bônus de boas-vindas (só primeira vez)
        const tx: KDTransaction = {
          id: uid(),
          tipo: 'boasvindas',
          pontos: BONUS_BOASVINDAS,
          descricao: 'Bônus de boas-vindas KIYVO 🎉',
          data: new Date().toISOString(),
        }
        const state = {
          pontos: BONUS_BOASVINDAS,
          totalGanho: BONUS_BOASVINDAS,
          totalGasto: 0,
          transacoes: [tx],
          loaded: true,
        }
        set(state)
        save(state)
      }
    } catch {
      set({ loaded: true })
    }
  },

  ganhar: (pontos, descricao, refId) => {
    if (pontos <= 0) return
    const tx: KDTransaction = {
      id: uid(), tipo: 'compra', pontos, descricao, refId,
      data: new Date().toISOString(),
    }
    const s = get()
    const next = {
      pontos: s.pontos + pontos,
      totalGanho: s.totalGanho + pontos,
      totalGasto: s.totalGasto,
      transacoes: [tx, ...s.transacoes].slice(0, 100),
      loaded: true,
    }
    set(next); save(next)
  },

  gastar: (pontos, descricao, refId) => {
    if (pontos <= 0) return false
    const s = get()
    if (s.pontos < pontos) return false
    const tx: KDTransaction = {
      id: uid(), tipo: 'saque', pontos: -pontos, descricao, refId,
      data: new Date().toISOString(),
    }
    const next = {
      pontos: s.pontos - pontos,
      totalGanho: s.totalGanho,
      totalGasto: s.totalGasto + pontos,
      transacoes: [tx, ...s.transacoes].slice(0, 100),
      loaded: true,
    }
    set(next); save(next)
    return true
  },

  maxKDPara: (valor) => {
    // 50% do valor, convertido em KD (100 KD = R$1)
    return Math.floor(valor * MAX_PCT_DESCONTO * 100)
  },

  calcularDesconto: (valor, kdUsados) => {
    const maxKD = get().maxKDPara(valor)
    const kdEfetivos = Math.max(0, Math.min(kdUsados, maxKD, get().pontos))
    const desconto = kdEfetivos / 100
    return { desconto, kdEfetivos }
  },

  resgatarCupom: (valor) => {
    const s = get()
    const necessarios = Math.ceil(valor * 100)
    if (s.pontos < necessarios) return { ok: false, erro: `Você precisa de ${necessarios} KD Points` }
    const codigo = 'KD' + Math.random().toString(36).slice(2,8).toUpperCase()
    s.gastar(necessarios, `Cupom de R$${valor.toFixed(2)} resgatado (${codigo})`)
    return { ok: true, codigo }
  },
}))
