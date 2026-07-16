'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchProducts } from '@/data/mockProducts'
import Link from 'next/link'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const results = query.length >= 2 ? searchProducts(query).slice(0, 5) : []

  return (
    <div className="relative w-full max-w-xl">
      <div className={`relative flex items-center transition-all duration-300 ${focused ? 'scale-[1.02]' : ''}`}>
        <Search size={18} className="absolute left-3.5 text-surface-400" />
        <input
          type="text"
          placeholder="Buscar jogos, contas, keys..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="input-base pl-10 pr-10 bg-surface-50/80"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-elevated border border-surface-100 overflow-hidden z-50"
          >
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/produto/${product.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center text-sm">
                  🎮
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{product.title}</p>
                  <p className="text-xs text-surface-500">{product.category} • R$ {product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
