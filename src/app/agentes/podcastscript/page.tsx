'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AudioLines } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'

export default function Page() {
  const [form, setForm] = useState<Record<string,any>>({"tema":"","convidado":"","duracao":""})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const gerar = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch("/api/agents/podcastscript", { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tema: form.tema===''?undefined:form.tema,convidado: form.convidado===''?undefined:form.convidado,duracao: form.duracao===''?undefined:Number(form.duracao)}) })
      setResult(await r.json())
    } finally { setLoading(false) }
  }
  return (
    <AgentShell titulo={"PodcastScript"} tagline={"Pauta completa de podcast/entrevista com blocos e perguntas"} icone={<AudioLines className="w-7 h-7"/>} cor={"bg-gradient-to-br from-purple-500 to-pink-600"} onGerar={gerar} loading={loading}
      output={result && (<div className="space-y-4"><div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white"><div className="text-xs font-black uppercase opacity-80">Episódio</div><div className="text-xl font-black mt-1">{result.tituloEpisodio}</div><p className="text-sm opacity-90 mt-2">{result.descricao}</p></div><div className="space-y-2">{result.blocos.map((b:any,i:number)=><div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700"><div className="flex justify-between items-baseline mb-1"><span className="text-xs font-mono text-slate-500">{b.tempo}</span><span className="text-[10px] font-black uppercase tracking-widest text-purple-600">{b.tipo}</span></div><p className="text-sm">{b.descricao}</p>{b.perguntas && <ul className="mt-2 space-y-1 text-xs text-slate-500 list-disc list-inside">{b.perguntas.map((p:string,j:number)=><li key={j}>{p}</li>)}</ul>}</div>)}</div></div>)}>
      <Field label={"Tema"}><input className={inputClass} value={form.tema as string} onChange={e=>setForm({...form,tema:e.target.value})} placeholder={""}/></Field>
      <Field label={"Convidado"}><input className={inputClass} value={form.convidado as string} onChange={e=>setForm({...form,convidado:e.target.value})} placeholder={"João Silva"}/></Field>
      <Field label={"Duração (min)"}><input type="number" className={inputClass} value={form.duracao as string} onChange={e=>setForm({...form,duracao:e.target.value})} placeholder={"40"}/></Field>
    </AgentShell>
  )
}
