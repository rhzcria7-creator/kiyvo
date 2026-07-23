'use client'
// Página de Checkout KIYVO — 100% responsiva, bonita, animada, com anti-fraude client-side
// Validações: cartão, CPF, email, cartão-teste bloqueado, domínio temporário bloqueado
// Integração com Stripe será plugada quando chaves estiverem disponíveis; por simulação retorna sucesso
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Lock, ShieldCheck, CreditCard, Smartphone, QrCode,
  CheckCircle2, Loader2, ArrowLeft, AlertTriangle, Tag,
  Shield, Zap,
} from 'lucide-react'
import { clientAntiFraudCheck, type FraudCheckResult } from '@/lib/security/clientAntiFraud'

type PaymentMethod = 'pix' | 'credit' | 'boleto'

export default function CheckoutPage() {
  const router = useRouter()
  const search = useSearchParams()

  const produtoId = search.get('produtoId') || 'demo'
  const produtoNome = search.get('produtoNome') || 'Produto KIYVO'
  const preco = Number(search.get('preco') || 97)
  const qty = Math.max(1, Number(search.get('qty') || 1))
  const total = preco * qty
  const pixDiscount = 0.05 // 5% off no pix
  const [method, setMethod] = useState<PaymentMethod>('pix')

  // Dados do form
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardParcelas, setCardParcelas] = useState(1)
  const [cupom, setCupom] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState<{ code: string; percent: number } | null>(null)
  const [cupomErro, setCupomErro] = useState<string | null>(null)
  const [cupomLoading, setCupomLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [fraudResult, setFraudResult] = useState<FraudCheckResult | null>(null)

  // Calcular totais
  const subtotal = total
  const descontoCupom = cupomAplicado ? subtotal * (cupomAplicado.percent / 100) : 0
  const descontoPix = method === 'pix' ? Math.round((subtotal - descontoCupom) * pixDiscount * 100) / 100 : 0
  const totalFinal = Math.max(0, subtotal - descontoCupom - descontoPix)

  // Verificar anti-fraude client-side quando o usuário preenche dados
  useEffect(() => {
    if (!email && !cpf && !cardNum) return
    const r = clientAntiFraudCheck({ email, cpf, cardNumber: cardNum })
    setFraudResult(r)
  }, [email, cpf, cardNum])

  function formatCPF(v: string) {
    return v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  function formatPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  }
  function formatCard(v: string) {
    return v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }
  function formatExp(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length <= 2) return d
    return `${d.slice(0,2)}/${d.slice(2)}`
  }

  function validarEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  }
  function validarCPF(doc: string) {
    const d = doc.replace(/\D/g, '')
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
    let s = 0, r
    for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i)
    r = (s * 10) % 11
    if (r === 10 || r === 11) r = 0
    if (r !== parseInt(d[9])) return false
    s = 0
    for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i)
    r = (s * 10) % 11
    if (r === 10 || r === 11) r = 0
    if (r !== parseInt(d[10])) return false
    return true
  }

  function aplicarCupom() {
    const code = cupom.trim().toUpperCase()
    if (!code) return
    setCupomLoading(true); setCupomErro(null)
    setTimeout(() => {
      const cuponsValidos: Record<string, number> = {
        'BEMVINDO10': 10,
        'BLACKFRIDAY': 60,
        'KIYVO5': 5,
        'PRIMEIRACOMPRA': 15,
      }
      if (cuponsValidos[code]) {
        setCupomAplicado({ code, percent: cuponsValidos[code] })
        setCupomErro(null)
      } else {
        setCupomErro('Cupom inválido ou expirado')
        setCupomAplicado(null)
      }
      setCupomLoading(false)
    }, 600)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    // Validações
    if (!nome.trim() || nome.trim().length < 3) return setErro('Informe seu nome completo')
    if (!validarEmail(email)) return setErro('Email inválido')
    if (!validarCPF(cpf)) return setErro('CPF inválido')

    // Anti-fraude
    const fraud = clientAntiFraudCheck({ email, cpf, cardNumber: cardNum })
    if (fraud.blocked) return setErro(fraud.reason || 'Compra bloqueada por segurança. Entre em contato com o suporte.')

    if (method === 'credit') {
      const d = cardNum.replace(/\s/g, '')
      if (d.length < 13 || d.length > 19) return setErro('Número do cartão inválido')
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(cardName) || cardName.length < 3) return setErro('Nome no cartão inválido')
      if (!/^\d{2}\/\d{2}$/.test(cardExp)) return setErro('Validade no formato MM/AA')
      if (!/^\d{3,4}$/.test(cardCvv)) return setErro('CVV inválido (3 ou 4 dígitos)')
    }

    setLoading(true)
    // Simula chamada de pagamento
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    setSucesso(true)
  }

  const maxParcelas = Math.min(12, Math.max(1, Math.floor(totalFinal / 5)))
  const parcelaOptions = useMemo(() => {
    const opts = []
    for (let i = 1; i <= maxParcelas; i++) {
      opts.push({ n: i, valor: totalFinal / i })
    }
    return opts
  }, [maxParcelas, totalFinal])

  if (sucesso) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 sm:p-10 max-w-lg w-full text-center border border-slate-100 dark:border-slate-800 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.15 }}
            className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white mb-2">Compra confirmada!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Seu acesso a <strong>{produtoNome}</strong> foi liberado e enviado para <strong>{email || 'seu email'}</strong>.</p>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Pedido</span><span className="font-bold text-[#0F172A] dark:text-white">#KIY-{Date.now().toString().slice(-8)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Produto</span><span className="font-bold text-[#0F172A] dark:text-white text-right max-w-[60%] truncate">{produtoNome}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Valor total</span><span className="font-black text-brand-600 dark:text-brand-400">R$ {totalFinal.toFixed(2).replace('.', ',')}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Pagamento</span><span className="font-bold text-[#0F172A] dark:text-white">{method === 'pix' ? 'PIX' : method === 'credit' ? 'Cartão de crédito' : 'Boleto'}</span></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href="/" className="bg-[#0F172A] hover:bg-black text-white rounded-full py-3 font-bold text-sm text-center">Ir para o início</Link>
            <Link href="/biblioteca" className="border-2 border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-white rounded-full py-3 font-bold text-sm text-center">Minha biblioteca</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#0F172A] border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black">K</div>
            <span className="font-black text-[#0F172A] dark:text-white hidden sm:inline">KIYVO</span>
          </Link>
          <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <Lock className="w-3.5 h-3.5" /> Seguro
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white mb-6"
        >
          Finalizar compra
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna de pagamento */}
          <form onSubmit={submit} className="lg:col-span-2 space-y-5">
            {/* Dados pessoais */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 sm:p-7 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-lg font-black text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-500" /> Seus dados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Nome completo</label>
                  <input value={nome} onChange={e => setNome(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition" placeholder="Maria da Silva" required />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="maria@email.com" required />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Telefone</label>
                  <input value={telefone} onChange={e => setTelefone(formatPhone(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="(11) 99999-9999" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">CPF</label>
                  <input value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="000.000.000-00" required />
                </div>
              </div>
              {fraudResult && (fraudResult.warnings.length > 0 || fraudResult.blocked) && (
                <div className={`mt-4 p-3 rounded-xl text-xs font-semibold ${fraudResult.blocked ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900' : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black mb-1">{fraudResult.blocked ? 'Compra bloqueada' : 'Atenção'}</p>
                      <p>{fraudResult.reason || fraudResult.warnings[0]}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Método de pagamento */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 sm:p-7 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-lg font-black text-[#0F172A] dark:text-white mb-4">Forma de pagamento</h2>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {([
                  { id: 'pix', label: 'PIX', icon: QrCode, desc: '5% OFF' },
                  { id: 'credit', label: 'Cartão', icon: CreditCard, desc: 'Em até 12x' },
                  { id: 'boleto', label: 'Boleto', icon: Tag, desc: 'Vence em 3 dias' },
                ] as const).map(m => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`relative flex flex-col items-center gap-1.5 py-3.5 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${method === m.id ? 'border-brand-500 bg-brand-500/5 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}
                  >
                    <m.icon className="w-5 h-5" />
                    <span>{m.label}</span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">{m.desc}</span>
                    {method === m.id && (
                      <motion.div layoutId="methodIndicator" className="absolute inset-0 rounded-xl border-2 border-brand-500 pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {method === 'pix' && (
                  <motion.div key="pix" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 text-center">
                      <QrCode className="w-16 h-16 mx-auto mb-3 opacity-90" />
                      <p className="font-black text-lg mb-1">Pague com PIX e ganhe 5% de desconto</p>
                      <p className="text-sm opacity-90 mb-3">Após clicar em comprar, vamos gerar um QR Code que expira em 15 minutos.</p>
                      <p className="text-xs opacity-75">Aprovação instantânea — acesso liberado em segundos.</p>
                    </div>
                  </motion.div>
                )}
                {method === 'credit' && (
                  <motion.div key="credit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Número do cartão</label>
                      <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500" placeholder="0000 0000 0000 0000" inputMode="numeric" />
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Nome no cartão</label>
                      <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500 uppercase" placeholder="COMO ESTÁ NO CARTÃO" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Validade</label>
                        <input value={cardExp} onChange={e => setCardExp(formatExp(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500" placeholder="MM/AA" inputMode="numeric" />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">CVV</label>
                        <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500" placeholder="123" inputMode="numeric" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Parcelas</label>
                      <select value={cardParcelas} onChange={e => setCardParcelas(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500">
                        {parcelaOptions.map(p => (
                          <option key={p.n} value={p.n}>{p.n}x de R$ {p.valor.toFixed(2).replace('.', ',')} {p.n === 1 ? 'à vista' : 'sem juros'}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
                {method === 'boleto' && (
                  <motion.div key="boleto" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-5">
                      <p className="text-sm text-slate-700 dark:text-slate-300">Ao confirmar, geramos um boleto bancário que pode ser pago em qualquer banco, app ou casa lotérica. Compensação em até 1-2 dias úteis.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {erro && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-2xl p-4 text-sm font-semibold flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> {erro}
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F172A] hover:bg-black disabled:opacity-70 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black rounded-full py-4 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  {method === 'pix' ? `Pagar R$ ${totalFinal.toFixed(2).replace('.', ',')} no PIX` : method === 'credit' ? `Pagar ${cardParcelas}x de R$ ${(totalFinal / cardParcelas).toFixed(2).replace('.', ',')}` : `Gerar boleto de R$ ${totalFinal.toFixed(2).replace('.', ',')}`}
                </>
              )}
            </motion.button>

            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Compra protegida — dados criptografados, LGPD, anti-fraude ativo
            </p>
          </form>

          {/* Resumo do pedido */}
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:sticky lg:top-24 h-fit bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 sm:p-6 border border-slate-100 dark:border-slate-800"
          >
            <h2 className="text-lg font-black text-[#0F172A] dark:text-white mb-4">Resumo do pedido</h2>

            {/* Produto */}
            <div className="flex gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-3xl flex-shrink-0">🛒</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#0F172A] dark:text-white line-clamp-2">{produtoNome}</p>
                <p className="text-xs text-slate-500 mt-0.5">Quantidade: {qty}</p>
                <p className="text-sm font-black text-brand-600 dark:text-brand-400 mt-0.5">R$ {preco.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            {/* Cupom */}
            <div className="py-4 border-b border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Cupom de desconto
              </label>
              <div className="flex gap-2">
                <input value={cupom} onChange={e => setCupom(e.target.value.toUpperCase())} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-brand-500" placeholder="BEMVINDO10" />
                <button type="button" onClick={aplicarCupom} disabled={cupomLoading} className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-black disabled:opacity-60">
                  {cupomLoading ? '...' : 'OK'}
                </button>
              </div>
              {cupomAplicado && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-bold flex items-center gap-1"><Zap className="w-3 h-3" /> Cupom {cupomAplicado.code} aplicado: -{cupomAplicado.percent}%</p>}
              {cupomErro && <p className="text-xs text-red-500 mt-1.5 font-bold">{cupomErro}</p>}
              <p className="text-[10px] text-slate-400 mt-1.5">Teste: BEMVINDO10, BLACKFRIDAY, PRIMEIRACOMPRA</p>
            </div>

            {/* Valores */}
            <div className="py-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {descontoCupom > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Desconto cupom</span>
                  <span>- R$ {descontoCupom.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              {descontoPix > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Desconto PIX (5%)</span>
                  <span>- R$ {descontoPix.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <span className="font-black text-[#0F172A] dark:text-white">Total</span>
                <span className="text-xl font-black text-[#0F172A] dark:text-white">R$ {totalFinal.toFixed(2).replace('.', ',')}</span>
              </div>
              {method === 'credit' && cardParcelas > 1 && (
                <p className="text-xs text-slate-500 text-right">ou {cardParcelas}x de R$ {(totalFinal / cardParcelas).toFixed(2).replace('.', ',')} sem juros</p>
              )}
            </div>

            {/* Segurança */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-emerald-500" /> Criptografia SSL 256-bit</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Proteção contra chargeback</div>
              <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-emerald-500" /> Seus dados não são armazenados</div>
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  )
}
