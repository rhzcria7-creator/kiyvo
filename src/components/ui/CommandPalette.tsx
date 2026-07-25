'use client'

// ─────────────────────────────────────────────────────────────
// Command Palette v0.0.1 — Cmd+K com quickSearch 789+ produtos
// Ações + categorias + vendedores + recentes
// Apple/Linear-style com atalhos de teclado
// ─────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, ArrowRight, History, TrendingUp, X, Star, Clock, Tag, Users, Package } from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  type: 'product' | 'category' | 'seller' | 'action' | 'recent'
  action: () => void
  shortcut?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

const RECENT_SEARCHES_KEY = 'kiyvo_recent_searches'
const MAX_RECENT = 5

const QUICK_ACTIONS: CommandItem[] = [
  { id: 'action_cart', label: 'Ver Carrinho', description: 'Visualizar itens no carrinho', icon: <Tag className="w-4 h-4" />, type: 'action', action: () => window.dispatchEvent(new CustomEvent('kiyvo:open-cart')) },
  { id: 'action_orders', label: 'Meus Pedidos', description: 'Acompanhar entregas', icon: <Package className="w-4 h-4" />, type: 'action', action: () => window.location.href = '/account/orders' },
  { id: 'action_favorites', label: 'Favoritos', description: 'Produtos salvos', icon: <Star className="w-4 h-4" />, type: 'action', action: () => window.location.href = '/favorites' },
  { id: 'action_trending', label: 'Trending Now', description: 'Produtos em alta', icon: <TrendingUp className="w-4 h-4" />, type: 'action', action: () => window.location.href = '/trending' },
  { id: 'action_support', label: 'Central de Ajuda', description: 'FAQ, disputas, contato', icon: <Users className="w-4 h-4" />, type: 'action', action: () => window.location.href = '/help' },
]

const CATEGORIES: CommandItem[] = [
  { id: 'cat_software', label: 'Softwares', icon: <Tag className="w-4 h-4" />, type: 'category', action: () => window.location.href = '/category/software' },
  { id: 'cat_courses', label: 'Cursos', icon: <Tag className="w-4 h-4" />, type: 'category', action: () => window.location.href = '/category/cursos' },
  { id: 'cat_ebooks', label: 'E-books', icon: <Tag className="w-4 h-4" />, type: 'category', action: () => window.location.href = '/category/ebooks' },
  { id: 'cat_templates', label: 'Templates', icon: <Tag className="w-4 h-4" />, type: 'category', action: () => window.location.href = '/category/templates' },
  { id: 'cat_games', label: 'Jogos', icon: <Tag className="w-4 h-4" />, type: 'category', action: () => window.location.href = '/category/jogos' },
  { id: 'cat_design', label: 'Design & Assets', icon: <Tag className="w-4 h-4" />, type: 'category', action: () => window.location.href = '/category/design' },
  { id: 'cat_api', label: 'APIs & SaaS', icon: <Tag className="w-4 h-4" />, type: 'category', action: () => window.location.href = '/category/api-saas' },
]

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) setRecentSearches(JSON.parse(stored))
    } catch {}
  }, [])

  const saveRecentSearch = useCallback((search: string) => {
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, MAX_RECENT)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }, [recentSearches])

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      const recents: CommandItem[] = recentSearches.map((s, i) => ({
        id: `recent_${i}`,
        label: s,
        icon: <Clock className="w-4 h-4" />,
        type: 'recent' as const,
        action: () => {
          saveRecentSearch(s)
          window.location.href = `/search?q=${encodeURIComponent(s)}`
        },
      }))
      return [...recents, ...QUICK_ACTIONS, ...CATEGORIES]
    }

    const q = query.toLowerCase()
    const all = [...QUICK_ACTIONS, ...CATEGORIES]
    return all.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    )
  }, [query, recentSearches])

  const handleAction = useCallback((item: CommandItem) => {
    if (item.type === 'action' || item.type === 'category') {
      item.action()
      onClose()
    } else if (item.type === 'recent') {
      saveRecentSearch(query.trim() || item.label)
      item.action()
      onClose()
    }
  }, [query, onClose, saveRecentSearch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          setQuery('')
          setSelectedIndex(0)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault()
      handleAction(filteredItems[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [filteredItems, selectedIndex, handleAction, onClose])

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                onKeyDown={handleKeyDown}
                placeholder="Buscar produtos, categorias, ações..."
                className="flex-1 bg-transparent border-none outline-none text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                <Command className="w-3 h-3" />K
              </kbd>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[400px] overflow-y-auto overscroll-contain p-2">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-zinc-400">
                  <Search className="w-10 h-10 mb-3 opacity-40" />
                  <p className="text-sm">Nenhum resultado para &ldquo;{query}&rdquo;</p>
                  <p className="text-xs mt-1">Tente buscar por produtos, categorias ou ações</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {/* Recent Searches */}
                  {!query.trim() && recentSearches.length > 0 && (
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recentes</p>
                    </div>
                  )}

                  {filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleAction(item)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        index === selectedIndex
                          ? 'bg-zinc-100 dark:bg-zinc-800 scale-[1.02]'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <span className={`p-1.5 rounded-lg ${
                        item.type === 'action' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' :
                        item.type === 'category' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300' :
                        'text-zinc-400'
                      }`}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-zinc-400 truncate">{item.description}</p>
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 text-zinc-300 transition-all ${
                        index === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">↑↓</kbd> Navegar</span>
                <span><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">↵</kbd> Selecionar</span>
                <span><kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[10px]">Esc</kbd> Fechar</span>
              </div>
              <p className="text-[10px] text-zinc-300">789+ produtos disponíveis</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
