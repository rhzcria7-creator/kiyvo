'use client'
// Página do agente: Termos de Uso e Privacidade LGPD
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, CheckCircle, Copy } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function AgentePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const formId = 'form-termosuso'

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
      const res = await fetch('/api/agents/termosuso', {
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

  const icon = <Scale className="w-7 h-7" />

  return (
    <AgentShell
      titulo="Termos de Uso e Privacidade LGPD"
      tagline="Documentos legais completos conforme LGPD, CDC e Marco Civil."
      icone={icon}
      cor="bg-gradient-to-br from-gray-700 to-gray-900"
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
        <Field label="Tipo de site"><select className={selectClass} name="tipoSite" required>
        <option value="infoproduto">Infoproduto/Curso</option>
        <option value="saas">SaaS</option>
        <option value="marketplace">Marketplace</option>
        <option value="blog">Blog</option>
        <option value="ecommerce">E-commerce</option>
      </select></Field>
        <Field label="Razão social"><input className={inputClass} name="empresa" placeholder="" required /></Field>
        <Field label="CNPJ"><input className={inputClass} name="cnpj" placeholder="" required /></Field>
        <Field label="Email de contato/DPO"><input className={inputClass} type="email" name="emailContato" required /></Field>
        <Field label="URL do site"><input className={inputClass} name="site" placeholder="" required /></Field>
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
