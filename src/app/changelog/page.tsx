'use client'
import { motion } from 'framer-motion'
import { CHANGELOG } from '@/lib/changelog'
import { Sparkles, Wrench, Bug, Bot, Rocket } from 'lucide-react'

const icons: Record<string, any> = { novo: Rocket, melhoria: Sparkles, correcao: Bug, agente: Bot }
const corBorda: Record<string, string> = { novo: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', melhoria: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20', correcao: 'border-red-500 bg-red-50 dark:bg-red-900/20', agente: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' }
const corIcone: Record<string, string> = { novo: 'text-emerald-600', melhoria: 'text-blue-600', correcao: 'text-red-600', agente: 'text-purple-600' }

export default function ChangelogPage() {
  const grouped = CHANGELOG.reduce<Record<string, typeof CHANGELOG>>((acc, item) => {
    const key = item.versao
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/15 px-4 py-1.5 mb-4">
            <Sparkles size={14} className="text-purple-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-purple-600">Novidades da plataforma</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white">Changelog <span className="text-brand-500">KIYVO</span></h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Tudo de novo que lançamos pra você vender mais a cada dia.</p>
        </motion.div>

        <div className="mt-10 space-y-8">
          {Object.entries(grouped).map(([versao, itens], gi) => (
            <motion.div key={versao} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: gi * 0.05 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] rounded-full px-4 py-1.5 font-black text-sm">v{versao}</div>
                <p className="text-xs text-slate-500 font-bold">{itens[0].data}</p>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-3 ml-2 border-l-2 border-slate-200 dark:border-slate-800 pl-5">
                {itens.map((item, i) => {
                  const Icon = icons[item.tipo] || Wrench
                  return (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: gi * 0.05 + i * 0.03 }}
                      className={`rounded-2xl border-l-4 ${corBorda[item.tipo]} p-4 bg-white dark:bg-[#111827]`}>
                      <div className="flex items-start gap-3">
                        <div className={`text-2xl`}>{item.emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-base text-[#0F172A] dark:text-white">{item.titulo}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${corIcone[item.tipo]}`}>
                              <Icon className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                              {item.tipo}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.descricao}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
