'use client'

// /categoria/[slug] — lista de produtos por categoria, com fallback rico.

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import {
  SlidersHorizontal, Zap, BadgeCheck, ChevronRight,
  Star, TrendingUp, ArrowUpDown, Sparkles, Search as SearchIcon,
} from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'
import { getCategoryData, fmt } from '@/lib/catalog/categoryData'

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'popular'

export default function CategoryPage() {
  const params = useParams()
  const slug = (params.slug as string) || 'games'
  const cat = useMemo(() => getCategoryData(slug), [slug])
  const [priceMax, setPriceMax] = useState<number>(500)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [activeSub, setActiveSub] = useState<string>('Todos')

  const products = useMemo(() => {
    let list = cat.products.filter(p => p.priceBrl <= priceMax)
    if (search.trim()) {
      const s = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(s))
    }
    switch (sort) {
      case 'price-asc': list = [...list].sort((a,b)=>a.priceBrl-b.priceBrl); break
      case 'price-desc': list = [...list].sort((a,b)=>b.priceBrl-a.priceBrl); break
      case 'popular': list = [...list].sort((a,b)=>b.sales-a.sales); break
    }
    return list
  }, [cat, priceMax, search, sort])

  // Hero gradient
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white">
      {/* HERO específico da categoria */}
      <section className={`relative overflow-hidden bg-[#0F172A] text-white`}>
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563EB_0%,transparent_55%)] opacity-40`}/>
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#8B5CF6_0%,transparent_50%)] opacity-30`}/>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-7xl mx-auto px-6 py-14 lg:py-20">
          <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition">Início</Link>
            <ChevronRight size={12}/>
            <Link href="/categorias" className="hover:text-white transition">Categorias</Link>
            <ChevronRight size={12}/>
            <span className="text-white/80">{cat.name}</span>
          </nav>
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.hue} flex items-center justify-center text-3xl`}>
              {cat.emoji}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/60 mb-1">
                <Sparkles size={11} className="inline mr-1"/> Categoria
              </p>
              <WordPullUp
                as="h1"
                words={cat.name}
                className="font-display font-black text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] tracking-[-0.03em]"
                delay={0.1}
              />
            </div>
          </div>
          <p className="text-white/70 max-w-xl mt-2">{cat.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-white/50">
            <span className="inline-flex items-center gap-1.5"><TrendingUp size={13}/> {cat.products.length}+ produtos</span>
            <span className="inline-flex items-center gap-1.5"><Zap size={13} className="text-emerald-400"/> Entrega instantânea</span>
            <span className="inline-flex items-center gap-1.5"><BadgeCheck size={13} className="text-brand-400"/> Oficial KIYVO</span>
            <span className="inline-flex items-center gap-1"><Star size={13} className="text-amber-400 fill-amber-400"/> 4.8/5</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-8 lg:py-10">
        {/* Subcategorias */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          {[{name:'Todos',emoji:'✨'}, ...cat.subcategories].map(sub => (
            <button
              key={sub.name}
              onClick={() => setActiveSub(sub.name)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition ${
                activeSub === sub.name
                  ? 'bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A]'
                  : 'bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#475569] dark:text-white/70 hover:border-[#0F172A] dark:hover:border-white'
              }`}
            >
              {sub.emoji} {sub.name}
            </button>
          ))}
        </div>

        {/* Barra de busca + filtros */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-6">
          <div className="relative flex-1 w-full">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"/>
            <input
              type="text"
              value={search}
              onChange={e=>setSearch(e.target.value)}
              placeholder={`Buscar em ${cat.name.toLowerCase()}...`}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <select
                value={sort}
                onChange={e=>setSort(e.target.value as SortKey)}
                className="appearance-none w-full md:w-auto pl-4 pr-10 py-3 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-semibold focus:outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="popular">Mais populares</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
                <option value="relevance">Relevância</option>
              </select>
              <ArrowUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]"/>
            </div>
            <button
              onClick={()=>setShowFilters(f=>!f)}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-sm font-semibold hover:border-[#0F172A] dark:hover:border-white transition"
            >
              <SlidersHorizontal size={15}/> Filtros
            </button>
          </div>
        </div>

        {/* Filtros (preço) */}
        {showFilters && (
          <motion.div
            initial={{opacity:0, height:0}}
            animate={{opacity:1, height:'auto'}}
            exit={{opacity:0, height:0}}
            className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-5 mb-6 overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] block mb-2">Preço máximo: {fmt(priceMax)}</label>
                <input
                  type="range" min="10" max="500" step="10"
                  value={priceMax} onChange={e=>setPriceMax(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
              <button onClick={()=>setPriceMax(500)} className="text-xs font-bold text-brand-600 hover:underline">
                Limpar
              </button>
            </div>
          </motion.div>
        )}

        <p className="text-xs text-[#64748B] dark:text-white/40 mb-4 font-semibold">
          {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>

        {/* Grid de produtos */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-white/5 rounded-[2rem] p-16 text-center border border-black/5 dark:border-white/10">
            <p className="font-display font-black text-xl">Nenhum produto com esses filtros</p>
            <p className="text-sm text-[#64748B] dark:text-white/50 mt-1">Tente limpar a busca ou aumentar o preço máximo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => {
              const discount = p.originalPriceBrl ? Math.round((1 - p.priceBrl/p.originalPriceBrl)*100) : 0
              return (
                <motion.div
                  key={p.id}
                  initial={{opacity:0,y:20}}
                  whileInView={{opacity:1,y:0}}
                  viewport={{once:true,margin:'-40px'}}
                  transition={{delay:i*0.04,duration:0.4}}
                >
                  <Link href={p.official ? `/p/oficial/${p.id}` : `/produto/${p.id}`} className="group block">
                    <div className="bg-white dark:bg-white/5 rounded-[1.5rem] border border-black/5 dark:border-white/10 overflow-hidden hover:shadow-[0_25px_60px_-20px_rgba(37,99,235,0.25)] dark:hover:shadow-[0_25px_60px_-20px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all">
                      <div className="relative aspect-square bg-gradient-to-br from-[#FAFAFA] to-slate-100 dark:from-white/5 dark:to-white/0 flex items-center justify-center overflow-hidden">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{p.emoji}</span>
                        {discount>0 && (
                          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">-{discount}%</span>
                        )}
                        {p.official && (
                          <span className="absolute top-3 right-3 bg-brand-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <BadgeCheck size={9}/> OFICIAL
                          </span>
                        )}
                        {p.instant && (
                          <span className="absolute bottom-3 left-3 inline-flex items-center gap-0.5 bg-emerald-500/95 text-white text-[9px] font-black px-2 py-0.5 rounded-full backdrop-blur">
                            <Zap size={9} fill="currentColor"/> Instantâneo
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-display font-bold text-sm leading-snug line-clamp-2 min-h-[2.5em] group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                          {p.title}
                        </h3>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="font-display font-black text-xl">{fmt(p.priceBrl)}</span>
                          {p.originalPriceBrl && (
                            <span className="text-xs text-[#94A3B8] line-through">{fmt(p.originalPriceBrl)}</span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#64748B] dark:text-white/40 font-semibold">
                          {p.rating > 0 && <span className="inline-flex items-center gap-0.5 text-amber-500"><Star size={10} fill="currentColor"/>{p.rating.toFixed(1)}</span>}
                          {p.rating>0 && <span>•</span>}
                          <span>{p.sales.toLocaleString('pt-BR')} vendas</span>
                        </div>
                        <div className="mt-3">
                          <span className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-black group-hover:bg-brand-600 dark:group-hover:bg-brand-400 transition">
                            Ver produto
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* CTA criar categoria/produto */}
        <div className="mt-16 relative rounded-[2rem] bg-[#0F172A] text-white p-10 lg:p-14 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#10B981_0%,transparent_55%)] opacity-25"/>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300 mb-3">Quer vender?</p>
              <h3 className="font-display font-black text-3xl lg:text-4xl leading-[1] tracking-tight">Não encontrou o que procura?</h3>
              <p className="text-white/70 mt-2 max-w-md">Crie sua própria categoria ou anuncie um novo produto em segundos. Você define o preço, a entrega é automática.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <ShimmerButton href="/cadastro" size="lg" icon={<Sparkles size={16}/>}>Criar conta e vender</ShimmerButton>
              <ShimmerButton href="/vender" variant="secondary" size="lg">Como vender</ShimmerButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
