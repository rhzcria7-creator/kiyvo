'use client'

import { mockWithdrawals } from '@/data/mockFAQ'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/shared/PageTransition'
import { formatPrice } from '@/lib/utils'
import { ArrowDownCircle, Zap } from 'lucide-react'

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  completed: { variant: 'success', label: 'Concluída' },
  pending: { variant: 'warning', label: 'Pendente' },
  failed: { variant: 'danger', label: 'Falhou' },
}

export default function RetiradasPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-2xl text-surface-900 mb-6">Minhas Retiradas</h1>

        <div className="card-base p-6 mb-8 bg-gradient-to-r from-brand-50 to-white border-brand-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-700 font-display font-semibold">Saldo Disponível</p>
              <p className="font-display font-extrabold text-3xl text-brand-600">R$ 450,00</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" icon={<ArrowDownCircle size={16} />}>Retirada Normal</Button>
              <Button variant="secondary" size="sm" icon={<Zap size={16} />}>Turbo</Button>
            </div>
          </div>
          <p className="text-xs text-surface-400 mt-2">Normal: grátis, até 2 dias úteis • Turbo: R$ 3,50, instantâneo</p>
        </div>

        <h2 className="font-display font-bold text-lg text-surface-900 mb-4">Histórico</h2>
        <div className="space-y-3">
          {mockWithdrawals.map((w) => (
            <div key={w.id} className="card-base p-4 flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-sm text-surface-900">{w.id}</p>
                <p className="text-xs text-surface-400">{w.date} • PIX</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display font-bold">{formatPrice(w.amount)}</span>
                <Badge variant={statusMap[w.status].variant} dot>{statusMap[w.status].label}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
