'use client'
// Página do Carrinho — funciona 100% com localStorage (sem login)
// Mostra itens, qtd, totais, cupom simplificado e checkout.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart,
  Tag, Sparkles, Shield, CreditCard, Package, TrendingUp, Heart,
} from 'lucide-react'
import { useCart } from '@/lib/cart/store'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { toast } from 'react-hot-toast'

// Cupons simples
const COUPONS: Record<string, { pct: number; label: string }> = {
  BEMVINDO10: { pct: 0.1, label: '10% OFF primeira compra' },
  BLACKFRIDAY: { pct: 0.2, label: '20% OFF Black Friday' },
  PRIMEIRACOMPRA: { pct: 0.15, label: '15% OFF primeira compra' },
  KIYVO5: { pct: 0.05, label: '5% OFF' },
}

export default function CarrinhoPage() {
  const router = useRouter()
  const { items, loaded, remove, setQty, clear, add } = useCart()
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; pct: number; label: string } | null>(null)
  const [client, setClient] = useState(false)

  useEffect(() => setClient(true), [])

  if (!client || !loaded) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center">
          <div className="text-slate-400">Carregando...</div>
        </main>
      </>
    )
  }

  const subtotal = items.reduce((acc, i) => acc + (i.preco_de || i.preco) * i.qty, 0)
  const comDesconto = items.reduce((acc, i) => acc + i.preco * i.qty, 0)
  const descontoProdutos = Math.max(0, subtotal - comDesconto)
  const descontoCupom = appliedCoupon ? comDesconto * appliedCoupon.pct : 0
  const total = comDesconto - descontoCupom
  const totalPix = total * 0.95
  const economiaTotal = descontoProdutos + descontoCupom + (total - totalPix)
  const totalItens = items.reduce((acc, i) => acc + i.qty, 0)

  const aplicarCupom = () => {
    const code = coupon.trim().toUpperCase()
    if (!code) return
    if (COUPONS[code]) {
      setAppliedCoupon({ code, pct: COUPONS[code].pct, label: COUPONS[code].label })
      toast.success(`Cupom ${code} aplicado: ${COUPONS[code].label}`)
      setCoupon('')
    } else {
      toast.error('Cupom inválido ou expirado')
    }
  }

  const finalizarCompra = () => {
    if (items.length === 0) return
    const params = new URLSearchParams()
    params.set('fromCart', '1')
    params.set('total', totalPix.toFixed(2))
    params.set('items', totalItens.toString())
    params.set('produtoNome', `${totalItens} produto(s)`)
    params.set('preco', totalPix.toFixed(2))
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-brand-600" />
              Meu carrinho
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {items.length === 0
                ? 'Seu carrinho está vazio. Que tal escolher algo?'
                : `${totalItens} ${totalItens === 1 ? 'item' : 'itens'} no carrinho · finalize para garantir.`}
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 sm:p-14 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 mx-auto rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-6"
              >
                <ShoppingBag className="w-12 h-12 text-brand-500" />
              </motion.div>
              <h2 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Carrinho vazio</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Explore produtos digitais, chaves, cursos, templates, streaming e mais. Adicione ao carrinho clicando em Comprar.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/buscar" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-7 py-3.5 font-bold shadow-lg hover:scale-[1.02] transition pulse-glow">
                  <Sparkles className="w-4 h-4" /> Ver produtos
                </Link>
                <Link href="/favoritos" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#0F172A] dark:text-white rounded-full px-7 py-3.5 font-bold">
                  <Heart className="w-4 h-4 text-red-500" /> Meus favoritos
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-[1fr,380px] gap-6">
              {/* Itens */}
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item, i) => {
                    const href = `/p/${item.slug || item.id}`
                    const precoUnit = item.preco
                    const precoOriginal = item.preco_de && item.preco_de > item.preco ? item.preco_de : null
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, scale: 0.9 }}
                        transition={{ delay: Math.min(i * 0.04, 0.3) }}
                        className="bg-white dark:bg-[#111827] rounded-[1.25rem] sm:rounded-2xl border border-slate-100 dark:border-slate-800 p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                      >
                        <Link href={href} className="shrink-0">
                          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br ${item.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center text-3xl sm:text-4xl shadow-md`}>
                            {item.emoji || '✨'}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={href} className="group">
                            <h3 className="font-black text-sm sm:text-base text-[#0F172A] dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {item.titulo}
                            </h3>
                          </Link>
                          {item.vendedor_nome && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              por {item.vendedor_nome}
                            </p>
                          )}
                          <div className="flex items-end justify-between gap-2 mt-2 sm:mt-3">
                            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full">
                              <button
                                onClick={() => setQty(item.id, item.qty - 1)}
                                disabled={item.qty <= 1}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600 disabled:opacity-30 transition"
                                aria-label="Diminuir"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-black text-sm text-[#0F172A] dark:text-white">{item.qty}</span>
                              <button
                                onClick={() => setQty(item.id, item.qty + 1)}
                                disabled={item.qty >= 99}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600 disabled:opacity-30 transition"
                                aria-label="Aumentar"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white leading-none">
                                R$ {(precoUnit * item.qty).toFixed(2).replace('.', ',')}
                              </div>
                              {precoOriginal && (
                                <div className="text-[10px] sm:text-xs text-slate-400 line-through">
                                  R$ {(precoOriginal * item.qty).toFixed(2).replace('.', ',')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => { remove(item.id); toast.success('Item removido do carrinho') }}
                          className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 text-slate-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center shrink-0 transition"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-3">
                  <button
                    onClick={() => {
                      if (confirm('Limpar carrinho?')) { clear(); toast.success('Carrinho limpo') }
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-red-500 py-2"
                  >
                    Limpar carrinho
                  </button>
                  <Link href="/buscar" className="text-xs font-bold text-brand-600 hover:underline inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Continuar comprando
                  </Link>
                </div>
              </div>

              {/* Resumo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:sticky lg:top-24 self-start bg-white dark:bg-[#111827] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-6"
              >
                <h3 className="font-black text-lg text-[#0F172A] dark:text-white flex items-center gap-2 mb-5">
                  <Tag className="w-5 h-5 text-brand-500" /> Resumo do pedido
                </h3>

                {/* Cupom */}
                <div className="mb-4">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                    Cupom de desconto
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 truncate">{appliedCoupon.label}</p>
                      </div>
                      <button
                        onClick={() => { setAppliedCoupon(null); toast('Cupom removido', { icon: '🔄' }) }}
                        className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && aplicarCupom()}
                        placeholder="Digite o cupom"
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10 text-sm font-bold outline-none focus:border-brand-500"
                      />
                      <button
                        onClick={aplicarCupom}
                        className="px-4 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-black text-sm font-black hover:scale-[1.02] transition"
                      >
                        OK
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1.5">Cupons: BEMVINDO10, BLACKFRIDAY, PRIMEIRACOMPRA</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal ({totalItens} {totalItens === 1 ? 'item' : 'itens'})</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {descontoProdutos > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <span>Desconto de produtos</span>
                      <span>-R$ {descontoProdutos.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <span>Cupom {appliedCoupon.code}</span>
                      <span>-R$ {descontoCupom.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Total no cartão</span>
                    <span className="font-black text-[#0F172A] dark:text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">À vista no PIX</p>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-none">R$ {totalPix.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-1 rounded-full">
                      -5%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ou até 12x de R$ {(total / 12).toFixed(2).replace('.', ',')} sem juros
                  </p>
                  {economiaTotal > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Você está economizando R$ {economiaTotal.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={finalizarCompra}
                  className="w-full mt-5 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full py-4 font-black text-base flex items-center justify-center gap-2 hover:bg-brand-600 dark:hover:bg-brand-400 dark:hover:text-white transition shadow-xl shadow-brand-500/20 pulse-glow"
                >
                  Finalizar compra <ArrowRight className="w-5 h-5" />
                </motion.button>

                {/* Selos */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: Shield, label: 'Pagamento seguro' },
                    { icon: Package, label: 'Entrega automática' },
                    { icon: CreditCard, label: 'PIX, cartão, boleto' },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1 p-2">
                      <s.icon className="w-4 h-4 text-brand-500" />
                      <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
