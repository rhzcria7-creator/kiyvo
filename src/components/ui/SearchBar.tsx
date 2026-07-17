// ─────────────────────────────────────────────────────────────
// SearchBar — Busca real via API /api/search
// Zero mock — debounce com FTS no Supabase
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatBRL } from '@/domain/fees/FeeEngine'

interface SearchResult {
  id: string
  title: string
  slug: string
  base_price: number
  category: string
  image: string
  type: string
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=5`)
      if (res.ok) {
        const data = await res.json()
        const searchData = data.data || data
        setResults((searchData.products || []).slice(0, 5))
      }
    } catch {
      // Erro silencioso
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  return (
    <div className="relative w-full max-w-xl">
      <div className={`relative flex items-center transition-all duration-300 ${focused ? 'scale-[1.02]' : ''}`}>
        <Search size={18} className="absolute left-3.5 text-surface-400" />
        <input
          type="text"
          placeholder="Buscar jogos, software, cursos, e-books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="input-base pl-10 pr-10 bg-surface-50/80 dark:bg-surface-800/50"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]) }}
            className="absolute right-3.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {focused && (results.length > 0 || searching) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-surface-900 rounded-xl shadow-elevated border border-surface-100 dark:border-surface-800 overflow-hidden z-50"
          >
            {searching ? (
              <div className="px-4 py-3 text-sm text-surface-400">Buscando...</div>
            ) : (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-sm overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{product.title}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{product.category} • {formatBRL(product.base_price)}</p>
                  </div>
                </Link>
              ))
            )}
            {results.length > 0 && (
              <Link
                href={`/buscar?q=${encodeURIComponent(query)}`}
                className="flex items-center justify-center px-4 py-3 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors border-t border-surface-100 dark:border-surface-800"
              >
                Ver todos os resultados
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
