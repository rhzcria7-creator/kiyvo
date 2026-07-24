'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Copy, CheckCircle2, RefreshCw } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'

interface Result { senha: string; forca: string; pontuacao: number; entropyBits: number; tempoQuebra: string; sugestoes: string[] }
export default function Page() {
  const [tamanho, setTamanho] = useState('16')
  const [maiusculas, setMaiusculas] = useState('true')
  const [numeros, setNumeros] = useState('true')
  const [simbolos, setSimbolos] = useState('true')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/senhaforge', { method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ tamanho: Number(tamanho), maiusculas: maiusculas==='true', numeros: numeros==='true', simbolos: simbolos==='true' }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  const copiar = async () => { if (!result?.senha) return; await navigator.clipboard.writeText(result.senha); setCopied(true); setTimeout(()=>setCopied(false), 1500) }
  const corForca = result?.forca==='muito_forte'?'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20':result?.forca==='forte'?'text-green-600 bg-green-50 dark:bg-green-900/20':result?.forca==='media'?'text-amber-600 bg-amber-50 dark:bg-amber-900/20':'text-red-600 bg-red-50 dark:bg-red-900/20'
  return (
    <AgentShell titulo="SenhaForge" tagline="Gera senhas ultra-seguras com estimativa real de tempo de quebra" icone={<Lock className="w-7 h-7" />} cor="bg-gradient-to-br from-slate-700 to-black" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 rounded-2xl bg-slate-900 text-white font-mono text-lg">
            <code className="flex-1 break-all">{result.senha}</code>
            <button onClick={copiar} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
              {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400"/> : <Copy className="w-5 h-5"/>}
            </button>
            <button onClick={gerar} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><RefreshCw className="w-5 h-5"/></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-4 rounded-xl ${corForca}`}><div className="text-[10px] font-black uppercase tracking-widest">Força</div><div className="text-lg font-black uppercase">{result.forca.replace('_',' ')}</div></div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Entropia</div><div className="text-lg font-black">{result.entropyBits} bits</div></div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tempo quebra</div><div className="text-sm font-black">{result.tempoQuebra}</div></div>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <motion.div initial={{width:0}} animate={{width: result.pontuacao + '%'}} transition={{duration:.6}} className={`h-full ${result.pontuacao>70?'bg-emerald-500':result.pontuacao>40?'bg-amber-500':'bg-red-500'}`} />
          </div>
          <div><div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas de segurança</div><ul className="space-y-1 text-sm">{result.sugestoes.map((s,i)=><li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>)}</ul></div>
        </div>
      )}>
      <Field label="Tamanho"><input type="number" min={8} max={64} className={inputClass} value={tamanho} onChange={e=>setTamanho(e.target.value)}/></Field>
      <Field label="Maiúsculas"><select className={selectClass} value={maiusculas} onChange={e=>setMaiusculas(e.target.value)}><option value="true">Sim</option><option value="false">Não</option></select></Field>
      <Field label="Números"><select className={selectClass} value={numeros} onChange={e=>setNumeros(e.target.value)}><option value="true">Sim</option><option value="false">Não</option></select></Field>
      <Field label="Símbolos"><select className={selectClass} value={simbolos} onChange={e=>setSimbolos(e.target.value)}><option value="true">Sim</option><option value="false">Não</option></select></Field>
    </AgentShell>
  )
}
