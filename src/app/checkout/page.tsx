'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth/context'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Shield, Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle, AlertTriangle, Clock, Tag, Zap, AlertCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageTransition } from '@/components/shared/PageTransition'
import { MorphingBlob, GlowCard } from '@/components/ui/AdvancedAnimations'
import { AnimatedShield } from '@/components/svgs/AnimatedSVGs'
import toast from 'react-hot-toast'

const paymentMethods = [
  { id: 'card', label: 'Cartão de Crédito', icon: '💳', desc: 'Visa, Mastercard, Elo', stripe: true },
  { id: 'pix', label: 'PIX', icon: '⚡', desc: 'Instantâneo', stripe: false },
  { id: 'boleto', label: 'Boleto', icon: '📄', desc: 'Até 3 dias', stripe: false },
]

interface ProductData {
  id: string
  title: string
  price: number
  original_price: number | null
  image_url: string | null
  category_name: string
  seller_name: string
  delivery_type: string
}

function CheckoutContent() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('product') || ''

  const [product, setProduct] = useState<ProductData | null>(null)
  const [productLoading, setProductLoading] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [coupon, setCoupon] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')

  // Buscar produto real do Supabase
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setProductError('Produto não especificado')
        setProductLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/search?q=&product_id=${encodeURIComponent(productId)}`)
        if (!res.ok) throw new Error('Produto não encontrado')
        const data = await res.json()
        const found = data.products?.[0] || null
        if (!found) throw new Error('Produto não encontrado')
        setProduct(found)
      } catch (err) {
        setProductError(err instanceof Error ? err.message : 'Erro ao carregar produto')
      } finally {
        setProductLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const discount = product?.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0
  const finalPrice = product ? (couponApplied ? product.price * (1 - couponDiscount / 100) : product.price) : 0

  const formatCard = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const applyCoupon = async () => {
    if (!coupon.trim()) return
    try {
      const res = await fetch(`/api/v1/coupons/validate?code=${encodeURIComponent(coupon)}&subtotal=${product?.price || 0}`)
      const data = await res.json()
      if (data.valid && data.coupon) {
        setCouponApplied(true)
        const discountVal = data.coupon.discount_type === 'percentage' ? data.coupon.discount_value : Math.round((data.coupon.calculated_discount / (product?.price || 1)) * 100)
        setCouponDiscount(discountVal)
        toast.success(`Cupom aplicado! ${discountVal}% de desconto`)
      } else {
        toast.error(data.error || 'Cupom inválido')
      }
    } catch {
      toast.error('Erro ao validar cupom')
    }
  }

  const handlePayment = async () => {
    if (!product) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_title: product.title,
          price: finalPrice,
          buyer_email: user?.email || 'guest@kiyvo.com',
        }),
      })
      const data = await res.json()
      if (data.url) {
        if (data.demo_mode) {
          router.push(data.url)
        } else {
          window.location.href = data.url
        }
      } else {
        toast.error('Erro ao processar pagamento')
      }
    } catch {
      toast.error('Erro na conexão')
    }
    setLoading(false)
  }

  // Loading do produto
  if (productLoading) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando produto...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Erro ao carregar produto
  if (productError || !product) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-surface-600 text-sm">{productError || 'Produto não encontrado'}</p>
            <a href="/" className="btn-secondary text-sm mt-2">Voltar à loja</a>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: 'Produto' },
            { num: 2, label: 'Pagamento' },
            { num: 3, label: 'Confirmação' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <motion.div
                animate={{
                  backgroundColor: step >= s.num ? '#2563EB' : '#F1F5F9',
                  color: step >= s.num ? '#fff' : '#94A3B8',
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold"
              >
                {step > s.num ? <CheckCircle size={18} /> : s.num}
              </motion.div>
              <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-surface-900' : 'text-surface-400'}`}>{s.label}</span>
              {i < 2 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-brand-500' : 'bg-surface-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <h2 className="font-display font-extrabold text-xl text-surface-900">Resumo do Pedido</h2>

                  {/* Product Card */}
                  <GlowCard color="brand" className="p-5">
                    <div className="flex gap-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.title} className="w-24 h-20 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-24 h-20 rounded-xl bg-surface-100 flex items-center justify-center shrink-0">
                          <CreditCard size={24} className="text-surface-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-surface-400">{product.category_name}</p>
                        <h3 className="font-display font-bold text-surface-900">{product.title}</h3>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-display font-extrabold text-lg text-brand-600">R$ {product.price.toFixed(2)}</span>
                          {product.original_price && (
                            <span className="text-sm text-surface-400 line-through">R$ {product.original_price.toFixed(2)}</span>
                          )}
                          {discount > 0 && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{discount}%</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-surface-500">
                          <Zap size={12} className="text-amber-500" />
                          Entrega {product.delivery_type === 'auto' ? 'automática instantânea' : 'via chat'}
                        </div>
                      </div>
                    </div>
                  </GlowCard>

                  {/* Coupon */}
                  <div className="card-base p-5">
                    <h3 className="font-display font-bold text-sm text-surface-900 flex items-center gap-2 mb-3"><Tag size={16} className="text-brand-600" /> Cupom de desconto</h3>
                    <div className="flex gap-2">
                      <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="DIGITE SEU CUPOM" className="input-base flex-1 font-mono text-sm uppercase" disabled={couponApplied} />
                      {couponApplied ? (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-xl flex items-center gap-1">
                          <CheckCircle size={16} /> -{couponDiscount}%
                        </div>
                      ) : (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={applyCoupon} className="btn-secondary text-sm py-2">Aplicar</motion.button>
                      )}
                    </div>
                  </div>

                  {/* Buyer info */}
                  <div className="card-base p-5">
                    <h3 className="font-display font-bold text-sm text-surface-900 mb-3">Dados do comprador</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-surface-500">E-mail</label>
                        <input type="email" defaultValue={user?.email || ''} className="input-base text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-surface-500">Nome</label>
                        <input type="text" defaultValue={profile?.full_name || ''} className="input-base text-sm" />
                      </div>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setStep(2)} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                    Continuar para pagamento <ArrowRight size={18} />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <h2 className="font-display font-extrabold text-xl text-surface-900">Forma de Pagamento</h2>

                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((pm) => (
                      <motion.button key={pm.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setPaymentMethod(pm.id)} className={`p-4 rounded-2xl border-2 text-center transition-all ${paymentMethod === pm.id ? 'border-brand-500 bg-brand-50' : 'border-surface-200 bg-white hover:border-surface-300'}`}>
                        <span className="text-2xl">{pm.icon}</span>
                        <p className="font-display font-bold text-sm text-surface-900 mt-1">{pm.label}</p>
                        <p className="text-xs text-surface-400">{pm.desc}</p>
                      </motion.button>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Número do cartão</label>
                        <div className="relative">
                          <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                          <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" className="input-base pl-10 font-mono" maxLength={19} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Nome no cartão</label>
                        <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} placeholder="NOME COMO NO CARTÃO" className="input-base uppercase" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-surface-600 mb-1 block">Validade</label>
                          <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/AA" className="input-base font-mono" maxLength={5} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-surface-600 mb-1 block">CVC</label>
                          <input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="000" className="input-base font-mono" maxLength={4} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'pix' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6 text-center">
                      <Zap size={32} className="text-emerald-500 mx-auto mb-2" />
                      <h3 className="font-display font-bold text-lg text-surface-900">PIX Instantâneo</h3>
                      <p className="text-sm text-surface-500 mt-1">Após confirmar, você receberá o QR Code para pagamento via PIX.</p>
                      <div className="mt-4 p-4 bg-surface-50 rounded-xl">
                        <p className="text-xs text-surface-400">Valor</p>
                        <p className="font-display font-extrabold text-2xl text-brand-600">R$ {finalPrice.toFixed(2)}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setStep(1)} className="flex-1 btn-secondary py-3.5 flex items-center justify-center gap-2">
                      <ArrowLeft size={18} /> Voltar
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setStep(3)} className="flex-1 btn-primary py-3.5">
                      Revisar pedido
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                  <h2 className="font-display font-extrabold text-xl text-surface-900">Confirmar Pagamento</h2>

                  <div className="card-base p-6">
                    <h3 className="font-display font-bold text-sm text-surface-500 uppercase mb-3">Detalhes do pedido</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-sm text-surface-600">Produto</span><span className="text-sm font-semibold text-surface-900">{product.title}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-surface-600">Vendedor</span><span className="text-sm font-semibold text-surface-900">{product.seller_name}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-surface-600">Entrega</span><span className="text-sm font-semibold text-surface-900">{product.delivery_type === 'auto' ? 'Automática' : 'Via chat'}</span></div>
                      <div className="flex justify-between"><span className="text-sm text-surface-600">Pagamento</span><span className="text-sm font-semibold text-surface-900">{paymentMethods.find(p => p.id === paymentMethod)?.label}</span></div>
                      {couponApplied && <div className="flex justify-between"><span className="text-sm text-surface-600">Cupom</span><span className="text-sm font-semibold text-emerald-600">-{couponDiscount}%</span></div>}
                      <div className="border-t border-surface-200 pt-3 flex justify-between">
                        <span className="font-display font-bold text-surface-900">Total</span>
                        <span className="font-display font-extrabold text-2xl text-brand-600">R$ {finalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Guarantees */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <AnimatedShield className="w-10 h-10 shrink-0" />
                      <div>
                        <p className="font-display font-bold text-emerald-900 text-sm">Compra 100% Garantida</p>
                        <ul className="mt-1 text-xs text-emerald-700 space-y-1">
                          <li className="flex items-center gap-1"><CheckCircle size={10} /> Dinheiro retido até confirmação de entrega</li>
                          <li className="flex items-center gap-1"><CheckCircle size={10} /> Reembolso integral se produto não for entregue</li>
                          <li className="flex items-center gap-1"><CheckCircle size={10} /> Pagamento processado via Stripe (PCI DSS)</li>
                          <li className="flex items-center gap-1"><CheckCircle size={10} /> Criptografia TLS/SSL em todas as transações</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setStep(2)} className="flex-1 btn-secondary py-3.5 flex items-center justify-center gap-2">
                      <ArrowLeft size={18} /> Voltar
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handlePayment} disabled={loading} className="flex-1 btn-primary py-3.5 relative overflow-hidden">
                      {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2"><Lock size={16} /> Pagar Agora — R$ {finalPrice.toFixed(2)}</span>}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right — Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-base p-5 sticky top-24">
              <h3 className="font-display font-bold text-sm text-surface-900 mb-4">Resumo</h3>
              <div className="flex gap-3 mb-4">
                {product.image_url ? (
                  <img src={product.image_url} alt="Imagem do produto" className="w-14 h-14 rounded-lg object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-surface-100 flex items-center justify-center">
                    <CreditCard size={20} className="text-surface-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 line-clamp-2">{product.title}</p>
                  <p className="text-xs text-surface-400">{product.category_name}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span className="text-surface-900">R$ {product.price.toFixed(2)}</span></div>
                {couponApplied && <div className="flex justify-between"><span className="text-emerald-600">Desconto ({couponDiscount}%)</span><span className="text-emerald-600">-R$ {(product.price - finalPrice).toFixed(2)}</span></div>}
                <div className="flex justify-between"><span className="text-surface-500">Taxa</span><span className="text-surface-900">R$ 0,00</span></div>
                <div className="border-t border-surface-200 pt-2 flex justify-between">
                  <span className="font-display font-bold text-surface-900">Total</span>
                  <span className="font-display font-extrabold text-lg text-brand-600">R$ {finalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-surface-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-surface-500"><Shield size={14} className="text-emerald-500" /> Compra garantida</div>
                <div className="flex items-center gap-2 text-xs text-surface-500"><Clock size={14} className="text-amber-500" /> Entrega {product.delivery_type === 'auto' ? 'instantânea' : 'via chat'}</div>
                <div className="flex items-center gap-2 text-xs text-surface-500"><Lock size={14} className="text-brand-500" /> Stripe Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="skeleton w-full max-w-5xl h-96 rounded-2xl" /></div>}>
      <CheckoutContent />
    </Suspense>
  )
}
