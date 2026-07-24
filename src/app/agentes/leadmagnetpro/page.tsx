'use client'
// Página do agente: Lead Magnet Pro
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Magnet, CheckCircle, Copy } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function AgentePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const formId = 'form-leadmagnetpro'

  async function handleGerar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null); setResult(null)
    try {
      const formData = new FormData(e.currentTarget)
      const raw = Object.fromEntries(formData.entries())
      const input: Record<string, any> = {}
      for (const [k, v] of Object.entries(raw as Record<string, FormDataEntryValue>)) {
        const s = String(v).trim()
        if (s === '') continue
        if (s === 'true') input[k] = true
        else if (s === 'false') input[k] = false
        else if (!isNaN(Number(s)) && s !== '' && /^-?\d+(\.\d+)?$/.test(s)) input[k] = parseFloat(s)
        else if (s.includes(',')) input[k] = s.split(',').map((x: string) => x.trim()).filter(Boolean)
        else input[k] = s
      }
      // Parser específico por agente
      
      const res = await fetch('/api/agents/leadmagnetpro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Erro ao gerar')
      setResult(data.data)
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const icon = <Magnet className="w-7 h-7" />

  return (
    <AgentShell
      titulo="Lead Magnet Pro"
      tagline="Crie iscas digitais irresistíveis que convertem 20-40% — checklist, ebook, template."
      icone={icon}
      cor="bg-gradient-to-br from-blue-500 to-cyan-600"
      onGerar={() => Promise.resolve()}
      loading={loading}
      output={
        error ? (
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm font-semibold">
            ❌ {error}
          </div>
        ) : result ? (
          <Resultado data={result} />
        ) : null
      }
      labelBotao="Gerar com IA ⚡"
    >
      <form id={formId} onSubmit={handleGerar} className="space-y-4">
        
      <Field label="Nicho"><input className={inputClass} name="nicho" placeholder="marketing digital" required /></Field>
      <Field label="Produto principal"><input className={inputClass} name="produtoPrincipal" placeholder="Curso Completo de Tráfego Pago" required /></Field>
      <Field label="Público alvo"><input className={inputClass} name="publico" placeholder="empreendedores digitais" required /></Field>
      <Field label="Dor principal"><input className={inputClass} name="dorPrincipal" placeholder="não conseguem vender pelo Instagram" required /></Field>
      <Field label="Formato">
        <select className={selectClass} name="formato">
          <option value="checklist">Checklist (PDF)</option>
          <option value="ebook">eBook</option><option value="template">Template</option>
          <option value="planilha">Planilha</option><option value="quiz">Quiz</option><option value="webinar">Webinar</option>
        </select>
      </Field>
        <button form={formId} type="submit" className="hidden">Gerar</button>
      </form>
    </AgentShell>
  )
}

function Resultado({ data }: { data: any }) {
  const json = JSON.stringify(data, null, 2)
  function copiar() { navigator.clipboard.writeText(json) }
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <CheckCircle className="w-4 h-4" /> Gerado com sucesso
        </div>
        <button onClick={copiar} className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <Copy className="w-3 h-3" /> Copiar JSON
        </button>
      </div>
      <pre className="bg-slate-950 dark:bg-black text-slate-200 rounded-2xl p-4 text-xs overflow-auto max-h-[500px] leading-relaxed">
        {json}
      </pre>
      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
        Dica: copie o JSON e cole no seu projeto, planilha ou em outro agente KIYVO.
      </p>
    </motion.div>
  )
}
