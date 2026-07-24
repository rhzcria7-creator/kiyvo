'use client'
// Calculadora de Taxas e Lucro Real
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, TrendingDown, Sparkles, Copy, Check } from 'lucide-react'
import { runLucroMax } from '@/lib/agents/lucromax'

interface Resultado {
  precoVenda: number
  valorCupom: number
  precoLiquido: number
  taxaKiyvo: { percentual: number; fixa: number; total: number; capAtingido: boolean }
  comissaoAfiliado: number
  impostos: number
  custosTotais: number
  lucroLiquido: number
  margemPercent: number
  roi: number
  markup: number
  saude: string
  dica: string
  precoIdeal50PorCentoMargem: number
  precoMinimoSemPrejuizo: number
  aCada100Vendas: number
  tabela: Array<{ nome: string; valor: number; destaque?: boolean }>
}

const planos = [
  { id: 'free', nome: 'Grátis', taxa: '8%' },
  { id: 'plus', nome: 'Plus', taxa: '6,5%' },
  { id: 'pro', nome: 'Pro', taxa: '5%' },
  { id: 'vendor_pro', nome: 'Vendor Pro', taxa: '3%' },
] as const

export default function CalcularTaxasPage() {
  const [preco, setPreco] = useState<number>(97)
  const [custo, setCusto] = useState<number>(0)
  const [anuncio, setAnuncio] = useState<number>(0)
  const [outros, setOutros] = useState<number>(0)
  const [afiliado, setAfiliado] = useState<number>(0)
  const [plano, setPlano] = useState<'free' | 'plus' | 'pro' | 'vendor_pro'>('free')
  const [impostos, setImpostos] = useState<boolean>(false)
  const [res, setRes] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)

  async function calcular() {
    setLoading(true)
    const r = await runLucroMax({
      precoVenda: preco,
      custoProduto: custo,
      custoAnuncio: anuncio,
      outrosCustos: outros,
      afiliadoPercent: afiliado,
      planoVendedor: plano,
      incluirImpostos: impostos,
    })
    if (r.ok) setRes(r.data as any)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-10 md:pt-14">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-[11px] font-black uppercase tracking-widest mb-3">
            <Calculator className="w-3.5 h-3.5" /> Calculadora KIYVO
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-[0.95]">
            Calcule seu <span className="bg-gradient-to-r from-emerald-500 to-brand-500 bg-clip-text text-transparent">lucro real</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Taxas, impostos, afiliado e custos — sem surpresas no fim do mês.</p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-[#111827] rounded-[2rem] p-5 md:p-7 shadow-sm border border-slate-100 dark:border-slate-800 h-fit">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Dados do produto</span>
            </div>
            <div className="space-y-4">
              <Field label="Preço de venda (R$)">
                <input type="number" value={preco} onChange={e => setPreco(Number(e.target.value))} className={ic} />
              </Field>
              <Field label="Custo do produto (R$)">
                <input type="number" value={custo} onChange={e => setCusto(Number(e.target.value))} className={ic} />
              </Field>
              <Field label="Custo de anúncio/CAC (R$)">
                <input type="number" value={anuncio} onChange={e => setAnuncio(Number(e.target.value))} className={ic} />
              </Field>
              <Field label="Outros custos (R$)">
                <input type="number" value={outros} onChange={e => setOutros(Number(e.target.value))} className={ic} />
              </Field>
              <Field label="Comissão afiliado (%)">
                <input type="number" value={afiliado} onChange={e => setAfiliado(Number(e.target.value))} className={ic} />
              </Field>
              <Field label="Seu plano KIYVO">
                <select value={plano} onChange={e => setPlano(e.target.value as any)} className={sc}>
                  {planos.map(p => <option key={p.id} value={p.id}>{p.nome} — taxa {p.taxa}</option>)}
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={impostos} onChange={e => setImpostos(e.target.checked)} className="w-4 h-4 accent-brand-600" />
                <span className="text-slate-700 dark:text-slate-300">Incluir impostos (Simples ~6,5%)</span>
              </label>
            </div>
            <button onClick={calcular} disabled={loading}
              className="mt-6 w-full bg-[#0F172A] dark:bg-white dark:text-black hover:bg-black text-white rounded-full py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50">
              {loading ? 'Calculando...' : 'Calcular lucro real'}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="md:col-span-3 bg-white dark:bg-[#111827] rounded-[2rem] p-5 md:p-7 shadow-sm border border-slate-100 dark:border-slate-800">
            {res ? <Resultado r={res} /> : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                <Calculator className="w-10 h-10 mb-4 opacity-40" />
                <p className="text-sm font-semibold">Preencha e clique em calcular</p>
                <p className="text-xs mt-2 max-w-xs">A calculadora mostra o que REALMENTE vai pra sua conta.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const ic = 'w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none text-slate-900 dark:text-slate-100'
const sc = ic

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function fmt(n: number) {
  return 'R$' + (n || 0).toFixed(2).replace('.', ',')
}

function Resultado({ r }: { r: Resultado }) {
  const [copied, setCopied] = useState(false)
  function copiar() {
    navigator.clipboard.writeText(
      r.tabela.map(l => `${l.nome}: ${fmt(l.valor)}`).join('\n')
    ).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }
  const saudeCores: Record<string, string> = {
    excelente: 'from-emerald-500 to-green-600',
    boa: 'from-green-500 to-emerald-600',
    media: 'from-yellow-500 to-amber-600',
    ruim: 'from-orange-500 to-red-600',
    critica: 'from-red-500 to-red-700',
  }
  const saudeLabel: Record<string, string> = {
    excelente: 'EXCELENTE',
    boa: 'BOA',
    media: 'MÉDIA',
    ruim: 'RUIM',
    critica: 'CRÍTICA',
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${saudeCores[r.saude]} text-white text-xs font-black uppercase tracking-wider`}>
          {r.lucroLiquido >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          Saúde: {saudeLabel[r.saude]}
        </div>
        <button onClick={copiar} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <CardGrande label="Lucro por venda" valor={fmt(r.lucroLiquido)} destaque />
        <CardGrande label="Margem" valor={r.margemPercent.toFixed(1).replace('.', ',') + '%'} />
        <CardGrande label="Taxa KIYVO" valor={fmt(r.taxaKiyvo.total)} aviso={r.taxaKiyvo.capAtingido ? '(teto atingido)' : ''} />
        <CardGrande label="Em 100 vendas" valor={fmt(r.aCada100Vendas)} />
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
        <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-3">Detalhamento por unidade</div>
        <div className="space-y-2">
          {r.tabela.map((linha, i) => (
            <div key={i} className={`flex justify-between items-center text-sm py-1.5 px-2 rounded-lg ${linha.destaque ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 font-black text-emerald-700 dark:text-emerald-300' : ''}`}>
              <span className={linha.destaque ? '' : 'text-slate-600 dark:text-slate-400'}>{linha.nome}</span>
              <span className={linha.destaque ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-100 font-semibold'}>{fmt(linha.valor)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Preço mínimo sem prejuízo</div>
          <div className="text-2xl font-black text-[#0F172A] dark:text-white">{fmt(r.precoMinimoSemPrejuizo)}</div>
          <div className="text-xs text-slate-500 mt-1">Abaixo disso você PERDE dinheiro.</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl p-4">
          <div className="text-[11px] font-black uppercase tracking-widest opacity-80 mb-1">Preço ideal (50% margem)</div>
          <div className="text-2xl font-black">{fmt(r.precoIdeal50PorCentoMargem)}</div>
          <div className="text-xs opacity-80 mt-1">Margem doce para escalar.</div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 dark:text-amber-200">{r.dica}</p>
      </div>
    </motion.div>
  )
}

function CardGrande({ label, valor, destaque, aviso }: { label: string; valor: string; destaque?: boolean; aviso?: string }) {
  return (
    <div className={`rounded-2xl p-4 border ${destaque ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0' : 'bg-slate-50 dark:bg-slate-900/60 border-slate-100 dark:border-slate-800'}`}>
      <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${destaque ? 'opacity-80' : 'text-slate-500'}`}>{label}</div>
      <div className={`text-xl font-black ${destaque ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>{valor}</div>
      {aviso && <div className={`text-[10px] mt-0.5 ${destaque ? 'opacity-80' : 'text-slate-400'}`}>{aviso}</div>}
    </div>
  )
}
