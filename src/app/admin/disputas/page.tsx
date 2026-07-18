'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Gavel, Loader2, AlertCircle, RefreshCw, Search, Filter, Eye, MessageSquare } from 'lucide-react'

interface Dispute {
  id: string
  order_id: string
  reason: string
  status: string
  created_at: string
  buyer_username: string
  vendor_username: string
  product_title: string
  amount: number
}

export default function AdminDisputasPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDisputes()
  }, [statusFilter])

  async function fetchDisputes() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('q', searchQuery)
      const res = await fetch(`/api/v1/admin/disputes?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setDisputes(data.disputes || [])
      } else {
        // Tabela pode não existir ainda
        setDisputes([])
      }
    } catch {
      setDisputes([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    } catch {
      return iso
    }
  }


  const statusBadge: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    under_review: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-surface-100 text-surface-600',
  }

  const statusLabel: Record<string, string> = {
    open: 'Aberta',
    under_review: 'Em Análise',
    resolved: 'Resolvida',
    closed: 'Fechada',
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Gavel size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-surface-900">Disputas</h1>
              <p className="text-surface-500 text-sm">Resolução de conflitos entre compradores e vendedores</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDisputes}
            disabled={loading}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
          </motion.button>
        </motion.div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Buscar por ID, produto ou usuário..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDisputes()}
              className="input-base pl-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'under_review', 'resolved'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {status === 'all' ? 'Todas' : statusLabel[status] || status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando disputas...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && disputes.length === 0 && (
          <div className="card-base p-12 text-center">
            <Gavel size={32} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 font-display font-bold">Nenhuma disputa encontrada</p>
            <p className="text-surface-400 text-sm mt-1">Disputas abertas aparecerão aqui para análise.</p>
          </div>
        )}

        {/* Lista de Disputas */}
        {!loading && disputes.length > 0 && (
          <div className="space-y-3">
            {disputes.map((dispute, i) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-base p-5 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-surface-400">#{dispute.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[dispute.status] || 'bg-surface-100 text-surface-600'}`}>
                        {statusLabel[dispute.status] || dispute.status}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-surface-900">{dispute.product_title || 'Produto'}</h3>
                    <p className="text-sm text-surface-500 mt-1">{dispute.reason}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                      <span>Comprador: {dispute.buyer_username}</span>
                      <span>•</span>
                      <span>Vendedor: {dispute.vendor_username}</span>
                      <span>•</span>
                      <span>{formatDate(dispute.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-extrabold text-lg text-surface-900">{formatPrice(dispute.amount)}</span>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-secondary text-sm px-3 py-2 flex items-center gap-1">
                      <Eye size={14} /> Analisar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
