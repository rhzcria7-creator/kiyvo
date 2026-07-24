'use client'
// /loja/[handle] — Página individual da loja (perfil + produtos)
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Star, Package, Users2, TrendingUp, ShieldCheck, MessageSquare, Award, Heart } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { STORES } from '@/lib/catalog/stores'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'
import { ProductCard } from '@/components/ProductCard'
import { toast } from 'react-hot-toast'

const ALL = [
  ...DEMO_PRODUCTS.map((p: any) => ({ ...p, store_id: p.vendor_id })),
  ...GG_PRODUCTS.map((p: any) => ({ ...p, store_id: p.vendor_id })),
  ...MEGA_PRODUCTS.map((p: any) => ({ ...p })),
]

export default function LojaPage() {
  const params = useParams<{ handle: string }>()
  const handle = params?.handle || ''
  const store = STORES.find(s => s.handle.replace('@','').toLowerCase() === handle.toLowerCase())
  const [seguindo, setSeguindo] = useState(false)

  const produtos = useMemo(() => {
    if (!store) return []
    return ALL.filter(p => p.store_id === store.id || p.vendedor_nome === store.name || p.vendor_id === store.id)
  }, [store])

  useEffect(() => {
    if (!store) return
    try {
      const seg = JSON.parse(localStorage.getItem('kiyvo_store_follows') || '[]')
      setSeguindo(seg.includes(store.id))
    } catch {}
  }, [store])

  function toggleSeguir() {
    if (!store) return
    try {
      const raw = localStorage.getItem('kiyvo_store_follows') || '[]'
      const seg = JSON.parse(raw) as string[]
      let next: string[]
      if (seg.includes(store.id)) {
        next = seg.filter(x => x !== store.id)
        toast.success('Deixou de seguir')
      } else {
        next = [...seg, store.id]
        toast.success(`Seguindo ${store.name}!`)
      }
      localStorage.setItem('kiyvo_store_follows', JSON.stringify(next))
      setSeguindo(next.includes(store.id))
    } catch {}
  }

  if (!store) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <p className="font-black text-2xl">Loja não encontrada</p>
            <Link href="/lojas" className="text-brand-600 font-bold mt-4 inline-block">← Voltar para lojas</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link href="/lojas" className="inline-flex items-center gap-1 text-slate-500 font-bold text-sm mt-6 hover:text-brand-600">
            <ArrowLeft className="w-4 h-4" /> Todas as lojas
          </Link>
        </div>

        {/* Capa da loja */}
        <section className={`relative bg-gradient-to-br ${store.color} mt-4 overflow-hidden`}>
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] bg-white/20 backdrop-blur border-2 border-white/30 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl">
                {store.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black">{store.name}</h1>
                  {store.verified && <ShieldCheck className="w-6 h-6 text-white fill-green-400" />}
                  {store.plan === 'vendor_pro' && <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400 text-amber-950"><Award className="w-3 h-3" /> Vendor PRO</span>}
                </div>
                <p className="text-white/90 font-semibold text-sm">{store.handle} • 📍 {store.city} • Desde {store.since}</p>
                <p className="text-white/85 mt-2 max-w-2xl">{store.bio}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm font-black">
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /> {store.rating.toFixed(1)}</span>
                  <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {store.sales.toLocaleString('pt-BR')} vendas</span>
                  <span className="flex items-center gap-1"><Users2 className="w-4 h-4" /> {store.followers.toLocaleString('pt-BR')} fãs</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Plano {store.plan.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={toggleSeguir}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-black text-sm shadow-lg transition ${seguindo ? 'bg-white/20 text-white border-2 border-white/40' : 'bg-white text-slate-900 hover:scale-105'}`}>
                  <Heart className={`w-4 h-4 ${seguindo ? 'fill-current' : ''}`} /> {seguindo ? 'Seguindo' : 'Seguir'}
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-black text-sm bg-black/30 text-white border-2 border-white/20 backdrop-blur">
                  <MessageSquare className="w-4 h-4" /> Contatar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Produtos da loja */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-2xl font-black text-[#0F172A] dark:text-white">
              Produtos de {store.name}
              <span className="ml-2 text-sm font-bold text-slate-400">({produtos.length})</span>
            </h2>
          </div>
          {produtos.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-500">Esta loja ainda não publicou produtos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtos.slice(0, 24).map((p: any, i: number) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}>
                  <ProductCard produto={p} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
