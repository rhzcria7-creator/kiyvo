'use client'
// /doar — Página de doações para manter o Copiloto e plataforma gratuitos
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Heart, Coffee, Rocket, Shield, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react'

const TIERS = [
  {
    value: 'R$ 5',
    title: 'Cafézinho',
    icon: Coffee,
    desc: 'Mantém o Copiloto rodando por 1 dia',
    perks: ['Agradecimento público', 'Selo Apoiador no perfil', 'Acesso ao Copiloto ilimitado'],
    gradient: 'from-amber-400 to-orange-500',
    popular: false,
  },
  {
    value: 'R$ 20',
    title: 'Apoiador',
    icon: Rocket,
    desc: 'Mantém por 1 semana + pesquisa web liberada',
    perks: ['Tudo do Cafézinho', 'Pesquisa DuckDuckGo em todas as respostas', 'Prioridade em novas features', 'Badge Apoiador Ouro'],
    gradient: 'from-brand-500 to-indigo-600',
    popular: true,
  },
  {
    value: 'R$ 50',
    title: 'Patrono',
    icon: Shield,
    desc: 'Financia 1 mês do Copiloto premium',
    perks: ['Tudo dos tiers anteriores', 'Nome na página de apoiadores', 'Acesso antecipado a agentes novos', 'Suporte prioritário por WhatsApp'],
    gradient: 'from-violet-500 to-fuchsia-600',
    popular: false,
  },
]

const METAS = [
  { label: 'Custear 1 mês de IA premium', current: 34, target: 100, done: false },
  { label: 'Servidor dedicado', current: 12, target: 500, done: false },
  { label: '200+ agentes gratuitos', current: 200, target: 200, done: true },
]

export default function DoarPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.15),transparent_55%)]" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 shadow-xl shadow-pink-500/30"
            >
              <Heart className="w-10 h-10 text-white fill-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight leading-[1.05]"
            >
              Ajude a manter a KIYVO <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">gratuita</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mt-4 max-w-2xl mx-auto"
            >
              Nosso Copiloto usa inteligência artificial com pesquisa atualizada da web — e custa dinheiro para rodar.
              Sua doação paga as APIs e mantém tudo 100% gratuito para todos.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-6"
            >
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% transparente
              </span>
              <span className="inline-flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <Shield className="w-3.5 h-3.5" /> Pix direto (sem intermediários)
              </span>
              <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full">
                <Zap className="w-3.5 h-3.5" /> Sem assinatura
              </span>
            </motion.div>
          </div>
        </section>

        {/* Tiers */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className={`relative bg-white dark:bg-[#111827] rounded-[1.5rem] border p-6 sm:p-7 flex flex-col ${
                  tier.popular
                    ? 'border-brand-400 dark:border-brand-500 shadow-2xl shadow-brand-500/20 md:scale-105'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    Mais popular
                  </span>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center text-white mb-4`}>
                  <tier.icon className="w-6 h-6" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{tier.title}</p>
                <p className="text-4xl font-black text-[#0F172A] dark:text-white mt-1">{tier.value}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-4">{tier.desc}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.03 }}
                  className={`w-full py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition ${
                    tier.popular
                      ? 'bg-[#0F172A] dark:bg-white text-white dark:text-black hover:bg-brand-600 dark:hover:bg-brand-400 dark:hover:text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-[#0F172A] dark:text-white hover:bg-slate-200 dark:hover:bg-white/20'
                  }`}
                  onClick={() => {
                    // Simulação: em produção, integrar com Stripe/Payment link
                    alert(`Em breve: doação ${tier.value} via Pix. Chave PIX: doacoes@kiyvo.com.br`)
                  }}
                >
                  Doar {tier.value} <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Metas */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16">
          <h2 className="text-2xl font-black text-[#0F172A] dark:text-white mb-6 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" /> Para onde vai o dinheiro
          </h2>
          <div className="bg-white dark:bg-[#111827] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5">
            {METAS.map((m, i) => {
              const pct = Math.min(100, Math.round((m.current / m.target) * 100))
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                      {m.done && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {m.label}
                    </span>
                    <span className={`text-xs font-black ${m.done ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {m.done ? '✅ Concluído' : `${m.current}%`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                      className={`h-full rounded-full ${m.done ? 'bg-emerald-500' : 'bg-gradient-to-r from-pink-500 to-rose-500'}`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* PIX copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-[1.5rem] p-6 sm:p-8 text-center shadow-xl shadow-emerald-500/20"
          >
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Doação direta via Pix</p>
            <p className="text-lg sm:text-xl font-black mb-2">Chave Pix (e-mail):</p>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-3 font-mono text-sm sm:text-base font-bold mb-3">
              doacoes@kiyvo.com.br
            </div>
            <p className="text-xs opacity-90">Qualquer valor ajuda. Muito obrigado! 💚</p>
          </motion.div>

          <div className="text-center mt-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600">
              ← Voltar para a página inicial
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
