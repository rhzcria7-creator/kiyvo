'use client'
// MiniCart — drawer lateral do carrinho acessível do ícone no header.
// Mostra items, total, subtotal, desconto PIX e CTA para checkout.
// Comentários em PT-BR.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Tag, CreditCard,
} from 'lucide-react'
import { useCart } from '@/lib/cart/store'
import { useProtectedAction } from '@/lib/auth/useProtectedAction'
import { toast } from 'react-hot-toast'

interface MiniCartProps {
  open: boolean
  onClose: () => void
}

export function MiniCart({ open, onClose }: MiniCartProps) {
  const router = useRouter()
  const { items, total, remove, setQty, clear } = useCart()
  const { guard } = useProtectedAction()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const totals = total()
  const subtotal = totals.subtotal
  const descontoPix = totals.subtotal * 0.05
  const totalPix = totals.totalPix
  const totalItens = totals.itens

  function irCheckout() {
    guard('checkout', {
      onSuccess: () => {
        onClose()
        if (items.length === 1) {
          const p = items[0]
          const params = new URLSearchParams({
            produtoId: p.id, produtoSlug: p.slug || p.id, produtoNome: p.titulo,
            preco: String(p.preco), qty: String(p.qty), emoji: p.emoji || '✨',
            gradient: p.gradient || 'from-brand-500 to-brand-700',
            categoria: p.categoria || 'digital', vendedor: p.vendedor_nome || 'KIYVO',
          })
          router.push(`/checkout?${params.toString()}`)
        } else {
          router.push('/carrinho')
        }
      },
    })
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[85]"
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0F172A] z-[90] flex flex-col shadow-2xl"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-500" />
                Seu carrinho
                {totalItens > 0 && (
                  <span className="text-xs font-black bg-brand-500 text-white px-2 py-0.5 rounded-full">{totalItens}</span>
                )}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="py-20 text-center">
                  <ShoppingBag className="w-14 h-14 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                  <p className="font-black text-slate-500">Seu carrinho está vazio</p>
                  <p className="text-sm text-slate-400 mt-1 mb-5">Explore produtos e adicione aqui</p>
                  <button onClick={() => { onClose(); router.push('/buscar') }}
                    className="inline-flex items-center gap-1 bg-brand-600 text-white rounded-full px-5 py-2.5 text-sm font-black hover:bg-brand-700">
                    Explorar produtos <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <motion.div key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-slate-800">
                      <Link href={`/p/${item.slug}`} onClick={onClose}
                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center text-3xl flex-shrink-0`}>
                        {item.emoji || '📦'}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/p/${item.slug}`} onClick={onClose}>
                          <p className="font-black text-sm text-[#0F172A] dark:text-white line-clamp-2 leading-tight hover:text-brand-600 dark:hover:text-brand-400">
                            {item.titulo}
                          </p>
                        </Link>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.vendedor_nome}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full">
                            <button onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-black">{item.qty}</span>
                            <button onClick={() => setQty(item.id, item.qty + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-black text-brand-600 dark:text-brand-400 text-sm">
                            R${(item.preco * item.qty).toFixed(2).replace('.',',')}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => remove(item.id)}
                        className="text-slate-400 hover:text-red-500 self-start p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 dark:border-slate-800 p-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span><span>R${subtotal.toFixed(2).replace('.',',')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Desconto PIX (5%)</span>
                    <span>- R${descontoPix.toFixed(2).replace('.',',')}</span>
                  </div>
                  <div className="flex justify-between font-black text-lg text-[#0F172A] dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Total no PIX</span>
                    <span>R${totalPix.toFixed(2).replace('.',',')}</span>
                  </div>
                </div>
                <button onClick={irCheckout}
                  className="w-full bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full py-3.5 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:scale-[1.02] transition">
                  <CreditCard className="w-4 h-4" /> Finalizar compra
                </button>
                <button onClick={() => { onClose(); router.push('/carrinho') }}
                  className="w-full text-center text-xs font-bold text-slate-500 hover:text-brand-600">
                  Ver carrinho completo →
                </button>
                <button onClick={() => { clear(); toast.success('Carrinho limpo') }}
                  className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-red-500">
                  Limpar carrinho
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
