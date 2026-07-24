'use client'
// Template de post de blog com tipografia grande, SEO-friendly e schema.org Article
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, User, Clock, ArrowLeft, Tag } from 'lucide-react'
import type { ReactNode } from 'react'

export interface BlogPostProps {
  titulo: string
  subtitulo: string
  autor: string
  data: string
  tempoLeitura: string
  categoria: string
  tags?: string[]
  children: ReactNode
}

export function BlogPost({ titulo, subtitulo, autor, data, tempoLeitura, categoria, tags = [], children }: BlogPostProps) {
  return (
    <article className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-14">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-semibold mb-8 hover:text-brand-500">
          <ArrowLeft className="w-4 h-4" /> Voltar para o blog
        </Link>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block bg-brand-500/10 text-brand-700 dark:text-brand-400 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest mb-4">
            {categoria}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-[1.1] tracking-tight">
            {titulo}
          </h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {subtitulo}
          </p>
          <div className="mt-6 flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400 font-semibold flex-wrap">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {autor}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {data}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {tempoLeitura}</span>
          </div>
        </motion.div>

        <div className="mt-10 prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:text-[#0F172A] dark:prose-headings:text-white prose-h2:text-2xl prose-h2:mt-10 prose-h3:text-xl prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-a:font-semibold prose-strong:text-[#0F172A] dark:prose-strong:text-white prose-ul:space-y-2 prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-brand-50 dark:prose-blockquote:bg-brand-950/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:font-medium">
          {children}
        </div>

        {tags.length > 0 && (
          <div className="mt-10 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-slate-400" />
            {tags.map((t) => (
              <span key={t} className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">#{t}</span>
            ))}
          </div>
        )}

        <div className="mt-10 bg-[#0F172A] rounded-[2rem] p-8 text-center text-white">
          <h2 className="text-2xl font-black">Quer vender produtos digitais com taxa justa?</h2>
          <p className="mt-2 text-slate-300 text-sm">Conheça a KIYVO — a plataforma brasileira com taxa de 8% máxima (teto R$50).</p>
          <Link href="/cadastro" className="mt-5 inline-flex items-center gap-2 bg-white text-black rounded-full px-7 py-3 font-black text-sm hover:bg-yellow-300">
            Criar conta grátis
          </Link>
        </div>
      </div>
    </article>
  )
}
