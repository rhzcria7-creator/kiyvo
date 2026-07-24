'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator } from 'lucide-react'
import { calcularLucroLiquido } from '@/lib/agents/taxcalc'

// Alias público pra /calculadora-lucro e /simulador-taxas
export default function SimuladorPage() {
  const [preco, setPreco] = useState('97')
  const [custo, setCusto] = useState('0')
  const [anuncios, setAnuncios] = useState('5')
  const [categoria, setCategoria] = useState<'digital'|'fisico'|'freela'|'afiliado'>('digital')
  const [conta, setConta] = useState<'pf'|'me'|'simples'|'lp'>('pf')
  const [metodo, setMetodo] = useState<'pix'|'cartao_avista'|'cartao_parcelado'|'boleto'>('pix')
  const [res, setRes] = useState<ReturnType<typeof calcularLucroLiquido> | null>(null)

  const calc = () => setRes(calcularLucroLiquido({ preco: Number(preco), custo: Number(custo), anuncios: Number(anuncios), categoria, tipoConta: conta, metodoPagamento: metodo }))
  const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/15 px-4 py-1.5 mb-4">
            <Calculator size={14} className="text-green-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-green-600">Ferramenta grátis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white">Simulador de Taxas e Lucro Real</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-xl">Descubra quanto você REALMENTE lucra em cada venda após taxas da KIYVO, gateway, impostos e anúncios.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
              <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1">Preço de venda (R$)</label>
                <input type="number" value={preco} onChange={e=>setPreco(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-black focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1">Custo do produto (R$)</label>
                <input type="number" value={custo} onChange={e=>setCusto(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1">CAC/anúncios por venda (R$)</label>
                <input type="number" value={anuncios} onChange={e=>setAnuncios(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
              <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1">Categoria</label>
                <select value={categoria} onChange={e=>setCategoria(e.target.value as any)} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 cursor-pointer">
                  <option value="digital">Digital (curso, ebook, template)</option><option value="fisico">Produto físico</option><option value="freela">Serviço/Freela</option><option value="afiliado">Afiliado</option>
                </select></div>
              <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1">Tipo de conta</label>
                <select value={conta} onChange={e=>setConta(e.target.value as any)} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 cursor-pointer">
                  <option value="pf">Pessoa Física</option><option value="me">MEI</option><option value="simples">Simples Nacional</option><option value="lp">Lucro Presumido</option>
                </select></div>
              <div><label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1">Método de pagamento</label>
                <select value={metodo} onChange={e=>setMetodo(e.target.value as any)} className="w-full bg-slate-50 dark:bg-[#0B0F1A] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 cursor-pointer">
                  <option value="pix">Pix ✅ (taxa 0 no KIYVO Wallet)</option><option value="cartao_avista">Cartão à vista</option><option value="cartao_parcelado">Cartão parcelado</option><option value="boleto">Boleto</option>
                </select></div>
              <button onClick={calc} className="w-full bg-[#0F172A] dark:bg-white dark:text-black text-white rounded-full py-4 font-black hover:scale-[1.02] transition">Calcular lucro real</button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            {res ? (
              <div className="space-y-3">
                <div className={`rounded-2xl p-6 text-white ${res.margemLiquida>=30?'bg-gradient-to-br from-emerald-500 to-green-600':res.margemLiquida>=15?'bg-gradient-to-br from-amber-500 to-orange-600':'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">Lucro líquido por venda</p>
                  <p className="text-4xl font-black mt-1">{brl(res.lucroLiquido)}</p>
                  <p className="text-sm opacity-90 mt-1">Margem: {res.margemLiquida.toFixed(1)}%</p>
                </div>
                <div className="space-y-1.5 text-sm">
                  <Row label="Receita bruta" valor={brl(res.receitaBruta)} />
                  <Row label={`Taxa KIYVO (${res.taxaPlataforma.percentual.toFixed(1)}%)`} valor={'- '+brl(res.taxaPlataforma.valor)} neg />
                  <Row label={`${res.taxaGateway.nome}`} valor={'- '+brl(res.taxaGateway.valor)} neg />
                  <Row label={res.impostos.nome} valor={'- '+brl(res.impostos.valor)} neg />
                  <Row label="Custos (produto + anúncios)" valor={'- '+brl(res.custos.custoProduto+res.custos.anuncios+res.custos.frete)} neg />
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2"></div>
                  <Row label="Break-even (preço mínimo)" valor={brl(res.breakEvenPrice)} destaque />
                  <Row label="ROAS mínimo" valor={res.roasMinimo.toFixed(2)+'x'} destaque />
                  <Row label="💙 KD Points distribuídos" valor={'+'+res.pontosDistribuidos+' KD'} positivo />
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs">
                  <ul className="space-y-1">{res.recomendacoes.map((r,i)=><li key={i}>• {r}</li>)}</ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20 text-center gap-3">
                <Calculator className="w-12 h-12 opacity-30" />
                <p className="text-sm">Preencha ao lado e clique em calcular</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, valor, neg, destaque, positivo }: { label: string; valor: string; neg?: boolean; destaque?: boolean; positivo?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${destaque?'font-black text-slate-900 dark:text-white':'text-slate-500 dark:text-slate-400'}`}>{label}</span>
      <span className={`font-black text-sm ${neg?'text-red-600':positivo?'text-emerald-600':destaque?'text-brand-600':'text-slate-900 dark:text-white'}`}>{valor}</span>
    </div>
  )
}
