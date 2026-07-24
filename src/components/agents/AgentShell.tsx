'use client'

// Shell genérico para páginas de agentes IA
// Entrada: form, saída: resultado em card grande
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles, ArrowRight, RotateCcw } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface AgentShellProps {
  titulo: string
  tagline: string
  icone: ReactNode
  cor: string
  children?: ReactNode // form fields
  onGerar: () => Promise<void>
  loading: boolean
  output: ReactNode
  placeholder?: string
  labelBotao?: string
}

export function AgentShell({
  titulo, tagline, icone, cor, children, onGerar, loading, output,
  placeholder = 'Preencha os campos e clique em "Gerar" para ver a mágica acontecer.',
  labelBotao = 'Gerar com IA',
}: AgentShellProps) {
  const [revelado, setRevelado] = useState(false)
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-8 md:pt-14">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <div className={`w-14 h-14 rounded-2xl ${cor} flex items-center justify-center text-white shadow-lg`}>
            {icone}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] dark:text-white leading-none">{titulo}</h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">{tagline}</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-[#111827] rounded-[2rem] p-5 md:p-7 shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Configurar</span>
            </div>
            <div className="space-y-4">{children}</div>
            <button
              onClick={async () => {
                setRevelado(false)
                await onGerar()
                setRevelado(true)
              }}
              disabled={loading}
              className="mt-6 w-full bg-[#0F172A] hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white rounded-full py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>) : (<>{labelBotao} <ArrowRight className="w-4 h-4" /></>)}
            </button>
            {revelado && !loading && (
              <button onClick={() => { setRevelado(false) }}
                className="mt-3 w-full border border-slate-200 dark:border-slate-700 rounded-full py-2.5 text-sm text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Refazer
              </button>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="md:col-span-3 bg-white dark:bg-[#111827] rounded-[2rem] p-5 md:p-7 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[400px]">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Resultado da IA</span>
            </div>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
                  <p className="text-sm font-semibold">Processando com a inteligência KIYVO...</p>
                </motion.div>
              ) : output ? (
                <motion.div key="out" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{output}</motion.div>
              ) : (
                <motion.div key="ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center gap-3 text-slate-400">
                  <div className={`w-16 h-16 rounded-2xl ${cor} opacity-20 flex items-center justify-center`}>{icone}</div>
                  <p className="text-sm max-w-xs">{placeholder}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export const inputClass = "w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-[#0F172A] dark:text-white placeholder:text-slate-400"
export const selectClass = inputClass + " cursor-pointer"
export const textareaClass = inputClass + " resize-none min-h-[90px]"
