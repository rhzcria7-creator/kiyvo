'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, CreditCard, Smartphone, FileText, Coins, Zap, Check, Shield } from 'lucide-react'

const CART_ITEMS = [
  { id: '1', title: 'Curso Marketing Digital 2026', price: 97, qty: 1, author: 'Carlos Silva', thumbnail: '📚', delivery: 'instant' },
  { id: '2', title: 'Template Bootstrap 5 Pro', price: 47, qty: 2, author: 'Ana Design', thumbnail: '🎨', delivery: 'instant' },
]

export default function CartPage() {
  const [items, setItems] = useState(CART_ITEMS)
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pix')

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const pixDiscount = subtotal * 0.05
  const total = paymentMethod === 'pix' ? subtotal - pixDiscount : subtotal

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white mb-8 flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" /> Carrinho ({items.length} itens)
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">
                    {item.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-400">por {item.author}</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white mt-1">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-8 text-center text-sm font-medium text-zinc-900 dark:text-white">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Resumo</h2>

            {/* Coupon */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text" value={coupon} onChange={e => setCoupon(e.target.value)}
                  placeholder="Cupom" className="w-full h-10 pl-10 pr-3 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>
              <button
                onClick={() => setCouponApplied(true)}
                className="h-10 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:opacity-90"
              >
                OK
              </button>
            </div>
            {couponApplied && <p className="text-xs text-green-600 dark:text-green-400 mb-4">🎉 Cupom aplicado: 10% OFF</p>}

            {/* Values */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span>
              </div>
              {paymentMethod === 'pix' && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Desconto PIX (5%)</span><span>-R$ {pixDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponApplied && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Desconto Cupom</span><span>-R$ {(subtotal * 0.1).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Taxa de Servico</span><span>R$ {(total * 0.007).toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between font-bold text-zinc-900 dark:text-white text-lg">
                <span>Total</span><span>R$ {(total + total * 0.007).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-zinc-500 uppercase">Pagamento</p>
              {[
                { id: 'pix', icon: <Smartphone className="w-4 h-4" />, label: 'PIX', discount: '5% OFF' },
                { id: 'credit', icon: <CreditCard className="w-4 h-4" />, label: 'Cartao de Credito' },
                { id: 'boleto', icon: <FileText className="w-4 h-4" />, label: 'Boleto' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    paymentMethod === p.id
                      ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-800'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${paymentMethod === p.id ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{p.icon}</div>
                  <span className="flex-1 text-sm text-zinc-900 dark:text-white">{p.label}</span>
                  {p.discount && <span className="text-[10px] font-bold text-green-600 dark:text-green-400">{p.discount}</span>}
                  {paymentMethod === p.id && <Check className="w-4 h-4 text-zinc-900 dark:text-white" />}
                </button>
              ))}
            </div>

            {/* Security */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
              <Shield className="w-3.5 h-3.5" />
              Compra segura • Escrow de 7 dias
            </div>

            <a
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-full text-sm hover:opacity-90 transition-all"
            >
              Finalizar Compra <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
