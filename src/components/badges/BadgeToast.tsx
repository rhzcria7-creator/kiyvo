'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Badge } from '@/lib/agents/badgeengine'

// Toast animado de conquista de badge (aparece ao ganhar uma badge)
export function BadgeToast({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [onClose])
  const raroCor: Record<string, string> = {
    comum: 'from-slate-500 to-slate-700',
    raro: 'from-blue-500 to-indigo-600',
    epico: 'from-purple-500 to-fuchsia-600',
    lendario: 'from-amber-400 via-yellow-500 to-orange-500',
  }
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 80, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 80 }}
        className="fixed bottom-24 right-4 md:right-6 z-[100] max-w-xs bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className={`bg-gradient-to-r ${raroCor[badge.raro]} p-4 text-white flex items-center gap-3`}>
          <Trophy className="w-6 h-6" />
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-90">🏆 Conquista desbloqueada!</p>
            <p className="font-black">{badge.nome}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 flex items-center gap-3">
          <div className="text-4xl">{badge.icone}</div>
          <div className="flex-1">
            <p className="text-sm text-slate-700 dark:text-slate-300">{badge.descricao}</p>
            <p className="text-xs font-black text-brand-600 mt-1">+{badge.xp} XP • +{badge.kdRecompensa} KD Points</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function useBadgeQueue() {
  const [queue, setQueue] = useState<Badge[]>([])
  const [current, setCurrent] = useState<Badge | null>(null)
  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0])
      setQueue(q => q.slice(1))
    }
  }, [queue, current])
  const push = (b: Badge) => setQueue(q => [...q, b])
  const close = () => setCurrent(null)
  return { current, push, close }
}
