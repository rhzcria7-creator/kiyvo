'use client'
import { motion } from 'framer-motion'

const numeros = [
  { valor: '8%', label: 'Taxa máxima sobre venda', sub: 'Menor taxa do Brasil' },
  { valor: 'R$50', label: 'Teto por transação', sub: 'Nunca paga mais que isso' },
  { valor: '1 dia', label: 'Saque em PIX', sub: 'Mínimo R$30, taxa R$0,99' },
  { valor: '200+', label: 'Agentes de IA', sub: 'Copy, banners, SEO, vendas' },
]

export function HomeNumeros() {
  return (
    <section className="py-10 md:py-14 border-y border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {numeros.map((n, i) => (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center md:text-left"
          >
            <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-brand-500 to-brand-700 bg-clip-text text-transparent leading-none">
              {n.valor}
            </div>
            <div className="mt-2 text-sm md:text-base font-black text-[#0F172A] dark:text-white">{n.label}</div>
            <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{n.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
