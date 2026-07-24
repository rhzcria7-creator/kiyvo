'use client'
// /lojas — Explorar lojas da KIYVO (todas as 60+ lojas com perfis)
// Atrai COMPRADORES mostrando vendedores confiáveis, e VENDEDORES com destaque.
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Store as StoreIcon, ShieldCheck, Star, TrendingUp, Users2, Award, Package, Plus } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { STORES } from '@/lib/catalog/stores'

export default function LojasPage() {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'pro' | 'verificadas'>('todos')
  const [ordenar, setOrdenar] = useState<'sales' | 'rating' | 'followers' | 'recentes'>('sales')

  const lojas = useMemo(() => {
    let l = STORES.slice()
    if (busca.trim()) {
      const q = busca.toLowerCase()
      l = l.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.bio.toLowerCase().includes(q) || s.city.toLowerCase().includes(q))
    }
    if (filtro === 'verificadas') l = l.filter(s => s.verified)
    if (filtro === 'pro') l = l.filter(s => s.plan === 'pro' || s.plan === 'vendor_pro')
    switch (ordenar) {
      case 'sales': l.sort((a,b) => b.sales - a.sales); break
      case 'rating': l.sort((a,b) => b.rating - a.rating); break
      case 'followers': l.sort((a,b) => b.followers - a.followers); break
      case 'recentes': l.sort((a,b) => a.since.localeCompare(b.since)); break
    }
    return l
  }, [busca, filtro, ordenar])

  const totalSales = STORES.reduce((s, x) => s + x.sales, 0)
  const totalFollowers = STORES.reduce((s, x) => s + x.followers, 0)
  const verifiedCount = STORES.filter(s => s.verified).length

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-24">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 text-white">
          <div className="absolute inset-0 opacity-20" aria-hidden>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-pink-300 blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-[11px] font-black uppercase tracking-widest mb-4">
              <StoreIcon className="w-3.5 h-3.5" /> Marketplace de TUDO que é digital
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Conheça as <span className="kiyvo-gradient-text-branco">60+ lojas</span> <br />
              da KIYVO
            </h1>
            <p className="mt-4 text-white/85 text-base sm:text-lg max-w-2xl">
              Compre de vendedores verificados de todo o Brasil. Cursos, software, templates,
              assinaturas, packs, música, gastronomia e muito mais — tudo digital com entrega automática.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Mini icon={<StoreIcon className="w-4 h-4" />} valor={STORES.length + '+'} label="Lojas oficiais" />
              <Mini icon={<ShieldCheck className="w-4 h-4" />} valor={verifiedCount + ''} label="Verificadas" />
              <Mini icon={<Package className="w-4 h-4" />} valor={(totalSales/1000).toFixed(0) + 'k+'} label="Vendas realizadas" />
              <Mini icon={<Users2 className="w-4 h-4" />} valor={(totalFollowers/1000).toFixed(0) + 'k+'} label="Clientes fiéis" />
            </div>

            <div className="mt-8 relative max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input value={busca} onChange={e => setBusca(e.target.value)}
                placeholder="Buscar loja por nome, categoria ou cidade..."
                className="w-full pl-12 pr-5 py-4 rounded-full bg-white/15 backdrop-blur border border-white/20 placeholder-white/60 text-white outline-none focus:bg-white/25 transition" />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-6">
            {([
              { id: 'todos', label: 'Todas' },
              { id: 'verificadas', label: '✅ Verificadas' },
              { id: 'pro', label: '⭐ PRO' },
            ] as const).map(f => (
              <button key={f.id} onClick={() => setFiltro(f.id)}
                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full transition ${filtro === f.id ? 'bg-[#0F172A] text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}>
                {f.label}
              </button>
            ))}
            <div className="ml-auto flex gap-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-full p-1">
              {([
                { id: 'sales', label: 'Mais vendas' },
                { id: 'rating', label: 'Melhor nota' },
                { id: 'followers', label: 'Mais seguidas' },
              ] as const).map(o => (
                <button key={o.id} onClick={() => setOrdenar(o.id)}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition ${ordenar === o.id ? 'bg-brand-500 text-white' : 'text-slate-500'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <Link href="/vender"
            className="flex items-center justify-between gap-3 mb-6 p-5 rounded-[1.5rem] bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.01] transition shadow-lg shadow-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center"><Plus className="w-5 h-5" /></div>
              <div>
                <p className="font-black text-sm">Você também pode vender na KIYVO</p>
                <p className="text-xs text-white/85">Cadastre sua loja em menos de 5 minutos — 0% de taxa nas primeiras 5.000 vendas.</p>
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">Abrir loja →</span>
          </Link>

          {/* Grid de lojas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lojas.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}>
                <Link href={`/loja/${s.handle.replace('@','')}`}
                  className="group block bg-white dark:bg-[#0F172A] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 hover:shadow-xl hover:-translate-y-1 transition">
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-lg shadow-black/10 flex-shrink-0`}>
                      {s.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-black text-[#0F172A] dark:text-white truncate">{s.name}</p>
                        {s.verified && <ShieldCheck className="w-4 h-4 text-brand-500 fill-brand-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold">{s.handle} • {s.city}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{s.bio}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Stat icon={<Star className="w-3 h-3 text-amber-500 fill-amber-500" />} valor={s.rating.toFixed(1)} />
                    <Stat icon={<TrendingUp className="w-3 h-3 text-emerald-500" />} valor={s.sales.toLocaleString('pt-BR')} label="vendas" />
                    <Stat icon={<Users2 className="w-3 h-3 text-brand-500" />} valor={formatK(s.followers)} label="fãs" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{s.category}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-brand-600 group-hover:gap-2 transition-all">
                      Ver loja →
                    </span>
                  </div>
                  {s.plan === 'vendor_pro' && (
                    <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white"><Award className="w-3 h-3" /> Vendor PRO</span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {lojas.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-black text-slate-500">Nenhuma loja encontrada</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function Mini({ icon, valor, label }: { icon: React.ReactNode; valor: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/15">
      <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-black uppercase tracking-wider mb-1">{icon}{label}</div>
      <p className="text-2xl font-black">{valor}</p>
    </div>
  )
}
function Stat({ icon, valor, label }: { icon: React.ReactNode; valor: string; label?: string }) {
  return (
    <div className="bg-slate-50 dark:bg-white/5 rounded-lg py-2">
      <div className="flex items-center justify-center gap-1 text-xs font-black text-[#0F172A] dark:text-white">{icon}{valor}</div>
      {label && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>}
    </div>
  )
}
function formatK(n: number) {
  if (n >= 1000) return (n/1000).toFixed(n>=10000?0:1).replace('.0','') + 'k'
  return String(n)
}
