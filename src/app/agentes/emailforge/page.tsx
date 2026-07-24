'use client'
import { useState } from 'react'
import { Mail } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
import type { EmailForgeOutput } from '@/lib/agents/emailforge'

export default function Page() {
  const [tipo, setTipo] = useState<'boas_vindas'|'carrinho_abandonado'|'lancamento'|'pos_venda'|'reativacao'|'blackfriday'|'upsell'|'newsletter'>('boas_vindas')
  const [produto, setProduto] = useState('')
  const [nomeLead, setNomeLead] = useState('')
  const [nomeLoja, setNomeLoja] = useState('KIYVO')
  const [desconto, setDesconto] = useState('10')
  const [preco, setPreco] = useState('97')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<EmailForgeOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/emailforge', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, produto: produto || 'o produto', nomeLead: nomeLead || 'Cliente', nomeLoja, desconto: Number(desconto), preco: Number(preco) }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="EmailForge" tagline="Sequências completas de e-mail que convertem (boas-vindas, carrinho, lançamento)"
      icone={<Mail className="w-7 h-7" />} cor="bg-gradient-to-br from-cyan-500 to-blue-600" labelBotao="Gerar sequência"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">📬 Sequência gerada</p>
            <p className="text-lg font-black mt-1">{out.totalEmails} e-mails • {out.receitaEstimada}</p>
          </div>
          {out.sequencia.map((e, i) => (
            <div key={i} className="bg-white dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">E-mail {i+1} • {e.delay}</span>
                <span className="text-[10px] font-bold text-brand-600">Score {e.score}/100</span>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assunto (com emojis!):</p>
                <p className="font-black text-base text-slate-900 dark:text-white">{e.assunto}</p>
                <p className="text-xs text-slate-500 italic">Preheader: {e.preheader}</p>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3 font-sans">{e.corpo}</pre>
                <div className="bg-[#0F172A] text-white text-center rounded-full py-2 text-xs font-bold cursor-pointer">{e.cta}</div>
              </div>
            </div>
          ))}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-4 text-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-400 mb-2">Métricas esperadas</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">{Object.entries(out.estrutura).map(([k, v]) => <li key={k}>• <strong>{k}:</strong> {v}</li>)}</ul>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-400 mt-3 mb-1">Dicas</p>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">{out.dicas.map((d, i) => <li key={i}>• {d}</li>)}</ul>
          </div>
        </div>
      )}>
      <Field label="Tipo de sequência"><select className={selectClass} value={tipo} onChange={(e)=>setTipo(e.target.value as any)}>
        <option value="boas_vindas">Boas-vindas (3 e-mails)</option>
        <option value="carrinho_abandonado">Carrinho abandonado (3 e-mails)</option>
        <option value="lancamento">Lançamento (3 e-mails)</option>
        <option value="pos_venda">Pós-venda (2 e-mails)</option>
        <option value="reativacao">Reativação (win-back)</option>
        <option value="blackfriday">Black Friday</option>
        <option value="upsell">Upsell</option>
        <option value="newsletter">Newsletter</option>
      </select></Field>
      <Field label="Produto"><input className={inputClass} value={produto} onChange={(e)=>setProduto(e.target.value)} placeholder="Ex: Método ReelsPro" /></Field>
      <Field label="Nome do lead"><input className={inputClass} value={nomeLead} onChange={(e)=>setNomeLead(e.target.value)} placeholder="Deixe vazio para genérico" /></Field>
      <Field label="Nome da loja"><input className={inputClass} value={nomeLoja} onChange={(e)=>setNomeLoja(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Desconto %"><input className={inputClass} type="number" value={desconto} onChange={(e)=>setDesconto(e.target.value)} /></Field>
        <Field label="Preço R$"><input className={inputClass} type="number" value={preco} onChange={(e)=>setPreco(e.target.value)} /></Field>
      </div>
    </AgentShell>
  )
}
