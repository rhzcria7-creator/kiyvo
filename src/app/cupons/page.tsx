'use client'
// ─────────────────────────────────────────────────────────────
// /cupons — Lista de cupons ativos carregados do Supabase
// Design KIYVO, fundo #FAFAFA, cards rounded-[2rem], tipografia preta.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Ticket, Copy, Check, Sparkles, Tag, Clock, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ShimmerButton from '@/components/ui/ShimmerButton'
import { Loader2 } from 'lucide-react'

interface Coupon {
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  min_purchase: number
  expires_at: string | null
  valid_until: string | null
  used_count: number
  max_uses: number | null
  first_purchase_only: boolean | null
}

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/coupons/public')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Erro')))
      .then(d => { if (alive) setCoupons(d.coupons || []) })
      .catch(e => { if (alive) setErr(String(e.message || 'Erro')) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  const copy = async (c: Coupon) => {
    try {
      await navigator.clipboard.writeText(c.code)
      setCopied(c.code)
      toast.success(`Cupom ${c.code} copiado!`)
      setTimeout(() => setCopied(prev => prev === c.code ? null : prev), 2500)
    } catch {
      toast.error('Selecione e copie manualmente')
    }
  }

  const fmtDiscount = (c: Coupon) => {
    if (c.discount_type === 'percentage') return `${Number(c.discount_value)}% OFF`
    return `R$ ${Number(c.discount_value).toFixed(2)} OFF`
  }

  const fmtMin = (c: Coupon) => {
    const min = Number(c.min_order_value || c.min_purchase || 0)
    if (min <= 0) return 'Sem mínimo'
    return `Mín. R$ ${min.toFixed(2)}`
  }

  const fmtExpires = (c: Coupon) => {
    const d = c.expires_at || c.valid_until
    if (!d) return 'Sem validade'
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return 'Sem validade'
    const days = Math.ceil((date.getTime() - Date.now()) / (1000*60*60*24))
    if (days < 0) return 'Expirado'
    if (days > 365) return 'Válido por 1 ano+'
    return `${days} dias restantes`
  }

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen pb-24">
      <section className="pt-14 pb-10 lg:pt-20 lg:pb-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/60 mb-5">
              <Ticket size={12}/> Cupons ativos
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#0F172A] dark:text-white leading-[0.95] tracking-tight">
              Economizar é <span className="text-brand-600">obrigatório</span>.
            </h1>
            <p className="mt-4 text-[#64748B] dark:text-white/60 max-w-xl mx-auto">
              Lista atualizada em tempo real. Clique em "Copiar" e aplique no checkout.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="text-center py-10">
            <Loader2 size={28} className="mx-auto animate-spin text-brand-600"/>
            <p className="mt-3 font-bold text-[#64748B]">Carregando cupons...</p>
          </div>
        )}

        {err && !loading && (
          <div className="rounded-[2rem] bg-rose-50 border border-rose-200 p-6 text-rose-700 flex items-start gap-3">
            <AlertCircle size={20}/>
            <div>
              <p className="font-bold">Não foi possível carregar os cupons</p>
              <p className="text-sm mt-1">Tente novamente em instantes. Enquanto isso, use <b>BOASVINDAS</b> para 10% OFF na primeira compra.</p>
            </div>
          </div>
        )}

        {!loading && !err && coupons && coupons.length === 0 && (
          <div className="rounded-[2rem] bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-12 text-center">
            <Ticket size={36} className="mx-auto text-[#CBD5E1] mb-3"/>
            <p className="font-black text-lg">Nenhum cupom ativo no momento</p>
            <p className="text-sm text-[#64748B] mt-1">Volte em breve — sempre adicionamos novos descontos.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(coupons || []).map((c, i) => {
            const usesLeft = c.max_uses ? Math.max(0, Number(c.max_uses) - Number(c.used_count||0)) : null
            return (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-black/5 dark:border-white/10 shadow-[0_20px_40px_-25px_rgba(15,23,42,0.2)] overflow-hidden group"
              >
                {c.first_purchase_only && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest">
                    Primeira compra
                  </div>
                )}
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br from-brand-100 to-violet-100 dark:from-brand-600/20 dark:to-violet-600/20 opacity-60 blur-2xl" />

                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Tag size={20}/>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-brand-600">Cupom</p>
                  <p className="font-display font-black text-4xl tracking-tight text-[#0F172A] dark:text-white leading-none mt-1">
                    {fmtDiscount(c)}
                  </p>
                  <p className="text-sm text-[#64748B] dark:text-white/60 mt-2 min-h-[2.5em]">
                    {c.description || 'Desconto exclusivo KIYVO'}
                  </p>

                  <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/10 space-y-2 text-xs text-[#64748B] dark:text-white/50">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Tag size={12}/> Código</span>
                      <span className="font-mono font-black text-[#0F172A] dark:text-white">{c.code}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Sparkles size={12}/> Condição</span>
                      <span className="font-semibold text-[#0F172A] dark:text-white/80">{fmtMin(c)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1"><Clock size={12}/> Validade</span>
                      <span className="font-semibold text-[#0F172A] dark:text-white/80">{fmtExpires(c)}</span>
                    </div>
                    {usesLeft !== null && (
                      <div className="flex items-center justify-between">
                        <span>Usos restantes</span>
                        <span className="font-semibold text-[#0F172A] dark:text-white/80">{usesLeft.toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => copy(c)}
                    className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-sm font-black hover:bg-brand-600 dark:hover:bg-brand-300 transition"
                  >
                    {copied === c.code ? <Check size={16}/> : <Copy size={16}/>}
                    {copied === c.code ? 'Copiado!' : 'Copiar cupom'}
                  </motion.button>
                </div>

                {/* Efeito de "ticket notch" */}
                <div className="absolute left-0 top-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FAFAFA] dark:bg-[#0B0F1A]" />
                <div className="absolute right-0 top-1/2 w-4 h-4 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FAFAFA] dark:bg-[#0B0F1A]" />
              </motion.div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-[#64748B] mb-4">Pronto pra usar?</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/categorias">
              <ShimmerButton>Ver produtos</ShimmerButton>
            </Link>
            <Link href="/indique-ganhe" className="inline-flex items-center gap-1 px-5 py-3 rounded-full text-sm font-black hover:text-brand-600 transition">
              Ganhar cupons ilimitados →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
