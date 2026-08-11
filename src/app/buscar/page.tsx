'use client'
// /buscar — página pública de busca de produtos avançada
// Design de Luxo: Minimalista, tons terrosos e azul, cantos super arredondados, animações fluidas
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search as SearchIcon, Loader2, X, SlidersHorizontal, Star,
  DollarSign, Check, RotateCcw, ShieldCheck, Zap, Sparkles
} from 'lucide-react'
import { ProductGrid, type Product } from '@/components/ProductCard'
import { usePublicQuery } from '@/hooks/usePublicQuery'
import { mergeUserProducts } from '@/components/home/MergedProducts'

export default function BuscarPage() {
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('')
  const [ordem, setOrdem] = useState('recentes')
  const [debouncedQ, setDebouncedQ] = useState('')

  // Filtros avançados adicionais
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [minRating, setMinRating] = useState<number>(0)
  const [entrega, setEntrega] = useState<string>('all') // 'all' | 'auto'

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  // Limpar todos os filtros
  const resetFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
    setEntrega('all')
    setCategoria('')
    setOrdem('recentes')
    setQ('')
  }

  const url = useMemo(() => {
    const usp = new URLSearchParams()
    if (debouncedQ) usp.set('q', debouncedQ)
    if (categoria) usp.set('categoria', categoria)
    if (minPrice) usp.set('min_price', minPrice)
    if (maxPrice) usp.set('max_price', maxPrice)
    if (minRating > 0) usp.set('min_rating', minRating.toString())
    if (entrega !== 'all') usp.set('entrega', entrega)
    usp.set('ordenar', ordem)
    usp.set('limit', '48')
    return `/api/v1/products?${usp.toString()}`
  }, [debouncedQ, categoria, minPrice, maxPrice, minRating, entrega, ordem])

  const { data, loading } = usePublicQuery<Product[]>(url, { deps: [url] })
  const produtos = mergeUserProducts(data || [])

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
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#070A13] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">

        {/* Título luxuoso */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-8 bg-earth-500 rounded-full" />
            <p className="text-[11px] font-black uppercase tracking-widest text-earth-600 dark:text-brand-300">Catálogo Exclusivo</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-earth-900 dark:text-white tracking-tight leading-[1.1]">
            Explorar <span className="text-transparent bg-clip-text bg-gradient-to-r from-earth-600 via-earth-500 to-brand-500">Produtos Digitais</span>
          </h1>
          <p className="text-sm text-earth-700/80 dark:text-[#F3ECE0]/60 mt-2 max-w-2xl font-medium">
            Encontre os melhores infoprodutos, licenças, templates e scripts premium com entrega 100% garantida pela nossa custódia segura.
          </p>
        </motion.div>

        {/* Barra de busca principal */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 items-start">

          {/* Lado Esquerdo: Busca, Categorias e Grid de Produtos */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0E1321] rounded-[2rem] p-4 border border-earth-100 dark:border-white/5 flex gap-3 items-center shadow-xl shadow-earth-900/5 dark:shadow-none">
              <SearchIcon className="w-5 h-5 text-earth-400 dark:text-brand-400 flex-shrink-0" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Busque por cursos, templates premium, segredos..."
                className="flex-1 bg-transparent outline-none text-earth-900 dark:text-white placeholder:text-earth-300 dark:placeholder:text-[#F3ECE0]/30 font-bold text-sm sm:text-base"
                autoFocus
              />
              {q && (
                <button onClick={() => setQ('')} className="text-earth-400 hover:text-earth-700 dark:hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all ${
                  showFilters || minPrice || maxPrice || minRating > 0 || entrega !== 'all'
                    ? 'bg-earth-600 text-white shadow-md'
                    : 'bg-earth-50 dark:bg-white/5 text-earth-700 dark:text-[#F3ECE0]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            </div>

            {/* Categorias em Tags Premium */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categorias.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoria(c.id)}
                  className={`px-4 py-2 text-xs font-black rounded-full whitespace-nowrap transition-all duration-300 ${
                    categoria === c.id
                      ? 'bg-earth-700 dark:bg-brand-500 text-white shadow-lg shadow-earth-700/20'
                      : 'bg-white dark:bg-[#0E1321] text-earth-700 dark:text-[#F3ECE0]/70 border border-earth-100/70 dark:border-white/5 hover:border-earth-300 dark:hover:border-white/10'
                  }`}
                >
                  {c.nome}
                </button>
              ))}
            </div>

            {/* Grid de Produtos ou Estado Vazio */}
            <div className="mt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-earth-400">
                  <Loader2 className="w-8 h-8 animate-spin text-earth-600 dark:text-brand-500" />
                  <span className="text-sm font-black uppercase tracking-widest">Acessando banco de dados...</span>
                </div>
              ) : produtos.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-[#0E1321] rounded-[2rem] p-12 text-center border border-earth-100 dark:border-white/5 shadow-xl shadow-earth-900/5"
                >
                  <p className="text-earth-500 dark:text-[#F3ECE0]/50 mb-4 font-bold text-lg">Nenhum produto de luxo encontrado com os filtros atuais.</p>
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 bg-earth-700 dark:bg-brand-600 hover:bg-earth-800 text-white rounded-full px-6 py-3 font-black text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" /> Resetar Busca
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-xs font-black uppercase tracking-widest text-earth-500 dark:text-brand-300">
                      {produtos.length} item{produtos.length !== 1 ? 'ns' : ''} localizado{produtos.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-earth-400 font-bold hidden sm:inline">Ordenar:</span>
                      <select
                        value={ordem}
                        onChange={(e) => setOrdem(e.target.value)}
                        className="text-xs font-black px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1321] text-earth-700 dark:text-[#F3ECE0] border border-earth-100 dark:border-white/10 outline-none cursor-pointer focus:border-earth-400"
                      >
                        <option value="destaque">Destaques da semana</option>
                        <option value="recentes">Lançamentos recentes</option>
                        <option value="vendidos">Mais vendidos</option>
                        <option value="rating">Melhor avaliados</option>
                        <option value="preco_asc">Menor preço</option>
                        <option value="preco_desc">Maior preço</option>
                      </select>
                    </div>
                  </div>
                  <ProductGrid produtos={produtos} />
                </>
              )}
            </div>
          </div>

          {/* Lado Direito: Filtros Avançados Expandidos/Estáticos */}
          <aside className={`lg:sticky lg:top-24 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-[#0E1321] rounded-[2rem] p-6 border border-earth-100 dark:border-white/5 shadow-xl shadow-earth-900/5">

              <div className="flex items-center justify-between pb-4 border-b border-earth-50 dark:border-white/10 mb-5">
                <h2 className="font-black text-earth-900 dark:text-white text-base uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-earth-600" />
                  Filtros Refinados
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-black uppercase tracking-widest text-earth-400 hover:text-earth-700 flex items-center gap-1 transition"
                  title="Limpar todos os filtros"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Resetar
                </button>
              </div>

              {/* Faixa de Preço */}
              <div className="space-y-3 mb-6">
                <label className="block text-[11px] font-black uppercase tracking-widest text-earth-500 dark:text-brand-300">
                  Faixa de Preço (R$)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-earth-400">Min</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full bg-earth-50 dark:bg-[#070A13] text-sm font-bold text-earth-950 dark:text-white rounded-xl pl-10 pr-3 py-2.5 border border-transparent focus:border-earth-400 outline-none transition"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-earth-400">Máx</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="999+"
                      className="w-full bg-earth-50 dark:bg-[#070A13] text-sm font-bold text-earth-950 dark:text-white rounded-xl pl-10 pr-3 py-2.5 border border-transparent focus:border-earth-400 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Avaliação Mínima */}
              <div className="space-y-3 mb-6">
                <label className="block text-[11px] font-black uppercase tracking-widest text-earth-500 dark:text-brand-300">
                  Avaliação do Produtor
                </label>
                <div className="flex flex-col gap-1.5">
                  {[0, 4, 4.5].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      type="button"
                      onClick={() => setMinRating(ratingVal)}
                      className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        minRating === ratingVal
                          ? 'bg-earth-100 dark:bg-brand-500/20 text-earth-900 dark:text-brand-400'
                          : 'hover:bg-earth-50 dark:hover:bg-white/5 text-earth-700 dark:text-[#F3ECE0]/70'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Star className={`w-4 h-4 ${minRating === ratingVal ? 'fill-amber-400 text-amber-400' : 'text-earth-300'}`} />
                        {ratingVal === 0 ? 'Qualquer avaliação' : `${ratingVal.toFixed(1)}+ Estrelas`}
                      </span>
                      {minRating === ratingVal && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Entrega */}
              <div className="space-y-3">
                <label className="block text-[11px] font-black uppercase tracking-widest text-earth-500 dark:text-brand-300">
                  Método de Entrega
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'all', nome: 'Todos os produtos' },
                    { id: 'auto', nome: 'Entrega Automática instantânea', badge: 'Recomendado' },
                  ].map((ent) => (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => setEntrega(ent.id)}
                      className={`flex flex-col items-start px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        entrega === ent.id
                          ? 'border-earth-300 bg-earth-50 dark:bg-brand-500/10 text-earth-900 dark:text-white'
                          : 'border-transparent hover:bg-earth-50 dark:hover:bg-white/5 text-earth-600 dark:text-[#F3ECE0]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{ent.nome}</span>
                        {entrega === ent.id && <Check className="w-3.5 h-3.5 text-earth-600 dark:text-brand-400 shrink-0" />}
                      </div>
                      {ent.badge && (
                        <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full mt-1.5">
                          {ent.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selo de Garantia da Custódia */}
              <div className="mt-8 bg-earth-50/50 dark:bg-white/5 rounded-2xl p-4 border border-earth-100/50 dark:border-white/5">
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-5 h-5 text-earth-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-earth-900 dark:text-white uppercase tracking-wider">Custódia Protegida</h4>
                    <p className="text-[10px] text-earth-600 dark:text-[#F3ECE0]/50 mt-1 leading-relaxed">
                      Seu dinheiro fica em custódia segura até que você confirme o recebimento do produto digital comprado. Compre tranquilo.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
