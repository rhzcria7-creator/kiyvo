// ─────────────────────────────────────────────────────────────
// Minhas Retiradas — Dados reais do Supabase + Stripe Connect
// Zero mock data
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/shared/PageTransition'
import { useAuth } from '@/lib/auth/context'
import { formatBRL } from '@/domain/fees/FeeEngine'
import { ArrowDownCircle, Zap, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Withdrawal {
  id: string
  amount: number
  method: string
  status: string
  created_at: string
}

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  completed: { variant: 'success', label: 'Concluída' },
  pending: { variant: 'warning', label: 'Pendente' },
  processing: { variant: 'warning', label: 'Processando' },
  failed: { variant: 'danger', label: 'Falhou' },
  cancelled: { variant: 'danger', label: 'Cancelada' },
}

export default function RetiradasPage() {
  const { user } = useAuth()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [availableBalance, setAvailableBalance] = useState(0)
  const [escrowBalance, setEscrowBalance] = useState(0)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!user) { setLoading(false); return }
      try {
        // Buscar saldo do vendor
        const vendorRes = await fetch('/api/v1/vendors/me')
        if (vendorRes.ok) {
          const vData = await vendorRes.json()
          setAvailableBalance(Number(vData.vendor?.available_balance) || 0)
          setEscrowBalance(Number(vData.vendor?.escrow_balance) || 0)
        }

        // Buscar histórico de retiradas
        const wRes = await fetch('/api/v1/withdrawals?limit=20')
        if (wRes.ok) {
          const wData = await wRes.json()
          setWithdrawals(wData.withdrawals || [])
        }
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  const handleWithdraw = async (turbo: boolean) => {
    if (availableBalance <= 0) {
      toast.error('Saldo insuficiente para retirada')
      return
    }
    setWithdrawing(true)
    try {
      const res = await fetch('/api/v1/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: availableBalance, method: turbo ? 'turbo' : 'standard' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(turbo ? 'Retirada Turbo solicitada!' : 'Retirada solicitada! Em até 2 dias úteis.')
        setAvailableBalance(0)
      } else {
        toast.error(data.error || 'Erro ao solicitar retirada')
      }
    } catch {
      toast.error('Erro ao solicitar retirada')
    } finally {
      setWithdrawing(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('pt-BR') } catch { return d }
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6">Minhas Retiradas</h1>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base p-6 mb-8 bg-gradient-to-r from-brand-50 to-white dark:from-brand-950/30 dark:to-surface-900 border-brand-200 dark:border-brand-800/40"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-brand-700 dark:text-brand-300 font-display font-semibold">Saldo Disponível</p>
              <p className="font-display font-extrabold text-3xl text-brand-600 dark:text-brand-400">{formatBRL(availableBalance)}</p>
              {escrowBalance > 0 && (
                <p className="text-xs text-surface-400 mt-1">Em escrow: {formatBRL(escrowBalance)}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                icon={<ArrowDownCircle size={16} />}
                onClick={() => handleWithdraw(false)}
                disabled={withdrawing || availableBalance <= 0}
              >
                Retirada Normal
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Zap size={16} />}
                onClick={() => handleWithdraw(true)}
                disabled={withdrawing || availableBalance <= 0}
              >
                Turbo
              </Button>
            </div>
          </div>
          <p className="text-xs text-surface-400 mt-2">Normal: grátis, até 2 dias úteis • Turbo: R$ 3,50, instantâneo</p>
        </motion.div>

        {/* Withdrawal History */}
        <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">Histórico</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-base p-4 flex items-center justify-between animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded w-24" />
                  <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded w-32" />
                </div>
                <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : withdrawals.length > 0 ? (
          <div className="space-y-3">
            {withdrawals.map((w) => {
              const st = statusMap[w.status] || statusMap.pending
              return (
                <div key={w.id} className="card-base p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-sm text-surface-900 dark:text-white">{w.id}</p>
                    <p className="text-xs text-surface-400 dark:text-surface-500">{formatDate(w.created_at)} • {w.method?.toUpperCase() || 'PIX'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-surface-900 dark:text-white">{formatBRL(w.amount)}</span>
                    <Badge variant={st.variant} dot>{st.label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-3" />
            <p className="text-surface-400 dark:text-surface-500 text-sm">Nenhuma retirada realizada</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
