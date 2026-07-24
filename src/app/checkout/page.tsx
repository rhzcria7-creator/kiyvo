'use client'
// Página de Checkout KIYVO — 100% responsiva, bonita, animada, com anti-fraude client-side
// Validações: cartão, CPF, email, cartão-teste bloqueado, domínio temporário bloqueado
// Integração com Stripe será plugada quando chaves estiverem disponíveis; por simulação retorna sucesso.
// Ao concluir, salva a compra na BIBLIOTECA do usuário (usePurchases) com arquivo de entrega.
// Comentários em PT-BR.
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Lock, ShieldCheck, CreditCard, QrCode,
  CheckCircle2, Loader2, ArrowLeft, AlertTriangle, Tag,
  Shield, Zap, Download, Coins, Sparkles,
} from 'lucide-react'
import { clientAntiFraudCheck, type FraudCheckResult } from '@/lib/security/clientAntiFraud'
import { useAuth } from '@/lib/auth/context'
import { usePurchases } from '@/lib/purchases/store'
import { useKYC } from '@/lib/kyc/store'
import { useKD } from '@/lib/kd/store'
import { useNotif } from '@/lib/notifications/store'
import { SimpleConfetti } from '@/components/ui/SimpleConfetti'

type PaymentMethod = 'pix' | 'credit' | 'boleto'

export default function CheckoutPage() {
  const router = useRouter()
  const search = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  // GATE: compra SÓ com login
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    }
  }, [user, authLoading, router])

  const produtoId = search.get('produtoId') || 'demo'
  const produtoNome = search.get('produtoNome') || 'Produto KIYVO'
  const produtoSlug = search.get('produtoSlug') || search.get('slug') || produtoId
  const produtoEmoji = search.get('emoji') || '✨'
  const produtoGradient = search.get('gradient') || 'from-brand-500 to-brand-700'
  const produtoCategoria = search.get('categoria') || 'digital'
  const produtoVendedor = search.get('vendedor') || 'Vendedor KIYVO'
  const preco = Number(search.get('preco') || 97)
  const qty = Math.max(1, Number(search.get('qty') || 1))
  const total = preco * qty
  const pixDiscount = 0.05 // 5% off no pix
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const { add: addPurchase, init: initPurchases, loaded: purchasesLoaded } = usePurchases()
  const { init: initKYC } = useKYC()
  const { init: initKD, ganhar: ganharKD, gastar: gastarKD, pontos: kdSaldo, calcularDesconto, maxKDPara } = useKD()
  const { init: initNotif, push: pushNotif } = useNotif()
  const [confettiKey, setConfettiKey] = useState(0)

  // Garante que stores foram inicializados (podem não estar se entrou direto na página)
  useEffect(() => { initPurchases(); initKYC(); initKD(); initNotif() }, [initPurchases, initKYC, initKD, initNotif])

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
  const [kdUsar, setKdUsar] = useState(0)
  const [kdAplicado, setKdAplicado] = useState(false)

  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [pedidoIdSucesso, setPedidoIdSucesso] = useState<string>('')
  const [erro, setErro] = useState<string | null>(null)
  const [fraudResult, setFraudResult] = useState<FraudCheckResult | null>(null)

  // Calcular totais
  const subtotal = total
  const descontoCupom = cupomAplicado ? subtotal * (cupomAplicado.percent / 100) : 0
  const subTotalPosCupom = Math.max(0, subtotal - descontoCupom)
  // KD Points aplicados: não passa do máximo de 50% do valor pós-cupom
  const kdCalc = kdAplicado ? calcularDesconto(subTotalPosCupom, kdUsar) : { desconto: 0, kdEfetivos: 0 }
  const descontoKD = kdCalc.desconto
  const kdEfetivosUsados = kdCalc.kdEfetivos
  const subTotalPosKD = Math.max(0, subTotalPosCupom - descontoKD)
  const descontoPix = method === 'pix' ? Math.round(subTotalPosKD * pixDiscount * 100) / 100 : 0
  const totalFinal = Math.max(0, subTotalPosKD - descontoPix)
  const kdDisponivel = kdSaldo || 0
  const kdMaxPossivel = maxKDPara(subTotalPosCupom)
  const kdRecomendado = Math.min(kdDisponivel, kdMaxPossivel)

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
    // Simula processamento do pagamento (Stripe real quando chaves estiverem no .env)
    await new Promise(r => setTimeout(r, 1800))

    // GERA ARQUIVO DE ENTREGA (instruções + dados do pedido em data URL para download imediato)
    const pedidoId = 'KIY-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase()
    setPedidoIdSucesso(pedidoId)
    const conteudoArquivo = `KIYVO - COMPROVANTE DE COMPRA E ACESSO
=============================================

Pedido: ${pedidoId}
Produto: ${produtoNome}
Valor: R$ ${totalFinal.toFixed(2).replace('.', ',')}
Pagamento: ${method === 'pix' ? 'PIX' : method === 'credit' ? 'Cartão de crédito' : 'Boleto'}
Comprador: ${nome} (${email})
CPF: ${cpf}
Data: ${new Date().toLocaleString('pt-BR')}

=============================================
INSTRUÇÕES DE ACESSO
=============================================
Seu produto digital "${produtoNome}" foi liberado automaticamente.

Para acessar quando quiser:
1. Entre na sua conta KIYVO
2. Vá até "Minha biblioteca" (/biblioteca)
3. Clique em "Baixar/Acessar" ao lado do produto

Se o produto for um curso ou área de membros, você receberá os dados de
acesso no seu email em até 5 minutos. Qualquer problema, chame o suporte:
https://t.me/kiyvosuporte

Garantia de 7 dias: se o produto não for o esperado, devolvemos 100%.
Obrigado por comprar na KIYVO! 🚀
`
    const blob = new Blob([conteudoArquivo], { type: 'text/plain;charset=utf-8' })
    const fileUrl = URL.createObjectURL(blob)

    // SALVA COMPRA NA BIBLIOTECA DO USUÁRIO
    if (purchasesLoaded) {
      // Debita KD Points se usados como desconto
      if (kdEfetivosUsados > 0) {
        gastarKD(kdEfetivosUsados, `Desconto na compra: ${produtoNome.slice(0, 30)}`, pedidoId)
      }
      addPurchase({
        productId: produtoId,
        productSlug: produtoSlug,
        titulo: produtoNome,
        preco: totalFinal,
        emoji: produtoEmoji,
        gradient: produtoGradient,
        categoria: produtoCategoria,
        vendedor_nome: produtoVendedor,
        arquivos: [{ nome: `${pedidoId}-acesso.txt`, url: fileUrl }],
      })

      // Dá KD Points de recompensa (5 KD por R$1 no valor FINAL)
      const kdGanhos = Math.max(10, Math.floor(totalFinal * 5))
      ganharKD(kdGanhos, `Compra: ${produtoNome.slice(0, 35)}`, pedidoId)
      pushNotif({ tipo: 'compra', titulo: 'Compra confirmada! 🎉', mensagem: `${produtoNome} já está na sua biblioteca.`, link: '/library', icone: '✅' })
      if (kdEfetivosUsados > 0) {
        pushNotif({ tipo: 'cupom', titulo: `-${kdEfetivosUsados} KD Points`, mensagem: `Desconto de R$ ${descontoKD.toFixed(2).replace('.', ',')} aplicado.`, link: '/recompensas', icone: '🏅' })
      }
      pushNotif({ tipo: 'kd', titulo: `+${kdGanhos} KD Points`, mensagem: 'Você ganhou pontos com esta compra.', link: '/recompensas', icone: '✨' })
    }

    setConfettiKey(k => k + 1)
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
        <SimpleConfetti trigger={confettiKey} pieces={180} duration={3000} />
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
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white mb-2">Compra confirmada! 🎉</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Seu acesso a <strong>{produtoNome}</strong> já está liberado na sua biblioteca.</p>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 text-left mb-4 space-y-2 text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-500">Pedido</span><span className="font-mono font-black text-[#0F172A] dark:text-white text-xs">#{pedidoIdSucesso || 'KIY-' + Date.now().toString(36).toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Produto</span><span className="font-bold text-[#0F172A] dark:text-white text-right max-w-[60%] truncate">{produtoNome}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Valor total</span><span className="font-black text-brand-600 dark:text-brand-400">R$ {totalFinal.toFixed(2).replace('.', ',')}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Pagamento</span><span className="font-bold text-[#0F172A] dark:text-white">{method === 'pix' ? 'PIX' : method === 'credit' ? 'Cartão de crédito' : 'Boleto'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Garantia</span><span className="font-bold text-emerald-600 dark:text-emerald-400">7 dias</span></div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 mt-1">
                      <span className="text-slate-500">⭐ KD Points ganhos</span>
                      <span className="font-black text-amber-600 dark:text-amber-400">+{Math.max(10, Math.floor(totalFinal * 5))} KD</span>
                    </div>
                  </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              const conteudo = `KIYVO - PEDIDO #${pedidoIdSucesso}\nProduto: ${produtoNome}\nValor: R$ ${totalFinal.toFixed(2).replace('.', ',')}\nData: ${new Date().toLocaleString('pt-BR')}\n\nAcesse sua biblioteca em /library para baixar o produto.`
              const b = new Blob([conteudo], { type: 'text/plain;charset=utf-8' })
              const u = URL.createObjectURL(b)
              const a = document.createElement('a')
              a.href = u; a.download = `${pedidoIdSucesso}-comprovante.txt`; document.body.appendChild(a); a.click()
              document.body.removeChild(a); URL.revokeObjectURL(u)
              setTimeout(() => { router.push('/library') }, 400)
            }}
            className="w-full mb-3 inline-flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full py-3.5 font-black text-sm shadow-lg shadow-emerald-500/30"
          >
            <Download className="w-4 h-4" /> Baixar comprovante e acessar produto
          </a>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href="/" className="bg-[#0F172A] hover:bg-black text-white rounded-full py-3 font-bold text-sm text-center">Ir para o início</Link>
            <Link href="/library" className="border-2 border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-white rounded-full py-3 font-bold text-sm text-center">Minha biblioteca</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Tela de loading/aguardando auth
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 font-bold">Verificando autenticação...</p>
          <p className="text-sm text-slate-400 mt-1">Você precisa estar logado para finalizar a compra.</p>
        </div>
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

            {/* KD Points */}
            <div className="py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-500" /> Usar KD Points
                </label>
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                  {kdDisponivel.toLocaleString('pt-BR')} KD disponíveis
                </span>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                    100 KD = R$ 1,00 · máx 50% da compra
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, kdRecomendado)}
                  step={10}
                  value={Math.min(kdUsar, kdRecomendado)}
                  onChange={e => setKdUsar(Number(e.target.value))}
                  disabled={kdDisponivel === 0}
                  className="w-full accent-amber-500"
                />
                <div className="flex items-center justify-between mt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setKdUsar(kdRecomendado); setKdAplicado(true) }}
                    disabled={kdDisponivel === 0}
                    className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-black text-[10px]"
                  >
                    Usar máximo
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setKdUsar(0); setKdAplicado(false) }}
                      className="text-slate-500 dark:text-slate-400 font-bold text-[10px] underline"
                    >
                      Não usar
                    </button>
                    <button
                      type="button"
                      onClick={() => setKdAplicado(true)}
                      disabled={kdUsar === 0}
                      className="px-3 py-1 rounded-lg bg-[#0F172A] dark:bg-white text-white dark:text-black font-black text-[10px] disabled:opacity-40"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
                {kdAplicado && descontoKD > 0 && (
                  <p className="mt-2 text-[11px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {kdEfetivosUsados.toLocaleString('pt-BR')} KD = -R$ {descontoKD.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
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
              {descontoKD > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span className="flex items-center gap-1"><Coins className="w-3 h-3" /> KD Points</span>
                  <span>- R$ {descontoKD.toFixed(2).replace('.', ',')}</span>
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
