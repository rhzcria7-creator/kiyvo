'use client'

import { useState } from 'react'
import { mockFAQ } from '@/data/mockFAQ'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { ChevronDown } from 'lucide-react'

const categories = ['Todas', ...Array.from(new Set(mockFAQ.map(f => f.category)))]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = activeCategory === 'Todas' ? mockFAQ : mockFAQ.filter(f => f.category === activeCategory)

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 mb-3">Perguntas Frequentes</h1>
        <p className="text-surface-500 mb-8">Tire suas dúvidas sobre a plataforma Playdex</p>

        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((faq) => (
            <div key={faq.id} className="card-base">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="brand">{faq.category}</Badge>
                  <span className="font-display font-semibold text-surface-900 text-sm">{faq.question}</span>
                </div>
                <ChevronDown size={18} className={`text-surface-400 shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
              </button>
              {openId === faq.id && (
                <div className="px-4 pb-4 text-sm text-surface-600 leading-relaxed border-t border-surface-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
