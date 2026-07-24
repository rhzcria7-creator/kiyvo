'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HomeCTA() {
  return (
    <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] p-8 md:p-14 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-brand-800 text-white text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Começa hoje
            </div>
            <h2 className="text-3xl md:text-5xl font-black leading-[1.05] mb-4">
              Pare de pagar taxa abusiva.
              <br />
              Venda na KIYVO.
            </h2>
            <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto mb-8">
              Publique seu produto em 5 minutos, de graça, sem mensalidade. Quando vender, a taxa é a mais justa do Brasil. Se não vender, você não paga nada.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/vender"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#0F172A] rounded-full px-7 py-4 font-black text-base hover:scale-105 transition"
              >
                Começar a vender grátis <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/transparencia"
                className="inline-flex items-center justify-center gap-2 border border-white/30 rounded-full px-7 py-4 font-bold text-base hover:bg-white/10 transition"
              >
                Ver taxas transparentes
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
