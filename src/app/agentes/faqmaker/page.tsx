'use client'
import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [produto, setProduto] = useState('')
  const [nicho, setNicho] = useState('')
  const [preco, setPreco] = useState('')
  const [publico, setPublico] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/faqmaker', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ produto, nicho, preco: preco?Number(preco):undefined, publico }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="FAQMaker" tagline="Gera FAQ completo com JSON-LD para SEO de páginas de produto"
      icone={<HelpCircle className="w-7 h-7" />} cor="bg-gradient-to-br from-teal-500 to-cyan-600" labelBotao="Gerar FAQ"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">📋 FAQ pronto com {out.perguntasFrequentes} perguntas</p>
            <p className="text-sm mt-1">Copia o JSON-LD no final para colocar na página do produto — melhora SEO em 20%+.</p>
          </div>
          <div className="space-y-2">
            {out.faqs.map((f:any,i:number)=>(
              <details key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3"><summary className="font-bold cursor-pointer text-sm">Q{i+1}. {f.pergunta}</summary><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{f.resposta}</p></details>
            ))}
          </div>
          <details className="bg-slate-900 text-white rounded-xl p-4"><summary className="font-bold text-sm cursor-pointer">🔍 JSON-LD para SEO (copiar)</summary><pre className="whitespace-pre-wrap mt-2 text-xs font-mono overflow-x-auto">{out.faqSchemaLd}</pre></details>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 mb-1">💡 Perguntas que também deve responder</p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">{out.sugestoesPerguntas.map((p:string,i:number)=><li key={i}>• {p}</li>)}</ul>
          </div>
        </div>
      )}>
      <Field label="Nome do produto"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Ex: Método ReelsPro" /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} placeholder="Ex: marketing digital" /></Field>
      <Field label="Preço R$"><input className={inputClass} type="number" value={preco} onChange={e=>setPreco(e.target.value)} /></Field>
      <Field label="Público alvo"><input className={inputClass} value={publico} onChange={e=>setPublico(e.target.value)} placeholder="Ex: afiliados iniciantes" /></Field>
    </AgentShell>
  )
}
