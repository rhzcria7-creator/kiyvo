'use client'
import { useState } from 'react'
import { Flame } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
import type { ScarcityOutput } from '@/lib/agents/scarcityforge'

export default function ScarcityPage() {
  const [product, setProduct] = useState('')
  const [price, setPrice] = useState('97')
  const [stock, setStock] = useState('')
  const [sales, setSales] = useState('')
  const [int, setInt] = useState<'baixa'|'media'|'alta'>('media')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<ScarcityOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/scarcity', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle: product, price: Number(price), stock: stock ? Number(stock) : 0, salesCount: sales ? Number(sales) : 0, intensidade: int }) })
      const d = await r.json(); if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="ScarcityForge" tagline="Gatilhos de urgência e escassez que dobram conversão"
      icone={<Flame className="w-7 h-7" />} cor="bg-gradient-to-br from-red-500 to-orange-500"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg">🔥</div>
            <div>
              <div className="inline-block bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">{out.badge}</div>
              <h3 className="text-xl md:text-2xl font-black text-[#0F172A] dark:text-white mt-2 leading-tight">{out.titulo}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{out.subtitulo}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">⏰ Urgência</p>
              <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">{out.contadorTexto}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">👥 Prova social</p>
              <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">{out.provaSocial}</p>
            </div>
          </div>
          <div className="bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl p-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Botão de compra recomendado</p>
            <p className="text-lg font-black mt-1">{out.cta}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">⚠️ Risco</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">{out.risco}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Score de urgência: {out.scoreUrgencia}/100</p>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-red-500" style={{ width: `${out.scoreUrgencia}%` }} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Dicas da IA</p>
            <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {out.recomendacoes.map((r, i) => <li key={i} className="flex gap-2"><span className="text-brand-500 font-black">›</span>{r}</li>)}
            </ul>
          </div>
        </div>
      )}>
      <Field label="Título do produto"><input className={inputClass} value={product} onChange={(e)=>setProduct(e.target.value)} placeholder="Ex: Pack Canva Pro" /></Field>
      <Field label="Preço (R$)"><input className={inputClass} type="number" step="0.01" value={price} onChange={(e)=>setPrice(e.target.value)} /></Field>
      <Field label="Estoque atual (opcional)"><input className={inputClass} type="number" value={stock} onChange={(e)=>setStock(e.target.value)} placeholder="Ex: 7" /></Field>
      <Field label="Unidades vendidas (opcional)"><input className={inputClass} type="number" value={sales} onChange={(e)=>setSales(e.target.value)} placeholder="Ex: 247" /></Field>
      <Field label="Intensidade"><select className={selectClass} value={int} onChange={(e)=>setInt(e.target.value as any)}>
        <option value="baixa">Baixa (lançamento suave)</option>
        <option value="media">Média (padrão)</option>
        <option value="alta">Alta (relâmpago / BF)</option>
      </select></Field>
    </AgentShell>
  )
}
