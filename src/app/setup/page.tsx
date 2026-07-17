'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, CreditCard, Shield, Webhook, Loader2 } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'

interface SetupStatus {
  setup: { supabase: boolean; stripe: boolean; webhook: boolean; storage: boolean }
  tables: Record<string, boolean>
  tablesCount: number
  tablesTotal: number
  categoriesSeeded: boolean
  ready: boolean
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/setup/status')
      const data = await res.json()
      setStatus(data)
    } catch {
      // Failed to fetch setup status
    }
    setLoading(false)
  }

  useEffect(() => { fetchStatus() }, [])

  const seed = async (action: string) => {
    setSeeding(action)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.message}`)
        fetchStatus()
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch {
      alert('❌ Erro ao executar ação')
    }
    setSeeding(null)
  }

  const StatusIcon = ({ ok, warning }: { ok: boolean; warning?: boolean }) => {
    if (ok) return <CheckCircle size={20} className="text-emerald-500" />
    if (warning) return <AlertTriangle size={20} className="text-amber-500" />
    return <XCircle size={20} className="text-red-500" />
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white">⚙️ Setup Automático</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Configure tudo automaticamente — sem mexer em código</p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-600" />
          </div>
        ) : status ? (
          <div className="mt-8 space-y-6">
            {/* Overall Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`card-base p-6 ${status.ready ? 'border-emerald-200 dark:border-emerald-800' : 'border-amber-200 dark:border-amber-800'}`}>
              <div className="flex items-center gap-4">
                {status.ready ? (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
                    <CheckCircle size={28} className="text-emerald-500" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-amber-500" />
                  </div>
                )}
                <div>
                  <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">
                    {status.ready ? 'Tudo configurado!' : 'Configuração pendente'}
                  </h2>
                  <p className="text-surface-500 dark:text-surface-400 text-sm">
                    {status.ready
                      ? 'Todas as integrações estão ativas e funcionando.'
                      : 'Algumas integrações precisam de atenção. Siga os passos abaixo.'}
                  </p>
                </div>
                <button onClick={fetchStatus} className="ml-auto p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                  <RefreshCw size={18} className="text-surface-400" />
                </button>
              </div>
            </motion.div>

            {/* Integrations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-base p-6">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Database size={20} className="text-brand-600 dark:text-brand-400" /> Integrações</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Database size={18} className="text-surface-500 dark:text-surface-400" />
                    <div><p className="text-sm font-medium text-surface-900 dark:text-white">Supabase</p><p className="text-xs text-surface-400">Banco de dados, Auth, Storage</p></div>
                  </div>
                  <StatusIcon ok={status.setup.supabase} />
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-surface-500 dark:text-surface-400" />
                    <div><p className="text-sm font-medium text-surface-900 dark:text-white">Stripe</p><p className="text-xs text-surface-400">Pagamentos (Cartão, PIX, Boleto)</p></div>
                  </div>
                  <StatusIcon ok={status.setup.stripe} />
                </div>
                <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Webhook size={18} className="text-surface-500 dark:text-surface-400" />
                    <div><p className="text-sm font-medium text-surface-900 dark:text-white">Webhook</p><p className="text-xs text-surface-400">Confirmação automática de pagamentos</p></div>
                  </div>
                  <StatusIcon ok={status.setup.webhook} warning={!status.setup.webhook && status.setup.stripe} />
                </div>
              </div>
            </motion.div>

            {/* Database Tables */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-base p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white flex items-center gap-2"><Shield size={20} className="text-brand-600 dark:text-brand-400" /> Tabelas do Banco</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.tablesCount === status.tablesTotal ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'}`}>
                  {status.tablesCount}/{status.tablesTotal}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(status.tablesCount / status.tablesTotal) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>

              {Object.entries(status.tables).map(([table, exists]) => (
                <div key={table} className="flex items-center justify-between py-1.5">
                  <span className="text-xs font-mono text-surface-600 dark:text-surface-400">{table}</span>
                  <StatusIcon ok={exists} />
                </div>
              ))}

              {status.tablesCount < status.tablesTotal && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">⚠️ Tabelas faltando</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Execute o SQL no Supabase SQL Editor. Veja o arquivo <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">supabase/schema.sql</code></p>
                </div>
              )}
            </motion.div>

            {/* Auto-Seed Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-base p-6">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">🌱 Seed Automático</h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">Popule o banco com dados iniciais automaticamente.</p>
              <div className="space-y-3">
                <button
                  onClick={() => seed('seed_categories')}
                  disabled={!!seeding || status.categoriesSeeded}
                  className="w-full flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {seeding === 'seed_categories' ? <Loader2 size={18} className="animate-spin text-brand-600" /> : <Database size={18} className="text-brand-600 dark:text-brand-400" />}
                    <div className="text-left">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">Criar 20 categorias</p>
                      <p className="text-xs text-surface-400">{status.categoriesSeeded ? '✅ Já criadas' : 'Jogos, Software, Cursos, E-books...'}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${status.categoriesSeeded ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'}`}>
                    {status.categoriesSeeded ? 'Pronto' : 'Criar'}
                  </span>
                </button>

                <button
                  onClick={() => seed('seed_coupons')}
                  disabled={!!seeding}
                  className="w-full flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {seeding === 'seed_coupons' ? <Loader2 size={18} className="animate-spin text-brand-600" /> : <CreditCard size={18} className="text-brand-600 dark:text-brand-400" />}
                    <div className="text-left">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">Criar 6 cupons de desconto</p>
                      <p className="text-xs text-surface-400">WELCOME10, DIGITAL20, KIYVO15...</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-brand-600 dark:text-brand-400">Criar</span>
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-surface-400">Falha ao carregar status do setup</p>
            <button onClick={fetchStatus} className="btn-primary mt-4">Tentar novamente</button>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
