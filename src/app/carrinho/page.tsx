'use client'
// Página do Carrinho Luxuoso — funciona 100% com localStorage (sem login)
// Design de Altíssimo Nível: Tons Terrosos, Azul Escuro, Minimalismo, Cantos Super Arredondados
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart,
  Tag, Sparkles, ShieldCheck, CreditCard, Package, TrendingUp, Heart,
  Lock, ArrowLeft, RefreshCw, HelpCircle
} from 'lucide-react'
import { useCart } from '@/lib/cart/store'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { toast } from 'react-hot-toast'

// Cupons premium
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
        <main className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF7F2] dark:bg-[#070A13]">
          <Loader2 className="w-8 h-8 animate-spin text-earth-600 dark:text-brand-500 mb-3" />
          <div className="text-earth-600 dark:text-brand-300 font-bold uppercase tracking-widest text-xs">Abrindo sacola de compras...</div>
        </main>
        <Footer />
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
      toast.success(`Cupom ${code} aplicado: ${COUPONS[code].label}`, {
        style: { borderRadius: '1rem', background: '#3D291B', color: '#fff' }
      })
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
    params.set('produtoNome', `${totalItens} produto(s) do Carrinho`)
    params.set('preco', totalPix.toFixed(2))
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF7F2] dark:bg-[#070A13] pb-24 pt-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {/* Passo a Passo Visual do Checkout */}
          <div className="flex items-center justify-center gap-2 mb-10 max-w-lg mx-auto text-[11px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-1.5 text-earth-700 dark:text-brand-300">
              <span className="w-5 h-5 rounded-full bg-earth-700 dark:bg-brand-500 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Sacola</span>
            </div>
            <div className="h-px flex-1 bg-earth-200 dark:bg-white/10" />
            <div className="flex items-center gap-1.5 text-earth-400 dark:text-white/40">
              <span className="w-5 h-5 rounded-full bg-earth-200 dark:bg-white/10 text-earth-500 flex items-center justify-center text-[10px]">2</span>
              <span>Identificação</span>
            </div>
            <div className="h-px flex-1 bg-earth-200 dark:bg-white/10" />
            <div className="flex items-center gap-1.5 text-earth-400 dark:text-white/40">
              <span className="w-5 h-5 rounded-full bg-earth-200 dark:bg-white/10 text-earth-500 flex items-center justify-center text-[10px]">3</span>
              <span>Entrega</span>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl md:text-5xl font-black text-earth-900 dark:text-white tracking-tight flex flex-col sm:flex-row items-center gap-3">
              <span className="p-3 bg-earth-100 dark:bg-brand-500/10 rounded-2xl">
                <ShoppingCart className="w-8 h-8 text-earth-700 dark:text-brand-400" />
              </span>
              Sua Sacola de Compras
            </h1>
            <p className="text-earth-600 dark:text-[#F3ECE0]/60 mt-3 text-sm font-medium">
              {items.length === 0
                ? 'Seu carrinho de luxo está aguardando produtos extraordinários.'
                : `Você possui ${totalItens} ${totalItens === 1 ? 'item exclusivo' : 'itens exclusivos'} selecionados.`}
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#0E1321] rounded-[2.5rem] border border-earth-100 dark:border-white/5 p-12 sm:p-20 text-center shadow-xl shadow-earth-900/5"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 mx-auto rounded-full bg-earth-50 dark:bg-brand-500/10 flex items-center justify-center mb-8"
              >
                <ShoppingBag className="w-12 h-12 text-earth-500" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl font-black text-earth-900 dark:text-white tracking-tight mb-3">Sacola vazia</h2>
              <p className="text-earth-600/80 dark:text-[#F3ECE0]/50 mb-8 max-w-md mx-auto text-sm font-medium leading-relaxed">
                Descubra infoprodutos premium, estratégias de tráfego, chaves de licença, e-books e scripts avançados no nosso catálogo.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/buscar" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-earth-700 dark:bg-brand-600 text-white rounded-full px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-earth-800 transition shadow-lg shadow-earth-700/20">
                  <Sparkles className="w-4 h-4" /> Ver produtos premium
                </Link>
                <Link href="/favoritos" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-earth-100 dark:border-white/10 text-earth-700 dark:text-white rounded-full px-8 py-4 font-black text-xs uppercase tracking-widest">
                  <Heart className="w-4 h-4 text-red-500" /> Meus favoritos
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-[1fr,390px] gap-8">

              {/* Itens */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {items.map((item, i) => {
                    const href = `/p/${item.slug || item.id}`
                    const precoUnit = item.preco
                    const precoOriginal = item.preco_de && item.preco_de > item.preco ? item.preco_de : null
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }}
                        transition={{ delay: Math.min(i * 0.05, 0.3) }}
                        className="bg-white dark:bg-[#0E1321] rounded-[2rem] border border-earth-100 dark:border-white/5 p-4 sm:p-5 flex items-center gap-4 sm:gap-6 shadow-md hover:shadow-lg transition-all"
                      >
                        <Link href={href} className="shrink-0">
                          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${item.gradient || 'from-earth-500 to-earth-800'} flex items-center justify-center text-3xl sm:text-4xl shadow-inner`}>
                            {item.emoji || '💎'}
                          </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link href={href} className="group">
                            <h3 className="font-black text-sm sm:text-base text-earth-950 dark:text-white line-clamp-2 group-hover:text-earth-600 dark:group-hover:text-brand-400 transition-colors">
                              {item.titulo}
                            </h3>
                          </Link>
                          {item.vendedor_nome && (
                            <p className="text-[10px] uppercase font-black tracking-wider text-earth-400 dark:text-[#F3ECE0]/40 mt-1">
                              por {item.vendedor_nome}
                            </p>
                          )}

                          <div className="flex items-end justify-between gap-2 mt-3">
                            {/* Controle de Qtd */}
                            <div className="flex items-center border border-earth-100 dark:border-white/10 rounded-full bg-earth-50 dark:bg-transparent">
                              <button
                                onClick={() => setQty(item.id, item.qty - 1)}
                                disabled={item.qty <= 1}
                                className="w-8 h-8 flex items-center justify-center text-earth-600 dark:text-brand-400 hover:text-earth-900 disabled:opacity-30 transition"
                                aria-label="Diminuir quantidade"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-black text-xs text-earth-900 dark:text-white">{item.qty}</span>
                              <button
                                onClick={() => setQty(item.id, item.qty + 1)}
                                disabled={item.qty >= 99}
                                className="w-8 h-8 flex items-center justify-center text-earth-600 dark:text-brand-400 hover:text-earth-900 disabled:opacity-30 transition"
                                aria-label="Aumentar quantidade"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Preços */}
                            <div className="text-right">
                              <div className="text-base sm:text-lg font-black text-earth-950 dark:text-white">
                                R$ {(precoUnit * item.qty).toFixed(2).replace('.', ',')}
                              </div>
                              {precoOriginal && (
                                <div className="text-[10px] sm:text-xs text-earth-300 dark:text-white/40 line-through">
                                  R$ {(precoOriginal * item.qty).toFixed(2).replace('.', ',')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botão Remover */}
                        <button
                          onClick={() => { remove(item.id); toast.success('Produto removido da sua sacola') }}
                          className="w-10 h-10 rounded-full border border-earth-100 dark:border-white/10 text-earth-300 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 dark:hover:bg-red-500/10 flex items-center justify-center shrink-0 transition"
                          aria-label="Remover do carrinho"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => {
                      if (confirm('Deseja realmente limpar toda sua sacola?')) { clear(); toast.success('Sacola limpa com sucesso') }
                    }}
                    className="text-xs font-black uppercase tracking-wider text-earth-400 hover:text-red-500 transition py-2"
                  >
                    Limpar sacola
                  </button>
                  <Link href="/buscar" className="text-xs font-black uppercase tracking-wider text-earth-700 dark:text-brand-300 hover:underline inline-flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Continuar escolhendo
                  </Link>
                </div>
              </div>

              {/* Resumo Financeiro / Checkout Box */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:sticky lg:top-24 self-start bg-white dark:bg-[#0E1321] rounded-[2rem] border border-earth-100 dark:border-white/5 p-6 shadow-xl shadow-earth-900/5"
              >
                <h3 className="font-black text-sm uppercase tracking-widest text-earth-900 dark:text-white flex items-center gap-2 mb-6 pb-4 border-b border-earth-50 dark:border-white/10">
                  <Tag className="w-4.5 h-4.5 text-earth-600" /> Resumo de Valores
                </h3>

                {/* Cupom */}
                <div className="mb-6">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-earth-500 dark:text-brand-300 mb-2">
                    Código de Desconto
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl px-3.5 py-2.5 animate-fade-up">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-400">{appliedCoupon.code}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 truncate font-semibold">{appliedCoupon.label}</p>
                      </div>
                      <button
                        onClick={() => { setAppliedCoupon(null); toast('Cupom removido', { icon: '🔄' }) }}
                        className="text-emerald-600 hover:text-emerald-800 text-xs font-black uppercase tracking-wider"
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
                        placeholder="Insira seu cupom (BEMVINDO10)"
                        className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-earth-50 dark:bg-[#070A13] border border-transparent dark:border-white/10 text-xs font-bold outline-none focus:border-earth-300 text-earth-950 dark:text-white"
                      />
                      <button
                        onClick={aplicarCupom}
                        className="px-4 rounded-xl bg-earth-700 dark:bg-brand-600 text-white text-xs font-black hover:bg-earth-800 transition"
                      >
                        OK
                      </button>
                    </div>
                  )}
                  <p className="text-[9px] text-earth-400 mt-2 font-medium">Cupons sugeridos: BEMVINDO10, BLACKFRIDAY, PRIMEIRACOMPRA</p>
                </div>

                <div className="space-y-3.5 text-xs font-bold text-earth-600 dark:text-[#F3ECE0]/80">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItens} {totalItens === 1 ? 'item' : 'itens'})</span>
                    <span className="text-earth-950 dark:text-white">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>

                  {descontoProdutos > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Descontos promocionais</span>
                      <span>-R$ {descontoProdutos.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Cupom {appliedCoupon.code}</span>
                      <span>-R$ {descontoCupom.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm py-2 border-t border-earth-50 dark:border-white/10">
                    <span className="text-earth-900 dark:text-white font-black">Total no Cartão</span>
                    <span className="font-black text-earth-950 dark:text-white text-base">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>

                  {/* PIX Destaque */}
                  <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">À vista no PIX</p>
                      <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 leading-none mt-1">R$ {totalPix.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-md">
                      -5% OFF
                    </span>
                  </div>

                  <p className="text-[11px] text-earth-400 text-center font-medium">
                    ou em até 12x de R$ {(total / 12).toFixed(2).replace('.', ',')} sem juros
                  </p>

                  {economiaTotal > 0 && (
                    <div className="pt-3 mt-1 border-t border-earth-50 dark:border-white/10 text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> Economia Total: R$ {economiaTotal.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </div>

                {/* Botão Finalizar Compra */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={finalizarCompra}
                  className="w-full mt-6 bg-earth-800 hover:bg-earth-900 dark:bg-brand-600 dark:hover:bg-brand-700 text-white rounded-full py-4.5 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-earth-800/15"
                >
                  Finalizar Compra Segura <ArrowRight className="w-4.5 h-4.5" />
                </motion.button>

                {/* Selos de Segurança */}
                <div className="mt-6 pt-5 border-t border-earth-50 dark:border-white/10 grid grid-cols-3 gap-2 text-center">
                  {[
                    { icon: ShieldCheck, label: 'Custódia Segura' },
                    { icon: Package, label: 'Auto Entrega' },
                    { icon: CreditCard, label: 'PIX ou Cartão' },
                  ].map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <s.icon className="w-4.5 h-4.5 text-earth-600 dark:text-brand-400" />
                      <p className="text-[9px] font-black uppercase tracking-wider text-earth-400 dark:text-[#F3ECE0]/40 leading-tight">{s.label}</p>
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

function Loader2({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}
