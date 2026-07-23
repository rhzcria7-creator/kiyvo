'use client'

// Como Funciona — página com tema unificado #FAFAFA/#0F172A

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Shield, CheckCircle, Zap, Download, Sparkles, BadgeCheck, ArrowRight } from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'

const BUY_STEPS = [
  { icon: Search, step: '01', title: 'Ache o digital que quer', desc: 'Navegue pelo catálogo ou use a busca. Jogos, software, gift cards, cursos, assinaturas, templates — tudo num lugar só.' },
  { icon: Shield, step: '02', title: 'Pague com segurança', desc: 'PIX em segundos, cartão em até 12x ou boleto. O valor fica em custódia (escrow) até você confirmar que recebeu.' },
  { icon: Download, step: '03', title: 'Receba na hora', desc: 'Produtos oficiais caem na sua biblioteca em menos de 3 segundos. Vendedores parceiros entregam em minutos.' },
  { icon: CheckCircle, step: '04', title: 'Ganhe KD Points', desc: 'Cada compra te dá até 50% do valor de volta em pontos. Troque em descontos nos próximos pedidos.' },
]

const TRUST_BADGES = [
  { icon: BadgeCheck, text: '1.2M+ usuários' },
  { icon: Shield, text: 'Escrow protegido' },
  { icon: Zap, text: 'Entrega <3s' },
  { icon: Download, text: '+500k pedidos' },
]

export default function ComoFuncionaPage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] text-[#0F172A] dark:text-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563EB_0%,transparent_55%)] opacity-50"/>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'28px 28px'}}/>
        <div className="relative max-w-5xl mx-auto px-6 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-black uppercase tracking-widest text-white/80 mb-6">
            <Sparkles size={12}/> Simples, rápido e seguro
          </div>
          <WordPullUp
            as="h1"
            words="Do clique ao download em segundos."
            className="font-display font-black text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em] mx-auto"
          />
          <p className="mt-5 text-lg text-white/70 max-w-2xl mx-auto">
            Comprar produtos digitais na KIYVO é mais fácil que pedir um café. Veja como funciona
            em 4 passos e por que mais de 1 milhão de brasileiros escolhem a gente.
          </p>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-b border-[#0F172A]/5 dark:border-white/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-6 lg:gap-10">
          {TRUST_BADGES.map(b => (
            <div key={b.text} className="inline-flex items-center gap-2 text-sm font-bold text-[#475569] dark:text-white/60">
              <b.icon size={16} className="text-brand-600"/> {b.text}
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="max-w-2xl mb-14">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-600 mb-3">Como comprar</p>
          <h2 className="font-display font-black text-4xl lg:text-5xl leading-[1] tracking-tight">
            Quatro passos e o digital é seu.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {BUY_STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="relative bg-white dark:bg-white/5 p-8 lg:p-10 rounded-[2rem] border border-[#0F172A]/5 dark:border-white/10 hover:shadow-[0_30px_70px_-20px_rgba(37,99,235,0.25)] transition"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center relative">
                  <s.icon size={22}/>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-600 text-white text-[11px] font-black flex items-center justify-center">{s.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-black text-2xl leading-tight">{s.title}</h3>
                  <p className="text-[#475569] dark:text-white/60 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Vendedor */}
        <div className="mt-16 grid md:grid-cols-5 gap-6 items-stretch">
          <div className="md:col-span-2 relative rounded-[2rem] bg-[#0F172A] text-white p-8 lg:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#8B5CF6_0%,transparent_60%)] opacity-40"/>
            <div className="relative">
              <p className="text-[11px] font-black uppercase tracking-widest text-brand-400 mb-4">Para vendedores</p>
              <h3 className="font-display font-black text-3xl leading-[1] tracking-tight">Quer vender também?</h3>
              <p className="text-white/70 mt-3">Anuncie em minutos, receba pela KIYVO, use a automação e venda 24/7 sem estar online.</p>
              <Link href="/vender" className="inline-flex items-center gap-1 mt-6 text-white font-bold hover:gap-2 transition-all">
                Começar a vender <ArrowRight size={16}/>
              </Link>
            </div>
          </div>
          <div className="md:col-span-3 bg-white dark:bg-white/5 p-8 lg:p-10 rounded-[2rem] border border-[#0F172A]/5 dark:border-white/10">
            <p className="text-[11px] font-black uppercase tracking-widest text-brand-600 mb-4">Taxas justas</p>
            <h3 className="font-display font-black text-3xl leading-[1] tracking-tight">Sem mensalidade. Sem surpresa.</h3>
            <div className="mt-6 space-y-3 text-[#475569] dark:text-white/60">
              {[
                '0 reais pra se cadastrar e navegar',
                'Comissão só quando você vende (a partir de 8%)',
                'Saque rápido via PIX em dias úteis',
                'Proteção anti-fraude inclusa',
              ].map(t => (
                <div key={t} className="flex gap-3 items-start">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5"/>
                  <span className="text-sm font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-[#0F172A] text-white p-10 lg:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2563EB_0%,transparent_60%)] opacity-60"/>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#8B5CF6_0%,transparent_50%)] opacity-40"/>
            <div className="relative">
              <WordPullUp
                as="h2"
                words="Pronto pra ver como é rápido?"
                className="font-display font-black text-3xl lg:text-5xl leading-[0.95] tracking-tight mb-5"
              />
              <p className="text-white/70 max-w-lg mx-auto">Catálogo aberto, sem precisar criar conta.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <ShimmerButton href="/categorias" size="lg" icon={<Sparkles size={16}/>}>Explorar categorias</ShimmerButton>
                <ShimmerButton href="/oficial" variant="secondary" size="lg" icon={<BadgeCheck size={16}/>}>Loja Oficial</ShimmerButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
