'use client'
// Página do agente: Gerador de Carta de Reembolso
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, CheckCircle, Copy } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function AgentePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const formId = 'form-cartareembolso'

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
        else input[k] = s
      }
      const res = await fetch('/api/agents/cartareembolso', {
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

  const icon = <ScrollText className="w-7 h-7" />

  return (
    <AgentShell
      titulo="Gerador de Carta de Reembolso"
      tagline="Crie cartas formais de reembolso e chargeback conforme o CDC."
      icone={icon}
      cor="bg-gradient-to-br from-emerald-500 to-teal-600"
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
        <Field label="Tipo de reembolso"><select className={selectClass} name="tipo" required>
        <option value="produto_digital">Produto digital não entregue</option>
        <option value="cobranca_indevida">Cobrança indevida</option>
        <option value="garantia_7dias">Arrependimento (7 dias CDC)</option>
        <option value="chargeback">Contestação cartão</option>
      </select></Field>
        <Field label="Nome da empresa/vendedor"><input className={inputClass} name="empresa" placeholder="" required /></Field>
        <Field label="Valor (R$)"><input className={inputClass} type="number" step="0.01" name="valor" defaultValue="97" required /></Field>
        <Field label="Data da compra"><input className={inputClass} type="date" name="dataCompra" /></Field>
        <Field label="Detalhes do ocorrido"><textarea className={textareaClass} name="detalhes" rows={4} required></textarea></Field>
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
      <pre className="bg-slate-950 dark:bg-black text-slate-200 rounded-2xl p-4 text-xs overflow-auto max-h-[500px] leading-relaxed whitespace-pre-wrap">
{JSON.stringify({dica: 'Resultado gerado. Para saídas mais elaboradas copie o JSON e cole nos agentes de copy/texto.', ...data}, null, 2)}
      </pre>
    </motion.div>
  )
}
