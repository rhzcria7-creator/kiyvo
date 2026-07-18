'use client'

// ─────────────────────────────────────────────────────────────
// FAQClient — Componente interativo do FAQ
// Accordion + filtro por categoria
// Recebe dados via props do server component
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white mb-3">
          Perguntas Frequentes
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          Tire suas dúvidas sobre a plataforma Kiyvo
        </p>

        {/* Filtro de categorias */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-2">
          {filtered.map((faq) => (
            <div key={faq.id} className="card-base">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left"
                aria-expanded={openId === faq.id}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="brand">{faq.category}</Badge>
                  <span className="font-display font-semibold text-surface-900 dark:text-white text-sm">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-surface-400 shrink-0 transition-transform ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openId === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-sm text-surface-600 dark:text-surface-400 leading-relaxed border-t border-surface-100 dark:border-surface-800 pt-3">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contato */}
        <div className="mt-12 text-center card-base p-8">
          <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-2">
            Ainda tem dúvidas?
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
            Entre em contato com nosso suporte
          </p>
          <a href="/ajuda" className="btn-primary text-sm">
            Central de Ajuda
          </a>
        </div>
      </div>
    </PageTransition>
  )
}
