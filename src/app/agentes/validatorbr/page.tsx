'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Copy, CheckCircle2 } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'

interface Result { valido: boolean; tipo: string; valorFormatado?: string; regiao?: string; bandeira?: string; erros: string[]; sugestao?: string }
export default function Page() {
  const [tipo, setTipo] = useState('cpf')
  const [valor, setValor] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [copied, setCopied] = useState(false)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/agents/validatorbr', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ tipo, valor }) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  const copiar = async () => { if (!result?.valorFormatado) return; await navigator.clipboard.writeText(result.valorFormatado); setCopied(true); setTimeout(()=>setCopied(false),1500) }
  return (
    <AgentShell titulo="ValidatorBR" tagline="Valida e formata CPF, CNPJ, CEP, telefone, email, cartão e PIX" icone={<ShieldCheck className="w-7 h-7" />} cor="bg-gradient-to-br from-emerald-500 to-green-600" onGerar={gerar} loading={loading}
      output={result && (
        <div className="space-y-4">
          <div className={`p-5 rounded-2xl ${result.valido?'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200':'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'}`}>
            <div className="flex items-center gap-2 text-2xl font-black">{result.valido?<CheckCircle2 className="w-7 h-7"/>:'⚠️'}{result.valido?'VÁLIDO':'INVÁLIDO'}</div>
            <div className="text-sm opacity-90 mt-1">{result.valido?'Documento/dado validado com sucesso.':result.erros[0]}</div>
            {result.valorFormatado && (
              <div className="mt-3 flex items-center gap-2 bg-white/60 dark:bg-black/20 rounded-xl px-3 py-2 font-mono font-bold">
                <span className="flex-1">{result.valorFormatado}</span>
                <button onClick={copiar} className="p-1.5 rounded-lg hover:bg-white/60">{copied?<CheckCircle2 className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}</button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {result.regiao && <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Região</div><div className="text-lg font-black">{result.regiao}</div></div>}
            {result.bandeira && <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F1A]"><div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Bandeira</div><div className="text-lg font-black">{result.bandeira}</div></div>}
          </div>
          {result.sugestao && <div className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">💡 {result.sugestao}</div>}
        </div>
      )}>
      <Field label="Tipo"><select className={selectClass} value={tipo} onChange={e=>setTipo(e.target.value)}><option value="cpf">CPF</option><option value="cnpj">CNPJ</option><option value="telefone">Telefone</option><option value="cep">CEP</option><option value="email">E-mail</option><option value="cartao">Cartão</option><option value="pix">Chave PIX</option></select></Field>
      <Field label="Valor"><input className={inputClass} value={valor} onChange={e=>setValor(e.target.value)} placeholder="Digite o valor" /></Field>
    </AgentShell>
  )
}
