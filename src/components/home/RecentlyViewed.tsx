'use client'
// RecentlyViewed — lista de produtos recentemente vistos pelo usuário.
// Mostra só se houver itens e o usuário estiver logado ou com histórico.
// Comentários em PT-BR.
import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import { useRecent } from '@/lib/recent/store'

export function RecentlyViewed() {
  const { init, list, loaded } = useRecent()

  useEffect(() => { init() }, [init])

  const items = list().slice(0, 8)

  if (!loaded || items.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-slate-50 dark:bg-[#0B0F1A]/40">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity:0,y:8 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          className="flex items-end justify-between mb-6 flex-wrap gap-2">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              <Clock className="w-3 h-3" /> Vistos recentemente
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">
              Você andou olhando...
            </h2>
          </div>
          <Link href="/buscar" className="inline-flex items-center gap-1 text-sm font-black text-brand-600 dark:text-brand-400 hover:underline">
            Ver mais <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity:0,y:12 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
              transition={{ delay: i*0.05, type:'spring', stiffness:200,damping:20 }}>
              <Link href={p.slug ? `/p/${p.slug}` : '#'}
                className="block group bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:-translate-y-0.5">
                <div className={`aspect-[4/3] bg-gradient-to-br ${p.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center relative`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform drop-shadow-lg">{p.emoji || '📦'}</span>
                  {p.preco_de && p.preco_de > p.preco && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      -{Math.round((1 - p.preco / p.preco_de) * 100)}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-600 mb-0.5">{p.categoria || 'Produto'}</p>
                  <h3 className="font-black text-xs md:text-sm text-[#0F172A] dark:text-white line-clamp-2 leading-tight">{p.titulo}</h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm md:text-base font-black text-[#0F172A] dark:text-white">R${p.preco.toFixed(2).replace('.',',')}</span>
                    {p.preco_de && p.preco_de > p.preco && (
                      <span className="text-[10px] text-slate-400 line-through">R${p.preco_de.toFixed(2).replace('.',',')}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">por {p.vendedor_nome || 'KIYVO'}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
