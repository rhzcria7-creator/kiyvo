'use client'
import { useState } from 'react'
import { Radar } from 'lucide-react'
import { AgentShell, Field, inputClass } from '@/components/agents/AgentShell'
import type { CompetidorRadarOutput } from '@/lib/agents/competidorradar'

function brl(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }

const saturLabel: Record<string, string> = {
  baixa: '🟢 Baixa (oportunidade)',
  media: '🟡 Média (bom momento)',
  alta: '🟠 Alta (precisa diferencial)',
  muito_alta: '🔴 Muito alta (nicho saturado)',
}

export default function Page() {
  const [nicho, setNicho] = useState('')
  const [produto, setProduto] = useState('')
  const [precoD, setPrecoD] = useState('')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<CompetidorRadarOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/competidor', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, produto: produto || nicho, precoDesejado: precoD ? Number(precoD) : undefined }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="CompetidorRadar" tagline="Raio-X do nicho: saturação, preço ideal, concorrentes e plano de 30 dias"
      icone={<Radar className="w-7 h-7" />} cor="bg-gradient-to-br from-violet-600 to-fuchsia-600" labelBotao="Analisar nicho"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Saturação</p>
              <p className="font-black mt-1">{saturLabel[out.saturacao]}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-2xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Score demanda</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{out.scoreDemanda}/100</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">💰 Mercado</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{out.tamanhoMercado}</p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div><p className="text-[10px] text-slate-500">Mínimo</p><p className="font-black text-red-600">{brl(out.precoMinimo)}</p></div>
              <div><p className="text-[10px] text-slate-500">Médio</p><p className="font-black text-slate-700 dark:text-slate-300">{brl(out.precoMedio)}</p></div>
              <div><p className="text-[10px] text-slate-500">Ideal</p><p className="font-black text-emerald-600">{brl(out.precoIdeal)}</p></div>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">🎯 Canais ideais</p>
            <div className="space-y-1.5">
              {out.canaisIdeais.map((c, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-2">
                  <span className="text-brand-600 font-black text-sm w-10">{c.percentualTrafego}%</span>
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 flex-1 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${c.percentualTrafego}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-28">{c.canal}</span>
                </div>
              ))}
            </div>
          </div>
          <details className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-4">
            <summary className="font-bold text-sm cursor-pointer">🔑 Palavras-chave (+{out.palavrasChave.length})</summary>
            <div className="mt-3 space-y-2">
              {out.palavrasChave.map((k, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span className="font-semibold">{k.kw}</span>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span className={`font-bold ${k.volume === 'alto' ? 'text-emerald-600' : k.volume === 'medio' ? 'text-amber-600' : 'text-slate-400'}`}>{k.volume}</span>
                    <span>{k.cpc}</span>
                    <span>KD {k.dificuldade}</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">🥷 Concorrentes</p>
            <div className="space-y-2">
              {out.concorrentes.map((c, i) => (
                <div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-sm">{c.nome}</p>
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 rounded-full px-2 py-0.5">{c.tipo}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Preço médio: {brl(c.precoMedio)}</p>
                  <p className="text-xs text-emerald-600 mt-1"><strong>Bater com:</strong> {c.comoBater}</p>
                </div>
              ))}
            </div>
          </div>
          <details className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
            <summary className="font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer">🚀 Plano de 30 dias KIYVO</summary>
            <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">{out.acao30Dias.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </details>
          <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-4 text-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">💙 Por que vender na KIYVO?</p>
            <ul className="space-y-1 text-xs">{out.vantagensKiyvo.map((v, i) => <li key={i}>{v}</li>)}</ul>
          </div>
        </div>
      )}>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={(e)=>setNicho(e.target.value)} placeholder="Ex: marketing digital para afiliados" /></Field>
      <Field label="Produto (opcional)"><input className={inputClass} value={produto} onChange={(e)=>setProduto(e.target.value)} placeholder="Ex: Método Orgânico Pro" /></Field>
      <Field label="Preço desejado R$"><input className={inputClass} type="number" value={precoD} onChange={(e)=>setPrecoD(e.target.value)} placeholder="Deixe vazio para sugestão da IA" /></Field>
      <p className="text-xs text-slate-500">📅 Dicas de sazonalidade inclusas na análise</p>
    </AgentShell>
  )
}
