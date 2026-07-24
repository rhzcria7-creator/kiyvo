// ─────────────────────────────────────────────────────────────
// /indique-ganhe — Indique e Ganhe (landing de afiliados)
//
// Tema unificado: fundo #FAFAFA, cards rounded-[2rem], tipografia preta grande,
// botões pretos rounded-full. Sem design "cara de IA".
//
// Regras (lucro real):
//  • Você (indicador): 8% de comissão em KD Points nas compras dos indicados (90 dias)
//    + R$ 5,00 de bônus na primeira compra ≥ R$20 do amigo.
//  • Amigo (indicado): 5% de desconto na PRIMEIRA compra.
//  • Saque em KD Points ou PIX quando atingir R$50.
// ─────────────────────────────────────────────────────────────

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, Gift, Copy, Check, ArrowRight, Share2, MessageCircle,
  Instagram, Twitter, Facebook, Wallet, Shield, Zap, Crown, TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import WordPullUp from '@/components/ui/WordPullUp'
import ShimmerButton from '@/components/ui/ShimmerButton'
import { AFFILIATE } from '@/lib/affiliates/constants'

// Em um ambiente real, esse código vem do usuário autenticado.
// Se não estiver logado, geramos um código placeholder dinâmico.
function getReferralCode() {
  if (typeof window === 'undefined') return 'KIYVO'
  try {
    const stored = localStorage.getItem('kiyvo_user')
    if (stored) {
      const u = JSON.parse(stored)
      if (u?.referral_code) return String(u.referral_code)
    }
  } catch { /* ignore */ }
  return 'KIYVO5'
}

export default function IndiqueGanhePage() {
  const [copied, setCopied] = useState(false)
  const [code, setCode] = useState<string>(() =>
    typeof window !== 'undefined' ? getReferralCode() : 'KIYVO5',
  )
  const link = `https://kiyvo.vercel.app/r/${code}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Link copiado! Agora é só enviar para os amigos.')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Não foi possível copiar. Selecione e copie manualmente.')
    }
  }

  const copyCode = async (c: string) => {
    try { await navigator.clipboard.writeText(c) } catch { /* ignore */ }
    toast.success(`Cupom ${c} copiado!`)
  }

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-brand-300/30 to-brand-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-200/30 to-rose-300/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize:'48px 48px'}}/>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-[11px] font-black uppercase tracking-widest mb-6"
          >
            <Gift size={12} /> Programa de Indicação KIYVO
          </motion.div>

          <WordPullUp
            as="h1"
            words="Indique amigos. Ganhe junto."
            className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-[#0F172A] dark:text-white leading-[0.95] tracking-tight max-w-4xl mx-auto"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[#64748B] dark:text-white/70 max-w-2xl mx-auto mt-5"
          >
            Para cada amigo que se cadastrar e comprar pelo seu link,
            <strong className="text-[#0F172A] dark:text-white"> você ganha {AFFILIATE.referrerCommissionPct}% de volta</strong> em KD Points
            e o amigo ganha <strong className="text-[#0F172A] dark:text-white">{AFFILIATE.refereeFirstBuyDiscountPct}% de desconto</strong> na primeira compra.
            Simples, justo e sem pegadinha.
          </motion.p>

          {/* Bloco principal do link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 max-w-2xl mx-auto bg-white dark:bg-white/5 rounded-[2rem] p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] border border-black/5 dark:border-white/10"
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-3">
              Seu link exclusivo
            </p>
            <div className="flex items-stretch gap-2">
              <div className="flex-1 flex items-center px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10 font-mono text-sm text-[#0F172A] dark:text-white truncate">
                <span className="truncate">{link}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={copy}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] font-black text-sm hover:bg-brand-600 dark:hover:bg-brand-400 transition"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </motion.button>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] dark:text-white/40">
                Compartilhe:
              </span>
              <ShareButton icon={<MessageCircle size={16} />} label="WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(`Use meu link e ganhe ${AFFILIATE.refereeFirstBuyDiscountPct}% OFF na primeira compra na KIYVO: ${link}`)}`} />
              <ShareButton icon={<Twitter size={16} />} label="X / Twitter" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ganhe ${AFFILIATE.refereeFirstBuyDiscountPct}% OFF na KIYVO usando meu link: ${link}`)}`} />
              <ShareButton icon={<Facebook size={16} />} label="Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} />
              <ShareButton icon={<Instagram size={16} />} label="Instagram" href="#" onClick={() => { copy(); toast.success('Link copiado! Cole no seu story do Instagram.') }} />
            </div>

            <div className="mt-5 pt-5 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-2 text-xs text-[#64748B] dark:text-white/60">
              <Shield size={12} /> Seus amigos precisam apenas se cadastrar usando seu link. E-mails temporários são bloqueados.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6"
          >
            <Link href="/afiliados">
              <ShimmerButton icon={<ArrowRight size={16} />}>
                Ver painel completo de afiliado
              </ShimmerButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 lg:py-20 bg-white dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-3">Como funciona</p>
            <h2 className="font-display font-black text-3xl lg:text-4xl text-[#0F172A] dark:text-white tracking-tight">
              Três passos. Dinheiro de verdade.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                icon: Share2,
                title: 'Compartilhe seu link',
                desc: 'Envie para amigos, grupos ou redes sociais. Cada pessoa que clica fica associada a você por 90 dias.',
                color: 'from-brand-500 to-brand-700',
              },
              {
                n: '02',
                icon: Users,
                title: 'Amigo se cadastra e compra',
                desc: `Ele ganha ${AFFILIATE.refereeFirstBuyDiscountPct}% de desconto na primeira compra (automaticamente) e você já começa a acumular.`,
                color: 'from-violet-500 to-purple-700',
              },
              {
                n: '03',
                icon: Wallet,
                title: 'Você recebe a comissão',
                desc: `${AFFILIATE.referrerCommissionPct}% do valor de cada compra em KD Points (100 pts = R$1). Saque em PIX ou use como desconto.`,
                color: 'from-emerald-500 to-green-700',
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative bg-white dark:bg-[#0B0F1A] rounded-[2rem] p-7 border border-black/5 dark:border-white/10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]"
              >
                <div className={`absolute -top-4 left-7 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} text-white font-display font-black text-sm flex items-center justify-center shadow-lg`}>
                  {step.n}
                </div>
                <step.icon size={28} className="text-brand-600 dark:text-brand-400 mt-4 mb-4" />
                <h3 className="font-display font-black text-xl text-[#0F172A] dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-white/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GANHOS */}
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-3">Quanto posso ganhar?</p>
            <h2 className="font-display font-black text-3xl lg:text-4xl text-[#0F172A] dark:text-white tracking-tight">
              Exemplo rápido
            </h2>
            <p className="text-[#64748B] dark:text-white/60 mt-3 max-w-2xl mx-auto text-sm">
              Supondo que você indique 20 amigos e cada um gaste em média R$ 80:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { label: 'Amigos indicados', value: '20', icon: Users, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-500/10' },
              { label: 'Volume gerado', value: 'R$ 1.600', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-500/10' },
              { label: 'Sua comissão', value: 'R$ 128', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-[2rem] p-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10"
              >
                <div className={`w-11 h-11 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon size={20} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] dark:text-white/40">{s.label}</p>
                <p className="font-display font-black text-3xl text-[#0F172A] dark:text-white mt-1">{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CUPONS */}
      <section className="py-16 lg:py-20 bg-white dark:bg-white/[0.02] border-y border-black/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-3">Cupons prontos</p>
            <h2 className="font-display font-black text-3xl lg:text-4xl text-[#0F172A] dark:text-white tracking-tight">
              Quer compartilhar um cupom em vez do link?
            </h2>
            <p className="text-[#64748B] dark:text-white/60 mt-3 max-w-2xl mx-auto text-sm">
              Os cupons abaixo são ativados pelo seu código. Envie para qualquer pessoa e o sistema credita você automaticamente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { code: `AMIGO5`, desc: '5% OFF primeira compra', pct: 5 },
              { code: `KIT10`, desc: 'R$10 OFF primeira compra ≥ R$50', pct: 0 },
              { code: `BOASVINDAS`, desc: 'Frete grátis + 5% OFF', pct: 5 },
            ].map((c) => (
              <motion.button
                key={c.code}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copyCode(c.code)}
                className="rounded-2xl p-5 bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-600/20 dark:to-indigo-600/20 border border-brand-200/50 dark:border-brand-500/20 text-left group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono font-black text-xl text-[#0F172A] dark:text-white">{c.code}</div>
                  <Copy size={16} className="text-brand-600 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <p className="text-sm text-[#64748B] dark:text-white/70">{c.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* REGRAS */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-black text-2xl lg:text-3xl text-[#0F172A] dark:text-white mb-6">Regras simples</h2>
          <div className="space-y-3">
            {[
              'Comissão de ' + AFFILIATE.referrerCommissionPct + '% em KD Points sobre compras dos indicados (válido por 90 dias).',
              'Bônus de R$ 5,00 (500 KD Points) quando o indicado fizer a primeira compra ≥ R$ 20.',
              'Indicado ganha ' + AFFILIATE.refereeFirstBuyDiscountPct + '% de desconto na primeira compra (aplicado automaticamente no carrinho).',
              'Saque disponível quando acumular R$ 50,00 em comissões (PIX ou KD Points).',
              'E-mails temporários, contas fake e auto-indicação são detectados e bloqueados pelo sistema anti-fraude.',
              'Comissões são creditadas após a confirmação da compra (sem disputa).',
              'KIYVO se reserva o direito de cancelar comissões em caso de abuso.',
            ].map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10"
              >
                <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-sm text-[#0F172A] dark:text-white/80 leading-relaxed">{rule}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] bg-[#0F172A] text-white p-10 lg:p-14 overflow-hidden shadow-[0_30px_80px_-20px_rgba(15,23,42,0.6)]"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="relative text-center">
              <Crown size={32} className="mx-auto mb-4 text-amber-300" />
              <h2 className="font-display font-black text-3xl lg:text-5xl tracking-tight leading-[1] mb-4">
                Comece a indicar hoje.
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                Leva 30 segundos para copiar seu link. Cada amigo que comprar é dinheiro na sua carteira.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href="/cadastro">
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0F172A] font-black text-sm uppercase tracking-wider hover:bg-brand-400 transition">
                    Criar conta grátis <ArrowRight size={16} />
                  </button>
                </Link>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-black text-sm uppercase tracking-wider hover:bg-white/10 transition"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado!' : 'Copiar meu link'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function ShareButton({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href: string; onClick?: () => void }) {
  if (onClick) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1F5F9] dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-[#0F172A] dark:text-white/70 hover:text-brand-600 dark:hover:text-brand-300 text-xs font-bold transition"
      >
        {icon} {label}
      </motion.button>
    )
  }
  return (
    <motion.a
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1F5F9] dark:bg-white/5 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-[#0F172A] dark:text-white/70 hover:text-brand-600 dark:hover:text-brand-300 text-xs font-bold transition"
    >
      {icon} {label}
    </motion.a>
  )
}
