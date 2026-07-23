'use client'
import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
import type { FunnelForgeOutput } from '@/lib/agents/funnelforge'

export default function Page() {
  const [produto, setProduto] = useState('')
  const [preco, setPreco] = useState('97')
  const [nicho, setNicho] = useState('marketing digital')
  const [publico, setPublico] = useState('afiliados iniciantes')
  const [tipo, setTipo] = useState<any>('perpetuo')
  const [leads, setLeads] = useState('100')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<FunnelForgeOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/funnelforge', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, preco: Number(preco), nicho, publico, tipo, leadsPorDia: Number(leads) }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="FunnelForge" tagline="Funis de vendas completos: perpétuo, oficina 24h, tripwire, lançamento sniper"
      icone={<GitBranch className="w-7 h-7" />} cor="bg-gradient-to-br from-emerald-500 to-teal-600" labelBotao="Projetar funil"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">🎯 {out.nomeFunil}</p>
            <p className="text-sm mt-1 opacity-90">{out.resumo}</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold">Ticket: R$ {out.ticketSugerido}</span>
              <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-bold">{out.roiEstimado}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">Diário</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{out.orcamentoTrafego.diario}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">Semanal</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{out.orcamentoTrafego.semanal}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">Mensal</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{out.orcamentoTrafego.mensal}</p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Etapas do funil</p>
            <div className="space-y-2">
              {out.etapas.map((e, i) => (
                <div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3 border-l-4 border-emerald-500">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-sm text-slate-900 dark:text-white">{e.nome}</p>
                    <span className="text-[10px] font-bold text-emerald-600 shrink-0">{e.metaConversao}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{e.objetivo}</p>
                  <p className="text-xs text-slate-500 mt-1">🎬 Ativos: {e.ativos.join(' • ')}</p>
                  <p className="text-[10px] text-slate-400 mt-1">⏱ {e.tempoEstimado}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">KPIs esperados</p>
            <div className="grid grid-cols-2 gap-2">
              {out.kpis.map((k, i) => (
                <div key={i} className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">{k.kpi}</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{k.valor}</p>
                </div>
              ))}
            </div>
          </div>
          <details className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-sm">
            <summary className="font-bold text-red-700 dark:text-red-400 cursor-pointer">⚠️ Riscos e Checklist de lançamento</summary>
            <ul className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-300">{(out as any).risc.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul>
            <p className="text-xs font-bold mt-3 text-red-700 dark:text-red-400">Checklist:</p>
            <ul className="mt-1 space-y-1 text-xs text-slate-700 dark:text-slate-300">{out.checklistLancamento.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </details>
        </div>
      )}>
      <Field label="Produto"><input className={inputClass} value={produto} onChange={(e)=>setProduto(e.target.value)} placeholder="Ex: Método TikTok Pro" /></Field>
      <Field label="Preço R$"><input className={inputClass} type="number" value={preco} onChange={(e)=>setPreco(e.target.value)} /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={(e)=>setNicho(e.target.value)} /></Field>
      <Field label="Público"><input className={inputClass} value={publico} onChange={(e)=>setPublico(e.target.value)} /></Field>
      <Field label="Tipo de funil"><select className={selectClass} value={tipo} onChange={(e)=>setTipo(e.target.value)}>
        <option value="perpetuo">Perpétuo (recomendado)</option>
        <option value="oficina_24h">Oficina 24h / Desafio</option>
        <option value="lancamento_sniper">Lançamento Sniper 7D</option>
        <option value="tripwire">Tripwire + Upsell</option>
        <option value="high_ticket">High Ticket (Application)</option>
        <option value="afiliado">Afiliado Hot/Launch</option>
        <option value="lead_ads">Lead Ads → WhatsApp</option>
      </select></Field>
      <Field label="Leads por dia"><input className={inputClass} type="number" value={leads} onChange={(e)=>setLeads(e.target.value)} /></Field>
    </AgentShell>
  )
}
