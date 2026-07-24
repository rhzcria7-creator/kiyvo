'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BadgePercent, Shield, Clock, Zap, ArrowRight, CheckCircle } from 'lucide-react'

export default function TaxaZeroClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-[#0B0F1A] dark:via-[#0B0F1A] dark:to-emerald-950/20 pb-20">
      <section className="max-w-4xl mx-auto px-4 pt-14 md:pt-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Zap className="w-3.5 h-3.5" /> Exclusivo para novos vendedores
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#0F172A] dark:text-white leading-[0.95] tracking-tight">
            TAXA <span className="text-emerald-500">0%</span><br />
            nas primeiras 5.000 vendas
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Você leu certo. Novos vendedores na KIYVO têm <strong>taxa de plataforma ZERO</strong> nas primeiras vendas (até 5.000), pagando só o custo direto do Stripe. Sem pegadinhas, sem letras miúdas.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cadastro" className="bg-[#0F172A] hover:bg-black dark:bg-white dark:text-black text-white rounded-full px-8 py-4 font-black text-sm flex items-center justify-center gap-2">
              Quero taxa zero <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/transparencia" className="border-2 border-slate-300 dark:border-slate-700 rounded-full px-8 py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Ver todas as taxas
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icone: BadgePercent, t: '0% de taxa da KIYVO', d: 'Nas primeiras vendas você paga R$0 de comissão para a KIYVO — só o custo do Stripe/PIX.' },
            { icone: Clock, t: 'Válido por 6 meses', d: 'A oferta dura 6 meses após o cadastro.' },
            { icone: Shield, t: 'Só custo de gateway', d: 'A única taxa cobrada é a do Stripe (3,99% + R$0,39 no cartão; 0% no PIX).' },
            { icone: Zap, t: 'Boost grátis de R$49', d: 'Após a primeira venda, você ganha R$49 em boost.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <f.icone className="w-5 h-5" />
              </div>
              <h3 className="font-black text-[#0F172A] dark:text-white text-lg mb-2">{f.t}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-6">Como funciona</h2>
        <div className="space-y-4">
          {[
            { n: '1', t: 'Cadastre-se gratuitamente', d: 'Conta de vendedor criada em 2 minutos.' },
            { n: '2', t: 'Publique seu primeiro produto', d: 'Aprovação em horas.' },
            { n: '3', t: 'Venda com taxa ZERO', d: 'Só paga custo do Stripe.' },
            { n: '4', t: 'Saque PIX em 1 dia útil', d: 'Receba seu dinheiro rápido.' },
          ].map((p, i) => (
            <div key={i} className="flex gap-4 bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black flex-shrink-0">{p.n}</div>
              <div>
                <h3 className="font-black text-[#0F172A] dark:text-white">{p.t}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-[#0F172A] rounded-[2rem] p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black leading-tight">Comece com taxa zero hoje</h2>
          <p className="mt-3 text-slate-300">Oferta por tempo limitado para novos vendedores.</p>
          <div className="mt-6 flex items-start gap-3 text-left text-sm max-w-md mx-auto">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">0% de taxa da KIYVO nas primeiras 5.000 vendas</span>
          </div>
          <div className="mt-2 flex items-start gap-3 text-left text-sm max-w-md mx-auto">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="text-slate-300">Só paga custo de gateway (Stripe)</span>
          </div>
          <Link href="/cadastro" className="mt-8 inline-flex items-center gap-2 bg-emerald-400 text-black rounded-full px-8 py-4 font-black text-sm hover:bg-emerald-300">
            Criar conta agora <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
