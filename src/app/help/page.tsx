'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen, CreditCard, Shield, Users, Settings, MessageCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { PageTransition } from '@/components/shared/PageTransition'

const categories = [
  { icon: BookOpen, title: 'Compras', desc: 'Como comprar, entrega, reembolso', articles: 12, href: '/faq' },
  { icon: CreditCard, title: 'Pagamentos', desc: 'PIX, cartão, boleto, estorno', articles: 8, href: '/pagamentos' },
  { icon: Shield, title: 'Segurança', desc: 'Verificação, proteção, disputas', articles: 6, href: '/seguranca' },
  { icon: Users, title: 'Vendas', desc: 'Anunciar, taxas, planos', articles: 10, href: '/vender' },
  { icon: Settings, title: 'Conta', desc: 'Perfil, senha, configurações', articles: 7, href: '/configuracoes' },
  { icon: MessageCircle, title: 'Suporte', desc: 'Chat, ticket, contato', articles: 4, href: '/suporte' },
]

const popularArticles = [
  { q: 'Como comprar na Kiyvo?', href: '/como-funciona' },
  { q: 'Como funciona a garantia?', href: '/garantia' },
  { q: 'Quais as formas de pagamento?', href: '/pagamentos' },
  { q: 'Como me tornar vendedor verificado?', href: '/verificacao' },
  { q: 'Como solicitar reembolso?', href: '/reembolso' },
  { q: 'Quais as taxas por venda?', href: '/tarifas' },
]

export default function HelpPage() {
  const [query, setQuery] = useState('')

  const filtered = query
    ? popularArticles.filter(a => a.q.toLowerCase().includes(query.toLowerCase()))
    : popularArticles

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display font-extrabold text-4xl text-surface-900 dark:text-white">Como podemos ajudar?</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-3">Encontre respostas rápidas ou fale com nosso suporte</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <div className="relative max-w-xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busque por dúvidas, problemas, tutoriais..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-900 border-2 border-surface-200 dark:border-surface-700 rounded-2xl text-surface-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 dark:focus:border-brand-500 transition-all"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {categories.map((cat, i) => (
            <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link href={cat.href} className="card-base p-5 block hover:shadow-card-hover dark:hover:shadow-dark-glow transition-shadow group">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mb-3">
                  <cat.icon size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-display font-bold text-surface-900 dark:text-white">{cat.title}</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{cat.desc}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-2">{cat.articles} artigos</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Popular Articles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-6">
          <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">📌 Artigos populares</h2>
          <div className="space-y-1">
            {filtered.map((article) => (
              <Link key={article.q} href={article.href} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors group">
                <span className="text-sm text-surface-700 dark:text-surface-300">{article.q}</span>
                <ChevronRight size={16} className="text-surface-400 group-hover:text-brand-500" />
              </Link>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-surface-400 py-4 text-center">Nenhum artigo encontrado para "{query}"</p>
            )}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <p className="text-surface-500 dark:text-surface-400 text-sm">Não encontrou o que procurava?</p>
          <Link href="/suporte" className="btn-primary mt-3 inline-flex">Falar com suporte</Link>
        </motion.div>
      </div>
    </PageTransition>
  )
}
