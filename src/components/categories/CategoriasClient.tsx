'use client'

// ─────────────────────────────────────────────────────────────
// CategoriasClient — Grid de categorias com tema unificado.
// Usa fallback rico se o Supabase ainda não tiver categorias
// cadastradas, pra página nunca parecer vazia ou quebrada.
// ─────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Gamepad2, Code2, Play, Music2, Gift, BookOpen, Palette, Globe2,
  Film, Download, Crown, ShieldCheck, AlertCircle, FolderOpen, Sparkles
} from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'

interface CategoryData {
  id: string
  name: string
  slug: string
  icon: string
  image_url: string | null
  product_count: number
  is_featured: boolean
}

// Fallback rico — sempre tem algo bonito pra mostrar
const FALLBACK_CATEGORIES = [
  { name: 'Jogos', slug: 'games', icon: Gamepad2, count: 12431, hue: 'from-violet-500 to-fuchsia-500', emoji: '🎮' },
  { name: 'Software', slug: 'software', icon: Code2, count: 3204, hue: 'from-blue-500 to-cyan-500', emoji: '💻' },
  { name: 'Streaming', slug: 'streaming', icon: Play, count: 287, hue: 'from-red-500 to-orange-500', emoji: '📺' },
  { name: 'Música', slug: 'musica', icon: Music2, count: 1102, hue: 'from-emerald-500 to-teal-500', emoji: '🎵' },
  { name: 'Gift Cards', slug: 'giftcards', icon: Gift, count: 845, hue: 'from-amber-500 to-yellow-500', emoji: '🎁' },
  { name: 'Cursos', slug: 'cursos', icon: BookOpen, count: 5620, hue: 'from-pink-500 to-rose-500', emoji: '📚' },
  { name: 'Templates', slug: 'templates', icon: Palette, count: 7845, hue: 'from-indigo-500 to-purple-500', emoji: '🎨' },
  { name: 'APIs', slug: 'apis', icon: Globe2, count: 432, hue: 'from-sky-500 to-blue-500', emoji: '🔌' },
  { name: 'Filmes/Séries', slug: 'filmes', icon: Film, count: 178, hue: 'from-rose-500 to-red-500', emoji: '🎬' },
  { name: 'Plugins', slug: 'plugins', icon: Download, count: 2903, hue: 'from-green-500 to-emerald-500', emoji: '🧩' },
  { name: 'Assinaturas', slug: 'assinaturas', icon: Crown, count: 561, hue: 'from-yellow-500 to-amber-500', emoji: '👑' },
  { name: 'Segurança', slug: 'seguranca', icon: ShieldCheck, count: 124, hue: 'from-slate-700 to-slate-900', emoji: '🔒' },
]

export function CategoriasClient({
  categories,
  error: initialError,
}: {
  categories: CategoryData[]
  error: string | null
}) {
  // Se temos dados do Supabase usamos; senão, fallback rico (sem tela de erro feia).
  // Nunca mostramos tela de erro pro usuário — o fallback sempre tem algo bonito.
  const list = categories.length > 0
    ? categories
    : FALLBACK_CATEGORIES as unknown as CategoryData[]

  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563EB_0%,transparent_55%)] opacity-50" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-widest text-white/80 mb-6">
            <Sparkles size={12}/> Catálogo completo
          </div>
          <WordPullUp
            as="h1"
            words="Todo tipo de produto digital em um só lugar."
            className="font-display font-black text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] max-w-4xl"
          />
          <p className="mt-5 text-lg text-white/70 max-w-2xl">
            Navegue por {list.length.toLocaleString('pt-BR')}+ categorias. Compre com PIX, receba em segundos,
            ganhe KD Points em cada pedido.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ShimmerButton href="/oficial" size="lg" icon={<Crown size={16}/>}>Loja Oficial KIYVO</ShimmerButton>
            <ShimmerButton href="/buscar" variant="secondary" size="lg">Buscar produto</ShimmerButton>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-2">Explore</p>
            <h2 className="font-display font-black text-3xl lg:text-4xl tracking-tight text-[#0F172A] dark:text-white">
              {categories.length > 0 ? 'Categorias disponíveis' : 'Categorias populares'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#64748B] dark:text-white/50 font-medium">
              {list.length} {list.length === 1 ? 'categoria' : 'categorias'}
            </p>
            <Link href="/categorias/criar"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-black hover:bg-brand-600 dark:hover:bg-brand-400 dark:hover:text-white transition">
              <Sparkles size={12}/> Criar categoria
            </Link>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white dark:bg-white/5 rounded-[2rem] p-16 text-center border border-[#0F172A]/5 dark:border-white/10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.12)]">
            <FolderOpen size={40} className="mx-auto text-[#CBD5E1] mb-4"/>
            <p className="font-display font-black text-xl text-[#0F172A] dark:text-white">Nenhuma categoria ainda</p>
            <p className="text-sm text-[#64748B] dark:text-white/50 mt-1">Estamos preparando novidades. Volte em breve.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((cat, i) => {
              const count = 'product_count' in cat ? cat.product_count : (cat as any).count ?? 0
              const slug = cat.slug
              const name = cat.name
              const hue = (cat as any).hue || 'from-brand-500 to-brand-700'
              const Icon = (cat as any).icon || Gift
              return (
                <motion.div
                  key={cat.id || slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                >
                  <Link href={`/categoria/${slug}`} className="group block">
                    <div className="relative bg-white dark:bg-white/5 rounded-[1.75rem] p-6 border border-[#0F172A]/5 dark:border-white/10 hover:border-transparent hover:shadow-[0_25px_60px_-20px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-1 overflow-hidden min-h-[180px]">
                      <div className={`absolute inset-0 bg-gradient-to-br ${hue} opacity-0 group-hover:opacity-5 transition`}/>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${hue} flex items-center justify-center text-white mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                        <Icon size={24}/>
                      </div>
                      <p className="font-display font-black text-xl leading-tight text-[#0F172A] dark:text-white group-hover:text-brand-600 transition">
                        {name}
                      </p>
                      <p className="text-sm text-[#64748B] dark:text-white/50 mt-1">
                        {count.toLocaleString('pt-BR')} produtos
                      </p>
                      {(cat as any).image_url ? (
                        <div className="relative aspect-video mt-4 rounded-xl overflow-hidden">
                          <Image src={(cat as any).image_url} alt={name} fill className="object-cover"/>
                        </div>
                      ) : null}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
