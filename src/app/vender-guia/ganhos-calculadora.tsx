'use client'
// Calculadora interativa: quanto VOCÊ pode ganhar vendendo na KIYVO
import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, Calculator } from 'lucide-react'

export function GanhosCalculadora() {
  const [preco, setPreco] = useState(47)
  const [vendasPorDia, setVendasPorDia] = useState(3)

  const taxa = 0.08
  const fixa = 0.5
  const taxaKiyvo = Math.min(preco * taxa + fixa, 50)
  const lucroPorVenda = preco - taxaKiyvo
  const receitaMes = lucroPorVenda * vendasPorDia * 30
  const receitaAno = receitaMes * 12

  return (
    <section className="bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-900/20 dark:via-[#0B0F1A] dark:to-blue-900/20 rounded-[2rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">Quanto você pode ganhar?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Simulação real com taxa justa. Sem pegadinhas.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-2">Preço do seu produto</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
              <input type="range" min={9} max={997} step={1} value={preco} onChange={e => setPreco(Number(e.target.value))} className="w-full accent-brand-600" />
              <div className="text-3xl font-black text-[#0F172A] dark:text-white mt-2">{preco.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-2">Vendas por dia</label>
            <input type="range" min={1} max={50} step={1} value={vendasPorDia} onChange={e => setVendasPorDia(Number(e.target.value))} className="w-full accent-brand-600" />
            <div className="text-3xl font-black text-[#0F172A] dark:text-white mt-2">{vendasPorDia} venda{vendasPorDia > 1 ? 's' : ''}</div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <motion.div key={'l' + preco + vendasPorDia} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Por venda</div>
            <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              R${lucroPorVenda.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-xs text-slate-500 mt-1">Taxa KIYVO: R${taxaKiyvo.toFixed(2).replace('.', ',')}</div>
          </motion.div>

          <motion.div key={'m' + preco + vendasPorDia} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Por mês</div>
            <div className="text-2xl md:text-3xl font-black text-brand-600 mt-1">
              R${Math.round(receitaMes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> renda extra</div>
          </motion.div>

          <motion.div key={'a' + preco + vendasPorDia} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="col-span-2 bg-gradient-to-br from-[#0F172A] to-emerald-700 text-white rounded-2xl p-6">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-80 mb-2"><Sparkles className="w-3.5 h-3.5" /> Por ano</div>
            <div className="text-3xl md:text-5xl font-black leading-none">
              R${Math.round(receitaAno).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm opacity-80 mt-2">Isso é o quanto você pode FATURAR vendendo {vendasPorDia}x/dia na KIYVO com taxa justa.</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
