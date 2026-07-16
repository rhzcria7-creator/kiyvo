'use client'

import { mockListings } from '@/data/mockFAQ'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageTransition } from '@/components/shared/PageTransition'
import { formatPrice } from '@/lib/utils'
import { Eye, ShoppingCart, Pause, Play, Plus } from 'lucide-react'
import Link from 'next/link'

const planColors: Record<string, string> = { silver: 'bg-surface-200 text-surface-700', gold: 'bg-amber-100 text-amber-700', diamond: 'bg-brand-100 text-brand-700' }
const planNames: Record<string, string> = { silver: 'Prata', gold: 'Ouro', diamond: 'Diamante' }
const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  active: { variant: 'success', label: 'Ativo' },
  paused: { variant: 'warning', label: 'Pausado' },
  expired: { variant: 'danger', label: 'Expirado' },
}

export default function AnunciosPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-extrabold text-2xl text-surface-900">Meus Anúncios</h1>
          <Link href="/anunciar"><Button size="sm" icon={<Plus size={16} />}>Novo Anúncio</Button></Link>
        </div>
        <div className="space-y-3">
          {mockListings.map((listing) => (
            <div key={listing.id} className="card-base p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center text-xl shrink-0">🎮</div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-surface-900 truncate">{listing.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${planColors[listing.plan]}`}>{planNames[listing.plan]}</span>
                  <Badge variant={statusMap[listing.status].variant} dot>{statusMap[listing.status].label}</Badge>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm text-surface-500">
                <span className="flex items-center gap-1"><Eye size={14} /> {listing.views}</span>
                <span className="flex items-center gap-1"><ShoppingCart size={14} /> {listing.sales}</span>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display font-bold">{formatPrice(listing.price)}</p>
                <button className="text-xs text-surface-400 hover:text-brand-600 mt-1 flex items-center gap-1">
                  {listing.status === 'active' ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Ativar</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
