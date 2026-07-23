'use client'
import { motion } from 'framer-motion'
import { Upload, CreditCard, Banknote } from 'lucide-react'

const passos = [
  { n: '01', icone: <Upload className="w-7 h-7" />, titulo: 'Publique em 5 minutos', desc: 'Cadastre seu produto digital (curso, template, plugin, arte, serviço). Escreva título, descrição, preço — nosso agente de IA ajuda se precisar.' },
  { n: '02', icone: <CreditCard className="w-7 h-7" />, titulo: 'Venda com PIX, cartão, boleto', desc: 'Aprovação automática, liberação imediata ao comprador. Gestão de reembolsos e afiliados pronta.' },
  { n: '03', icone: <Banknote className="w-7 h-7" />, titulo: 'Saque em 1 dia útil', desc: 'Quando passar os 7 dias de garantia, saldo fica disponível para saque via PIX. Taxa fixa de R$0,99.' },
]

export function HomeComoFunciona() {
  return (
    <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <div className="inline-block text-[11px] font-black uppercase tracking-widest text-brand-500 mb-3">Como funciona</div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Comece a vender em 3 passos.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-base md:text-lg">Sem burocracia, sem configuração complicada.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {passos.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative bg-white dark:bg-[#111827] rounded-[2rem] p-7 md:p-8 border border-slate-100 dark:border-slate-800"
            >
              <div className="absolute -top-4 left-7 bg-gradient-to-br from-brand-500 to-brand-700 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md">{p.n}</div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5">{p.icone}</div>
              <h3 className="text-xl font-black text-[#0F172A] dark:text-white mb-2">{p.titulo}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
