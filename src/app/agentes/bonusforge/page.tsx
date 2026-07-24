'use client'
import { useState } from 'react'
import { Gift } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
import type { BonusForgeOutput } from '@/lib/agents/bonusforge'

function brl(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }

export default function Page() {
  const [produto, setProduto] = useState('')
  const [preco, setPreco] = useState('97')
  const [nicho, setNicho] = useState('marketing digital')
  const [publico, setPublico] = useState('seus alunos')
  const [tipo, setTipo] = useState<any>('curso')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<BonusForgeOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/bonusforge', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produto, preco: Number(preco), nicho, publico, tipoProduto: tipo }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  const icones: Record<string, string> = {
    pdf: '📘', checklist: '✅', template: '🎨', planilha: '📊', swipe_file: '📋', grupo: '👥', mentoria: '🎯', desconto: '🔄', video: '🎬',
  }

  return (
    <AgentShell titulo="BonusForge" tagline="Pacote de bônus irresistíveis que triplicam o valor percebido"
      icone={<Gift className="w-7 h-7" />} cor="bg-gradient-to-br from-pink-500 to-purple-600" labelBotao="Criar pacote"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">🎁 {out.tituloPacote}</p>
            <p className="text-3xl font-black mt-2">{brl(out.valorTotalBonus)}</p>
            <p className="text-sm opacity-90">em bônus EXCLUSIVOS para você dar junto</p>
          </div>
          <div className="space-y-2">
            {out.bonus.map((b, i) => (
              <div key={i} className="bg-slate-50 dark:bg-[#0B0F1A] rounded-2xl p-4 flex gap-3">
                <div className="text-3xl">{icones[b.tipo] || '🎁'}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-sm text-slate-900 dark:text-white">Bônus {i+1}: {b.nome}</p>
                    <span className="text-xs font-bold text-emerald-600 shrink-0">De {brl(b.valor)}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{b.descricao}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">📦 Entrega: {b.entrega}</p>
                </div>
              </div>
            ))}
          </div>
          <details className="bg-slate-900 text-white rounded-2xl p-4">
            <summary className="font-bold cursor-pointer">📢 Script de anúncio dos bônus (copiar)</summary>
            <pre className="whitespace-pre-wrap text-xs mt-3 font-sans opacity-90">{out.scriptAnuncioBonus}</pre>
          </details>
        </div>
      )}>
      <Field label="Nome do produto"><input className={inputClass} value={produto} onChange={(e)=>setProduto(e.target.value)} placeholder="Ex: Método Reels Pro" /></Field>
      <Field label="Preço R$"><input className={inputClass} type="number" value={preco} onChange={(e)=>setPreco(e.target.value)} /></Field>
      <Field label="Nicho"><input className={inputClass} value={nicho} onChange={(e)=>setNicho(e.target.value)} /></Field>
      <Field label="Público"><input className={inputClass} value={publico} onChange={(e)=>setPublico(e.target.value)} /></Field>
      <Field label="Tipo de produto"><select className={selectClass} value={tipo} onChange={(e)=>setTipo(e.target.value)}>
        <option value="curso">Curso</option><option value="ebook">Ebook/PDF</option><option value="template">Templates/Canva</option><option value="ferramenta">Ferramenta/Software</option><option value="servico">Serviço</option><option value="fisico">Produto físico</option><option value="combo">Combo</option>
      </select></Field>
    </AgentShell>
  )
}
