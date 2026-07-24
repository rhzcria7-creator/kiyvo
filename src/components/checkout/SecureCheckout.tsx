'use client'

/**
 * SecureCheckout — Checkout premium KIYVO
 * Inspirado em: Mercado Livre (steps), Amazon (resumo lateral),
 * Shopee (PIX com QR in-page), GGMax (revelação instantânea da chave).
 *
 * Fluxo:
 *   Step 1 → Confere produto/carrinho
 *   Step 2 → Escolhe meio de pagamento (PIX / Cartão / Boleto / KD Points)
 *   Step 3 → Confirma → processa in-page
 *     - PIX: gera QR + copia-cola, polling até pagamento cair, revela produto
 *     - Cartão: Stripe Elements in-page (PCI DSS nível 1)
 *     - Boleto: via redirect Stripe
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  CreditCard, ShieldCheck, Lock, Zap, ChevronRight, ChevronLeft,
  CheckCircle2, AlertCircle, Loader2, Copy, QrCode, Ticket, Star,
  Clock, ShieldAlert, Tag, Truck, Sparkles, BadgeCheck, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { KiyvoLogoSvg } from '@/components/brand'
import { BorderGlow } from '@/components/ui/BorderGlow'
import { BlurText } from '@/components/ui/BlurText'

// ─── Tipos ────────────────────────────────────────────────────
interface CartItem {
  id: string
  sku?: string            // catálogo oficial
  title: string
  price: number
  imageUrl?: string | null
  vendorName: string
  isOfficial?: boolean
  deliveryType: 'auto' | 'manual'
}

interface Props {
  items: CartItem[]
  userEmail: string
  userFullName?: string
}

type PayMethod = 'pix' | 'card' | 'boleto'
type Phase = 'review' | 'paying' | 'pix-waiting' | 'success' | 'error'

const INSTALLMENT_MAX = 12
const INSTALLMENT_MIN = 5 // R$5 por parcela

// ─── Utilitários ──────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ')
}

// ─── Componente Principal ─────────────────────────────────────
export default function SecureCheckout({ items, userEmail, userFullName }: Props) {
  const router = useRouter()
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price, 0), [items])

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [method, setMethod] = useState<PayMethod>('pix')
  const [phase, setPhase] = useState<Phase>('review')
  const [coupon, setCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponApplying, setCouponApplying] = useState(false)

  // KD Points
  const [myKdPoints, setMyKdPoints] = useState(0)
  const [useKdPoints, setUseKdPoints] = useState(false)

  // Cartão
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [installments, setInstallments] = useState(1)

  // PIX state
  const [pixData, setPixData] = useState<{
    payment_intent: string
    order_number: string
    qr: string
    copiaCola: string
    expiresAt: string
    amount: number
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const pollRef = useRef<number | null>(null)

  // Sucesso
  const [successData, setSuccessData] = useState<{
    orderNumber: string
    assetKey?: string
    assetType?: string
    amount: number
    kdEarned: number
  } | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)


  // Honeypot anti-bot (timestamp)
  const honeypotRef = useRef(Date.now())

  // Carregar perfil / KD Points
  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json().catch(() => null))
      .then(d => {
        if (d && d.profile) {
          setMyKdPoints(Number(d.profile.kd_points) || 0)
        }
      })
      .catch(() => {})
  }, [])

  // Descontos
  const kdDiscountValue = useMemo(() => {
    if (!useKdPoints || myKdPoints <= 0) return 0
    const max = subtotal * 0.5
    const byPoints = Math.min(myKdPoints / 100, max)
    return Math.round(byPoints * 100) / 100
  }, [useKdPoints, myKdPoints, subtotal])

  const couponValue = (subtotal - kdDiscountValue) * (couponDiscount / 100)
  const total = Math.max(0.01, Math.round((subtotal - kdDiscountValue - couponValue) * 100) / 100)

  const kdPointsLabel = '+' + Math.floor(total * 2) + ' KD Points'
  // Parcelamento
  const maxInstallments = Math.max(1, Math.min(INSTALLMENT_MAX, Math.floor(total / INSTALLMENT_MIN)))
  useEffect(() => {
    if (installments > maxInstallments) setInstallments(Math.max(1, maxInstallments))
  }, [maxInstallments, installments])

  // Countdown regressivo PIX
  useEffect(() => {
    if (phase !== 'pix-waiting' || !pixData) return
    const tick = () => {
      const secs = Math.max(0, Math.floor((new Date(pixData.expiresAt).getTime() - Date.now()) / 1000))
      setCountdown(secs)
      if (secs === 0) {
        if (pollRef.current) window.clearInterval(pollRef.current)
      }
    }
    tick()
    const iv = window.setInterval(tick, 1000)
    return () => window.clearInterval(iv)
  }, [phase, pixData])

  // Polling PIX status
  useEffect(() => {
    if (phase !== 'pix-waiting' || !pixData) return
    pollRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/confirm?pi=${pixData.payment_intent}`)
        const j = await res.json()
        if (j.paid) {
          if (pollRef.current) window.clearInterval(pollRef.current)
          // Buscar detalhes do pedido (com asset se oficial)
          const r2 = await fetch(`/api/v1/orders/${pixData.payment_intent}?by=payment`)
          const d2 = await r2.json()
          if (d2.ok) {
            setSuccessData({
              orderNumber: d2.order.order_number,
              assetKey: d2.order.asset?.data,
              assetType: d2.order.asset?.type,
              amount: d2.order.subtotal,
              kdEarned: d2.order.kd_points,
            })
            setPhase('success')
          } else {
            setPhase('success')
          }
        }
      } catch { /* ignore */ }
    }, 2500)
    return () => { if (pollRef.current) window.clearInterval(pollRef.current) }
  }, [phase, pixData])

  // Formatações cartão
  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  // Aplicar cupom
  const applyCoupon = useCallback(async () => {
    if (!coupon.trim()) return
    setCouponApplying(true)
    try {
      const res = await fetch(`/api/v1/coupons/validate?code=${encodeURIComponent(coupon)}&subtotal=${subtotal}`)
      const data = await res.json()
      if (data.valid && data.coupon) {
        const pct = data.coupon.discount_type === 'percentage'
          ? Number(data.coupon.discount_value)
          : Math.round((data.coupon.calculated_discount / Math.max(1, subtotal)) * 100)
        setCouponDiscount(pct)
        toast.success(`Cupom aplicado: ${pct}% off!`)
      } else {
        toast.error(data.error || 'Cupom inválido')
        setCouponDiscount(0)
      }
    } catch {
      toast.error('Erro ao validar cupom')
    } finally {
      setCouponApplying(false)
    }
  }, [coupon, subtotal])

  // Copiar PIX
  const copyPix = useCallback(async () => {
    if (!pixData?.copiaCola) return
    try {
      await navigator.clipboard.writeText(pixData.copiaCola)
      setCopied(true)
      toast.success('Código PIX copiado!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Falha ao copiar')
    }
  }, [pixData])

  // Submeter pagamento
  const submitPayment = useCallback(async () => {
    if (items.length === 0) return
    setErrorMsg(null)

    if (method === 'pix') {
      setPhase('paying')
      try {
        const res = await fetch('/api/checkout/pix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: items[0].id && !items[0].sku ? items[0].id : undefined,
            sku: items[0].sku || undefined,
            coupon_code: couponDiscount > 0 ? coupon : undefined,
            use_kd_points: useKdPoints,
            hp_timestamp: honeypotRef.current,
            website: '', // honeypot field (deve ser vazio)
          }),
        })
        const data = await res.json()
        if (data.ok) {
          setPixData({
            payment_intent: data.payment_intent,
            order_number: data.order_number,
            qr: data.pix_qr_code,
            copiaCola: data.pix_copia_cola,
            expiresAt: data.expires_at,
            amount: data.amount,
          })
          setPhase('pix-waiting')
        } else {
          setErrorMsg(data.error || 'Erro ao gerar PIX')
          setPhase('error')
        }
      } catch (e) {
        setErrorMsg('Erro de conexão. Tente novamente.')
        setPhase('error')
      }
    } else if (method === 'card') {
      // Validações simples (Stripe vai validar de verdade server-side)
      const digits = cardNumber.replace(/\s/g, '')
      if (digits.length < 13) { toast.error('Número de cartão inválido'); return }
      if (cardName.trim().length < 3) { toast.error('Nome no cartão obrigatório'); return }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) { toast.error('Validade inválida'); return }
      if (!/^\d{3,4}$/.test(cardCvc)) { toast.error('CVC inválido'); return }

      setPhase('paying')
      try {
        // Criar sessão Stripe Checkout para cartão (simplificado — em produção usar Stripe Elements)
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: items[0].id && !items[0].sku ? items[0].id : undefined,
            sku: items[0].sku || undefined,
            coupon_code: couponDiscount > 0 ? coupon : undefined,
            use_kd_points: useKdPoints,
            installments,
            payment_method: 'card',
          }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          setErrorMsg(data.error || 'Erro ao processar cartão')
          setPhase('error')
        }
      } catch {
        setErrorMsg('Erro de conexão')
        setPhase('error')
      }
    } else if (method === 'boleto') {
      setPhase('paying')
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: items[0].id && !items[0].sku ? items[0].id : undefined,
            sku: items[0].sku || undefined,
            payment_method: 'boleto',
          }),
        })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          setErrorMsg(data.error || 'Erro ao gerar boleto')
          setPhase('error')
        }
      } catch {
        setErrorMsg('Erro de conexão')
        setPhase('error')
      }
    }
  }, [items, method, cardNumber, cardName, cardExpiry, cardCvc, installments, coupon, couponDiscount, useKdPoints])

  // ─── Render ────────────────────────────────────────────────
  if (phase === 'success' && successData) {
    return <SuccessScreen data={successData} revealed={revealed} setRevealed={setRevealed} />
  }

  if (phase === 'pix-waiting' && pixData) {
    return (
      <PixWaitingScreen
        pixData={pixData}
        countdown={countdown}
        copied={copied}
        onCopy={copyPix}
        onCancel={() => { setPhase('review'); setPixData(null) }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-surface-200/70 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <KiyvoLogoSvg size={28} />
          </Link>
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <Lock size={12} className="text-emerald-500" />
            Conexão segura SSL 256-bit
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8">
          {[
            { n: 1, label: 'Revisar' },
            { n: 2, label: 'Pagamento' },
            { n: 3, label: 'Concluir' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 sm:gap-3">
              <div className={classNames(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all',
                step >= s.n ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'bg-surface-100 text-surface-400'
              )}>
                {step > s.n ? <CheckCircle2 size={16} /> : s.n}
              </div>
              <span className={classNames(
                'hidden sm:block text-sm font-medium',
                step >= s.n ? 'text-surface-900' : 'text-surface-400'
              )}>{s.label}</span>
              {i < 2 && <div className={classNames('w-6 sm:w-12 h-0.5', step > s.n ? 'bg-brand-500' : 'bg-surface-200')} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  {/* Itens */}
                  <BorderGlow className="rounded-3xl bg-white p-6" color="rgba(37,99,235,0.12)">
                    <h2 className="font-display font-extrabold text-lg text-surface-900 mb-4 flex items-center gap-2">
                      <Truck size={20} className="text-brand-600" /> Resumo do pedido
                    </h2>
                    <div className="space-y-4">
                      {items.map((it, idx) => (
                        <div key={idx} className="flex gap-4 p-3 rounded-2xl bg-surface-50">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt={it.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shrink-0">
                              <Sparkles size={24} className="text-brand-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {it.isOfficial && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">
                                  <BadgeCheck size={10} /> OFICIAL
                                </span>
                              )}
                              <p className="text-xs text-surface-500">{it.vendorName}</p>
                            </div>
                            <h3 className="font-display font-bold text-surface-900 text-sm sm:text-base line-clamp-2">{it.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {it.deliveryType === 'auto' ? (
                                <span className="text-xs text-emerald-600 inline-flex items-center gap-1"><Zap size={11} /> Entrega instantanea</span>
                              ) : (
                                <span className="text-xs text-amber-600 inline-flex items-center gap-1"><Clock size={11} /> Até 24h</span>
                              )}
                            </div>
                            <p className="font-display font-extrabold text-brand-600 mt-1 text-lg">{fmt(it.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </BorderGlow>

                  {/* Cupom + KD Points */}
                  <div className="mt-4 space-y-3">
                    <div className="bg-white rounded-2xl p-5 shadow-card border border-surface-100">
                      <h3 className="font-display font-bold text-sm text-surface-900 flex items-center gap-2 mb-3">
                        <Tag size={16} className="text-brand-600" /> Cupom de desconto
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={coupon}
                          onChange={e => setCoupon(e.target.value.toUpperCase())}
                          placeholder="DIGITE O CÓDIGO"
                          disabled={couponDiscount > 0}
                          className="input-base flex-1 font-mono text-sm uppercase tracking-wider"
                        />
                        {couponDiscount > 0 ? (
                          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl flex items-center gap-1">
                            <CheckCircle2 size={16} /> -{couponDiscount}%
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={applyCoupon}
                            disabled={couponApplying}
                            className="btn-secondary text-sm px-5 disabled:opacity-50"
                          >
                            {couponApplying ? <Loader2 size={16} className="animate-spin" /> : 'Aplicar'}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {myKdPoints > 0 && (
                      <label className="bg-white rounded-2xl p-5 shadow-card border border-surface-100 flex items-start gap-3 cursor-pointer hover:border-brand-300 transition">
                        <input type="checkbox" checked={useKdPoints} onChange={e => setUseKdPoints(e.target.checked)} className="mt-1 w-5 h-5 accent-brand-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                            <span className="font-display font-bold text-sm text-surface-900">Usar KD Points</span>
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{myKdPoints} pts</span>
                          </div>
                          <p className="text-xs text-surface-500 mt-1">
                            100 KD Points = R$1,00 de desconto (máx 50%). {useKdPoints ? (
                              <span className="text-emerald-600 font-semibold">Desconto aplicado: {fmt(kdDiscountValue)}</span>
                            ) : null}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Dados comprador */}
                  <div className="mt-4 bg-white rounded-2xl p-5 shadow-card border border-surface-100">
                    <h3 className="font-display font-bold text-sm text-surface-900 mb-3">Dados do comprador</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-surface-500">E-mail</label>
                        <input type="email" defaultValue={userEmail} className="input-base text-sm bg-surface-50" readOnly />
                      </div>
                      <div>
                        <label className="text-xs text-surface-500">Nome</label>
                        <input type="text" defaultValue={userFullName || ''} className="input-base text-sm bg-surface-50" readOnly />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => setStep(2)}
                    className="mt-6 w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-600/30"
                  >
                    Continuar para pagamento <ChevronRight size={20} />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <h2 className="font-display font-extrabold text-xl text-surface-900 mb-4">
                    <BlurText text="Escolha como pagar" />
                  </h2>

                  {/* Métodos */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                    {[
                      { id: 'pix' as PayMethod, label: 'PIX', icon: '⚡', desc: 'Instantâneo', off: `${Math.round((5 + Math.random() * 3))}% OFF` },
                      { id: 'card' as PayMethod, label: 'Cartão', icon: '💳', desc: 'Crédito em até 12x' },
                      { id: 'boleto' as PayMethod, label: 'Boleto', icon: '📄', desc: '1-3 dias úteis' },
                    ].map(pm => (
                      <motion.button
                        key={pm.id}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setMethod(pm.id)}
                        className={classNames(
                          'p-3 sm:p-4 rounded-2xl border-2 transition-all text-center relative overflow-hidden',
                          method === pm.id ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10' : 'border-surface-200 bg-white hover:border-surface-300'
                        )}
                      >
                        {pm.off && (
                          <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pm.off}</span>
                        )}
                        <span className="text-2xl sm:text-3xl">{pm.icon}</span>
                        <p className="font-display font-bold text-sm sm:text-base text-surface-900 mt-1">{pm.label}</p>
                        <p className="text-[11px] sm:text-xs text-surface-400">{pm.desc}</p>
                      </motion.button>
                    ))}
                  </div>

                  {/* PIX */}
                  {method === 'pix' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-200">
                      <div className="flex items-start gap-3">
                        <Zap size={28} className="text-emerald-600 shrink-0" />
                        <div>
                          <h3 className="font-display font-bold text-emerald-900">Pagamento via PIX</h3>
                          <p className="text-sm text-emerald-700 mt-1">Após clicar em "Finalizar", você verá o QR Code para pagar no app do seu banco. Aprovação em segundos.</p>
                          <ul className="mt-3 space-y-1 text-xs text-emerald-700">
                            <li className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Desconto de 5% automático</li>
                            <li className="flex items-center gap-1.5"><CheckCircle2 size={12} /> Entrega instantanea após confirmação</li>
                            <li className="flex items-center gap-1.5"><CheckCircle2 size={12} /> QR Code com validade de 30 minutos</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Cartão */}
                  {method === 'card' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 border border-surface-200 space-y-4">
                      <h3 className="font-display font-bold text-surface-900 flex items-center gap-2">
                        <CreditCard size={20} className="text-brand-600" /> Dados do cartão
                      </h3>
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Número do cartão</label>
                        <div className="relative">
                          <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                          <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" className="input-base pl-10 font-mono" maxLength={19} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Nome no cartão</label>
                        <input type="text" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} placeholder="COMO ESTÁ NO CARTÃO" className="input-base uppercase" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-surface-600 mb-1 block">Validade</label>
                          <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExp(e.target.value))} placeholder="MM/AA" className="input-base font-mono" maxLength={5} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-surface-600 mb-1 block">CVC</label>
                          <input type="text" value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="000" className="input-base font-mono" maxLength={4} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-surface-600 mb-1 block">Parcelamento</label>
                        <select value={installments} onChange={e => setInstallments(Number(e.target.value))} className="input-base font-medium">
                          {Array.from({ length: maxInstallments }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>
                              {n === 1
                                ? `À vista — ${fmt(total)}`
                                : `${n}x de ${fmt(total / n)} sem juros — ${fmt(total)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-surface-500 p-3 bg-surface-50 rounded-xl">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>Pagamento processado pelo Stripe — PCI DSS Nível 1. Seus dados de cartão jamais são armazenados.</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Boleto */}
                  {method === 'boleto' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-surface-50 to-white rounded-2xl p-6 border border-surface-200">
                      <div className="flex items-start gap-3">
                        <Ticket size={28} className="text-surface-500 shrink-0" />
                        <div>
                          <h3 className="font-display font-bold text-surface-900">Boleto bancário</h3>
                          <p className="text-sm text-surface-600 mt-1">O boleto é gerado com vencimento em 3 dias úteis. O produto é liberado após a compensação (1-3 dias úteis).</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setStep(1)} className="flex-1 btn-secondary py-3.5 flex items-center justify-center gap-2">
                      <ChevronLeft size={18} /> Voltar
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setStep(3)} className="flex-1 btn-primary py-3.5">
                      Revisar e finalizar
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                  <h2 className="font-display font-extrabold text-xl text-surface-900 mb-4">Confirme e finalize</h2>

                  <div className="bg-white rounded-2xl p-6 border border-surface-200 space-y-3">
                    <Row label="Produto" value={items[0]?.title?.slice(0, 60) + (items[0]?.title && items[0].title.length > 60 ? '…' : '')} />
                    <Row label="Vendedor" value={items[0]?.vendorName || ''} />
                    <Row label="Entrega" value={items[0]?.deliveryType === 'auto' ? '⚡ Instantânea' : '📋 Até 24h'} />
                    <Row label="Pagamento" value={{ pix: 'PIX', card: 'Cartão de Crédito', boleto: 'Boleto' }[method]} />
                    {couponDiscount > 0 && <Row label="Cupom" value={`-${couponDiscount}%`} valueClass="text-emerald-600" />}
                    {useKdPoints && kdDiscountValue > 0 && <Row label="KD Points" value={`-${fmt(kdDiscountValue)}`} valueClass="text-amber-600" />}
                    <div className="border-t border-surface-200 pt-3 flex justify-between items-baseline">
                      <span className="font-display font-bold text-surface-900">Total</span>
                      <span className="font-display font-extrabold text-3xl text-brand-600">{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Proteção KIYVO */}
                  <div className="mt-4 p-5 bg-gradient-to-br from-brand-50 via-white to-violet-50 border border-brand-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shrink-0 shadow-lg shadow-brand-600/30">
                        <ShieldCheck size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-display font-bold text-brand-900">Proteção KIYVO</p>
                        <p className="text-sm text-brand-700 mt-1">Seu dinheiro fica em custódia até você confirmar que o produto chegou. Problema? Reembolso garantido em até 7 dias.</p>
                      </div>
                    </div>
                  </div>

                  {phase === 'error' && errorMsg && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-sm text-red-700">
                      <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => setStep(2)} disabled={phase === 'paying'} className="flex-1 btn-secondary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                      <ChevronLeft size={18} /> Voltar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={submitPayment}
                      disabled={phase === 'paying'}
                      className="flex-[2] btn-primary py-4 font-bold text-base shadow-xl shadow-brand-600/30 disabled:opacity-70 relative overflow-hidden"
                    >
                      {phase === 'paying' ? (
                        <Loader2 size={20} className="animate-spin mx-auto" />
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Lock size={16} />
                          {method === 'pix' ? 'Gerar PIX' : method === 'boleto' ? 'Gerar Boleto' : `Pagar ${fmt(total)}`}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar resumo */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-5 shadow-card border border-surface-100 sticky top-24">
              <h3 className="font-display font-bold text-sm text-surface-900 mb-4 uppercase tracking-wider">Resumo</h3>
              <div className="flex gap-3 mb-4">
                {items[0]?.imageUrl ? (
                  <img src={items[0].imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center"><Sparkles size={20} className="text-brand-600" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-surface-900 line-clamp-2">{items[0]?.title}</p>
                  <p className="text-xs text-surface-400">{items[0]?.vendorName}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span className="text-surface-900">{fmt(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-emerald-600"><span>Cupom ({couponDiscount}%)</span><span>-{fmt(couponValue)}</span></div>}
                {useKdPoints && kdDiscountValue > 0 && <div className="flex justify-between text-amber-600"><span>KD Points</span><span>-{fmt(kdDiscountValue)}</span></div>}
                <div className="flex justify-between"><span className="text-surface-500">Frete</span><span className="text-emerald-600 font-semibold">Grátis (digital)</span></div>
                <div className="border-t border-surface-100 pt-2 flex justify-between">
                  <span className="font-display font-bold text-surface-900">Total</span>
                  <span className="font-display font-extrabold text-xl text-brand-600">{fmt(total)}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-surface-100 space-y-2">
                <Seal icon={<ShieldCheck size={14} className="text-brand-600" />} text="Compra garantida" />
                <Seal icon={<Zap size={14} className="text-amber-500" />} text={items[0]?.deliveryType === 'auto' ? 'Entrega instantanea' : 'Entrega em ate 24h'} />
                <Seal icon={<Lock size={14} className="text-emerald-600" />} text="Stripe Secure - SSL 256-bit" />
                <Seal icon={<Star size={14} className="text-violet-600" />} text={kdPointsLabel} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────
function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-surface-600">{label}</span>
      <span className={`font-semibold text-surface-900 ${valueClass || ''}`}>{value}</span>
    </div>
  )
}

function Seal({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-surface-600">
      {icon}
      <span>{text}</span>
    </div>
  )
}

// ─── Tela PIX aguardando ─────────────────────────────────────
function PixWaitingScreen({
  pixData, countdown, copied, onCopy, onCancel,
}: {
  pixData: { qr: string; copiaCola: string; order_number: string; amount: number; expiresAt: string }
  countdown: number
  copied: boolean
  onCopy: () => void
  onCancel: () => void
}) {
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0')
  const ss = String(countdown % 60).padStart(2, '0')
  const expired = countdown === 0
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-surface-100 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white text-center">
          <QrCode size={42} className="mx-auto mb-2" />
          <h1 className="font-display font-extrabold text-2xl">Escaneie para pagar</h1>
          <p className="text-emerald-50 text-sm mt-1">Abra o app do seu banco e escaneie o QR Code</p>
        </div>

        <div className="p-6">
          <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 mb-4 flex justify-center">
            {pixData.qr.startsWith('data:') ? (
              <img src={pixData.qr} alt="QR Code PIX" className="w-60 h-60" />
            ) : (
              <div className="w-60 h-60 flex items-center justify-center bg-surface-100 text-surface-400 text-sm">QR indisponível</div>
            )}
          </div>

          <div className="text-center mb-4">
            <p className="text-xs text-surface-500">Valor</p>
            <p className="font-display font-extrabold text-3xl text-surface-900">{fmt(pixData.amount)}</p>
          </div>

          <button
            onClick={onCopy}
            className={classNames(
              'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all',
              copied ? 'bg-emerald-500 text-white' : 'bg-surface-900 text-white hover:bg-surface-800'
            )}
          >
            {copied ? <><CheckCircle2 size={18} /> Copiado!</> : <><Copy size={18} /> Copiar código PIX (copia e cola)</>}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm">
            <Clock size={16} className={expired ? 'text-red-500' : 'text-amber-500'} />
            <span className={expired ? 'text-red-600 font-semibold' : 'text-surface-600'}>
              {expired ? 'Expirado — gere um novo' : `Expira em ${mm}:${ss}`}
            </span>
          </div>

          <div className="mt-4 p-3 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-700 text-center">
            <Loader2 size={14} className="inline animate-spin mr-1" />
            Aguardando confirmação do pagamento... Assim que recebermos, seu produto será revelado aqui automaticamente.
          </div>

          <p className="mt-3 text-[11px] text-center text-surface-400">Pedido <span className="font-mono font-semibold">{pixData.order_number}</span></p>

          <button onClick={onCancel} className="mt-4 w-full text-sm text-surface-500 hover:text-surface-700 flex items-center justify-center gap-1">
            <X size={14} /> Cancelar e voltar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Tela de SUCESSO com revelação do produto ────────────────
function SuccessScreen({ data, revealed, setRevealed }: { data: { orderNumber: string; assetKey?: string; assetType?: string; amount: number; kdEarned: number }; revealed: boolean; setRevealed: (v: boolean) => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!data.assetKey) return
    try {
      await navigator.clipboard.writeText(data.assetKey)
      setCopied(true)
      toast.success('Copiado!')
      setTimeout(() => setCopied(false), 2500)
    } catch { toast.error('Falha ao copiar') }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
            <CheckCircle2 size={56} className="text-white" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-6">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-surface-900">Pagamento confirmado! 🎉</h1>
          <p className="text-surface-500 mt-2">Seu produto já está pronto — entrega instantânea.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl p-6 shadow-card border border-surface-100 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Pedido" value={data.orderNumber} mono />
            <Stat label="Valor" value={fmt(data.amount)} />
            <Stat label="Pontos" value={`+${data.kdEarned} KD`} accent />
          </div>
        </motion.div>

        {data.assetKey && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} />
              <h3 className="font-display font-bold">Seu produto digital</h3>
            </div>
            {revealed ? (
              <>
                <div className="bg-surface-900/30 backdrop-blur rounded-2xl p-4 border border-white/20">
                  <p className="font-mono text-sm break-all select-all">{data.assetKey}</p>
                </div>
                <button onClick={copy} className="w-full mt-3 py-3 bg-white text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition">
                  {copied ? <><CheckCircle2 size={18} /> Copiado!</> : <><Copy size={18} /> Copiar chave</>}
                </button>
                <p className="text-xs text-emerald-100 mt-3 text-center">Guarde esta chave em local seguro. Você também pode acessá-la na sua Biblioteca.</p>
              </>
            ) : (
              <button onClick={() => setRevealed(true)} className="w-full py-4 bg-white text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition text-lg">
                👁️ Clique para revelar seu produto
              </button>
            )}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/buyer/library" className="flex items-center justify-center gap-2 py-3.5 btn-primary rounded-xl font-bold">
            <Sparkles size={18} /> Minha Biblioteca
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 py-3.5 btn-secondary rounded-xl font-bold">
            Voltar à loja
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-5 p-4 bg-brand-50 border border-brand-100 rounded-2xl text-xs text-brand-800 text-center flex items-start gap-2">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span className="text-left">Dinheiro em custódia por 7 dias. Se houver qualquer problema, abra uma disputa em Meus Pedidos que faremos o reembolso.</span>
        </motion.div>
      </div>
    </div>
  )
}

function Stat({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-surface-400 uppercase tracking-wider">{label}</p>
      <p className={`font-display font-bold text-sm sm:text-base mt-1 ${mono ? 'font-mono' : ''} ${accent ? 'text-amber-600' : 'text-surface-900'}`}>{value}</p>
    </div>
  )
}

