'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity, Database, CreditCard, Clock, Loader2 } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'

interface HealthData {
  status: string
  timestamp: string
  version: string
  uptime: number
  checks: Record<string, { status: string; message?: string; latency?: number }>
  latency: number
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setHealth(data)
    } catch {
      setHealth(null)
    }
    setLoading(false)
  }

  useEffect(() => { fetchHealth() }, [])

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${d}d ${h}h ${m}m`
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white flex items-center gap-3">
              <Activity size={32} className="text-brand-600 dark:text-brand-400" />
              Status do Sistema
            </h1>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Monitoramento em tempo real — atualizado automaticamente</p>
          </div>
          <button onClick={fetchHealth} className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
            <RefreshCw size={18} className={`text-surface-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </motion.div>

        {loading && !health ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-brand-600" /></div>
        ) : health ? (
          <div className="mt-8 space-y-6">
            {/* Overall Status Banner */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className={`card-base p-6 ${health.status === 'healthy' ? 'border-emerald-200 dark:border-emerald-800' : health.status === 'degraded' ? 'border-amber-200 dark:border-amber-800' : 'border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-4">
                <motion.div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${health.status === 'healthy' ? 'bg-emerald-50 dark:bg-emerald-950/50' : health.status === 'degraded' ? 'bg-amber-50 dark:bg-amber-950/50' : 'bg-red-50 dark:bg-red-950/50'}`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {health.status === 'healthy' ? <CheckCircle size={32} className="text-emerald-500" /> : health.status === 'degraded' ? <AlertTriangle size={32} className="text-amber-500" /> : <XCircle size={32} className="text-red-500" />}
                </motion.div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-surface-900 dark:text-white capitalize">{health.status === 'healthy' ? '✅ Todos os sistemas operacionais' : health.status === 'degraded' ? '⚠️ Funcionando com limitações' : '❌ Problemas detectados'}</h2>
                  <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">v{health.version} • Uptime: {formatUptime(health.uptime)} • Verificado em {new Date(health.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </motion.div>

            {/* Service Checks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(health.checks).map(([key, check], i) => (
                <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-base p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {key === 'database' ? <Database size={16} className="text-brand-600 dark:text-brand-400" /> : <CreditCard size={16} className="text-brand-600 dark:text-brand-400" />}
                      <span className="text-sm font-semibold text-surface-900 dark:text-white capitalize">{key}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${check.status === 'ok' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : check.status === 'warning' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'}`}>
                      {check.status === 'ok' ? 'OK' : check.status === 'warning' ? 'Atenção' : 'Erro'}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 dark:text-surface-500">{check.message}</p>
                  {check.latency && <p className="text-xs text-surface-300 dark:text-surface-600 mt-1"><Clock size={10} className="inline" /> {check.latency}ms</p>}
                </motion.div>
              ))}
            </div>

            {/* Response Time */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-6">
              <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-2">Tempo de Resposta</h3>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-display font-extrabold text-brand-600 dark:text-brand-400">{health.latency}ms</div>
                <div className="text-sm text-surface-400">Tempo total da verificação de saúde</div>
              </div>
              <div className="mt-3 w-full h-3 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${health.latency < 500 ? 'bg-emerald-500' : health.latency < 1000 ? 'bg-amber-500' : 'bg-red-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((health.latency / 2000) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-20"><p className="text-surface-400">Falha ao conectar</p></div>
        )}
      </div>
    </PageTransition>
  )
}
