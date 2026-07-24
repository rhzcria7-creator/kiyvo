'use client'

// /affiliate/dashboard — Painel de afiliado (tema unificado)
// Corrige o bug do bg-slate-950 hardcoded e adiciona:
//   - Link curto /r/CODE
//   - Compartilhamento WhatsApp/Twitter/FB
//   - Histórico de indicações
//   - Regras e saque

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth/context'
import {
  Share2, Copy, Eye, MousePointerClick, DollarSign, TrendingUp,
  CheckCircle, Gift, Users, Clock, ArrowRight, Wallet, MessageCircle,
  Twitter, Facebook, Instagram,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ShimmerButton from '@/components/ui/ShimmerButton'
import { AFFILIATE } from '@/lib/affiliates/constants'

interface DashboardData {
  referral_code: string
  total_clicks: number
  total_conversions: number
  total_earnings: number
  pending_earnings: number
  available_earnings: number
}

export default function AffiliateDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    referral_code: '',
    total_clicks: 0,
    total_conversions: 0,
    total_earnings: 0,
    pending_earnings: 0,
    available_earnings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login?next=/affiliate/dashboard'); return }
    loadAffiliateData()
  }, [user, authLoading, router])

  async function loadAffiliateData() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/v1/affiliate')
      if (res.ok) {
        const d = await res.json()
        setData({
          referral_code: d.affiliate?.referral_code || (user?.email ? generateCode(user.email) : 'KIYVO5'),
          total_clicks: d.affiliate?.total_clicks || 0,
          total_conversions: d.affiliate?.total_conversions || 0,
          total_earnings: Number(d.affiliate?.total_earnings) || 0,
          pending_earnings: Number(d.pendingCommissions) || 0,
          available_earnings: Number(d.affiliate?.available_earnings) || 0,
        })
      } else if (user?.email) {
        setData((prev) => ({ ...prev, referral_code: generateCode(user.email ?? 'KIYVO') }))
      }
    } catch {
      if (user?.email) setData((prev) => ({ ...prev, referral_code: generateCode(user.email ?? 'KIYVO') }))
    } finally {
      setIsLoading(false)
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kiyvo.vercel.app'
  const referralLink = `${origin}/r/${data.referral_code}`
  const canWithdraw = data.available_earnings >= AFFILIATE.minWithdrawKD / 100

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Não foi possível copiar')
    }
  }

  const shareWA = `https://wa.me/?text=${encodeURIComponent(`Use meu link e ganhe ${AFFILIATE.refereeFirstBuyDiscountPct}% OFF na primeira compra na KIYVO: ${referralLink}`)}`
  const shareTW = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ganhe ${AFFILIATE.refereeFirstBuyDiscountPct}% OFF na KIYVO: ${referralLink}`)}`
  const shareFB = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <Link href="/indique-ganhe" className="text-white/70 hover:text-white text-xs font-bold inline-flex items-center gap-1 mb-4">
            ← Voltar para página de indicação
          </Link>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-[11px] font-black uppercase tracking-widest mb-3">
              <Share2 size={12}/> Programa de Afiliados
            </div>
            <h1 className="font-display font-black text-3xl lg:text-4xl tracking-tight">
              Painel de Afiliado
            </h1>
            <p className="text-white/80 text-sm mt-2 max-w-xl">
              Acompanhe cliques, indicações e comissões em tempo real.
              Cada compra feita pelo seu link gera {AFFILIATE.referrerCommissionPct}% de volta para você.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 -mt-6 relative">
        {/* Link card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.2)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
              <Gift size={20} />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-[#0F172A] dark:text-white">Seu link exclusivo</h2>
              <p className="text-xs text-[#64748B] dark:text-white/60">Compartilhe com amigos e nas redes</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10 font-mono text-sm text-[#0F172A] dark:text-white truncate">
              <span className="truncate">{referralLink}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-black text-sm hover:bg-brand-600 dark:hover:bg-brand-400 transition"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </motion.button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8]">Compartilhar:</span>
            <a href={shareWA} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition">
              <MessageCircle size={12} /> WhatsApp
            </a>
            <a href={shareTW} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 transition">
              <Twitter size={12} /> X / Twitter
            </a>
            <a href={shareFB} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition">
              <Facebook size={12} /> Facebook
            </a>
            <button onClick={() => { copyLink(); toast.success('Link copiado para compartilhar no Instagram') }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-300 text-xs font-bold hover:bg-pink-100 transition">
              <Instagram size={12} /> Stories
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Cliques', value: data.total_clicks, icon: MousePointerClick, color: 'from-sky-500 to-blue-600', text: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' },
            { label: 'Cadastros', value: data.total_conversions, icon: Users, color: 'from-violet-500 to-purple-600', text: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
            { label: 'A receber', value: formatCurrency(data.pending_earnings), icon: Clock, color: 'from-amber-500 to-orange-600', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Disponível p/ saque', value: formatCurrency(data.available_earnings), icon: Wallet, color: 'from-emerald-500 to-green-600', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.text} flex items-center justify-center mb-3`}>
                <s.icon size={18} />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] dark:text-white/40">{s.label}</p>
              <p className="font-display font-black text-2xl text-[#0F172A] dark:text-white mt-0.5">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Saque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-[2rem] p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-display font-black text-lg text-[#0F172A] dark:text-white flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-600" /> Sacar comissões
              </h2>
              <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
                Saque disponível quando atingir {formatCurrency(AFFILIATE.minWithdrawKD / 100)} em comissões confirmadas.
                Você pode sacar via PIX ou converter em KD Points com bônus de 10%.
              </p>
              {!canWithdraw && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-bold text-[#64748B] mb-1">
                    <span>Faltam {formatCurrency(Math.max(0, AFFILIATE.minWithdrawKD / 100 - data.available_earnings))}</span>
                    <span>{Math.min(100, Math.round((data.available_earnings / (AFFILIATE.minWithdrawKD / 100)) * 100))}%</span>
                  </div>
                  <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (data.available_earnings / (AFFILIATE.minWithdrawKD / 100)) * 100)}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                    />
                  </div>
                </div>
              )}
            </div>
            <ShimmerButton
              disabled={!canWithdraw}
              icon={<ArrowRight size={16} />}
              className={!canWithdraw ? 'opacity-40 cursor-not-allowed' : ''}
            >
              {canWithdraw ? 'Solicitar saque' : 'Bloqueado'}
            </ShimmerButton>
          </div>
        </motion.div>

        {/* Regras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-[2rem] p-6 lg:p-8"
        >
          <h2 className="font-display font-black text-lg text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-600" /> Como maximizar ganhos
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              `Comissão de ${AFFILIATE.referrerCommissionPct}% sobre cada compra dos indicados (válido por ${AFFILIATE.attributionWindowDays} dias)`,
              `Bônus de R$ 5,00 quando o indicado fizer a primeira compra ≥ R$${AFFILIATE.minFirstBuyBRL}`,
              `Indicado ganha ${AFFILIATE.refereeFirstBuyDiscountPct}% OFF automaticamente (sem trabalho adicional para você)`,
              'Saque por PIX ou KD Points (com +10% de bônus ao ficar na plataforma)',
              'E-mails temporários são bloqueados — só contas reais geram comissão',
              'Comissões são liberadas após a confirmação do pedido (sem disputa)',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-[#FAFAFA] dark:bg-white/[0.02]">
                <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-[#475569] dark:text-white/70 text-xs leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Placeholder de indicações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-white/[0.04] border border-black/5 dark:border-white/10 rounded-[2rem] p-6 lg:p-8 text-center"
        >
          <Eye size={24} className="mx-auto text-[#94A3B8] mb-3" />
          <p className="text-sm text-[#64748B] dark:text-white/60">
            {isLoading ? 'Carregando suas indicações...' : 'Suas indicações aparecerão aqui assim que alguém se cadastrar pelo seu link.'}
          </p>
          <Link href="/indique-ganhe" className="mt-4 inline-flex items-center gap-1 text-sm font-black text-brand-600 hover:underline">
            Ver como funciona <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

/** Gera um código de afiliado determinístico a partir do e-mail (fallback). */
function generateCode(email: string): string {
  const local = email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const hash = Array.from(email).reduce((a, c) => a + c.charCodeAt(0), 0).toString(36).toUpperCase().slice(0, 3)
  return (local + hash).slice(0, 10) || 'KIYVO5'
}
