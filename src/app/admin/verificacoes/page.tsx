'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/ui/AdvancedAnimations'
import { CheckCircle, XCircle, Clock, User, CreditCard, Camera, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const pendingVerifications = [
  { id: '1', username: '@joaosilva', fullName: 'João Silva', steps: { cpf: 'approved', birth_date: 'approved', selfie: 'pending', address: 'approved' }, date: '15/07/26' },
  { id: '2', username: '@mariaoliveira', fullName: 'Maria Oliveira', steps: { cpf: 'approved', birth_date: 'approved', selfie: 'approved', address: 'pending' }, date: '14/07/26' },
  { id: '3', username: '@carlosdev', fullName: 'Carlos Developer', steps: { cpf: 'approved', birth_date: 'pending', selfie: 'pending', address: 'pending' }, date: '13/07/26' },
  { id: '4', username: '@ana_costa', fullName: 'Ana Costa', steps: { cpf: 'rejected', birth_date: 'pending', selfie: 'pending', address: 'pending' }, date: '12/07/26' },
]

const stepIcons: Record<string, typeof CreditCard> = { cpf: CreditCard, birth_date: Clock, selfie: Camera, address: MapPin }
const stepLabels: Record<string, string> = { cpf: 'CPF', birth_date: 'Nascimento', selfie: 'Selfie', address: 'Endereço' }

export default function AdminVerificacoesPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl text-surface-900">Verificações Pendentes</h1>
          <p className="text-surface-500 text-sm mt-1">{pendingVerifications.length} verificações para revisar</p>
        </motion.div>

        <div className="space-y-4 mt-6">
          {pendingVerifications.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-base p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
                    <User size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-surface-900">{v.fullName}</p>
                    <p className="text-xs text-surface-400">{v.username} • {v.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1">
                    <CheckCircle size={16} /> Aprovar
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 bg-red-50 text-red-700 font-semibold text-sm rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1">
                    <XCircle size={16} /> Rejeitar
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {Object.entries(v.steps).map(([step, status]) => {
                  const Icon = stepIcons[step]
                  const statusColors: Record<string, string> = {
                    approved: 'bg-emerald-50 border-emerald-200',
                    pending: 'bg-amber-50 border-amber-200',
                    rejected: 'bg-red-50 border-red-200',
                  }
                  const statusBadge: Record<string, 'success' | 'warning' | 'danger'> = {
                    approved: 'success', pending: 'warning', rejected: 'danger',
                  }
                  return (
                    <div key={step} className={`p-3 rounded-xl border ${statusColors[status]} flex items-center gap-2`}>
                      <Icon size={16} className="text-surface-500" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-surface-700">{stepLabels[step]}</p>
                        <Badge variant={statusBadge[status]} className="mt-0.5">{status === 'approved' ? 'Aprovado' : status === 'pending' ? 'Pendente' : 'Rejeitado'}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
