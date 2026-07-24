'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BADGES, calcularNivel } from '@/lib/agents/badgeengine'
import { Trophy, Sparkles, Lock, Star } from 'lucide-react'

// Página de Conquistas (gamificação KIYVO)
export default function ConquistasPage() {
  const [xp, setXp] = useState(0)
  const [kd, setKd] = useState(0)
  const [adquiridos, setAdquiridos] = useState<string[]>([])

  useEffect(() => {
    try {
      // Carrega do localStorage (em produção virá do Supabase)
      const d = localStorage.getItem('kiyvo_badges_demo')
      if (d) {
        const p = JSON.parse(d)
        setAdquiridos(p.adquiridos || [])
        setXp(p.xp || 0)
        setKd(p.kd || 0)
      }
    } catch {}
  }, [])

  const save = (a: string[], x: number, k: number) => {
    setAdquiridos(a); setXp(x); setKd(k)
    try { localStorage.setItem('kiyvo_badges_demo', JSON.stringify({ adquiridos: a, xp: x, kd: k })) } catch {}
  }

  const simularConquista = () => {
    const naoAdquiridos = BADGES.filter(b => !adquiridos.includes(b.id))
    if (naoAdquiridos.length === 0) return
    const ganho = naoAdquiridos[Math.floor(Math.random() * naoAdquiridos.length)]
    const novas = [...adquiridos, ganho.id]
    save(novas, xp + ganho.xp, kd + ganho.kdRecompensa)
  }

  const nivel = calcularNivel(xp)
  const raroCor: Record<string, string> = {
    comum: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    raro: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    epico: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    lendario: 'bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900',
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-1.5 mb-4">
            <Trophy size={14} className="text-amber-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-600">Gamificação KIYVO</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-tight">Suas <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">conquistas</span></h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Ganhe badges, XP e KD Points ao comprar, vender, avaliar e indicar amigos.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white rounded-[2rem] p-6">
            <p className="text-[11px] font-black uppercase tracking-widest opacity-70">Nível atual</p>
            <p className="text-5xl font-black mt-2 flex items-baseline gap-1">{nivel.nivel}<span className="text-lg font-bold opacity-70">/∞</span></p>
            <p className="text-sm opacity-80 mt-1">{nivel.titulo}</p>
            <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300" style={{ width: `${(nivel.xpAtual / nivel.xpProximo) * 100}%` }} />
            </div>
            <p className="text-xs opacity-70 mt-1">{nivel.xpAtual} / {nivel.xpProximo} XP</p>
          </div>
          <div className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Total de XP</p>
            <p className="text-4xl font-black mt-2 text-[#0F172A] dark:text-white">{xp.toLocaleString('pt-BR')}</p>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-bold text-sm"><Sparkles className="w-4 h-4" /> {adquiridos.length}/{BADGES.length} badges</div>
          </div>
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-[2rem] p-6">
            <p className="text-[11px] font-black uppercase tracking-widest opacity-80">KD Points acumulados</p>
            <p className="text-4xl font-black mt-2">{kd.toLocaleString('pt-BR')}</p>
            <p className="text-sm opacity-90 mt-1">≈ R$ {(kd / 100).toFixed(2).replace('.', ',')} em descontos</p>
          </div>
        </motion.div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Todos os badges</p>
          <button onClick={simularConquista} className="bg-[#0F172A] dark:bg-white dark:text-black text-white rounded-full px-4 py-2 text-xs font-bold hover:scale-105 transition">
            🎲 Simular conquista aleatória (demo)
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BADGES.map((b, i) => {
            const ganho = adquiridos.includes(b.id)
            return (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className={`relative bg-white dark:bg-[#111827] rounded-2xl p-4 border ${ganho ? 'border-amber-300 dark:border-amber-500/50 shadow-md' : 'border-slate-200 dark:border-slate-800 opacity-60'} text-center`}>
                {!ganho && <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-400" />}
                {ganho && <Star className="absolute top-2 right-2 w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                <div className="text-4xl mb-2 grayscale-0">{b.icone}</div>
                <p className={`text-sm font-black ${ganho ? 'text-[#0F172A] dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>{b.nome}</p>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{b.descricao}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2 flex-wrap">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${raroCor[b.raro]}`}>{b.raro}</span>
                </div>
                <p className="text-[10px] font-bold text-brand-600 mt-2">+{b.xp} XP • +{b.kdRecompensa} KD</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
