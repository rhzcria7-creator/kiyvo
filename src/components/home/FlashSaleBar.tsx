'use client'
// FlashSaleBar — barra de ofertas relâmpago no topo com contador regressivo.
// Aparece em todas as páginas, abaixo do header, com desconto surpresa e contagem.
// Design de urgência, bonito, com framer-motion e sem blocar o conteúdo.
// Comentários em PT-BR.
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, X, Zap } from 'lucide-react'

// Próxima expiração: hoje 23:59 do fuso BR
function getEndOfDay() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 0)
  return end.getTime()
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function FlashSaleBar() {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(true)
  const [now, setNow] = useState(Date.now())
  const [endAt] = useState(getEndOfDay())

  useEffect(() => {
    setMounted(true)
    // Se o usuário já fechou na sessão, não mostrar de novo
    try {
      if (sessionStorage.getItem('kiyvo_flash_dismissed') === '1') setVisible(false)
    } catch {}
    const i = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])

  function dismiss() {
    setVisible(false)
    try { sessionStorage.setItem('kiyvo_flash_dismissed', '1') } catch {}
  }

  if (!mounted || !visible) return null

  const ms = Math.max(0, endAt - now)
  const secs = Math.floor(ms / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  // Rotaciona entre 3 ofertas
  const ofertas = [
    { texto: 'BLACK FRIDAY ANTECIPADO: até 70% OFF em produtos selecionados', href: '/ofertas' },
    { texto: 'Taxa ZERO nas primeiras 5.000 vendas para novos vendedores', href: '/vender' },
    { texto: 'Use KD Points e pague metade do preço no checkout', href: '/recompensas' },
  ]
  const idx = Math.floor(now / 5000) % ofertas.length
  const oferta = ofertas[idx]

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white overflow-hidden">
      {/* Shine animado */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
        }}
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm shrink-0">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur"
          >
            <Flame className="w-3.5 h-3.5" />
          </motion.span>
          <span className="hidden sm:inline">OFERTA RELÂMPAGO</span>
          <span className="sm:hidden">OFERTA</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-w-0"
          >
            <Link href={oferta.href} className="text-xs sm:text-sm font-bold block truncate hover:underline">
              <Zap className="w-3 h-3 inline-block mr-1 fill-white" />
              {oferta.texto}
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Contador */}
        <div className="flex items-center gap-1 text-xs font-black tabular-nums shrink-0">
          <span className="hidden sm:inline text-white/80 mr-1">termina em</span>
          <span className="bg-black/25 px-1.5 py-0.5 rounded text-sm sm:text-base">{pad(h)}</span>
          <span className="animate-pulse">:</span>
          <span className="bg-black/25 px-1.5 py-0.5 rounded text-sm sm:text-base">{pad(m)}</span>
          <span className="animate-pulse">:</span>
          <span className="bg-black/25 px-1.5 py-0.5 rounded text-sm sm:text-base">{pad(s)}</span>
        </div>

        <button
          onClick={dismiss}
          aria-label="Fechar aviso"
          className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default FlashSaleBar
