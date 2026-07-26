'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Shield, TrendingUp, DollarSign, Users, BarChart3, Gift, ArrowRight } from 'lucide-react'

const BENEFITS = [
  { icon: <DollarSign className="w-5 h-5" />, title: 'Taxa Zero ate R$ 5.000', desc: 'Sem taxa nas primeiras vendas. Depois taxas a partir de 1%.' },
  { icon: <Zap className="w-5 h-5" />, title: 'Saque em 1 dia via PIX', desc: 'Receba suas vendas em ate 24 horas. Minimo de R$ 30.' },
  { icon: <Users className="w-5 h-5" />, title: '+1M de Compradores', desc: 'Acesse base ativa de milhoes de compradores no Brasil.' },
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Analytics Completos', desc: 'Metricas em tempo real de vendas, visitas, conversao.' },
  { icon: <Gift className="w-5 h-5" />, title: 'KD Points para Vend.', desc: 'Ganhe pontos bonus por cada venda.' },
  { icon: <Shield className="w-5 h-5" />, title: 'Protecao Anti-Fraude', desc: 'Sistema com escrow de 7 dias para seguranca.' },
]

export default function SellPage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-[#0B0F1A] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              Vend. faturaram R$ 2.5M+ este mes
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight mb-4">
              Venda seus produtos com a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">menor taxa</span>
              {' '}do Brasil
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
              Taxa ZERO nas primeiras R$ 5.000 em vendas. 1 milhao de compradores.
            </p>
            <a href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-full text-sm hover:opacity-90 transition-all shadow-lg">
              Comecar a Vender Gratis <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-6 shadow-sm">
          {[
            { label: 'Vend. Ativos', value: '12K+' },
            { label: 'Prod. Vendidos', value: '789+' },
            { label: 'Fat. Mensal', value: 'R$ 2.5M+' },
            { label: 'Taxa Media', value: '3.5%' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-zinc-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white text-center mb-8">Por que vender no KIYVO?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">{b.icon}</div>
              <h3 className="font-bold text-zinc-900 dark:text-white mb-1">{b.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Comece a vender agora!</h2>
          <p className="text-blue-100 mb-6">Taxa zero nas primeiras R$ 5.000 em vendas. Sem mensalidade.</p>
          <a href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-zinc-900 font-semibold rounded-full text-sm hover:opacity-90 transition-all">
            Criar Conta Gratis <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </main>
  )
}
