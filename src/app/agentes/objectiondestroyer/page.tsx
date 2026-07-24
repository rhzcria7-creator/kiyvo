'use client'
import { useState } from 'react'
import { ShieldOff } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'
export default function Page() {
  const [produto, setProduto] = useState('')
  const [preco, setPreco] = useState('97')
  const [nicho, setNicho] = useState('marketing digital')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<any>(null)
  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/objectiondestroyer', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ produto, preco: Number(preco), nicho }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo="ObjectionDestroyer" tagline="Respostas prontas para as 10 objeções mais comuns em vendas"
      icone={<ShieldOff className="w-7 h-7" />} cor="bg-gradient-to-br from-red-500 to-pink-600" labelBotao="Gerar respostas"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          {out.respostas.map((r:any,i:number)=>(
            <details key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3 text-sm">
              <summary className="font-bold cursor-pointer flex items-center justify-between">
                <span>❓ {r.objecao}</span>
                <span className="text-[10px] font-black uppercase bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">{r.abordagem}</span>
              </summary>
              <div className="mt-3 space-y-2">
                <p><strong>Resposta (venda):</strong> {r.resposta}</p>
                <p className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2"><strong>WhatsApp:</strong> {r.scriptWhatsapp}</p>
              </div>
            </details>
          ))}
          <details className="bg-slate-900 text-white rounded-xl p-4"><summary className="font-bold cursor-pointer">📞 Script de ligação</summary><pre className="whitespace-pre-wrap mt-2 text-xs font-sans opacity-90">{out.scriptLigacao}</pre></details>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs"><ul className="space-y-1">{out.checklist.map((c:string,i:number)=><li key={i}>{c}</li>)}</ul></div>
        </div>
      )}>
      <Field label="Produto"><input className={inputClass} value={produto} onChange={e=>setProduto(e.target.value)} placeholder="Ex: Método ReelsPro" /></Field>
      <Field label="Preço R$"><input className={inputClass} type="number" value={preco} onChange={e=>setPreco(e.target.value)} /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={e=>setNicho(e.target.value)} /></Field>
    </AgentShell>
  )
}
