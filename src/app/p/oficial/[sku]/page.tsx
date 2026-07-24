'use client'

/**
 * /p/oficial/[sku] - Pagina de produto oficial KIYVO.
 */

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  BadgeCheck, Zap, Star, ShieldCheck, Truck, Clock, ArrowLeft, Heart,
  ShoppingCart, Sparkles, Lock, CheckCircle2, Award, Share2
} from 'lucide-react'
import { OFFICIAL_CATALOG, OFFICIAL_VENDOR } from '@/lib/catalog/official'
import { KiyvoLogoSvg } from '@/components/brand'
import { BorderGlow } from '@/components/ui/BorderGlow'
import toast from 'react-hot-toast'

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = (original: number, current: number) => Math.round((1 - current / original) * 100)

const PLATFORM_EMOJI: Record<string, string> = {
  Steam: '🎮', PlayStation: '🎮', Xbox: '🎮', Epic: '🚀',
  Netflix: '📺', Spotify: '🎵', Outro: '🎁',
}

const REVIEWS = [
  { name: 'Lucas S.', rating: 5, date: 'ha 2 dias', text: 'Chave chegou em 10 segundos apos o PIX. Recomendo!', verified: true },
  { name: 'Mariana P.', rating: 5, date: 'ha 1 semana', text: 'Preco otimo, entrega instantanea, tudo certo.', verified: true },
  { name: 'Felipe R.', rating: 4, date: 'ha 2 semanas', text: 'Funcionou perfeitamente, boleto demorou mas normal.', verified: true },
]

export default function OfficialProductPage() {
  const params = useParams<{ sku: string }>()
  const router = useRouter()
  const sku = params?.sku
  const [fav, setFav] = useState(false)
  const [adding, setAdding] = useState(false)

  const product = useMemo(() => OFFICIAL_CATALOG.find(p => p.sku === sku), [sku])

  const related = useMemo(() => {
    if (!product) return []
    return OFFICIAL_CATALOG.filter(p => p.sku !== product.sku && p.category === product.category).slice(0, 4)
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="font-display font-bold text-xl text-surface-900">Produto nao encontrado</h1>
          <Link href="/oficial" className="mt-4 inline-block btn-primary px-6 py-2 text-sm">Voltar a loja oficial</Link>
        </div>
      </div>
    )
  }

  const discount = product.originalPriceBrl ? pct(product.originalPriceBrl, product.priceBrl) : 0
  const kdEarned = Math.floor(product.priceBrl * 2)

  const buy = () => {
    setAdding(true)
    router.push(`/checkout?sku=${encodeURIComponent(product.sku)}`)
  }

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado!')
      }
    } catch {
      // silent
    }
  }

  const toggleFav = () => {
    setFav(!fav)
    toast.success(fav ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-16">
      <div className="border-b border-surface-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-surface-600 min-w-0">
            <Link href="/" className="hover:text-brand-600 shrink-0"><KiyvoLogoSvg size={24} /></Link>
            <span className="text-surface-300">/</span>
            <Link href="/oficial" className="hover:text-brand-600">KIYVO Oficial</Link>
            <span className="text-surface-300 hidden sm:inline">/</span>
            <span className="truncate hidden sm:inline">{product.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleFav} aria-label="Favoritar"
              className={`p-2 rounded-xl ${fav ? 'bg-red-50 text-red-500' : 'bg-surface-100 text-surface-600'} hover:scale-105 transition`}>
              <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
            </button>
            <button onClick={share} aria-label="Compartilhar"
              className="p-2 rounded-xl bg-surface-100 text-surface-600 hover:bg-surface-200 transition">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <Link href="/oficial" className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-brand-600 mb-4">
          <ArrowLeft size={14} /> Voltar a loja
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          <div className="lg:col-span-3">
            <motion.div layoutId={`product-${sku}`}>
              <BorderGlow className="rounded-3xl overflow-hidden" color="rgba(37,99,235,0.15)">
                <div className="aspect-[16/10] bg-gradient-to-br from-brand-50 via-white to-violet-50 flex items-center justify-center relative">
                  {discount > 0 && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full shadow-lg">-{discount}%</span>
                  )}
                  {product.instant && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <Zap size={13} fill="currentColor" /> INSTANTANEO
                    </span>
                  )}
                  <span className="text-8xl sm:text-9xl">{PLATFORM_EMOJI[product.platform] || '🎁'}</span>
                </div>
              </BorderGlow>
            </motion.div>

            <div className="mt-6 bg-white rounded-3xl p-6 shadow-card border border-surface-100">
              <h2 className="font-display font-extrabold text-lg text-surface-900 mb-3">Sobre este produto</h2>
              <p className="text-surface-600 text-sm leading-relaxed">{product.shortDescription}</p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Spec icon={<BadgeCheck size={18} className="text-brand-600" />} label="Plataforma" value={product.platform} />
                <Spec icon={<GlobeIcon />} label="Regiao" value={product.region} />
                <Spec icon={<Zap size={18} className="text-emerald-600" />} label="Entrega" value={product.deliveryEta} />
                <Spec icon={<ShieldCheck size={18} className="text-violet-600" />} label="Garantia" value="7 dias" />
              </div>
            </div>

            <div className="mt-6 bg-white rounded-3xl p-6 shadow-card border border-surface-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-extrabold text-lg text-surface-900">Avaliacoes</h2>
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-amber-700">4,9</span>
                  <span className="text-xs text-amber-600">(24.321)</span>
                </div>
              </div>
              <div className="space-y-4">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="pb-4 border-b border-surface-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">{r.name[0]}</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-surface-900">{r.name}</p>
                          {r.verified && <BadgeCheck size={13} className="text-brand-600" />}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} size={11} className={j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-200'} />
                            ))}
                          </div>
                          <span className="text-[10px] text-surface-400">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-surface-600 ml-10">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-card border border-surface-100">
                <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl border border-brand-100 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                    <BadgeCheck size={18} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="font-display font-bold text-sm text-surface-900">{OFFICIAL_VENDOR.storeName}</p>
                      <span className="text-[9px] font-black bg-brand-600 text-white px-1.5 py-0.5 rounded">OFICIAL</span>
                    </div>
                    <p className="text-xs text-surface-500 flex items-center gap-1">
                      <Award size={11} className="text-amber-500" />
                      Platinum - 99% avaliacoes positivas
                    </p>
                  </div>
                </div>

                <h1 className="font-display font-extrabold text-xl sm:text-2xl text-surface-900 leading-tight">{product.title}</h1>

                <div className="mt-4">
                  {product.originalPriceBrl && (
                    <p className="text-sm text-surface-400 line-through">{fmt(product.originalPriceBrl)}</p>
                  )}
                  <p className="font-display font-extrabold text-4xl text-surface-900">{fmt(product.priceBrl)}</p>
                  {discount > 0 && (
                    <p className="text-sm text-emerald-600 font-semibold mt-0.5">Economia de {fmt(product.originalPriceBrl! - product.priceBrl)} ({discount}% OFF)</p>
                  )}
                  <p className="text-xs text-surface-500 mt-1">
                    ou <span className="font-bold text-surface-900">12x de {fmt(product.priceBrl / 12)}</span> sem juros
                  </p>
                </div>

                <ul className="mt-5 space-y-2">
                  <Benefit icon={<Zap size={15} className="text-emerald-500" />} text={product.instant ? 'Entrega instantanea apos pagamento' : `Entrega em ${product.deliveryEta}`} />
                  <Benefit icon={<ShieldCheck size={15} className="text-brand-500" />} text="Garantia KIYVO de 7 dias" />
                  <Benefit icon={<Lock size={15} className="text-violet-500" />} text="Pagamento seguro com criptografia" />
                  <Benefit icon={<Sparkles size={15} className="text-amber-500" />} text={`+${kdEarned} KD Points (desconto na proxima compra)`} />
                </ul>

                <div className="mt-5 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={buy}
                    disabled={adding}
                    className="w-full py-4 bg-[#0F172A] hover:bg-brand-600 text-white rounded-2xl font-display font-extrabold text-base shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {adding ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Carregando...</span>
                    ) : (
                      <>
                        <Zap size={20} fill="currentColor" /> Comprar agora
                      </>
                    )}
                  </motion.button>
                  <button onClick={() => toast.success('Adicionado ao carrinho')}
                    className="w-full py-3 bg-white border-2 border-brand-600 text-brand-600 hover:bg-brand-50 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition">
                    <ShoppingCart size={16} /> Adicionar ao carrinho
                  </button>
                </div>

                <div className="mt-5 pt-5 border-t border-surface-100 space-y-2">
                  <Seal icon={<ShieldCheck size={13} className="text-emerald-600" />} text="Protecao KIYVO - reembolso garantido" />
                  <Seal icon={<Truck size={13} className="text-brand-600" />} text="Produto digital - entrega online" />
                  <Seal icon={<Clock size={13} className="text-amber-600" />} text="Suporte 24h" />
                </div>
              </div>

              {related.length > 0 && (
                <div className="bg-white rounded-3xl p-5 shadow-card border border-surface-100">
                  <h3 className="font-display font-bold text-sm text-surface-900 mb-3">Voce tambem pode gostar</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {related.map(r => (
                      <Link key={r.sku} href={`/p/oficial/${r.sku}`} className="block group">
                        <div className="aspect-square bg-gradient-to-br from-brand-50 to-violet-50 rounded-xl flex items-center justify-center text-3xl relative overflow-hidden">
                          <span>{PLATFORM_EMOJI[r.platform] || '🎁'}</span>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
                        </div>
                        <p className="text-xs font-medium text-surface-900 line-clamp-2 mt-1.5 group-hover:text-brand-600 transition">{r.title}</p>
                        <p className="text-sm font-extrabold text-surface-900">{fmt(r.priceBrl)}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-surface-50 rounded-xl">
      <div className="flex items-center gap-1.5 mb-0.5">{icon}<span className="text-[10px] uppercase tracking-wider font-bold text-surface-500">{label}</span></div>
      <p className="text-sm font-bold text-surface-900">{value}</p>
    </div>
  )
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-surface-700">
      <span className="shrink-0">{icon}</span>
      <span>{text}</span>
    </li>
  )
}

function Seal({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-surface-600">
      {icon}
      <span>{text}</span>
    </div>
  )
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" />
    </svg>
  )
}
