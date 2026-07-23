'use client'

// Vender na KIYVO — página com tema unificado #FAFAFA/#0F172A

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Rocket, ShoppingBag, Shield, CreditCard, Star, Users, ArrowRight,
  CheckCircle, Zap, TrendingUp, BadgeCheck, Sparkles, Gift, Clock, BarChart3, Headphones
} from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'

const STEPS = [
  { icon: Users, title: 'Crie sua conta', desc: 'Cadastro gratuito em 30 segundos. Sem cartão.' },
  { icon: Shield, title: 'Verifique sua identidade', desc: 'KYC rápido com CPF. Aprovação em até 24h.' },
  { icon: ShoppingBag, title: 'Crie seu anúncio', desc: 'Título, descrição, preço e arquivos. Publique em segundos.' },
  { icon: Zap, title: 'Venda 24/7 no automático', desc: 'Use entrega automática por chaves/licenças. Venda dormindo.' },
  { icon: CreditCard, title: 'Receba com segurança', desc: 'PIX, cartão, boleto. Escrow até a confirmação do comprador.' },
  { icon: Gift, title: 'Saque quando quiser', desc: 'Saque via PIX direto pra sua conta. Rápido e sem burocracia.' },
]

const BENEFITS = [
  { icon: Rocket, title: 'Zero mensalidade', desc: 'Paga só quando vender. Taxas a partir de 8%.' },
  { icon: Zap, title: 'Entrega automática', desc: 'Configure uma vez, entregue pra sempre via bot.' },
  { icon: Shield, title: 'Proteção ao vendedor', desc: 'Escrow e anti-fraude evitam chargebacks abusivos.' },
  { icon: TrendingUp, title: '3x mais conversão', desc: 'Checkout otimizado com PIX em um clique.' },
  { icon: BarChart3, title: 'Dashboard completo', desc: 'Métricas, relatórios e comissões em tempo real.' },
  { icon: Headphones, title: 'Suporte de verdade', desc: 'Time brasileiro que responde rápido em PT-BR.' },
]

const STATS = [
  { v: '1.2M', l: 'compradores ativos' },
  { v: '500k+', l: 'pedidos entregues' },
  { v: 'R$0', l: 'pra começar a vender' },
  { v: '<3s', l: 'tempo médio de entrega' },
]

export default function VenderPage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#10B981_0%,transparent_50%)] opacity-30"/>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#2563EB_0%,transparent_55%)] opacity-40"/>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-black uppercase tracking-widest text-emerald-300 mb-6">
                <Rocket size={12}/> Venda sem limites
              </div>
              <WordPullUp
                as="h1"
                words="Sua renda digital começa aqui."
                className="font-display font-black text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em]"
              />
              <p className="mt-5 text-lg text-white/70 max-w-xl">
                Venda jogos, software, cursos, templates, APIs e qualquer produto digital.
                Sem mensalidade, sem burocracia, com automação de entrega e recebimento garantido.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ShimmerButton href="/cadastro" size="lg" icon={<Rocket size={16}/>}>Começar a vender grátis</ShimmerButton>
                <ShimmerButton href="/planos" variant="secondary" size="lg">Ver taxas e planos</ShimmerButton>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['#2563EB','#10B981','#8B5CF6','#EC4899'].map((c,i)=>(
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0F172A]" style={{background:`linear-gradient(135deg,${c},${c}CC)`}}/>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({length:5}).map((_,i)=><Star key={i} size={14} className="text-amber-400 fill-amber-400"/>)}
                    <span className="ml-1 text-sm font-bold">4,9/5</span>
                  </div>
                  <p className="text-xs text-white/60">+24 mil vendedores ativos</p>
                </div>
              </div>
            </div>
            {/* Card preview */}
            <motion.div
              initial={{ opacity:0, y:30, rotateX:10 }}
              animate={{ opacity:1, y:0, rotateX:0 }}
              transition={{ delay:0.3, duration:0.8, type:'spring' }}
              className="relative max-w-sm mx-auto lg:ml-auto"
            >
              <div className="relative bg-white dark:bg-white/5 text-[#0F172A] dark:text-white rounded-[2rem] p-6 shadow-[0_40px_100px_-20px_rgba(16,185,129,0.4)] border border-white/10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                      <TrendingUp size={18}/>
                    </div>
                    <div>
                      <p className="font-display font-black text-[11px] uppercase tracking-wider text-emerald-600">Venda realizada</p>
                      <p className="text-xs text-[#64748B] dark:text-white/50">agora mesmo</p>
                    </div>
                  </div>
                  <BadgeCheck size={22} className="text-brand-600"/>
                </div>
                <div className="rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] p-5 border border-[#0F172A]/5 dark:border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B] dark:text-white/50">Curso Python</p>
                  <p className="mt-1 font-display font-black text-xl leading-tight">Curso Completo de Python 2026</p>
                  <p className="mt-3 font-display font-black text-2xl text-emerald-600">+ R$ 89,90</p>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-[#64748B] dark:text-white/50"><Clock size={12}/> Entregue automaticamente</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full">PAGO</span>
                </div>
              </div>
              <div className="absolute -inset-10 bg-gradient-to-r from-emerald-400/30 via-brand-400/30 to-violet-400/30 blur-3xl -z-10 rounded-full"/>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white dark:bg-white/5 border-y border-[#0F172A]/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className="text-center lg:text-left lg:border-l lg:border-[#0F172A]/5 dark:border-white/10 lg:first:border-0 lg:pl-5">
              <p className="font-display font-black text-4xl lg:text-5xl tracking-tight">{s.v}</p>
              <p className="mt-1 text-sm text-[#64748B] dark:text-white/50">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 mb-3">Como começar</p>
          <h2 className="font-display font-black text-4xl lg:text-5xl leading-[1] tracking-tight">
            Seis passos pra sua primeira venda.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((s,i)=>(
            <motion.div key={s.title} initial={{opacity:0,y:25}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-40px'}} transition={{delay:i*0.06,duration:0.5}} className="bg-white dark:bg-white/5 rounded-[1.75rem] p-7 border border-[#0F172A]/5 dark:border-white/10 hover:shadow-[0_25px_60px_-20px_rgba(37,99,235,0.2)] transition hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
                  <s.icon size={18}/>
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#94A3B8] dark:text-white/40">Passo {i+1}</span>
              </div>
              <h3 className="font-display font-black text-xl leading-tight">{s.title}</h3>
              <p className="text-sm text-[#475569] dark:text-white/60 mt-2 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-white dark:bg-white/5 border-y border-[#0F172A]/5 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 mb-3">Vantagens</p>
            <h2 className="font-display font-black text-4xl lg:text-5xl leading-[1] tracking-tight">
              Por que vender na KIYVO.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b,i)=>(
              <motion.div key={b.title} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}} className="p-7 rounded-[2rem] bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-[#0F172A]/5 dark:border-white/10 hover:border-brand-200 transition">
                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4">
                  <b.icon size={20}/>
                </div>
                <h3 className="font-display font-black text-lg">{b.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-white/50 mt-1.5 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-[#0F172A] text-white p-10 lg:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#10B981_0%,transparent_60%)] opacity-40"/>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#2563EB_0%,transparent_50%)] opacity-50"/>
            <div className="relative">
              <WordPullUp
                as="h2"
                words="Sua primeira venda pode sair hoje."
                className="font-display font-black text-3xl lg:text-5xl leading-[0.95] tracking-tight mb-5"
              />
              <p className="text-white/70 max-w-lg mx-auto">
                Cadastro em 30 segundos. Sem cartão. Sem pegadinha.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <ShimmerButton href="/cadastro" size="lg" icon={<Sparkles size={16}/>}>Criar conta de vendedor</ShimmerButton>
                <ShimmerButton href="/planos" variant="secondary" size="lg">Ver taxas</ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
