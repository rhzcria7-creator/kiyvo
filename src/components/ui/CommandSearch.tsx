'use client'
// CommandSearch — busca instantânea com ⌘K / Ctrl+K + clique no ícone de busca do header.
// Dropdown com produtos, lojas, sugestões, histórico. Mobile-friendly.
// Comentários em PT-BR.
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, Package, Store, Sparkles, Clock, TrendingUp, ArrowRight,
} from 'lucide-react'
import { quickSearch, getSearchHistory, addSearchHistory, clearSearchHistory, getTrending } from '@/lib/search/quickSearch'

export function CommandSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Atalho teclado: Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setHistory(getSearchHistory())
      setTimeout(() => inputRef.current?.focus(), 60)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const t = setTimeout(() => document.addEventListener('click', onClick), 0)
    return () => { clearTimeout(t); document.removeEventListener('click', onClick) }
  }, [open])

  const results = useMemo(() => {
    if (!query.trim()) return null
    return quickSearch(query, 6)
  }, [query])

  const trending = useMemo(() => getTrending(5), [])

  function ir(term: string) {
    const t = term.trim()
    if (!t) return
    addSearchHistory(t)
    setOpen(false)
    setQuery('')
    router.push(`/buscar?q=${encodeURIComponent(t)}`)
  }

  function irProduto(slug: string) {
    if (query.trim()) addSearchHistory(query.trim())
    setOpen(false); setQuery('')
    router.push(`/p/${slug}`)
  }

  function irLoja(handle: string) {
    setOpen(false); setQuery('')
    router.push(`/loja/${handle.replace('@','')}`)
  }

  return (
    <>
      {/* Botão de busca no header (abre o painel) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className="group w-10 h-10 rounded-full flex items-center justify-center text-[#475569] dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition"
      >
        <Search size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed left-1/2 top-[10vh] md:top-[15vh] -translate-x-1/2 w-[95vw] max-w-2xl z-[90] bg-white dark:bg-[#0F172A] rounded-[1.5rem] shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
            >
              {/* Input */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && query.trim()) ir(query)
                  }}
                  placeholder="Busque produtos, lojas, categorias..."
                  className="flex-1 bg-transparent outline-none text-base text-[#0F172A] dark:text-white placeholder-slate-400"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                  <span className="text-xs">⌘</span>K
                </kbd>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {!results ? (
                  <div className="p-3">
                    {history.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Recentes</p>
                          <button onClick={() => { clearSearchHistory(); setHistory([]) }} className="text-[10px] font-bold text-slate-400 hover:text-red-500">Limpar</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {history.map(h => (
                            <button key={h} onClick={() => ir(h)}
                              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-300 transition">
                              {h}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Em alta
                      </p>
                      <div>
                        {trending.map(p => (
                          <button key={p.id} onClick={() => irProduto(p.slug)}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center text-lg flex-shrink-0`}>
                              {p.emoji || '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#0F172A] dark:text-white truncate">{p.titulo}</p>
                              <p className="text-[10px] text-slate-500 capitalize">{p.categoria}</p>
                            </div>
                            <p className="font-black text-sm text-brand-600 dark:text-brand-400 flex-shrink-0">R${p.preco.toFixed(2).replace('.',',')}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {results.produtos.length === 0 && results.lojas.length === 0 && results.sugestoes.length === 0 && (
                      <div className="py-8 text-center">
                        <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-500">Nada encontrado para "{query}"</p>
                        <button onClick={() => ir(query)} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-600">
                          Ver todos resultados <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {results.lojas.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 flex items-center gap-1"><Store className="w-3 h-3" /> Lojas</p>
                        {results.lojas.map(l => (
                          <button key={l.id} onClick={() => irLoja(l.handle)}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${l.color} flex items-center justify-center text-xl flex-shrink-0`}>
                              {l.logo}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-1.5 truncate">
                                {l.name}
                                {l.verified && <span className="text-emerald-500">✓</span>}
                              </p>
                              <p className="text-[10px] text-slate-500 capitalize">{l.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {results.produtos.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 flex items-center gap-1"><Package className="w-3 h-3" /> Produtos</p>
                        {results.produtos.map(p => (
                          <button key={p.id} onClick={() => irProduto(p.slug)}
                            className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-left transition">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${p.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center text-lg flex-shrink-0`}>
                              {p.emoji || '📦'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#0F172A] dark:text-white truncate">{p.titulo}</p>
                              <p className="text-[10px] text-slate-500">por {p.vendedor_nome} · {p.categoria}</p>
                            </div>
                            <p className="font-black text-sm text-brand-600 dark:text-brand-400 flex-shrink-0">
                              R${p.preco.toFixed(2).replace('.',',')}
                              {p.preco_de && p.preco_de > p.preco && (
                                <span className="ml-1 text-[9px] text-red-500 line-through font-normal">R${p.preco_de.toFixed(2).replace('.',',')}</span>
                              )}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {results.sugestoes.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1">Sugestões</p>
                        <div className="flex flex-wrap gap-1.5 px-2">
                          {results.sugestoes.map(s => (
                            <button key={s} onClick={() => ir(s)}
                              className="px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-500/20 transition capitalize">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => ir(query)}
                      className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-black font-black text-sm hover:opacity-90 transition">
                      Ver todos resultados para "{query}" <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1"><kbd className="border border-slate-300 dark:border-slate-700 px-1 rounded">Enter</kbd> buscar</span>
                  <span className="hidden sm:inline-flex items-center gap-1"><kbd className="border border-slate-300 dark:border-slate-700 px-1 rounded">Esc</kbd> fechar</span>
                </span>
                <Link href="/buscar" onClick={() => setOpen(false)} className="hover:text-brand-500">Busca avançada →</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
