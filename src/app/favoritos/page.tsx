'use client'
// Página de Favoritos — funciona com localStorage (sem login)
// Mostra os produtos salvos com preço, permite remover, e comprar direto.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingCart, Trash2, ArrowRight, Sparkles, Package, Search } from 'lucide-react'
import { useFavorites } from '@/lib/favorites/store'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function FavoritosPage() {
  const { items, loaded, remove, clear } = useFavorites()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => setIsClient(true), [])

  const total = items.reduce((acc, p) => acc + (p.preco || 0), 0)
  const totalPix = total * 0.95

  if (!isClient || !loaded) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center">
          <div className="text-slate-400">Carregando...</div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 md:w-10 md:h-10 text-red-500 fill-red-500" />
              Meus favoritos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {items.length === 0
                ? 'Você ainda não tem nenhum produto salvo. Explore o catálogo!'
                : `${items.length} ${items.length === 1 ? 'produto salvo' : 'produtos salvos'} · não perca os preços.`}
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-5">
                <Heart className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Nenhum favorito ainda</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Toque no coração dos produtos que você gostou para salvar aqui. Não perca uma oferta.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/buscar"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-7 py-3.5 font-bold shadow-lg hover:scale-[1.02] transition"
                >
                  <Search className="w-4 h-4" /> Explorar produtos
                </Link>
                <Link
                  href="/ofertas"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#0F172A] dark:text-white rounded-full px-7 py-3.5 font-bold"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" /> Ver ofertas
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-[1fr,320px] gap-6">
              {/* Lista de favoritos */}
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((p, i) => {
                    const precoPix = p.preco * 0.95
                    const href = `/p/${p.slug || p.id}`
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }}
                        transition={{ delay: Math.min(i * 0.05, 0.3) }}
                        className="bg-white dark:bg-[#111827] rounded-[1.25rem] sm:rounded-2xl border border-slate-100 dark:border-slate-800 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-lg transition-shadow"
                      >
                        <Link href={href} className="shrink-0">
                          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br ${p.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center text-3xl sm:text-4xl shadow-md`}>
                            {p.emoji || '✨'}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={href} className="group">
                            <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {p.titulo}
                            </h3>
                          </Link>
                          {p.vendedor_nome && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              por {p.vendedor_nome}
                            </p>
                          )}
                          {p.preco_de && p.preco_de > p.preco && (
                            <span className="inline-block mt-1 text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-full">
                              -{Math.round((1 - p.preco / p.preco_de) * 100)}%
                            </span>
                          )}
                          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
                            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">
                              R$ {precoPix.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">no PIX</span>
                            {p.preco_de && p.preco_de > p.preco && (
                              <span className="text-xs text-slate-400 line-through">
                                R$ {p.preco_de.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              const params = new URLSearchParams({
                                produtoId: p.id,
                                produtoNome: p.titulo,
                                preco: String(p.preco),
                              })
                              router.push(`/checkout?${params.toString()}`)
                            }}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0F172A] dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-brand-600 dark:hover:bg-brand-400 dark:hover:text-white transition"
                            aria-label="Comprar"
                          >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => remove(p.id)}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:border-red-300 flex items-center justify-center transition"
                            aria-label="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Resumo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:sticky lg:top-24 self-start bg-white dark:bg-[#111827] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5"
              >
                <h3 className="font-black text-lg text-[#0F172A] dark:text-white flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-brand-500" /> Resumo
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{items.length} produto(s)</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Desconto PIX (5%)</span>
                    <span>-R$ {(total - totalPix).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-2" />
                  <div className="flex justify-between text-[#0F172A] dark:text-white">
                    <span className="font-bold">Total no PIX</span>
                    <span className="text-2xl font-black">R$ {totalPix.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ou até 12x sem juros no cartão
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const params = new URLSearchParams()
                    params.set('produtoNome', `${items.length} produto(s) dos favoritos`)
                    params.set('preco', String(totalPix))
                    params.set('fromFav', '1')
                    router.push(`/checkout?${params.toString()}`)
                  }}
                  className="w-full mt-4 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full py-3.5 font-black text-sm flex items-center justify-center gap-2 hover:bg-brand-600 dark:hover:bg-brand-400 dark:hover:text-white transition pulse-glow"
                >
                  Comprar todos <ArrowRight className="w-4 h-4" />
                </motion.button>

                <button
                  onClick={() => {
                    if (confirm('Remover todos os favoritos?')) clear()
                  }}
                  className="w-full mt-2 text-xs font-bold text-slate-400 hover:text-red-500 py-2 transition"
                >
                  Limpar favoritos
                </button>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
