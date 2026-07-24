'use client'

// ─────────────────────────────────────────────────────────────
// FAQClient — Accordion + filtro por categoria (tema unificado)
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, HelpCircle, MessageCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
}

export function FAQClient({ faqs }: { faqs: FAQItem[] }) {
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [openId, setOpenId] = useState<string | null>(null)

  const categories = ['Todas', ...Array.from(new Set(faqs.map(f => f.category)))]
  const filtered = activeCategory === 'Todas' ? faqs : faqs.filter(f => f.category === activeCategory)

  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563EB_0%,transparent_55%)] opacity-50"/>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-4xl mx-auto px-6 py-16 lg:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-widest text-white/80 mb-5">
            <HelpCircle size={12}/> Central de ajuda
          </div>
          <WordPullUp
            as="h1"
            words="Tudo que você precisa saber."
            className="font-display font-black text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] tracking-[-0.03em] mx-auto"
          />
          <p className="mt-4 text-white/70 max-w-xl mx-auto">Respostas pras dúvidas mais comuns sobre comprar, vender, KD Points, pagamentos e saques.</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-14 lg:py-16">
        {/* Filtro de categorias */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition ${
                activeCategory === cat
                  ? 'bg-[#0F172A] text-white shadow-lg'
                  : 'bg-white dark:bg-white/5 border border-[#0F172A]/10 text-[#475569] dark:text-white/60 hover:border-[#0F172A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filtered.map(faq => {
            const open = openId === faq.id
            return (
              <div key={faq.id} className="bg-white dark:bg-white/5 rounded-2xl border border-[#0F172A]/5 dark:border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[#FAFAFA] dark:bg-[#0B0F1A] transition"
                  aria-expanded={open}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="shrink-0 mt-0.5 text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                      {faq.category}
                    </span>
                    <span className="font-display font-bold text-[15px] pr-3">{faq.question}</span>
                  </div>
                  <ChevronDown size={18} className={`text-[#94A3B8] dark:text-white/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}/>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 text-sm text-[#475569] dark:text-white/60 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Contato */}
        <div className="mt-14 bg-white dark:bg-white/5 rounded-[2rem] p-10 border border-[#0F172A]/5 dark:border-white/10 text-center shadow-[0_30px_80px_-30px_rgba(15,23,42,0.15)]">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={24} className="text-brand-600"/>
          </div>
          <h2 className="font-display font-black text-2xl">Não achou sua resposta?</h2>
          <p className="text-sm text-[#64748B] dark:text-white/50 mt-2 max-w-md mx-auto">
            Nosso time de suporte responde em até 1 hora em dias úteis. Chama a gente.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <ShimmerButton href="/suporte" size="md" icon={<MessageCircle size={14}/>}>Falar com suporte</ShimmerButton>
            <Link href="/como-funciona" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white dark:bg-white/5 border-2 border-black/10 dark:border-white/15 text-sm font-black text-[#0F172A] dark:text-white hover:border-[#0F172A] transition">
              Como funciona
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
