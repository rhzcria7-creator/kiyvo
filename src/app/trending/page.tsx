'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Star, Zap, Clock, Eye, ShoppingBag } from 'lucide-react'

const TRENDING = [
  { id: '1', title: 'Curso Marketing Digital 2026', price: 97, oldPrice: 197, sales: 1234, rating: 4.8, emoji: '📚', badge: '+100 vendas/dia' },
  { id: '2', title: 'Plugin WordPress Speed Pro', price: 67, oldPrice: 147, sales: 890, rating: 4.9, emoji: '⚡', badge: 'Boost' },
  { id: '3', title: 'Template Bootstrap 5 Admin', price: 47, oldPrice: 97, sales: 567, rating: 4.7, emoji: '🎨', badge: 'Recente' },
  { id: '4', title: 'E-book Receitas Saudaveis', price: 27, oldPrice: 67, sales: 3456, rating: 4.5, emoji: '📖', badge: 'Mais Vendido' },
  { id: '5', title: 'Pacote 200+ Templates', price: 97, oldPrice: 297, sales: 789, rating: 4.6, emoji: '📦', badge: 'Bundle' },
  { id: '6', title: 'Curso Design UX/UI', price: 147, oldPrice: 297, sales: 456, rating: 4.9, emoji: '🖌️', badge: '+50 vendas/dia' },
  { id: '7', title: 'Software Gestao Financeira', price: 197, oldPrice: 397, sales: 234, rating: 4.4, emoji: '💼', badge: 'Novo' },
  { id: '8', title: 'Kit Fontes Premium', price: 37, oldPrice: 97, sales: 1234, rating: 4.8, emoji: '🔤', badge: 'Promocao' },
  { id: '9', title: 'Curso Python Avancado', price: 127, oldPrice: 247, sales: 567, rating: 4.7, emoji: '🐍', badge: 'Trending' },
  { id: '10', title: 'Asset Pack Game Dev', price: 77, oldPrice: 177, sales: 345, rating: 4.6, emoji: '🎮', badge: '+30 vendas/dia' },
  { id: '11', title: 'E-book Financas Pessoais', price: 22, oldPrice: 57, sales: 2345, rating: 4.3, emoji: '💰', badge: 'Popular' },
  { id: '12', title: 'Plugin SEO WordPress', price: 87, oldPrice: 187, sales: 678, rating: 4.8, emoji: '🔍', badge: 'Boost' },
]

export default function TrendingPage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">Trending Now</h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">Produtos mais quentes do momento no KIYVO</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {TRENDING.map((item, i) => {
            const discount = item.oldPrice ? Math.round((1 - item.price / item.oldPrice) * 100) : 0
            return (
              <motion.a
                key={item.id} href={`/product/${item.id}`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, y: -2 }}
                viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[9px] font-bold rounded-full">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{item.rating}</span>
                  </div>
                  <span className="text-xs text-zinc-400">{item.sales} vendas</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">R$ {item.price.toFixed(2)}</span>
                  {item.oldPrice && <span className="text-xs text-zinc-400 line-through">R$ {item.oldPrice.toFixed(2)}</span>}
                </div>
                {discount > 0 && <div className="mt-1 text-[10px] font-bold text-green-600">-{discount}% OFF</div>}
              </motion.a>
            )
          })}
        </div>
      </div>
    </main>
  )
}
