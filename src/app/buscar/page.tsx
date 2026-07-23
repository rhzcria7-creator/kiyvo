'use client'
// /buscar — página pública de busca de produtos
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search as SearchIcon, Loader2, X, SlidersHorizontal } from 'lucide-react'
import { ProductGrid, type Product } from '@/components/ProductCard'
import { usePublicQuery } from '@/hooks/usePublicQuery'

export default function BuscarPage() {
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('')
  const [ordem, setOrdem] = useState('recentes')
  const [debouncedQ, setDebouncedQ] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 400)
    return () => clearTimeout(t)
  }, [q])

  const url = useMemo(() => {
    const usp = new URLSearchParams()
    if (debouncedQ) usp.set('q', debouncedQ)
    if (categoria) usp.set('categoria', categoria)
    usp.set('ordenar', ordem)
    usp.set('limit', '48')
    return `/api/v1/products?${usp.toString()}`
  }, [debouncedQ, categoria, ordem])

  const { data, loading } = usePublicQuery<Product[]>(url, { deps: [url] })
  const produtos = data || []

  const categorias = [
    { id: '', nome: 'Todas' },
    { id: 'marketing', nome: 'Marketing Digital' },
    { id: 'curso', nome: 'Cursos' },
    { id: 'templates', nome: 'Templates' },
    { id: 'ebooks', nome: 'E-books' },
    { id: 'software', nome: 'Software / Plugins' },
    { id: 'mentoria', nome: 'Mentorias' },
    { id: 'planilhas', nome: 'Planilhas' },
    { id: 'design', nome: 'Design' },
  ]

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white mb-6">
            Buscar produtos
          </h1>

          <div className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-4 border border-slate-100 dark:border-slate-800 flex gap-3 items-center sticky top-20 z-10">
            <SearchIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busque por cursos, templates, plugins..."
              className="flex-1 bg-transparent outline-none text-[#0F172A] dark:text-white placeholder:text-slate-400 font-medium"
              autoFocus
            />
            {q && (
              <button onClick={() => setQ('')} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            {categorias.map((c) => (
              <button key={c.id} onClick={() => setCategoria(c.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition ${
                  categoria === c.id
                    ? 'bg-[#0F172A] dark:bg-white text-white dark:text-black'
                    : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}>{c.nome}</button>
            ))}
            <select value={ordem} onChange={(e) => setOrdem(e.target.value)}
              className="ml-auto text-xs font-bold px-3.5 py-1.5 rounded-full bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 outline-none">
              <option value="recentes">Mais recentes</option>
              <option value="vendidos">Mais vendidos</option>
              <option value="rating">Melhor avaliados</option>
              <option value="preco_asc">Menor preço</option>
              <option value="preco_desc">Maior preço</option>
            </select>
          </div>
        </motion.div>

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-semibold">Buscando...</span>
            </div>
          ) : produtos.length === 0 ? (
            <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-12 text-center border border-slate-100 dark:border-slate-800">
              <p className="text-slate-500 mb-4">Nenhum produto encontrado. Tente outra busca ou <Link href="/vender" className="text-brand-600 font-bold">seja o primeiro a vender</Link>.</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">{produtos.length} produto{produtos.length !== 1 ? 's' : ''} encontrado{produtos.length !== 1 ? 's' : ''}</p>
              <ProductGrid produtos={produtos} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
