'use client'
// Página de Boost de produtos (destaques pagos) - fonte de receita da KIYVO
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, Star, Crown, Gem, TrendingUp, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

const pacotes = [
  {
    id: 'boost_6h',
    nome: 'Relâmpago',
    icone: <Zap className="w-6 h-6" />,
    horas: 6,
    preco: 4.9,
    kd: 400,
    cor: 'from-red-500 to-orange-600',
    selo: '🔥 RELÂMPAGO',
    multiplicador: '2x mais views',
    beneficios: ['6h na primeira página', 'Selo "🔥 Relâmpago"', 'Aprovação imediata'],
  },
  {
    id: 'boost_24h',
    nome: 'Diário',
    icone: <Star className="w-6 h-6" />,
    horas: 24,
    preco: 14.9,
    kd: 1200,
    cor: 'from-amber-500 to-yellow-600',
    selo: '⭐ DESTAQUE',
    multiplicador: '3x mais views',
    beneficios: ['24h em destaque', 'Selo dourado', 'Aparece na Home', 'Impulsionamento no buscador'],
    recomendado: true,
  },
  {
    id: 'boost_7d',
    nome: 'Semanal',
    icone: <Crown className="w-6 h-6" />,
    horas: 168,
    preco: 69.9,
    kd: 6000,
    cor: 'from-purple-500 to-violet-600',
    selo: '👑 ESCOLHA DA SEMANA',
    multiplicador: '4x mais views',
    beneficios: ['7 dias no topo', 'Badge exclusivo', 'Destaque em emails marketing', 'Suporte prioritário'],
  },
  {
    id: 'boost_30d',
    nome: 'Premium',
    icone: <Gem className="w-6 h-6" />,
    horas: 720,
    preco: 199.9,
    kd: 18000,
    cor: 'from-emerald-500 to-teal-600',
    selo: '💎 PREMIUM',
    multiplicador: '5x mais views',
    beneficios: ['30 dias de visibilidade máxima', 'Selo exclusivo', 'Destaque no app e web', 'Gerente de contas dedicado', 'Boost bônus de cortesia'],
  },
]

export default function BoostPage() {
  const [selecionado, setSelecionado] = useState<string>('boost_24h')
  const [produtoId, setProdutoId] = useState('')
  const [meusProdutos] = useState<Array<{ id: string; title: string; price: number }>>([]) // Carregar via fetch em produção

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-10 md:pt-14">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-black uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5" /> Impulsione suas vendas
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] dark:text-white leading-[0.95]">
            Coloque seu produto <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">no topo</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto">
            Boost é um destaque pago que coloca seu produto na primeira página, na frente de milhares de compradores. Mais views = mais vendas.
          </p>
        </motion.div>

        {/* Pacotes */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {pacotes.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              onClick={() => setSelecionado(p.id)}
              className={`relative text-left bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border-2 transition ${
                selecionado === p.id
                  ? 'border-brand-500 ring-4 ring-brand-100 dark:ring-brand-900/30 scale-[1.02]'
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
              }`}
            >
              {p.recomendado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Mais popular
                </div>
              )}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.cor} flex items-center justify-center text-white mb-4 shadow-lg`}>
                {p.icone}
              </div>
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{p.multiplicador}</div>
              <h3 className="text-xl font-black text-[#0F172A] dark:text-white mb-1">{p.nome}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-black text-[#0F172A] dark:text-white">R${p.preco.toFixed(2).replace('.', ',')}</span>
                <span className="text-xs text-slate-400 font-semibold">/ {p.horas < 24 ? p.horas + 'h' : p.horas / 24 + 'd'}</span>
              </div>
              <div className="text-xs text-slate-500 mb-4 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> ou {p.kd.toLocaleString('pt-BR')} KD Points
              </div>
              <ul className="space-y-1.5">
                {p.beneficios.map((b, j) => (
                  <li key={j} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
              {selecionado === p.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Escolher produto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-6"
        >
          <h2 className="text-xl font-black text-[#0F172A] dark:text-white mb-2">Escolha qual produto impulsionar</h2>
          <p className="text-sm text-slate-500 mb-4">Selecione um dos seus produtos publicados para aplicar o boost.</p>
          <input
            type="text"
            value={produtoId}
            onChange={e => setProdutoId(e.target.value)}
            placeholder="Cole o ID ou URL do produto"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-2xl">📦</div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {produtoId ? 'Produto selecionado' : 'Nenhum produto selecionado'}
                </div>
                <div className="text-xs text-slate-500">Publique um produto antes de dar boost.</div>
              </div>
            </div>
            <Link href="/anunciar" className="text-xs font-bold text-brand-600 hover:underline inline-flex items-center gap-1">
              Publicar produto <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        {/* Resumo + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Resumo
            </div>
            <div className="text-2xl md:text-3xl font-black">
              {pacotes.find(p => p.id === selecionado)?.nome} — R${pacotes.find(p => p.id === selecionado)?.preco.toFixed(2).replace('.', ',')}
            </div>
            <div className="text-slate-300 text-sm mt-1">
              Ativação em menos de 2 minutos após pagamento. Começa a contar a partir da aprovação.
            </div>
          </div>
          <button disabled={!produtoId} className="inline-flex items-center gap-2 bg-white text-[#0F172A] rounded-full px-6 py-3.5 text-sm font-black hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100">
            <TrendingUp className="w-4 h-4" /> Pagar e ativar boost
          </button>
        </motion.div>

        {/* Garantias */}
        <div className="mt-8 grid sm:grid-cols-3 gap-3 text-center">
          {[
            { i: <CheckCircle2 className="w-5 h-5" />, t: 'Sem assinatura', d: 'Pagamento único. Sem cobrança recorrente escondida.' },
            { i: <Clock className="w-5 h-5" />, t: 'Ativação imediata', d: 'Começa em até 2 min após pagamento confirmado.' },
            { i: <TrendingUp className="w-5 h-5" />, t: 'Reembolsável', d: 'Se não houver views em 2h, devolvemos 100%.' },
          ].map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }} className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
              <div className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 mb-2">
                {g.i}
              </div>
              <div className="font-black text-sm text-[#0F172A] dark:text-white">{g.t}</div>
              <div className="text-xs text-slate-500 mt-1">{g.d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
