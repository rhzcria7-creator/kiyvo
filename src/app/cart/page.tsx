'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/domain/cart/CartStore'
import { FeeEngine, formatBRL } from '@/domain/fees/FeeEngine'
import { ShoppingBag, Trash2, ArrowRight, Tag, Shield, Lock, Zap, X, CreditCard, Minus, Plus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const feeEngine = new FeeEngine()

export default function CartPage() {
  const {
    items,
    couponCode,
    couponDiscount,
    paymentMethod,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    setPaymentMethod,
    getGroups,
    getSubtotal,
    getTotalBuyerFees,
    getTotal,
    getItemCount,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const groups = getGroups()
  const subtotal = getSubtotal()
  const buyerFees = getTotalBuyerFees()
  const total = getTotal()
  const itemCount = getItemCount()

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplyingCoupon(true)
    try {
      const res = await fetch(`/api/v1/coupons/validate?code=${encodeURIComponent(couponInput.toUpperCase())}`)
      if (res.ok) {
        const data = await res.json()
        if (data.valid && data.coupon) {
          const discount = data.coupon.discount_type === 'percentage' ? data.coupon.discount_value : 0
          applyCoupon(couponInput.toUpperCase(), discount)
          toast.success(`Cupom aplicado! ${discount}% de desconto`)
          setCouponInput('')
        } else {
          toast.error(data.error || 'Cupom inválido')
        }
      } else {
        toast.error('Cupom inválido ou expirado')
      }
    } catch {
      toast.error('Erro ao validar cupom')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio')
      return
    }
    // Redirecionar para checkout
    toast.success('Redirecionando para o pagamento...')
  }

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={32} className="text-surface-400" />
            </div>
            <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
              Seu carrinho está vazio
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2 max-w-sm mx-auto">
              Explore nosso catálogo e encontre os melhores produtos digitais
            </p>
            <Link href="/categorias" className="mt-6 inline-block">
              <Button icon={<ArrowRight size={18} />}>Explorar Catálogo</Button>
            </Link>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white flex items-center gap-3">
              <ShoppingBag size={28} className="text-brand-600 dark:text-brand-400" />
              Carrinho
              <span className="text-lg font-semibold text-surface-400">({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
            </h1>
          </div>
          <button
            onClick={() => {
              clearCart()
              toast.success('Carrinho limpo')
            }}
            className="text-sm text-surface-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} /> Limpar
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Cart Items by Seller */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {groups.map((group) => (
                <motion.div
                  key={group.sellerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="card-base overflow-hidden"
                >
                  {/* Seller Header */}
                  <div className="p-4 bg-surface-50 dark:bg-surface-800/50 border-b border-surface-100 dark:border-surface-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
                        {group.sellerName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-surface-900 dark:text-white">
                        {group.sellerName}
                      </p>
                      <p className="text-xs text-surface-400">
                        {group.items.length} {group.items.length === 1 ? 'produto' : 'produtos'} • Subtotal: {formatBRL(group.subtotal)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-surface-100 dark:divide-surface-800">
                    {group.items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.licenseType}`}
                        layout
                        className="p-4 flex gap-4"
                      >
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-20 h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-surface-400 mb-0.5">{item.categorySlug}</p>
                          <h3 className="font-display font-semibold text-sm text-surface-900 dark:text-white line-clamp-2">
                            {item.productTitle}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-surface-100 dark:bg-surface-800 rounded-full text-surface-500 dark:text-surface-400">
                              {item.licenseType}
                            </span>
                            <span className="text-xs text-surface-400 flex items-center gap-1">
                              <Zap size={10} className="text-amber-500" />
                              {item.deliveryType === 'auto' ? 'Entrega automática' : 'Entrega manual'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-extrabold text-brand-600 dark:text-brand-400">
                            {formatBRL(item.productPrice)}
                          </p>
                          <button
                            onClick={() => {
                              removeItem(item.productId, item.licenseType)
                              toast.success('Produto removido do carrinho')
                            }}
                            className="mt-1 text-xs text-surface-400 hover:text-red-500 transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Seller Fee Summary */}
                  {group.feeCalculation && (
                    <div className="p-4 bg-surface-50/50 dark:bg-surface-800/30 border-t border-surface-100 dark:border-surface-800">
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-400">Taxa de serviço ({paymentMethod})</span>
                        <span className="text-surface-600 dark:text-surface-400 font-semibold">
                          +{formatBRL(group.feeCalculation.buyerServiceFee)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Coupon */}
            <FadeInOnScroll>
              <div className="card-base p-5">
                <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white flex items-center gap-2 mb-3">
                  <Tag size={16} className="text-brand-600 dark:text-brand-400" /> Cupom de desconto
                </h3>
                {couponCode ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">{couponCode}</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">-{couponDiscount}%</span>
                    </div>
                    <button onClick={() => { removeCoupon(); toast.success('Cupom removido') }} className="p-2 text-surface-400 hover:text-red-500 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="DIGITE SEU CUPOM"
                      className="input-base flex-1 font-mono text-sm uppercase"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    />
                    <Button variant="secondary" size="md" onClick={handleApplyCoupon} disabled={applyingCoupon || !couponInput.trim()}>
                      Aplicar
                    </Button>
                  </div>
                )}
              </div>
            </FadeInOnScroll>

            {/* Payment Method */}
            <FadeInOnScroll>
              <div className="card-base p-5">
                <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white mb-3">Método de pagamento</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pix' as const, label: 'PIX', icon: '⚡', desc: 'Instantâneo' },
                    { id: 'credit_card' as const, label: 'Cartão', icon: '💳', desc: 'Crédito' },
                    { id: 'boleto' as const, label: 'Boleto', icon: '📄', desc: 'Até 3 dias' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl text-center border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                          : 'border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-800'
                      }`}
                    >
                      <span className="text-xl">{method.icon}</span>
                      <p className="text-xs font-semibold text-surface-700 dark:text-surface-300 mt-1">{method.label}</p>
                      <p className="text-[10px] text-surface-400">{method.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </FadeInOnScroll>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-base p-5 sticky top-24">
              <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-4">Resumo do pedido</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Subtotal ({itemCount} itens)</span>
                  <span className="text-surface-900 dark:text-white font-semibold">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Taxa de serviço</span>
                  <span className="text-surface-900 dark:text-white font-semibold">+{formatBRL(buyerFees)}</span>
                </div>
                {couponCode && couponDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-emerald-600 dark:text-emerald-400">Desconto ({couponDiscount}%)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">-{formatBRL(subtotal * couponDiscount / 100)}</span>
                  </div>
                )}
                <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display font-bold text-surface-900 dark:text-white">Total</span>
                    <span className="font-display font-extrabold text-2xl text-brand-600 dark:text-brand-400">
                      {formatBRL(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                icon={<Lock size={16} />}
                onClick={handleCheckout}
              >
                Finalizar Compra
              </Button>

              {/* Trust signals */}
              <div className="mt-5 pt-4 border-t border-surface-100 dark:border-surface-800 space-y-2">
                <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                  <Shield size={14} className="text-emerald-500 shrink-0" /> Compra 100% garantida
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                  <Zap size={14} className="text-amber-500 shrink-0" /> Entrega digital instantânea
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                  <Lock size={14} className="text-brand-500 shrink-0" /> Pagamento seguro via Stripe
                </div>
              </div>

              {/* Fee breakdown mini */}
              {buyerFees > 0 && (
                <div className="mt-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                  <p className="text-[10px] text-surface-400 font-semibold uppercase tracking-wider mb-2">Detalhamento de taxas</p>
                  {groups.map((group) => (
                    group.feeCalculation && (
                      <div key={group.sellerId} className="space-y-1">
                        <p className="text-[10px] text-surface-400 font-semibold">{group.sellerName}</p>
                        {group.feeCalculation.breakdown.filter(b => b.payer === 'buyer').map((item, i) => (
                          <div key={i} className="flex justify-between text-[10px]">
                            <span className="text-surface-400">{item.name}</span>
                            <span className="text-surface-600 dark:text-surface-400">{formatBRL(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
