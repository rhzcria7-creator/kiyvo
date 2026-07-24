'use client'
// Comparativo honesta com concorrentes (SEO keyword "alternativa a hotmart/kiwify/eduzz")
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'

const plataformas = [
  { nome: 'KIYVO', destaque: true, taxa: '8% + R$0,50', teto: 'R$50', saqueMin: 'R$30', saqueTaxa: 'R$0,99 fixo', saquePrazo: '1 dia', taxasEscondidas: false, cor: 'from-brand-500 to-emerald-600' },
  { nome: 'Hotmart', taxa: '10,99% + R$1', teto: 'Sem teto', saqueMin: 'R$20', saqueTaxa: 'R$1,99', saquePrazo: '1-2 dias', taxasEscondidas: true },
  { nome: 'Monetizze', taxa: '9,9% + R$1', teto: 'Sem teto', saqueMin: 'R$20', saqueTaxa: 'R$1,99', saquePrazo: '2 dias', taxasEscondidas: true },
  { nome: 'Eduzz', taxa: '9,9% + R$1', teto: 'Sem teto', saqueMin: 'R$50', saqueTaxa: 'R$3,49', saquePrazo: '2 dias', taxasEscondidas: true },
  { nome: 'Kiwify', taxa: '12% + R$1', teto: 'Sem teto', saqueMin: 'R$50', saqueTaxa: 'Variável', saquePrazo: '3-5 dias', taxasEscondidas: true },
  { nome: 'GGMax', taxa: '15% + extras', teto: 'Sem teto', saqueMin: 'R$100+', saqueTaxa: 'Alta', saquePrazo: '15+ dias', taxasEscondidas: true },
]

function Selo({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
      {ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {label}
    </span>
  )
}

export function HomeComparativo() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0F172A]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="inline-block text-[11px] font-black uppercase tracking-widest text-brand-500 mb-3">Comparativo</div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mb-4">
            A menor taxa do mercado brasileiro.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg">
            Não somos obrigados a cobrar 11%+ e taxas fixas abusivas. A KIYVO foi feita por quem vende
            digital — e sabemos que cada centavo importa.
          </p>
        </motion.div>

        <div className="overflow-x-auto rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <th className="text-left p-4 md:p-5">Plataforma</th>
                <th className="text-right p-4 md:p-5">Taxa sobre venda</th>
                <th className="text-right p-4 md:p-5">Teto por venda</th>
                <th className="text-right p-4 md:p-5">Saque mín.</th>
                <th className="text-right p-4 md:p-5">Taxa de saque</th>
                <th className="text-right p-4 md:p-5">Taxas escondidas?</th>
              </tr>
            </thead>
            <tbody>
              {plataformas.map((p) => (
                <motion.tr
                  key={p.nome}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className={`border-t border-slate-100 dark:border-slate-800 ${p.destaque ? 'bg-gradient-to-r from-emerald-50 to-brand-50 dark:from-emerald-900/20 dark:to-brand-900/20 font-bold' : ''}`}
                >
                  <td className="p-4 md:p-5">
                    <div className="flex items-center gap-2">
                      {p.destaque && <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white uppercase tracking-widest">Mais justo</span>}
                      <span className={`text-base md:text-lg ${p.destaque ? 'text-[#0F172A] dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{p.nome}</span>
                    </div>
                  </td>
                  <td className={`text-right p-4 md:p-5 ${p.destaque ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>{p.taxa}</td>
                  <td className={`text-right p-4 md:p-5 ${p.destaque ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>{p.teto}</td>
                  <td className="text-right p-4 md:p-5">{p.saqueMin}</td>
                  <td className="text-right p-4 md:p-5">{p.saqueTaxa}</td>
                  <td className="text-right p-4 md:p-5">
                    <div className="flex justify-end">
                      <Selo ok={!p.taxasEscondidas} label={p.taxasEscondidas ? 'Sim' : 'Não'} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-500 mt-4 text-center">
          *Dados públicos coletados em jul/2026 das páginas oficiais de cada plataforma. Podem sofrer alterações.
        </p>

        <div className="mt-8 text-center">
          <Link href="/transparencia" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:underline">
            Ver tabela completa + comparativo de saque <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
