'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'A KIYVO cobra mensalidade?',
    r: 'Não. Você pode vender gratuitamente. O plano Grátis cobra 8% + R$0,50 por venda. Planos Plus/Pro/VendorPro são opcionais e reduzem taxa, com benefícios extras. Nada de assinatura obrigatória.',
  },
  {
    q: 'Quanto tempo demora pra sacar?',
    r: 'Após os 7 dias de garantia (período do consumidor), você pode sacar a partir de R$30. PIX cai em até 1 dia útil com taxa fixa de R$0,99.',
  },
  {
    q: 'Tem garantia de reembolso?',
    r: 'Sim. Todos os produtos têm garantia mínima de 7 dias por lei (CDC). Se o comprador pedir reembolso nesse período, devolvemos 100%.',
  },
  {
    q: 'A KIYVO é melhor que Hotmart/Kiwify/Eduzz?',
    r: 'Cada plataforma tem seus pontos. A KIYVO cobra taxa menor (8% com teto de R$50 contra 10-12% sem teto), tem saque mais rápido, e 200+ agentes de IA inclusos de graça para ajudar você a vender mais. Comparamos abertamente em /transparencia.',
  },
  {
    q: 'Preciso ter CNPJ pra vender?',
    r: 'Não. Você pode começar como pessoa física (CPF). CNPJ é recomendado para volume alto por causa de impostos, mas não obrigatório.',
  },
  {
    q: 'Como funciona o sistema de afiliados?',
    r: 'Você decide se permite afiliados em cada produto, define a comissão (10-50%) e aprova afiliados. Links rastreáveis, comissão automática em venda confirmada.',
  },
  {
    q: 'Dá pra vender serviço e freelance?',
    r: 'Sim! Temos seção de freelance onde você oferece serviços digitais (design, copy, programação, edição, consultoria) com escrow e bids.',
  },
  {
    q: 'A KIYVO é brasileira?',
    r: 'Sim, com orgulho. Feita por brasileiros, para brasileiros. Suporte em PT-BR, impostos simulados, PIX nativo e sem "surpresas cambiais".',
  },
]

export function HomeFAQ() {
  const [aberto, setAberto] = useState<number | null>(0)
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block text-[11px] font-black uppercase tracking-widest text-brand-500 mb-3">Perguntas frequentes</div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">Tudo que você precisa saber.</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden">
              <button
                onClick={() => setAberto(aberto === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-bold text-[15px] md:text-base text-[#0F172A] dark:text-white">{f.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition ${aberto === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {aberto === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-5 text-sm md:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">{f.r}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
