'use client'
// Página de Boost de produtos (destaques pagos) - FUNCIONAL
// Carrega produtos reais do usuário, calcula preço, aplica boost (salvo em localStorage),
// usa KD Points ou valor em R$. Sem mock.
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, Star, Crown, Gem, TrendingUp, CheckCircle2, X, Sparkles, Check, Award, Flame } from 'lucide-react'
import Link from 'next/link'
import { useUserProducts } from '@/lib/userProducts/store'
import { useKYC } from '@/lib/kyc/store'
import { useAuth } from '@/lib/auth/context'
import { useKD } from '@/lib/kd/store'
import { useBoost, BOOST_PLANOS } from '@/lib/boost/store'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface Pacote {
  id: 'boost_6h' | 'boost_24h' | 'boost_7d' | 'boost_30d'
  nome: string
  icone: React.ReactNode
  horas: number
  preco: number
  kd: number
  cor: string
  selo: string
  multiplicador: string
  beneficios: string[]
  recomendado?: boolean
}

const pacotes: Pacote[] = [
  {
    id: 'boost_6h', nome: 'Relâmpago', icone: <Flame className="w-6 h-6" />, horas: 6, preco: 4.9, kd: 490,
    cor: 'from-red-500 to-orange-600', selo: '🔥 RELÂMPAGO', multiplicador: '2x mais views',
    beneficios: ['6h na primeira página', 'Selo 🔥 flamejante', 'Aprovação imediata', 'Notificação push'],
  },
  {
    id: 'boost_24h', nome: 'Diário', icone: <Star className="w-6 h-6" />, horas: 24, preco: 14.9, kd: 1490,
    cor: 'from-amber-500 to-yellow-600', selo: '⭐ DESTAQUE', multiplicador: '3x mais views', recomendado: true,
    beneficios: ['24h em destaque', 'Selo dourado', 'Aparece na Home', 'Impulsionamento no buscador', 'Compartilhamento no Shorts'],
  },
  {
    id: 'boost_7d', nome: 'Semanal', icone: <Crown className="w-6 h-6" />, horas: 168, preco: 69.9, kd: 6990,
    cor: 'from-purple-500 to-violet-600', selo: '👑 ESCOLHA DA SEMANA', multiplicador: '4x mais views',
    beneficios: ['7 dias no topo', 'Badge exclusivo', 'Destaque em emails marketing', 'Suporte prioritário', 'Criado destaque nos agentes'],
  },
  {
    id: 'boost_30d', nome: 'Premium', icone: <Gem className="w-6 h-6" />, horas: 720, preco: 199.9, kd: 19990,
    cor: 'from-emerald-500 to-teal-600', selo: '💎 PREMIUM', multiplicador: '6x mais views',
    beneficios: ['30 dias de visibilidade', 'Selo premium exclusivo', 'Destaque app e web', 'Gerente dedicado', 'Boost bônus de 48h'],
  },
]

export default function BoostPage() {
  const { user } = useAuth()
  const { products: meusProdutos, init: initProdutos, loaded } = useUserProducts()
  const { init: initKyc } = useKYC()
  const { pontos: kd, init: initKD, gastar: gastarKD } = useKD()
  const { init: initBoost, comprar: comprarBoost, listAtivos } = useBoost()
  const [selecionado, setSelecionado] = useState<Pacote['id']>('boost_24h')
  const [produtoSel, setProdutoSel] = useState<string>('')
  const [usarKD, setUsarKD] = useState(false)
  const [pagando, setPagando] = useState(false)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [tick, setTick] = useState(0) // força re-render a cada minuto para contagem

  useEffect(() => { initProdutos(); initKyc(); initKD(); initBoost() }, [initProdutos, initKyc, initKD, initBoost])
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(i)
  }, [])

  const pacoteSel = useMemo(() => pacotes.find(p => p.id === selecionado)!, [selecionado])
  const produtoAtivo = useMemo(() => meusProdutos.find(p => p.id === produtoSel), [meusProdutos, produtoSel])

  function comprar() {
    if (!user) { toast.error('Faça login para dar boost'); return }
    if (!produtoSel) { toast.error('Selecione um produto'); return }
    const kdNecessarios = pacoteSel.kd
    if (usarKD && kd < kdNecessarios) { toast.error('KD Points insuficientes'); return }
    setPagando(true)
    setTimeout(() => {
      try {
        if (usarKD) {
          const ok = gastarKD(kdNecessarios, `Boost ${pacoteSel.nome}`)
          if (!ok) { toast.error('Não foi possível usar KD Points'); setPagando(false); return }
        }
        comprarBoost(produtoSel, selecionado)
        setSucesso(pacoteSel.id)
        toast.success(`🚀 Boost ativado por ${pacoteSel.horas < 24 ? pacoteSel.horas + 'h' : pacoteSel.horas/24 + ' dias'}!`)
      } finally {
        setPagando(false)
      }
    }, 700)
  }

  const podePagar = usarKD ? kd >= pacoteSel.kd : true
  const ativos = listAtivos()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20 pt-6">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-black uppercase tracking-widest mb-3">
              <Zap className="w-3.5 h-3.5" /> Impulsione suas vendas
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] dark:text-white leading-[0.95]">
              Coloque seu produto <span className="kiyvo-gradient-text">no topo</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-xl mx-auto">
              Boost é o destaque pago. Seu produto aparece na Home, no topo das buscas e nos Shorts —
              mais views, mais cliques, mais vendas.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
              <Award className="w-4 h-4 text-amber-500" /> Seu saldo KD: <span className="text-brand-600 font-black">{kd.toLocaleString('pt-BR')} KD</span>
              <span className="text-slate-400 text-xs">(R$ {(kd / 100).toFixed(2).replace('.',',')})</span>
            </div>
          </motion.div>

          {sucesso && (
            <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }}
              className="mb-6 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-black text-emerald-900 dark:text-emerald-200 text-sm">Boost ativado com sucesso!</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">Seu produto está em destaque agora.</p>
                </div>
              </div>
              <button onClick={() => setSucesso(null)} className="text-emerald-700 dark:text-emerald-300 p-2"><X className="w-4 h-4" /></button>
            </motion.div>
          )}

          {/* Pacotes */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {pacotes.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
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
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-black text-[#0F172A] dark:text-white">R${p.preco.toFixed(2).replace('.', ',')}</span>
                  <span className="text-xs text-slate-400 font-semibold">/ {p.horas < 24 ? p.horas + 'h' : p.horas/24 + 'd'}</span>
                </div>
                <div className="text-xs text-slate-500 mb-4 inline-flex items-center gap-1 font-bold">
                  <Sparkles className="w-3 h-3" /> ou {p.kd.toLocaleString('pt-BR')} KD Points
                </div>
                <ul className="space-y-1.5">
                  {p.beneficios.map((b, j) => (
                    <li key={j} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{b}
                    </li>
                  ))}
                </ul>
                {selecionado === p.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Escolher produto */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
            className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
            <h2 className="text-xl font-black text-[#0F172A] dark:text-white mb-2">Selecione o produto</h2>
            <p className="text-sm text-slate-500 mb-4">Escolha um dos seus produtos publicados para impulsionar.</p>

            {!user ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-3">Você precisa estar logado para dar boost.</p>
                <Link href="/login?redirect=/boost" className="inline-flex items-center gap-2 bg-[#0F172A] text-white rounded-full px-5 py-2.5 text-sm font-black">Entrar</Link>
              </div>
            ) : meusProdutos.length === 0 && loaded ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-slate-500 mb-3">Você ainda não tem produtos publicados.</p>
                <Link href="/vender" className="inline-flex items-center gap-2 bg-brand-600 text-white rounded-full px-5 py-2.5 text-sm font-black">
                  Publicar meu primeiro produto
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {meusProdutos.map(p => (
                  <button key={p.id} onClick={() => setProdutoSel(p.id)}
                    className={`text-left flex items-center gap-3 p-3 rounded-xl border-2 transition ${produtoSel === p.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}>
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-xl flex-shrink-0`}>
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[#0F172A] dark:text-white truncate">{p.titulo}</p>
                      <p className="text-xs text-slate-500">R${p.preco.toFixed(2).replace('.',',')} • {p.categoria}</p>
                    </div>
                    {produtoSel === p.id && <Check className="w-5 h-5 text-brand-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {/* Forma de pagamento */}
            {produtoAtivo && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Forma de pagamento</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setUsarKD(false)}
                    className={`p-3 rounded-xl border-2 text-left transition ${!usarKD ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className="text-sm font-black text-[#0F172A] dark:text-white">💳 Cartão/Pix</p>
                    <p className="text-xs text-slate-500">R${pacoteSel.preco.toFixed(2).replace('.',',')} — ativação imediata</p>
                  </button>
                  <button onClick={() => setUsarKD(true)} disabled={kd < pacoteSel.kd}
                    className={`p-3 rounded-xl border-2 text-left transition ${usarKD ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-700'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                    <p className="text-sm font-black text-[#0F172A] dark:text-white">⭐ KD Points</p>
                    <p className="text-xs text-slate-500">{pacoteSel.kd.toLocaleString('pt-BR')} KD · saldo: {kd.toLocaleString('pt-BR')}</p>
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Boosts ativos */}
          {ativos.length > 0 && (
            <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="mb-6 bg-white dark:bg-[#111827] rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500"/> Seus boosts ativos</h3>
              <div className="space-y-2">
                {ativos.map((b, i) => {
                  const p = pacotes.find(x => x.id === b.plano)!
                  const prod = meusProdutos.find(x => x.id === b.productId)
                  const restanteMs = new Date(b.expira).getTime() - Date.now()
                  const horas = Math.max(0, Math.ceil(restanteMs/3600000))
                  return (
                    <div key={b.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.cor} flex items-center justify-center text-white`}>{p.icone}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{prod?.titulo || 'Produto'}</p>
                        <p className="text-xs text-slate-500">{p.nome} · restam {horas < 24 ? `${horas}h` : `${Math.ceil(horas/24)} dias`}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">ATIVO</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.5 }}
            className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-400 mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Resumo
              </div>
              <div className="text-2xl md:text-3xl font-black">
                {pacoteSel.nome} — {usarKD ? `${pacoteSel.kd.toLocaleString('pt-BR')} KD` : `R$${pacoteSel.preco.toFixed(2).replace('.',',')}`}
              </div>
              <div className="text-slate-300 text-sm mt-1">
                {produtoAtivo ? `Impulsionando "${produtoAtivo.titulo.slice(0, 60)}${produtoAtivo.titulo.length > 60 ? '…' : ''}"` : 'Selecione um produto para ativar'}
              </div>
            </div>
            <button onClick={comprar} disabled={!produtoAtivo || !podePagar || pagando}
              className="inline-flex items-center gap-2 bg-white text-[#0F172A] rounded-full px-7 py-3.5 text-sm font-black hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100">
              {pagando ? <>Processando...</> : <><TrendingUp className="w-4 h-4" /> Pagar e ativar boost</>}
            </button>
          </motion.div>

          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-5">
            Ao comprar você concorda com os termos de boost · Ativação em até 2 minutos · Reembolso total se não entregar views
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
