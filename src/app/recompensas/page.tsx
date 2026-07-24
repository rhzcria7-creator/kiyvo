'use client'
// Página de Recompensas — KD Points reais (100 KD = R$1, máx 50% de desconto).
// Mostra saldo, histórico e formas de ganhar mais pontos. Comentários em PT-BR.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Star, Gift, ShoppingBag, Clock, ArrowLeft, Coins, Copy, Check,
  TrendingUp, UserPlus, MessageSquare, Sparkles, Award,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useKD } from '@/lib/kd/store'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'react-hot-toast'

export default function RecompensasPage() {
  const { user } = useAuth()
  const {
    init, pontos, totalGanho, totalGasto, transacoes, loaded,
    resgatarCupom,
  } = useKD()
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => { init() }, [init])

  const valorEmReais = (pontos / 100).toFixed(2).replace('.', ',')
  const cuponsDisponiveis = [
    { valor: 5, label: 'R$5', desc: 'Cupom de R$5 em qualquer compra', necessario: 500 },
    { valor: 10, label: 'R$10', desc: 'Cupom de R$10 em qualquer compra', necessario: 1000 },
    { valor: 25, label: 'R$25', desc: 'Cupom de R$25 em compras acima de R$50', necessario: 2500 },
    { valor: 50, label: 'R$50', desc: 'Cupom de R$50 em compras acima de R$100', necessario: 5000 },
  ]
  const formasGanhar = [
    { icon: ShoppingBag, titulo: 'Comprar na KIYVO', pontos: '+5 KD / R$1', desc: 'A cada real gasto você ganha 5 KD Points automaticamente.' },
    { icon: MessageSquare, titulo: 'Avaliar produtos', pontos: '+50 KD', desc: 'Publique uma avaliação com ou sem foto após receber um produto.' },
    { icon: UserPlus, titulo: 'Indicar amigos', pontos: '+200 KD', desc: 'Ganhe pontos quando seu amigo se cadastrar pelo seu link e fizer a primeira compra.' },
    { icon: Award, titulo: 'Completar perfil/KYC', pontos: '+300 KD', desc: 'Complete a verificação de conta e ganhe pontos extras.' },
    { icon: TrendingUp, titulo: 'Vender produtos', pontos: '+2 KD / R$1', desc: 'Vendedores também ganham KD Points a cada venda realizada.' },
  ]

  function resgatar(v: number) {
    const res = resgatarCupom(v)
    if (!res.ok) { toast.error(res.erro || 'Pontos insuficientes'); return }
    if (!res.codigo) return
    navigator.clipboard.writeText(res.codigo).catch(() => {})
    setCopiado(res.codigo)
    toast.success(`Cupom ${res.codigo} copiado!`)
    setTimeout(() => setCopiado(null), 3000)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:from-[#0B0F1A] pb-24">
        {/* Hero card dourado */}
        <section className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
            <Link href="/" className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm font-bold mb-6">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white/90 mb-3">
                  <Star className="w-3 h-3" /> Programa de recompensas
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.95]">
                  KD Points
                </h1>
                <p className="text-white/90 mt-2 text-sm md:text-base max-w-lg">
                  100 KD = R$1 de desconto. Use em qualquer compra, até 50% do valor.
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-[2rem] p-6 border border-white/30 text-white min-w-[220px]">
                <p className="text-[11px] font-black uppercase tracking-widest text-white/80 mb-1">Seu saldo</p>
                <div className="flex items-baseline gap-2">
                  <Coins className="w-8 h-8" />
                  <span className="text-5xl font-black">{loaded ? pontos.toLocaleString('pt-BR') : '...'}</span>
                </div>
                <p className="text-sm mt-1 font-bold text-white/90">≈ R${valorEmReais} em descontos</p>
                {user ? (
                  <p className="text-xs text-white/70 mt-3">
                    Total ganho: {totalGanho.toLocaleString('pt-BR')} · Total usado: {totalGasto.toLocaleString('pt-BR')}
                  </p>
                ) : (
                  <Link href="/login?redirect=/recompensas" className="mt-3 inline-flex items-center gap-1 bg-white text-amber-700 rounded-full px-4 py-2 text-xs font-black hover:scale-105 transition">
                    Entrar para ver saldo
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
          {/* Formas de ganhar */}
          <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
            className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-5 md:p-7 border border-slate-100 dark:border-slate-800 shadow-xl mb-6">
            <h2 className="text-lg md:text-xl font-black text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Como ganhar KD Points
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {formasGanhar.map((f, i) => (
                <motion.div key={f.titulo} initial={{ opacity:0,y:10 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className="font-black text-sm text-[#0F172A] dark:text-white">{f.titulo}</p>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">{f.pontos}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Resgatar cupons */}
          <motion.div initial={{ opacity:0,y:12 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-5 md:p-7 border border-slate-100 dark:border-slate-800 shadow-xl mb-6">
            <h2 className="text-lg md:text-xl font-black text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" /> Resgatar cupons
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cuponsDisponiveis.map((c, i) => {
                const pode = pontos >= c.necessario
                return (
                  <motion.button key={c.valor}
                    initial={{ opacity:0,scale:0.95 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }} transition={{ delay:i*0.05 }}
                    onClick={() => pode && user && resgatar(c.valor)}
                    disabled={!pode || !user}
                    className={`relative p-4 rounded-2xl border-2 text-left transition ${
                      pode
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/5 hover:shadow-lg hover:scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/[0.02] opacity-60'
                    }`}>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{c.label}</p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">{c.desc}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500">{c.necessario.toLocaleString('pt-BR')} KD</span>
                      {copiado && c.valor === 5 ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </motion.button>
                )
              })}
            </div>
            {!user && (
              <p className="text-center text-xs text-slate-500 mt-4">
                <Link href="/login?redirect=/recompensas" className="text-brand-600 font-bold underline">Entre na sua conta</Link> para resgatar cupons.
              </p>
            )}
          </motion.div>

          {/* Histórico */}
          <motion.div initial={{ opacity:0,y:12 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-5 md:p-7 border border-slate-100 dark:border-slate-800 shadow-xl">
            <h2 className="text-lg md:text-xl font-black text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" /> Histórico
            </h2>
            {!user ? (
              <p className="text-sm text-slate-500 text-center py-8">Entre para ver seu histórico.</p>
            ) : transacoes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Nenhuma transação ainda. Comece comprando para ganhar pontos!</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {transacoes.slice(0, 20).map(t => (
                  <div key={t.id} className="py-3 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.pontos > 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400'}`}>
                      {t.pontos > 0 ? <TrendingUp className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#0F172A] dark:text-white truncate">{t.descricao}</p>
                      <p className="text-[10px] text-slate-400">{new Date(t.data).toLocaleString('pt-BR')}</p>
                    </div>
                    <span className={`font-black text-sm ${t.pontos > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.pontos > 0 ? '+' : ''}{t.pontos} KD
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
