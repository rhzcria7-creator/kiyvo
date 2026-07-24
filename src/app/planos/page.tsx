'use client'

// Planos (assinaturas KD Points) — tema unificado.
// Quatro tiers: Grátis 15%, Básico 25%, Pro 35%, Plus 50%.
// 100 KD Points = R$1,00. Desconto máximo 50% por pedido.

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Crown, Sparkles, Zap, Shield, ArrowRight, Star } from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'

const PLANS = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    percent: 15,
    highlight: false,
    color: 'from-slate-100 to-slate-200',
    textColor: 'text-[#0F172A] dark:text-white',
    features: [
      '15% de volta em KD Points em cada compra',
      'Catálogo completo de produtos digitais',
      'Proteção ao comprador com escrow',
      'Entrega instantânea na loja oficial',
      'Suporte por chat',
    ],
    cta: 'Começar grátis',
    ctaVariant: 'secondary' as const,
  },
  {
    name: 'Básico',
    price: 'R$ 9,90',
    period: 'por mês',
    percent: 25,
    highlight: false,
    color: 'from-blue-100 to-cyan-100',
    textColor: 'text-[#0F172A] dark:text-white',
    features: [
      '25% de volta em KD Points',
      'Tudo do plano Grátis',
      'Suporte prioritário',
      'Descontos exclusivos da Loja Oficial',
      'Entrega prioritária',
      'Sem anúncios',
    ],
    cta: 'Assinar Básico',
    ctaVariant: 'secondary' as const,
  },
  {
    name: 'Pro',
    price: 'R$ 29,90',
    period: 'por mês',
    percent: 35,
    highlight: true,
    color: 'from-brand-500 to-violet-600',
    textColor: 'text-white',
    features: [
      '35% de volta em KD Points',
      'Tudo do Básico',
      'Cashback em dobro em promoções',
      'Acesso antecipado a ofertas',
      'Suporte 24h em português',
      'Sem taxa de saque',
      'Selo Pro no perfil',
    ],
    cta: 'Assinar Pro',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'Plus',
    price: 'R$ 59,90',
    period: 'por mês',
    percent: 50,
    highlight: false,
    color: 'from-amber-400 to-orange-500',
    textColor: 'text-[#0F172A] dark:text-white',
    features: [
      '50% de volta — máximo do mercado',
      'Tudo do Pro',
      'Consultor pessoal de conta',
      'API ilimitada para revenda',
      'Selo verificado dourado',
      'Acesso beta a novidades',
      'Prioridade máxima em disputas',
    ],
    cta: 'Assinar Plus',
    ctaVariant: 'secondary' as const,
  },
]

const FAQ = [
  { q: 'O que são KD Points?', a: 'KD Points é o programa de cashback da KIYVO. 100 pontos = R$ 1,00 de desconto em qualquer compra futura.' },
  { q: 'Tem desconto máximo?', a: 'Sim. Você pode usar até 50% do valor do pedido em KD Points como desconto.' },
  { q: 'Pontos expiram?', a: 'KD Points expiram após 12 meses sem atividade na conta. Basta comprar ou vender que a validade renova.' },
  { q: 'Posso cancelar quando quiser?', a: 'Claro. Sem fidelidade, sem multa. Cancela em um clique no painel da conta.' },
  { q: 'Vale a pena o Plus?', a: 'Se você gasta mais de R$ 120/mês em produtos digitais, o Plus se paga sozinho com o cashback.' },
]

export default function PlanosPage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563EB_0%,transparent_55%)] opacity-50"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#8B5CF6_0%,transparent_50%)] opacity-30"/>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-5xl mx-auto px-6 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-widest text-white/80 mb-6">
            <Crown size={12}/> KD Points — Assinaturas
          </div>
          <WordPullUp
            as="h1"
            words="Quanto mais digital você vive, mais você ganha."
            className="font-display font-black text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em] mx-auto"
          />
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto">
            Receba até 50% de cada compra de volta em KD Points. 100 pontos = R$ 1,00 de desconto.
            Troque em jogos, software, gift cards, cursos — onde quiser.
          </p>
        </div>
      </section>

      {/* PLANS */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className={`relative rounded-[2rem] p-7 border border-[#0F172A]/5 dark:border-white/10 flex flex-col ${
                plan.highlight
                  ? 'bg-[#0F172A] text-white lg:-translate-y-3 shadow-[0_30px_80px_-20px_rgba(37,99,235,0.5)]'
                  : 'bg-white dark:bg-white/5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.15)]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    <Star size={10} fill="currentColor"/> Mais popular
                  </span>
                </div>
              )}

              <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} ${plan.textColor} items-center justify-center mb-5`}>
                {plan.name === 'Plus' ? <Crown size={24}/> :
                 plan.name === 'Pro' ? <Zap size={24}/> :
                 plan.name === 'Básico' ? <Shield size={24}/> : <Sparkles size={24}/>}
              </div>

              <h3 className="font-display font-black text-2xl tracking-tight">{plan.name}</h3>
              <p className={`text-xs uppercase tracking-widest font-bold mt-1 ${plan.highlight ? 'text-white/60' : 'text-[#64748B] dark:text-white/50'}`}>
                {plan.percent}% de volta em KD Points
              </p>

              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display font-black text-4xl tracking-tight">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? 'text-white/60' : 'text-[#64748B] dark:text-white/50'}`}>/ {plan.period}</span>
              </div>

              <div className={`my-6 h-px ${plan.highlight ? 'bg-white/10' : 'bg-[#0F172A]/5'}`}/>

              <ul className="space-y-3 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-2.5 items-start text-sm">
                    <Check size={16} className={`shrink-0 mt-0.5 ${plan.highlight ? 'text-emerald-400' : 'text-emerald-500'}`}/>
                    <span className={plan.highlight ? 'text-white/90' : 'text-[#475569] dark:text-white/60'}>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <Link
                  href="/cadastro"
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full font-display font-black text-sm transition ${
                    plan.highlight
                      ? 'bg-white dark:bg-white/5 text-[#0F172A] dark:text-white hover:bg-brand-50'
                      : plan.name === 'Plus'
                        ? 'bg-[#0F172A] text-white hover:bg-amber-600'
                        : 'bg-[#0F172A] text-white hover:bg-brand-600'
                  }`}
                >
                  {plan.cta} <ArrowRight size={14}/>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Nota */}
        <p className="mt-10 text-center text-sm text-[#64748B] dark:text-white/50">
          100 KD Points = R$ 1,00. Desconto máximo por pedido: 50%. Cancele quando quiser, sem multa.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 mb-3">Dúvidas</p>
          <h2 className="font-display font-black text-4xl tracking-tight">Perguntas frequentes</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {FAQ.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-[#0F172A]/5 dark:border-white/10"
            >
              <h3 className="font-display font-black text-base">{f.q}</h3>
              <p className="text-sm text-[#64748B] dark:text-white/50 mt-2 leading-relaxed">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-[#0F172A] text-white p-10 lg:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563EB_0%,transparent_60%)] opacity-60"/>
            <div className="relative">
              <h2 className="font-display font-black text-3xl lg:text-5xl leading-[0.95] tracking-tight">
                Comece de graça. Upgrade quando quiser.
              </h2>
              <p className="text-white/70 mt-4 max-w-lg mx-auto">
                Sem cartão. Sem compromisso. Você já sai ganhando 15% de volta na primeira compra.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <ShimmerButton href="/cadastro" size="lg" icon={<Sparkles size={16}/>}>Criar conta grátis</ShimmerButton>
                <ShimmerButton href="/categorias" variant="secondary" size="lg">Ver catálogo primeiro</ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
