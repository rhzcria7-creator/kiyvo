'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Grid3X3, List, Star } from 'lucide-react'

const ALL_PRODUCTS = [
  { id: '1', title: 'Curso Marketing Digital 2026', price: 97, oldPrice: 197, sales: 1234, rating: 4.8, emoji: '📚', category: 'Cursos', badge: 'Mais Vendido' },
  { id: '2', title: 'Plugin WordPress Speed Pro', price: 67, oldPrice: 147, sales: 890, rating: 4.9, emoji: '⚡', category: 'Software', badge: 'Boost' },
  { id: '3', title: 'Template Bootstrap 5 Admin', price: 47, oldPrice: 97, sales: 567, rating: 4.7, emoji: '🎨', category: 'Templates', badge: 'Recente' },
  { id: '4', title: 'E-book Receitas Saudaveis', price: 27, oldPrice: 67, sales: 3456, rating: 4.5, emoji: '📖', category: 'E-books', badge: 'Mais Vendido' },
  { id: '5', title: 'Pacote 200+ Templates UI', price: 97, oldPrice: 297, sales: 789, rating: 4.6, emoji: '📦', category: 'Templates', badge: 'Bundle' },
  { id: '6', title: 'Curso Design UX/UI Completo', price: 147, oldPrice: 297, sales: 456, rating: 4.9, emoji: '🖌️', category: 'Cursos', badge: 'Novo' },
  { id: '7', title: 'Software Gestao Financeira', price: 197, oldPrice: 397, sales: 234, rating: 4.4, emoji: '💼', category: 'Software', badge: 'Premium' },
  { id: '8', title: 'Kit Fontes Premium 500+', price: 37, oldPrice: 97, sales: 1234, rating: 4.8, emoji: '🔤', category: 'Design', badge: 'Promocao' },
  { id: '9', title: 'Curso Python Avancado', price: 127, oldPrice: 247, sales: 567, rating: 4.7, emoji: '🐍', category: 'Cursos', badge: 'Trending' },
  { id: '10', title: 'Asset Pack Game Dev Pro', price: 77, oldPrice: 177, sales: 345, rating: 4.6, emoji: '🎮', category: 'Jogos', badge: 'Novo' },
  { id: '11', title: 'E-book Financas Pessoais', price: 22, oldPrice: 57, sales: 2345, rating: 4.3, emoji: '💰', category: 'E-books', badge: 'Popular' },
  { id: '12', title: 'Plugin SEO WordPress', price: 87, oldPrice: 187, sales: 678, rating: 4.8, emoji: '🔍', category: 'Software', badge: 'Boost' },
  { id: '13', title: 'Curso Fotografia Mobile', price: 67, oldPrice: 147, sales: 890, rating: 4.5, emoji: '📸', category: 'Cursos', badge: 'Novo' },
  { id: '14', title: 'Template Landing Page', price: 37, oldPrice: 87, sales: 1234, rating: 4.6, emoji: '🖥️', category: 'Templates', badge: 'Mais Vendido' },
  { id: '15', title: 'E-book Produtividade', price: 17, oldPrice: 47, sales: 4567, rating: 4.4, emoji: '⏰', category: 'E-books', badge: 'Popular' },
  { id: '16', title: 'Software Editor Video', price: 147, oldPrice: 347, sales: 345, rating: 4.7, emoji: '🎬', category: 'Software', badge: 'Premium' },
]

const CATEGORIES = ['Todas', 'Cursos', 'Software', 'Templates', 'E-books', 'Design', 'Jogos']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todas')
  const [sort, setSort] = useState('relevance')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = ALL_PRODUCTS.filter(p => {
    if (category !== 'Todas' && p.category !== category) return false
    if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'rating') return b.rating - a.rating
    if (sort === 'sales') return b.sales - a.sales
    return 0
  })

  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar produtos..." autoFocus
              className="w-full h-12 pl-12 pr-4 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="h-12 px-4 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl outline-none text-zinc-700 dark:text-zinc-300"
            >
              <option value="relevance">Relevancia</option>
              <option value="price_asc">Menor Preco</option>
              <option value="price_desc">Maior Preco</option>
              <option value="rating">Melhor Avaliacao</option>
              <option value="sales">Mais Vendidos</option>
            </select>
            <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <button onClick={() => setView('grid')} className={`p-3 ${view === 'grid' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-3 ${view === 'list' ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-400 mb-4">{filtered.length} resultados encontrados</p>

        {/* Results */}
        {view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((p, i) => (
              <motion.a
                key={p.id} href={`/product/${p.id}`}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02, y: -2 }}
                viewport={{ once: true }} transition={{ delay: i * 0.02 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 hover:shadow-lg transition-all group"
              >
                <span className="text-3xl block mb-2">{p.emoji}</span>
                <span className="text-[10px] text-zinc-400 uppercase">{p.category}</span>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mt-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">{p.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-zinc-500">{p.rating}</span>
                  <span className="text-xs text-zinc-400 ml-1">({p.sales})</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">R$ {p.price.toFixed(2)}</span>
                  {p.oldPrice && <span className="text-xs text-zinc-400 line-through">R$ {p.oldPrice.toFixed(2)}</span>}
                </div>
                <div className="mt-1 text-[10px] font-bold text-green-600">{p.badge}</div>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p, i) => (
              <motion.a
                key={p.id} href={`/product/${p.id}`}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-zinc-400 uppercase">{p.category}</span>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-zinc-500">{p.rating}</span>
                    <span className="text-xs text-zinc-400">{p.sales} vendas</span>
                    <span className="text-[10px] font-bold text-green-600">{p.badge}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">R$ {p.price.toFixed(2)}</p>
                  {p.oldPrice && <p className="text-xs text-zinc-400 line-through">R$ {p.oldPrice.toFixed(2)}</p>}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
