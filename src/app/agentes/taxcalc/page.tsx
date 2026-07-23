'use client'
import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { AgentShell, Field, inputClass, selectClass } from '@/components/agents/AgentShell'
import type { TaxCalcOutput } from '@/lib/agents/taxcalc'

function brl(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }

export default function Page() {
  const [preco, setPreco] = useState('97')
  const [custo, setCusto] = useState('0')
  const [frete, setFrete] = useState('0')
  const [anuncios, setAnuncios] = useState('5')
  const [cupom, setCupom] = useState('0')
  const [kd, setKd] = useState('0')
  const [categoria, setCategoria] = useState<any>('digital')
  const [conta, setConta] = useState<any>('pf')
  const [metodo, setMetodo] = useState<any>('pix')
  const [parcelas, setParcelas] = useState('1')
  const [vendasMes, setVendasMes] = useState('10')
  const [loading, setLoading] = useState(false)
  const [out, setOut] = useState<TaxCalcOutput | null>(null)

  const gerar = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/agents/taxcalc', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preco: Number(preco), custo: Number(custo), frete: Number(frete), anuncios: Number(anuncios), cupom: Number(cupom), kdPointsUsados: Number(kd), categoria, tipoConta: conta, metodoPagamento: metodo, parcelas: Number(parcelas), vendasMes: Number(vendasMes) }) })
      const d = await r.json()
      if (d.error) { alert(d.error); return }
      setOut(d)
    } catch { alert('Erro') } finally { setLoading(false) }
  }

  return (
    <AgentShell titulo="Calculadora de Lucro" tagline="Calcula lucro LÍQUIDO real: taxas KIYVO + gateway + impostos + frete + anúncios"
      icone={<Calculator className="w-7 h-7" />} cor="bg-gradient-to-br from-green-500 to-emerald-600" labelBotao="Calcular lucro real"
      onGerar={gerar} loading={loading} output={out && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 text-white ${out.margemLiquida >= 30 ? 'bg-gradient-to-br from-emerald-500 to-green-600' : out.margemLiquida >= 15 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Lucro líquido por venda</p>
            <p className="text-4xl font-black mt-2">{brl(out.lucroLiquido)}</p>
            <p className="text-sm mt-1 opacity-90">Margem: {out.margemLiquida.toFixed(1)}%</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">Receita bruta</p>
              <p className="font-black text-slate-900 dark:text-white">{brl(out.receitaBruta)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">Taxa KIYVO ({out.taxaPlataforma.percentual.toFixed(1)}%)</p>
              <p className="font-black text-red-600">- {brl(out.taxaPlataforma.valor)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">{out.taxaGateway.nome} ({out.taxaGateway.percentual.toFixed(2)}%)</p>
              <p className="font-black text-red-600">- {brl(out.taxaGateway.valor)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">{out.impostos.nome}</p>
              <p className="font-black text-red-600">- {brl(out.impostos.valor)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B0F1A] rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-slate-500">Custos</p>
              <p className="font-black text-red-600">- {brl(out.custos.custoProduto + out.custos.frete + out.custos.anuncios)}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">💙 KD Points distribuídos</p>
              <p className="font-black text-blue-700 dark:text-blue-400">+{out.pontosDistribuidos} KD</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-indigo-600">Preço equilíbrio</p>
              <p className="font-black text-indigo-700 dark:text-indigo-300">{brl(out.breakEvenPrice)}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
              <p className="text-[10px] font-black uppercase text-purple-600">ROAS mínimo</p>
              <p className="font-black text-purple-700 dark:text-purple-300">{out.roasMinimo.toFixed(2)}x</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 col-span-2">
              <p className="text-[10px] font-black uppercase text-emerald-600">Ticket recomendado</p>
              <p className="font-black text-emerald-700 dark:text-emerald-300">{brl(out.ticketMedioRecomendado)}</p>
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2">Recomendações da IA</p>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">{out.recomendacoes.map((r, i) => <li key={i}>• {r}</li>)}</ul>
          </div>
        </div>
      )}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço venda R$"><input className={inputClass} type="number" step="0.01" value={preco} onChange={(e)=>setPreco(e.target.value)} /></Field>
        <Field label="Custo produto R$"><input className={inputClass} type="number" step="0.01" value={custo} onChange={(e)=>setCusto(e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Frete R$"><input className={inputClass} type="number" step="0.01" value={frete} onChange={(e)=>setFrete(e.target.value)} /></Field>
        <Field label="Anúncios/CAC R$"><input className={inputClass} type="number" step="0.01" value={anuncios} onChange={(e)=>setAnuncios(e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Desconto cupom %"><input className={inputClass} type="number" value={cupom} onChange={(e)=>setCupom(e.target.value)} /></Field>
        <Field label="KD Points usados R$"><input className={inputClass} type="number" value={kd} onChange={(e)=>setKd(e.target.value)} /></Field>
      </div>
      <Field label="Categoria"><select className={selectClass} value={categoria} onChange={(e)=>setCategoria(e.target.value)}>
        <option value="digital">Digital</option><option value="fisico">Físico</option><option value="freela">Freelance</option><option value="afiliado">Afiliado</option>
      </select></Field>
      <Field label="Tipo de conta"><select className={selectClass} value={conta} onChange={(e)=>setConta(e.target.value)}>
        <option value="pf">Pessoa Física</option><option value="me">MEI</option><option value="simples">Simples Nacional</option><option value="lp">Lucro Presumido</option>
      </select></Field>
      <Field label="Método pagamento"><select className={selectClass} value={metodo} onChange={(e)=>setMetodo(e.target.value)}>
        <option value="pix">Pix (recomendado)</option><option value="cartao_avista">Cartão à vista</option><option value="cartao_parcelado">Cartão parcelado</option><option value="boleto">Boleto</option>
      </select></Field>
      {metodo === 'cartao_parcelado' && <Field label="Parcelas"><input className={inputClass} type="number" min="2" max="12" value={parcelas} onChange={(e)=>setParcelas(e.target.value)} /></Field>}
      <Field label="Vendas por mês"><input className={inputClass} type="number" value={vendasMes} onChange={(e)=>setVendasMes(e.target.value)} /></Field>
    </AgentShell>
  )
}
