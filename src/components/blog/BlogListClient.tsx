'use client'

// ─────────────────────────────────────────────────────────────
// BlogListClient — Lista de posts com tema unificado.
// Se não houver posts (banco vazio), mostra posts estáticos
// de exemplo pra página nunca ficar vazia.
// ─────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, FileText, ArrowRight, Sparkles, BookOpen, Pen } from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  image_url: string | null
  category: string
  read_time: string
  created_at: string
  author_name: string
  author_avatar: string | null
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return isoDate
  }
}

// Posts fallback caso o banco ainda não tenha conteúdo
const FALLBACK_POSTS: BlogPostData[] = [
  {
    id: 'p1',
    title: 'Como vender seu primeiro produto digital em 7 dias',
    slug: 'primeiro-produto-digital-7-dias',
    excerpt: 'Guia passo a passo pra escolher um nicho, criar seu produto, anunciar na KIYVO e fazer a primeira venda sem gastar nada em tráfego.',
    image_url: null,
    category: 'Vender',
    read_time: '7 min',
    created_at: '2026-07-15',
    author_name: 'Equipe KIYVO',
    author_avatar: null,
  },
  {
    id: 'p2',
    title: 'PIX na KIYVO: por que o pagamento cai em 2 segundos',
    slug: 'pix-2-segundos',
    excerpt: 'Entenda a tecnologia por trás do checkout instantâneo da KIYVO e por que somos mais rápidos que qualquer outro marketplace.',
    image_url: null,
    category: 'Pagamento',
    read_time: '4 min',
    created_at: '2026-07-10',
    author_name: 'Tech KIYVO',
    author_avatar: null,
  },
  {
    id: 'p3',
    title: 'KD Points: como ganhar R$50 de volta por mês em jogos',
    slug: 'kd-points-guia',
    excerpt: 'Estratégia de compras pra maximizar o cashback do programa de pontos da KIYVO — e como chegar aos 50% de volta do plano Plus.',
    image_url: null,
    category: 'KD Points',
    read_time: '5 min',
    created_at: '2026-07-05',
    author_name: 'Equipe KIYVO',
    author_avatar: null,
  },
  {
    id: 'p4',
    title: 'Anti-fraude na KIYVO: como protegemos compradores e vendedores',
    slug: 'anti-fraude-explicado',
    excerpt: 'Mostramos por dentro o sistema de score de fraude, escrow automático e detecção de chargeback que roda em cada pedido.',
    image_url: null,
    category: 'Segurança',
    read_time: '6 min',
    created_at: '2026-06-28',
    author_name: 'Segurança KIYVO',
    author_avatar: null,
  },
  {
    id: 'p5',
    title: 'Gift cards baratos: como economizar até 30% em jogos',
    slug: 'gift-cards-baratos',
    excerpt: 'Dicas pra comprar gift cards de Steam, PlayStation, Xbox, Netflix e Spotify pelo menor preço do Brasil com entrega garantida.',
    image_url: null,
    category: 'Comprar',
    read_time: '5 min',
    created_at: '2026-06-20',
    author_name: 'Equipe KIYVO',
    author_avatar: null,
  },
  {
    id: 'p6',
    title: 'Entrega automática: como vender dormindo',
    slug: 'entrega-automatica',
    excerpt: 'Aprenda a configurar o cofre digital da KIYVO e enviar chaves de licença automaticamente pra cada comprador sem estar online.',
    image_url: null,
    category: 'Vender',
    read_time: '8 min',
    created_at: '2026-06-15',
    author_name: 'Equipe KIYVO',
    author_avatar: null,
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Vender: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  Pagamento: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  'KD Points': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Segurança: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  Comprar: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
}

export function BlogListClient({
  posts,
  error: initialError,
}: {
  posts: BlogPostData[]
  error: string | null
}) {
  const list = posts.length > 0 ? posts : FALLBACK_POSTS

  if (initialError && posts.length === 0) {
    return (
      <main className="min-h-[70svh] bg-[#FAFAFA] dark:bg-[#0B0F1A] dark:bg-[#0B0F1A] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={28} className="text-red-500"/>
          </div>
          <h1 className="font-display font-black text-2xl text-[#0F172A] dark:text-white dark:text-white">Ops</h1>
          <p className="text-[#64748B] dark:text-white/50 dark:text-white/60 mt-2">{initialError}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-6 text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  const [featured, ...rest] = list

  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white dark:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#EC4899_0%,transparent_55%)] opacity-20"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#2563EB_0%,transparent_50%)] opacity-40"/>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-5xl mx-auto px-6 py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-widest text-white/80 mb-5">
            <BookOpen size={12}/> Blog KIYVO
          </div>
          <WordPullUp
            as="h1"
            words="Dicas, guias e novidades do mundo digital."
            className="font-display font-black text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.95] tracking-[-0.03em] max-w-3xl"
          />
          <p className="mt-4 text-white/70 max-w-xl">
            Aprenda a comprar melhor, vender mais e aproveitar ao máximo a KIYVO com artigos diretos e em português.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-14 lg:py-16">
        {posts.length === 0 && !initialError && (
          <div className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Sparkles size={12}/> Mostrando posts de exemplo
          </div>
        )}

        {/* Featured */}
        {featured && (
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="group mb-12"
          >
            <Link href={`/blog/${featured.slug}`} className="block">
              <div className="grid md:grid-cols-2 gap-0 bg-white dark:bg-white/5 dark:bg-white/5 dark:border-white/10 rounded-[2rem] border border-[#0F172A]/5 dark:border-white/10 overflow-hidden hover:shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] dark:hover:shadow-[0_30px_80px_-30px_rgba(37,99,235,0.3)] transition-all">
                <div className="relative aspect-video md:aspect-auto bg-gradient-to-br from-brand-500 via-violet-500 to-pink-500 min-h-[260px] flex items-center justify-center overflow-hidden">
                  {featured.image_url ? (
                    <Image src={featured.image_url} alt={featured.title} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width: 768px) 100vw, 50vw"/>
                  ) : (
                    <Pen size={72} className="text-white/90 group-hover:scale-110 transition"/>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <span className={`inline-flex w-fit text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] || 'bg-slate-100 text-slate-700'}`}>
                    {featured.category}
                  </span>
                  <h2 className="mt-4 font-display font-black text-2xl lg:text-3xl leading-[1.05] tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                    {featured.title}
                  </h2>
                  <p className="text-[#64748B] dark:text-white/50 dark:text-white/60 mt-3 leading-relaxed">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 mt-6 text-xs text-[#94A3B8] dark:text-white/40 dark:text-white/40">
                    <span className="font-bold">{featured.author_name}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {featured.read_time}</span>
                    <span>{formatDate(featured.created_at)}</span>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-1 text-sm font-black text-brand-600 dark:text-brand-400 group-hover:gap-2 transition-all">
                    Ler artigo <ArrowRight size={14}/>
                  </div>
                </div>
              </div>
            </Link>
          </motion.article>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <div className="bg-white dark:bg-white/5 dark:bg-white/5 rounded-[1.75rem] border border-[#0F172A]/5 dark:border-white/10 dark:border-white/10 overflow-hidden hover:shadow-[0_25px_60px_-20px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_25px_60px_-20px_rgba(37,99,235,0.3)] hover:-translate-y-1 transition-all h-full flex flex-col">
                  <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
                    {post.image_url ? (
                      <Image src={post.image_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"/>
                    ) : (
                      <FileText size={42} className="text-slate-400 dark:text-slate-500 group-hover:scale-110 transition"/>
                    )}
                    <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-white/90 text-slate-700'}`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display font-black text-lg leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-white/50 dark:text-white/60 mt-2 line-clamp-2 leading-relaxed flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-4 text-[11px] text-[#94A3B8] dark:text-white/40 dark:text-white/40 font-bold">
                      <span className="flex items-center gap-1"><Clock size={11}/> {post.read_time}</span>
                      <span>•</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-[#0F172A] text-white p-10 lg:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#8B5CF6_0%,transparent_60%)] opacity-50"/>
            <div className="relative">
              <h2 className="font-display font-black text-3xl lg:text-4xl leading-tight tracking-tight">
                Quer vender também?
              </h2>
              <p className="text-white/70 mt-3 max-w-lg mx-auto">
                Crie sua conta grátis e comece a vender produtos digitais pra mais de 1 milhão de brasileiros.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <ShimmerButton href="/cadastro" size="lg" icon={<Sparkles size={16}/>}>Criar conta grátis</ShimmerButton>
                <ShimmerButton href="/vender" variant="secondary" size="lg">Como vender</ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
