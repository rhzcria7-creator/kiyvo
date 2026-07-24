'use client'
// HomeCategories — seção de categorias com emojis grandes, bounce no hover e contador de produtos
// Busca da API pública /api/v1/categories
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Grid3X3 } from 'lucide-react'

interface Category {
  id: string
  nome: string
  slug: string
  icone: string
  produtoCount: number
  ordem: number
}

// Categorias base fallback (caso API falhe ou não retorne)
const FALLBACK: Category[] = [
  { id: 'marketing', nome: 'Marketing Digital', slug: 'marketing', icone: '📣', produtoCount: 18, ordem: 1 },
  { id: 'curso', nome: 'Cursos', slug: 'curso', icone: '🎓', produtoCount: 22, ordem: 2 },
  { id: 'copywriting', nome: 'Copywriting', slug: 'copywriting', icone: '✍️', produtoCount: 9, ordem: 3 },
  { id: 'templates', nome: 'Templates', slug: 'templates', icone: '🎨', produtoCount: 15, ordem: 4 },
  { id: 'planilhas', nome: 'Planilhas', slug: 'planilhas', icone: '📊', produtoCount: 8, ordem: 7 },
  { id: 'design', nome: 'Design Assets', slug: 'design', icone: '🖼️', produtoCount: 12, ordem: 8 },
  { id: 'social', nome: 'Redes Sociais', slug: 'social', icone: '📱', produtoCount: 10, ordem: 13 },
  { id: 'saude', nome: 'Saúde e Fitness', slug: 'saude', icone: '💪', produtoCount: 6, ordem: 14 },
  { id: 'financas', nome: 'Finanças', slug: 'financas', icone: '💹', produtoCount: 7, ordem: 15 },
  { id: 'prompts', nome: 'Prompts IA', slug: 'prompts', icone: '💬', produtoCount: 5, ordem: 21 },
  { id: 'video', nome: 'Vídeo e Edição', slug: 'video', icone: '🎥', produtoCount: 9, ordem: 25 },
  { id: 'pack', nome: 'Packs Digitais', slug: 'pack', icone: '📦', produtoCount: 11, ordem: 26 },
]

// Cores de fundo alternadas por categoria (gradientes suaves)
const BG = [
  'from-blue-100 to-blue-200 dark:from-blue-950/40 dark:to-blue-900/30',
  'from-pink-100 to-rose-200 dark:from-pink-950/40 dark:to-rose-900/30',
  'from-emerald-100 to-green-200 dark:from-emerald-950/40 dark:to-green-900/30',
  'from-amber-100 to-orange-200 dark:from-amber-950/40 dark:to-orange-900/30',
  'from-violet-100 to-purple-200 dark:from-violet-950/40 dark:to-purple-900/30',
  'from-cyan-100 to-sky-200 dark:from-cyan-950/40 dark:to-sky-900/30',
  'from-rose-100 to-fuchsia-200 dark:from-rose-950/40 dark:to-fuchsia-900/30',
  'from-lime-100 to-emerald-200 dark:from-lime-950/40 dark:to-emerald-900/30',
]

export function HomeCategories() {
  const [cats, setCats] = useState<Category[]>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/categories')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        const data = Array.isArray(json.data) ? json.data : Array.isArray(json.categories) ? json.categories : []
        const valid = data
          .filter((c: Category) => c && c.slug)
          .sort((a: Category, b: Category) => (a.ordem || 99) - (b.ordem || 99))
          .slice(0, 12)
        if (valid.length >= 6) setCats(valid)
        setLoading(false)
      })
      .catch(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  return (
    <section className="py-14 md:py-20 bg-white dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8 gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 text-[11px] font-black uppercase tracking-widest mb-3">
              <Grid3X3 className="w-3.5 h-3.5" /> Categorias
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white leading-tight">
              Explore por categoria
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
              Navegue por centenas de produtos organizados. Tudo digital, com entrega automática e garantia de 7 dias.
            </p>
          </div>
          <Link
            href="/categorias"
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-brand-600 dark:text-brand-400 hover:gap-3 transition-all"
          >
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3 sm:gap-4">
          {cats.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i * 0.05, 0.5), type: 'spring', stiffness: 250, damping: 22 }}
              whileHover={{ y: -6, scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                href={`/categoria/${c.slug}`}
                className={`group relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${BG[i % BG.length]} border border-black/5 dark:border-white/5 hover:shadow-xl hover:shadow-brand-500/10 transition-all h-full overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/40 dark:bg-white/5 blur-2xl pointer-events-none" />
                <motion.div
                  className="text-4xl sm:text-5xl mb-2 relative"
                  whileHover={{ rotate: [-5, 5, -5], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {c.icone || '✨'}
                </motion.div>
                <div className="font-black text-xs sm:text-sm text-[#0F172A] dark:text-white leading-tight mt-1 line-clamp-2">
                  {c.nome}
                </div>
                <div className="mt-1 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> {c.produtoCount || '+'}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/categorias" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600">
            Ver todas as categorias <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
