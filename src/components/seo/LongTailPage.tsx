'use client'
// Template de página SEO de cauda longa — usado por "alternativa a X", "melhor Y", etc.
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Zap, TrendingUp, ArrowRight, CheckCircle, Star, Clock, BadgePercent, Banknote } from 'lucide-react'
import type { ReactNode } from 'react'

export interface LongTailProps {
  titulo: ReactNode
  subtitulo: string
  concorrente?: string
  concorrenteTaxa?: string
  concorrenteProblemas?: string[]
  kiyvoDiferenciais?: Array<{ icone: string; titulo: string; desc: string }>
  comparativo?: Array<{ criterio: string; concorrente: string; kiyvo: string; kiyvoMelhor?: boolean }>
  faq?: Array<{ pergunta: string; resposta: string | ReactNode }>
  cta?: { titulo: string; subtitulo: string; botao: string; href: string }
  tags?: string[]
}

const iconMap: Record<string, any> = {
  Shield, Zap, TrendingUp, Star, Clock, BadgePercent, Banknote, CheckCircle,
}

export function LongTailPage({
  titulo, subtitulo, concorrente = 'concorrência', concorrenteTaxa = 'taxas altas',
  concorrenteProblemas = [], kiyvoDiferenciais = [], comparativo = [], faq = [],
  cta = { titulo: 'Começe a vender na KIYVO hoje', subtitulo: 'Taxa de 8% máxima (teto R$50), saque em 1 dia, e mais de 180 agentes IA para vender mais.', botao: 'Criar conta grátis', href: '/cadastro' },
  tags = [],
}: LongTailProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-10 md:pt-20">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-700 dark:text-brand-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Shield className="w-3.5 h-3.5" />
            Taxas justas — sem roubo
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] dark:text-white leading-[1.05] tracking-tight">
            {titulo}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {subtitulo}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={cta.href} className="bg-[#0F172A] hover:bg-black dark:bg-white dark:text-black text-white rounded-full px-8 py-4 font-bold text-sm flex items-center justify-center gap-2 transition">
              {cta.botao} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/transparencia" className="border-2 border-slate-200 dark:border-slate-700 rounded-full px-8 py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Ver taxas transparentes
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Grátis para começar</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Sem mensalidade</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Saque em 1 dia útil</span>
          </div>
        </motion.div>
      </section>

      {/* Problemas do concorrente */}
      {concorrenteProblemas.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-6">
            Por que vender no{concorrente.includes('Hotmart') ? 'a' : ''} {concorrente} pode estar te custando dinheiro
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {concorrenteProblemas.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 border border-red-100 dark:border-red-900/40">
                <p className="text-red-600 dark:text-red-400 font-bold text-sm flex items-start gap-2">
                  <span className="mt-0.5">❌</span> {p}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Diferenciais KIYVO */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-2">
          Por que escolher a KIYVO?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl">
          A KIYVO foi criada para ser a alternativa ética e brasileira — sem taxas abusivas, sem saques travados, sem letras miúdas.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kiyvoDiferenciais.map((d, i) => {
            const Ico = iconMap[d.icone] || CheckCircle
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800">
                <div className="w-11 h-11 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                  <Ico className="w-5 h-5" />
                </div>
                <h3 className="font-black text-[#0F172A] dark:text-white mb-2">{d.titulo}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{d.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Tabela comparativa */}
      {comparativo.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-6">Comparativo lado a lado</h2>
          <div className="bg-white dark:bg-[#111827] rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800 font-black text-[11px] uppercase tracking-widest">
              <div className="bg-white dark:bg-[#111827] p-4 text-slate-500">Critério</div>
              <div className="bg-white dark:bg-[#111827] p-4 text-slate-500 text-center">{concorrente}</div>
              <div className="bg-brand-500 p-4 text-white text-center">KIYVO ✅</div>
            </div>
            {comparativo.map((c, i) => (
              <div key={i} className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800 text-sm">
                <div className="bg-white dark:bg-[#111827] p-4 font-semibold text-[#0F172A] dark:text-white">{c.criterio}</div>
                <div className="bg-white dark:bg-[#111827] p-4 text-slate-500 dark:text-slate-400 text-center">{c.concorrente}</div>
                <div className="bg-brand-50 dark:bg-brand-950/30 p-4 text-brand-700 dark:text-brand-300 font-bold text-center">{c.kiyvo}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-6">Perguntas frequentes</h2>
          <div className="space-y-3">
            {faq.map((f, i) => (
              <details key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 group">
                <summary className="font-black text-[#0F172A] dark:text-white cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{f.pergunta}</span>
                  <span className="text-brand-500 text-xl group-open:rotate-45 transition">+</span>
                </summary>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.resposta}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-[#0F172A] rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-black leading-tight">{cta.titulo}</h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">{cta.subtitulo}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={cta.href} className="bg-white text-[#0F172A] rounded-full px-8 py-4 font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100">
              {cta.botao} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/transparencia" className="border-2 border-white/20 rounded-full px-8 py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10">
              Ver taxas
            </Link>
          </div>
        </motion.div>
      </section>

      {tags.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-10 text-xs text-slate-500">
          Tags: {tags.join(', ')}
        </div>
      )}
    </div>
  )
}
