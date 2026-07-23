'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Percent, TrendingUp, Clock, Shield, Zap, ArrowRight, Banknote, Gift, CheckCircle } from 'lucide-react'

const vantagens = [
  { icone: Percent, titulo: 'Até 70% de comissão', desc: 'Vendedor define a comissão — encontre produtos de 30% a 70%.' },
  { icone: Clock, titulo: 'Saque em 1 dia útil', desc: 'Receba comissões via PIX em 1 dia útil após a garantia.' },
  { icone: Shield, titulo: 'Atribuição confiável', desc: 'Cookie de 30 dias + first-click e last-click.' },
  { icone: Zap, titulo: 'Materiais prontos', desc: 'Copy, banners e criativos gerados por agentes IA.' },
  { icone: Banknote, titulo: 'Saque mínimo R$50', desc: 'Você não precisa esperar meses para sacar.' },
  { icone: Gift, titulo: 'Bônus de performance', desc: 'Afiliados top ganham KD Points em dobro.' },
]

export default function ProgramaAfiliadosClient() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <section className="max-w-5xl mx-auto px-4 pt-14 pb-10 md:pt-20 text-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Users className="w-3.5 h-3.5" /> Programa de Afiliados
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] dark:text-white leading-[1.05] tracking-tight">
            Ganhe até <span className="text-emerald-500">70% de comissão</span><br />
            recomendando produtos da KIYVO
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Cadastro gratuito, saque em 1 dia útil via PIX, rastreamento confiável e 200+ agentes IA.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cadastro" className="bg-[#0F172A] hover:bg-black dark:bg-white dark:text-black text-white rounded-full px-8 py-4 font-bold text-sm flex items-center justify-center gap-2">
              Quero ser afiliado <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/marketplace" className="border-2 border-slate-200 dark:border-slate-700 rounded-full px-8 py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Ver produtos
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-6 text-center">Vantagens</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vantagens.map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <v.icone className="w-5 h-5" />
              </div>
              <h3 className="font-black text-[#0F172A] dark:text-white mb-2">{v.titulo}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-6">Como funciona</h2>
        <div className="space-y-4">
          {[
            { n: '1', t: 'Cadastre-se', d: '2 minutos, sem mensalidade.' },
            { n: '2', t: 'Escolha produtos', d: 'Encontre produtos com alta conversão.' },
            { n: '3', t: 'Divulgue seu link', d: 'Use os agentes IA KIYVO para criar materiais.' },
            { n: '4', t: 'Receba comissão', d: 'Saque em 1 dia útil via PIX.' },
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
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black">Comece hoje</h2>
          <p className="mt-3 text-emerald-50">Sem mensalidade, sem custos.</p>
          <Link href="/cadastro" className="mt-6 inline-flex items-center gap-2 bg-white text-emerald-700 rounded-full px-8 py-4 font-black text-sm hover:bg-yellow-300 hover:text-black transition">
            Criar conta gratuita <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
