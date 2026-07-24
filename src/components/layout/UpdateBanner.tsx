'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Banner de novidades no topo (dismissível)
export function UpdateBanner() {
  const [visivel, setVisivel] = useState(false)
  const [versao, setVersao] = useState('8.7')

  useEffect(() => {
    try {
      const visto = localStorage.getItem(`kiyvo_update_v${versao}`)
      if (!visto) setVisivel(true)
    } catch {}
  }, [versao])

  const dispensar = () => {
    setVisivel(false)
    try { localStorage.setItem(`kiyvo_update_v${versao}`, '1') } catch {}
  }

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 text-white overflow-hidden sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="font-bold">
                🚀 <strong>v{versao}</strong>: +10 agentes IA, sistema de conquistas, calculadora de lucro e muito mais!
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/changelog" className="underline underline-offset-2 font-bold hidden sm:inline">Ver tudo</Link>
              <Link href="/agentes" className="bg-white text-[#0F172A] rounded-full px-3 py-1 text-xs font-black hover:scale-105 transition">
                Abrir agentes IA
              </Link>
              <button onClick={dispensar} aria-label="Fechar" className="hover:bg-white/20 rounded-full p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
