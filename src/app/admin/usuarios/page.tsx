'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Search, Shield, Ban, Eye, Loader2, RefreshCw, Users } from 'lucide-react'

interface UserData {
  id: string
  username: string
  email: string
  plan: string
  verification: string
  total_sales: number
  status: string
  created_at: string
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  banned: 'bg-red-50 text-red-700',
  suspended: 'bg-amber-50 text-amber-700',
}
const verifyColors: Record<string, string> = {
  verified: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
  unverified: 'bg-surface-100 text-surface-500',
}
const verifyLabels: Record<string, string> = {
  verified: 'Verificado',
  pending: 'Pendente',
  rejected: 'Rejeitado',
  unverified: 'Não verificado',
}
const planLabels: Record<string, string> = {
  silver: 'Prata',
  gold: 'Ouro',
  diamond: 'Diamante',
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [planFilter, setPlanFilter] = useState('all')

  useEffect(() => {
    fetchUsers()
  }, [planFilter])

  async function fetchUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (planFilter !== 'all') params.set('plan', planFilter)
      if (searchQuery) params.set('q', searchQuery)
      params.set('limit', '50')
      const res = await fetch(`/api/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      } else {
        setUsers([])
      }
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    } catch {
      return iso
    }
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-surface-900">Gerenciar Usuários</h1>
              <p className="text-surface-500 text-sm mt-0.5">{users.length} usuários encontrados</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchUsers}
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
              placeholder="Buscar por username ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="input-base pl-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'silver', 'gold', 'diamond'].map((plan) => (
              <button
                key={plan}
                onClick={() => setPlanFilter(plan)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  planFilter === plan ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {plan === 'all' ? 'Todos' : planLabels[plan] || plan}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando usuários...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && users.length === 0 && (
          <div className="card-base p-12 text-center">
            <Users size={32} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500 font-display font-bold">Nenhum usuário encontrado</p>
            <p className="text-surface-400 text-sm mt-1">Os usuários aparecerão aqui quando o Supabase estiver conectado.</p>
          </div>
        )}

        {/* Tabela */}
        {!loading && users.length > 0 && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100 bg-surface-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Usuário</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Plano</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Verificação</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Vendas</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Desde</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-surface-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-surface-900">{user.username}</p>
                        <p className="text-xs text-surface-400">{user.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                          {planLabels[user.plan] || user.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${verifyColors[user.verification] || verifyColors.unverified}`}>
                          {verifyLabels[user.verification] || user.verification}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-surface-700">{user.total_sales.toLocaleString('pt-BR')}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[user.status] || 'bg-surface-100 text-surface-600'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-surface-500">{formatDate(user.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors" title="Ver perfil"><Eye size={14} className="text-surface-500" /></button>
                          <button className="p-2 hover:bg-surface-100 rounded-lg transition-colors" title="Verificar"><Shield size={14} className="text-surface-500" /></button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Banir"><Ban size={14} className="text-red-400" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
