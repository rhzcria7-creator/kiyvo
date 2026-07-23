'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bot, ArrowRight, Sparkles } from 'lucide-react'

const agentes = [
  { nome: 'LucroMax', desc: 'Calculadora de lucro real com taxas' },
  { nome: 'Copywriter', desc: 'Títulos e descrições que vendem' },
  { nome: 'CheckoutMax', desc: 'Checkout otimizado com gatilhos' },
  { nome: 'Script Venda SPN', desc: 'Sofrimento → Ponte → Nova Vida' },
  { nome: 'Bump de Venda', desc: 'Order bump que converte 25-40%' },
  { nome: 'UpsellMax', desc: 'OTO/downsell/subscription' },
  { nome: 'Roteiro de Webinar', desc: 'Webinar 90min de 8-15% conversão' },
  { nome: 'Calculadora ROI', desc: 'Veja se anúncio dá lucro' },
]

export function HomeAgentes() {
  return (
    <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Exclusivo KIYVO
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mb-4">
            200+ agentes de IA trabalhando pra você vender mais.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg">
            Copies, banners, SEO, thumbnails, scripts de anúncio, precificação, e-mails, upsell. Tudo incluso, muitos são gratuitos.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {agentes.map((a, i) => (
            <motion.div
              key={a.nome}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex gap-3 items-start"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-sm text-[#0F172A] dark:text-white">{a.nome}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/agentes" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline">
            Ver todos os 200+ agentes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
