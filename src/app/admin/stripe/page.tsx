'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, DollarSign, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Skeleton } from '@/components/ui/Skeleton'
import { InlineLoader } from '@/components/ui/LoadingScreen'
import { formatPrice } from '@/lib/utils'
import { clientLogger } from '@/lib/observability/client-logger'

interface StripeHealthStats {
  stripeConfigured: boolean
  volume: number
  transactions: number
  approvalRate: number
  chargebacks: number
}

export default function AdminStripePage() {
  const [stats, setStats] = useState<StripeHealthStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/health', { credentials: 'include' })
      if (res.status === 401 || res.status === 403) {
        setError('Sem permissão para acessar.')
        setStats(null)
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      // Detectar se Stripe está configurado (vem da health check route)
      const stripeConfigured = data.checks?.stripe === 'up' && !!data.stripeConfigured

      setStats({
        stripeConfigured,
        volume: data.stripe?.volume ?? 0,
        transactions: data.stripe?.transactions ?? 0,
        approvalRate: data.stripe?.approvalRate ?? (stripeConfigured ? 0 : 0),
        chargebacks: data.stripe?.chargebacks ?? 0,
      })
      setError(null)
    } catch (err) {
      clientLogger.error('Falha ao carregar saúde do Stripe', { metadata: { err: String(err) } })
      // Se falhar, assumir não configurado (modo seguro)
      setStats({
        stripeConfigured: false,
        volume: 0,
        transactions: 0,
        approvalRate: 0,
        chargebacks: 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const isConnected = stats?.stripeConfigured ?? false

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4"
        >
          <div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white flex items-center gap-2">
              <CreditCard size={24} className="text-brand-600 dark:text-brand-400" /> Stripe Dashboard
            </h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
              Gerencie pagamentos e transações Stripe
            </p>
          </div>
          <button
            onClick={() => { setRefreshing(true); fetchStats() }}
            disabled={loading || refreshing}
            className="btn-secondary p-2 self-start"
            aria-label="Atualizar"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </motion.div>

        {loading && (
          <div className="mt-8 space-y-4">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {/* Connection Status */}
        {!loading && (
          <FadeInOnScroll className="mt-8">
            <div className={`card-base p-6 ${
              isConnected
                ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-amber-200 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/20'
            }`}>
              <div className="flex items-center gap-4">
                {isConnected ? (
                  <CheckCircle size={32} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertCircle size={32} className="text-amber-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">
                    {isConnected ? 'Stripe Conectado' : 'Stripe Não Configurado'}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                    {isConnected
                      ? 'Sua conta Stripe está conectada e processando pagamentos.'
                      : 'Configure suas credenciais Stripe para começar a receber pagamentos reais.'}
                  </p>
                </div>
              </div>

              {!isConnected && (
                <div className="mt-4 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
                  <h4 className="font-display font-bold text-sm text-surface-900 dark:text-white mb-3">
                    Como configurar:
                  </h4>
                  <ol className="space-y-2 text-sm text-surface-600 dark:text-surface-400">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-brand-600 dark:text-brand-400">1.</span>
                      Crie uma conta em <strong>stripe.com</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-brand-600 dark:text-brand-400">2.</span>
                      No Dashboard, copie a <strong>Publishable Key</strong> e a <strong>Secret Key</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-brand-600 dark:text-brand-400">3.</span>
                      Adicione as variáveis no arquivo <code className="bg-surface-100 dark:bg-surface-800 px-1 rounded">.env.local</code>:
                    </li>
                  </ol>
                  <div className="mt-3 bg-surface-950 dark:bg-black rounded-xl p-4 font-mono text-sm overflow-x-auto">
                    <p className="text-surface-500">{'# .env.local'}</p>
                    <p className="text-emerald-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...</p>
                    <p className="text-emerald-400">STRIPE_SECRET_KEY=sk_live_...</p>
                    <p className="text-amber-400">STRIPE_WEBHOOK_SECRET=whsec_...</p>
                  </div>
                  <p className="text-xs text-surface-400 mt-3">
                    💡 Em modo de teste, use as chaves <code className="bg-surface-100 dark:bg-surface-800 px-1 rounded">pk_test_</code> e{' '}
                    <code className="bg-surface-100 dark:bg-surface-800 px-1 rounded">sk_test_</code>
                  </p>
                </div>
              )}
            </div>
          </FadeInOnScroll>
        )}

        {/* Stats */}
        {!loading && stats && isConnected && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              {
                label: 'Volume total',
                value: stats.volume,
                prefix: 'R$ ',
                format: (v: number) => formatPrice(v),
                icon: DollarSign,
                color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
              },
              {
                label: 'Transações',
                value: stats.transactions,
                icon: CreditCard,
                color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
              },
              {
                label: 'Taxa de aprovação',
                value: stats.approvalRate,
                suffix: '%',
                icon: CheckCircle,
                color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
              },
              {
                label: 'Chargebacks',
                value: stats.chargebacks,
                icon: TrendingUp,
                color: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
              },
            ].map((stat, i) => (
              <FadeInOnScroll key={stat.label} delay={i * 0.05}>
                <div className="card-base p-5">
                  <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                    <stat.icon size={16} />
                  </div>
                  <p className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
                    {refreshing ? <InlineLoader /> : (
                      <>
                        {stat.prefix || ''}
                        {stat.format ? stat.format(Number(stat.value)) : Number(stat.value).toLocaleString('pt-BR')}
                        {stat.suffix || ''}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-surface-400 dark:text-surface-500">{stat.label}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        )}

        {/* Payment Methods */}
        <FadeInOnScroll className="mt-8">
          <div className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">
              Métodos de Pagamento Aceitos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Cartão de Crédito', icon: '💳', desc: 'Visa, Mastercard, Elo, Amex' },
                { name: 'PIX', icon: '⚡', desc: 'Instantâneo via Stripe' },
                { name: 'Boleto', icon: '📄', desc: '1-3 dias úteis' },
                { name: 'KD Points', icon: '⭐', desc: 'Desconto com pontos' },
              ].map(pm => (
                <div key={pm.name} className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl text-center">
                  <span className="text-2xl">{pm.icon}</span>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white mt-1">{pm.name}</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500">{pm.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
