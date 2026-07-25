'use client'

// ─────────────────────────────────────────────────────────────
// SearchFilters v0.0.1 — Filtros avançados de busca
// Preço, categoria, rating, delivery, boost, tax-free
// ─────────────────────────────────────────────────────────────

import React, { useCallback } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, RotateCcw, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export interface SearchFiltersState {
  minPrice: string
  maxPrice: string
  minRating: number
  category: string
  deliveryType: string
  hasBoost: boolean
  taxFree: boolean
  sortBy: string
}

interface SearchFiltersProps {
  filters: SearchFiltersState
  onChange: (filters: SearchFiltersState) => void
  categories: Array<{ name: string; count: number }>
  isOpen: boolean
  onToggle: () => void
}

const RATINGS = [5, 4, 3, 2, 1]
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliação' },
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'sales', label: 'Mais Vendidos' },
]

export default function SearchFilters({ filters, onChange, categories, isOpen, onToggle }: SearchFiltersProps) {
  const update = useCallback((key: keyof SearchFiltersState, value: any) => {
    onChange({ ...filters, [key]: value })
  }, [filters, onChange])

  const reset = useCallback(() => {
    onChange({
      minPrice: '',
      maxPrice: '',
      minRating: 0,
      category: '',
      deliveryType: '',
      hasBoost: false,
      taxFree: false,
      sortBy: 'relevance',
    })
  }, [onChange])

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.minRating > 0 ||
    filters.category || filters.deliveryType || filters.hasBoost || filters.taxFree

  return (
    <div className="space-y-4">
      {/* Toggle + Reset */}
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          <ChevronDown className={clsx('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
        </button>
        {hasActiveFilters && (
          <button onClick={reset} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            <RotateCcw className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-5 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800"
        >
          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Ordenar por</label>
            <select
              value={filters.sortBy}
              onChange={e => update('sortBy', e.target.value)}
              className="w-full h-9 px-3 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-zinc-400"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Faixa de Preço</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="R$ min"
                value={filters.minPrice}
                onChange={e => update('minPrice', e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-zinc-400"
                min="0"
              />
              <span className="text-zinc-400">—</span>
              <input
                type="number"
                placeholder="R$ max"
                value={filters.maxPrice}
                onChange={e => update('maxPrice', e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-zinc-400"
                min="0"
              />
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Categorias</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => update('category', filters.category === cat.name ? '' : cat.name)}
                    className={clsx(
                      'px-3 py-1.5 text-xs rounded-full border transition-all',
                      filters.category === cat.name
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    )}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Avaliação Mínima</label>
            <div className="flex gap-1">
              {RATINGS.map(r => (
                <button
                  key={r}
                  onClick={() => update('minRating', filters.minRating === r ? 0 : r)}
                  className={clsx(
                    'px-3 py-1.5 text-xs rounded-full border transition-all',
                    filters.minRating === r
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                  )}
                >
                  {r}+ ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasBoost}
                onChange={e => update('hasBoost', e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              Com Boost 🚀
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.taxFree}
                onChange={e => update('taxFree', e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              Tax Free 🛡️
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.deliveryType === 'instant'}
                onChange={e => update('deliveryType', e.target.checked ? 'instant' : '')}
                className="rounded border-zinc-300 dark:border-zinc-700"
              />
              Entrega Imediata ⚡
            </label>
          </div>
        </motion.div>
      )}
    </div>
  )
}
