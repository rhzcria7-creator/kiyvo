// ─────────────────────────────────────────────────────────────
// FAQ Page — Dados do Supabase ou fallback estático
// Sem dependência de mockFAQ — usa API real quando disponível
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
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

// Fallback estático para quando o Supabase não tem FAQs ainda
const fallbackFAQ: FAQItem[] = [
  { id: 'f1', category: 'Kiyvo', question: 'A Kiyvo é confiável?', answer: 'Com certeza. Somos o marketplace líder em produtos digitais. Intermediamos todas as transações para garantir que o comprador receba o produto e o vendedor receba o pagamento. Seu dinheiro fica em escrow até a confirmação de entrega.' },
  { id: 'f2', category: 'Kiyvo', question: 'O que posso comprar e vender?', answer: 'Tudo que é digital! Jogos, contas, keys, software, licenças, cursos online, e-books, templates, gift cards, domínios, APIs, serviços freelance e muito mais.' },
  { id: 'f3', category: 'Comprador', question: 'Como comprar um produto?', answer: 'Basta acessar o anúncio e clicar em "Comprar". Você será direcionado ao checkout seguro via Stripe, onde pode pagar com PIX, cartão ou boleto.' },
  { id: 'f4', category: 'Comprador', question: 'E se eu não receber o produto?', answer: 'O pagamento fica em Escrow — só é liberado ao vendedor após sua confirmação. Se não receber, abra uma disputa e receberá reembolso integral.' },
  { id: 'f5', category: 'Pagamento', question: 'Quais formas de pagamento são aceitas?', answer: 'PIX (instantâneo), cartão de crédito, boleto bancário e saldo Kiyvo. Todos processados com segurança via Stripe.' },
  { id: 'f6', category: 'Pagamento', question: 'O pagamento é seguro?', answer: 'Sim. A Kiyvo segura o pagamento em Escrow e só repassa ao vendedor após a confirmação de entrega. Seus dados de pagamento são processados pelo Stripe (PCI DSS Level 1).' },
  { id: 'f7', category: 'Vendedor', question: 'Como anunciar meu produto?', answer: 'Crie sua conta, complete a verificação KYC e clique em "Anunciar". Preencha as informações e faça upload do produto digital no Cofre Digital. A entrega é automática!' },
  { id: 'f8', category: 'Vendedor', question: 'Quais são as taxas?', answer: 'A taxa varia pelo plano do vendedor: Prata (9,99%), Ouro (11,99%) e Diamante (12,99%). A taxa só é cobrada quando você vende — cadastro é grátis.' },
  { id: 'f9', category: 'Retiradas', question: 'Como retirar meu dinheiro?', answer: 'Após o comprador confirmar o recebimento, o valor fica disponível para saque via PIX. Retirada Normal: grátis, até 2 dias úteis. Retirada Turbo: R$ 3,50, instantânea.' },
  { id: 'f10', category: 'Recompensas', question: 'O que são KD Points?', answer: 'KD Points é nosso programa de recompensas. Cada R$1 gasto = 1 PD Point. Acumule e troque por descontos em futuras compras.' },
]

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Todas')
  const [openId, setOpenId] = useState<string | null>(null)
  const [faqs, setFaqs] = useState<FAQItem[]>(fallbackFAQ)

  useEffect(() => {
    async function fetchFAQ() {
      try {
        const res = await fetch('/api/v1/faq')
        if (res.ok) {
          const data = await res.json()
          if (data.faqs && data.faqs.length > 0) {
            setFaqs(data.faqs)
          }
        }
      } catch {
        // Usa fallback
      }
    }
    fetchFAQ()
  }, [])

  const categories = ['Todas', ...Array.from(new Set(faqs.map(f => f.category)))]
  const filtered = activeCategory === 'Todas' ? faqs : faqs.filter(f => f.category === activeCategory)

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white mb-3">Perguntas Frequentes</h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">Tire suas dúvidas sobre a plataforma Kiyvo</p>

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

        <div className="space-y-2">
          {filtered.map((faq) => (
            <div key={faq.id} className="card-base">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="brand">{faq.category}</Badge>
                  <span className="font-display font-semibold text-surface-900 dark:text-white text-sm">{faq.question}</span>
                </div>
                <ChevronDown size={18} className={`text-surface-400 shrink-0 transition-transform ${openId === faq.id ? 'rotate-180' : ''}`} />
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
      </div>
    </PageTransition>
  )
}
