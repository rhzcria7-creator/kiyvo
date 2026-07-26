'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Clock, Zap } from 'lucide-react'

const DEALS = [
  { id: '1', title: 'Curso Marketing Digital', price: 47, old: 197, sales: 1234, rating: 4.8, emoji: '📚', ends: '2h', disc: '-76%' },
  { id: '2', title: 'Plugin WP Speed Pro', price: 27, old: 147, sales: 890, rating: 4.9, emoji: '⚡', ends: '5h', disc: '-82%' },
  { id: '3', title: 'Template Bootstrap 5', price: 17, old: 97, sales: 567, rating: 4.7, emoji: '🎨', ends: '8h', disc: '-82%' },
  { id: '4', title: 'E-book Receitas Fit', price: 9, old: 67, sales: 3456, rating: 4.5, emoji: '📖', ends: '3h', disc: '-87%' },
  { id: '5', title: 'Pacote Templates UI', price: 47, old: 297, sales: 789, rating: 4.6, emoji: '📦', ends: '12h', disc: '-84%' },
  { id: '6', title: 'Curso UX/UI Completo', price: 67, old: 297, sales: 456, rating: 4.9, emoji: '🖌️', ends: '6h', disc: '-77%' },
  { id: '7', title: 'Gestao Financeira', price: 97, old: 397, sales: 234, rating: 4.4, emoji: '💼', ends: '24h', disc: '-76%' },
  { id: '8', title: 'Kit Fontes Premium', price: 12, old: 97, sales: 1234, rating: 4.8, emoji: '🔤', ends: '4h', disc: '-88%' },
  { id: '9', title: 'Curso Python', price: 57, old: 247, sales: 567, rating: 4.7, emoji: '🐍', ends: '10h', disc: '-77%' },
  { id: '10', title: 'Asset Pack Games', price: 27, old: 177, sales: 345, rating: 4.6, emoji: '🎮', ends: '7h', disc: '-85%' },
  { id: '11', title: 'E-book Financas', price: 7, old: 57, sales: 2345, rating: 4.3, emoji: '💰', ends: '2h', disc: '-88%' },
  { id: '12', title: 'Plugin SEO WP', price: 37, old: 187, sales: 678, rating: 4.8, emoji: '🔍', ends: '9h', disc: '-80%' },
]

export default function DealsPage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">Ofertas Relampago</h1>
          </div>
          <p className="text-zinc-500 mb-8">Descontos por tempo limitado. Corra!</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {DEALS.map((d, i) => (
            <motion.a key={d.id} href={`/product/${d.id}`}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, y: -2 }}
              viewport={{ once: true }} transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl">{d.disc}</div>
              <span className="text-3xl block mb-2">{d.emoji}</span>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2 group-hover:text-blue-600">{d.title}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-zinc-500">{d.rating}</span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-lg font-bold text-red-600">R$ {d.price.toFixed(2)}</span>
                <span className="text-xs text-zinc-400 line-through">R$ {d.old.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-400">
                <Clock className="w-3 h-3" /> Termina em {d.ends}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </main>
  )
}
