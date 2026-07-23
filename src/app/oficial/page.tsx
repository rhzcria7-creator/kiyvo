'use client'

/**
 * /oficial — Loja KIYVO Oficial
 * Catálogo da conta oficial da KIYVO (dropshipping desfaçado).
 * Produtos entregues instantaneamente via supplier adapters.
 * Estilo Amazon/Shopee: categorias, cards com desconto, badges "OFICIAL".
 */

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BadgeCheck, Zap, Star, Search, Sparkles, ChevronRight, ShoppingCart, Shield
} from 'lucide-react'
import { OFFICIAL_CATALOG, OFFICIAL_VENDOR, type CatalogProduct } from '@/lib/catalog/official'
import { KiyvoLogoSvg } from '@/components/brand'
import { BlurText } from '@/components/ui/BlurText'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = (p: CatalogProduct) => p.originalPriceBrl ? Math.round((1 - p.priceBrl / p.originalPriceBrl) * 100) : 0

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '🛍️' },
  { id: 'giftcards', label: 'Gift Cards', icon: '💳' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'streaming', label: 'Streaming', icon: '📺' },
  { id: 'software', label: 'Software', icon: '💻' },
  { id: 'assinaturas', label: 'Assinaturas', icon: '✨' },
  { id: 'moedas-gold', label: 'Moedas & Gold', icon: '🪙' },
]

const PLATFORM_ICONS: Record<string, string> = {
  Steam: '🎮', PlayStation: '🎮', Xbox: '🎮',
  Netflix: '📺', Spotify: '🎵', Outro: '✨',
}

export default function OficialPage() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured')

  const filtered = useMemo(() => {
    let items = [...OFFICIAL_CATALOG]
    if (cat !== 'all') items = items.filter(i => i.category === cat)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        i.platform.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'price-asc': items.sort((a, b) => a.priceBrl - b.priceBrl); break
      case 'price-desc': items.sort((a, b) => b.priceBrl - a.priceBrl); break
      case 'discount': items.sort((a, b) => pct(b) - pct(a)); break
      default:
        items.sort((a, b) => (b.originalPriceBrl ? pct(b) : 0) - (a.originalPriceBrl ? pct(a) : 0))
    }
    return items
  }, [cat, search, sort])

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero banner */}
      <div className="bg-[#0F172A] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BadgeCheck size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold bg-white text-brand-700 px-2 py-0.5 rounded-full">LOJA OFICIAL</span>
                <span className="text-xs font-semibold bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded-full">✓ VERIFICADA</span>
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl mt-1">
                <BlurText text={OFFICIAL_VENDOR.storeName} />
              </h1>
            </div>
          </div>
          <p className="text-white/90 text-sm sm:text-base max-w-xl mt-3">{OFFICIAL_VENDOR.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Pill><Zap size={14} /> Entrega instantânea</Pill>
            <Pill><Shield size={14} /> 100% garantido</Pill>
            <Pill><Star size={14} /> 4.9 ★ (24k+ avaliações)</Pill>
            <Pill><Sparkles size={14} /> Melhor preço do Brasil</Pill>
          </div>

          {/* Search */}
          <div className="mt-6 relative max-w-lg">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar gift card, jogo, software..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-surface-900 placeholder:text-surface-400 shadow-xl shadow-brand-900/30 font-medium focus:outline-none focus:ring-4 focus:ring-white/30"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                cat === c.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-white text-surface-700 hover:bg-surface-100 border border-surface-200'
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-surface-600"><span className="font-bold text-surface-900">{filtered.length}</span> produtos encontrados</p>
          <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="text-sm bg-white border border-surface-200 rounded-lg px-3 py-1.5 font-medium text-surface-700 focus:outline-none focus:border-brand-500">
            <option value="featured">Mais relevantes</option>
            <option value="discount">Maiores descontos</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>
        </div>

        {/* Grid de produtos */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-surface-400">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((p, i) => {
              const d = pct(p)
              return (
                <motion.div
                  key={p.sku}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  <Link href={`/p/oficial/${p.sku}`} className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden border border-surface-200 hover:border-brand-300 hover:shadow-card-hover transition-all">
                      <div className="aspect-[4/3] bg-gradient-to-br from-brand-50 to-violet-50 flex items-center justify-center relative">
                        <span className="text-5xl">{PLATFORM_ICONS[p.platform] || '🎁'}</span>
                        {d > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">-{d}%</span>
                        )}
                        {p.instant && (
                          <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Zap size={10} /> INSTANTÂNEO
                          </span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-[10px] font-bold text-surface-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <BadgeCheck size={10} className="text-brand-600" /> OFICIAL
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-surface-400 uppercase tracking-wider font-bold">{p.platform} · {p.region}</p>
                        <h3 className="font-display font-bold text-sm text-surface-900 mt-0.5 line-clamp-2 group-hover:text-brand-600 transition-colors min-h-[2.5rem]">{p.title}</h3>
                        <div className="mt-2 flex items-baseline gap-1.5">
                          {p.originalPriceBrl && (
                            <span className="text-xs text-surface-400 line-through">{fmt(p.originalPriceBrl)}</span>
                          )}
                        </div>
                        <p className="font-display font-extrabold text-xl text-surface-900">{fmt(p.priceBrl)}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <Zap size={11} /> {p.deliveryEta}
                        </p>
                        <div className="mt-2 w-full flex items-center justify-center gap-1 py-2.5 bg-[#0F172A] group-hover:bg-brand-600 text-white rounded-full text-sm font-black transition">
                          <ShoppingCart size={14} /> Comprar
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Segurança */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TrustBadge icon={<Shield size={22} />} title="Compra 100% Garantida" text="Receba o produto ou seu dinheiro de volta" />
          <TrustBadge icon={<Zap size={22} />} title="Entrega Instantânea" text="Chaves entregues em segundos após pagamento" />
          <TrustBadge icon={<BadgeCheck size={22} />} title="Loja Oficial KIYVO" text="Suporte direto da equipe KIYVO" />
        </div>
      </div>
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full border border-white/20">
      {children}
    </span>
  )
}

function TrustBadge({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-surface-100 shadow-card">
      <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="font-display font-bold text-surface-900 text-sm">{title}</p>
        <p className="text-xs text-surface-500">{text}</p>
      </div>
    </div>
  )
}
