'use client'
import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass, textareaClass } from '@/components/agents/AgentShell'
import type { ResponderOutput } from '@/lib/agents/responder'

export default function ResponderPage() {
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [seller, setSeller] = useState('KIYVO')
  const [product, setProduct] = useState('')
  const [tone, setTone] = useState('amigavel')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<ResponderOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/responder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, reviewText: review, sellerName: seller, productName: product, tone }),
      })
      const data = await r.json()
      if (data.error) { alert(data.error); return }
      setOut(data)
    } catch { alert('Erro ao gerar') }
    finally { setLoading(false) }
  }

  const sentCores: Record<string, string> = {
    positivo: 'bg-emerald-100 text-emerald-700',
    negativo: 'bg-red-100 text-red-700',
    neutro: 'bg-slate-100 text-slate-600',
    misto: 'bg-amber-100 text-amber-700',
  }

  return (
    <AgentShell titulo="ReviewResponder" tagline="Responde avaliações de clientes no tom perfeito em segundos"
      icone={<MessageSquare className="w-7 h-7" />} cor="bg-gradient-to-br from-sky-500 to-blue-600"
      onGerar={gerar} loading={loading}
      output={out && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${sentCores[out.sentimento]}`}>Sentimento: {out.sentimento}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700">{out.tempoResposta}</span>
            {out.problemaDetectado && <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700">Problema: {out.problemaDetectado}</span>}
          </div>
          <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-2xl p-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">{out.resposta}</div>
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 text-sm">
            <p className="font-black uppercase text-[11px] text-brand-700 dark:text-brand-400 tracking-widest mb-2">Ação recomendada</p>
            <p className="text-slate-700 dark:text-slate-300">{out.acaoRecomendada}</p>
          </div>
          <button onClick={() => { navigator.clipboard?.writeText(out.resposta) }} className="text-xs font-bold text-brand-600 hover:underline">Copiar resposta</button>
        </div>
      )}>
      <Field label="Nota (1 a 5 estrelas)">
        <div className="flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}
              className={`flex-1 py-2 rounded-xl font-black text-lg transition ${n <= rating ? 'bg-amber-400 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>★</button>
          ))}
        </div>
      </Field>
      <Field label="Texto da avaliação">
        <textarea className={textareaClass} value={review} onChange={(e) => setReview(e.target.value)} placeholder="Cole aqui a avaliação do cliente..." />
      </Field>
      <Field label="Nome da sua loja/marca">
        <input className={inputClass} value={seller} onChange={(e) => setSeller(e.target.value)} placeholder="KIYVO" />
      </Field>
      <Field label="Nome do produto">
        <input className={inputClass} value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Ex: Pack de Templates Canva" />
      </Field>
      <Field label="Tom da resposta">
        <select className={selectClass} value={tone} onChange={(e) => setTone(e.target.value)}>
          <option value="amigavel">Amigável & caloroso</option>
          <option value="profissional">Profissional</option>
          <option value="formal">Formal</option>
          <option value="carismático">Carismático (voz de marca)</option>
          <option value="descontraido">Descontraído</option>
        </select>
      </Field>
    </AgentShell>
  )
}
