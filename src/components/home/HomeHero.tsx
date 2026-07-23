'use client'
// Hero da Home — conversão + SEO
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Star, CheckCircle2, TrendingDown } from 'lucide-react'

export function HomeHero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Gradiente de fundo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.2),transparent_60%)]" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-brand-50/40 to-transparent dark:from-brand-900/10" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge superior */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs md:text-sm font-black uppercase tracking-widest mb-6"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Taxa mais justa do Brasil — 8% com teto de R$50
          </motion.div>

          {/* H1 principal */}
          <h1 className="font-black text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] text-[#0F172A] dark:text-white tracking-tight mb-5">
            O marketplace de tudo
            <br />
            que é{' '}
            <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              digital
            </span>
            .
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Venda e compre <strong>cursos, e-books, templates, plugins, artes, software, serviços e freelances</strong> com a menor taxa do mercado.
            Saque seu dinheiro em 1 dia via PIX, use <strong>200+ agentes de IA gratuitos</strong> para vender mais, sem pegadinhas, sem assinatura obrigatória, sem taxas escondidas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              href="/anunciar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] rounded-full px-8 py-4 text-base font-black hover:scale-[1.03] transition shadow-xl shadow-black/10"
            >
              Começar a vender grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/buscar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 text-[#0F172A] dark:text-white rounded-full px-8 py-4 text-base font-bold hover:bg-slate-50 dark:hover:bg-white/20 transition"
            >
              Explorar produtos
            </Link>
          </div>

          {/* Selos de confiança */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs md:text-sm text-slate-500 dark:text-slate-400"
          >
            <span className="inline-flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" /> Pagamento seguro</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Saque em 1 dia útil</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Garantia de 7 dias</span>
            <span className="inline-flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> 4.8/5 em +2 mil avaliações</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
