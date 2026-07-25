'use client'

// ─────────────────────────────────────────────────────────────
// ClickSpark Pro v0.0.1 — Efeito de clique minimalista mobile-friendly
// Máximo 6 partículas, duração 400ms, sem ripple
// ─────────────────────────────────────────────────────────────

import React, { useCallback, useRef } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  angle: number
  color: string
}

const SPARK_COLORS = [
  'bg-zinc-400',
  'bg-zinc-500',
  'bg-zinc-300',
  'bg-zinc-600',
  'bg-zinc-400',
  'bg-zinc-500',
]

export default function ClickSparkPro() {
  const particlesRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const idCounter = useRef(0)

  const handleClick = useCallback((e: MouseEvent | TouchEvent) => {
    let x: number, y: number

    if ('touches' in e) {
      const touch = e.touches[0] || (e as TouchEvent).changedTouches[0]
      if (!touch) return
      x = touch.clientX
      y = touch.clientY
    } else {
      x = (e as MouseEvent).clientX
      y = (e as MouseEvent).clientY
    }

    // Criar 6 partículas
    for (let i = 0; i < 6; i++) {
      const id = idCounter.current++
      const angle = (i / 6) * Math.PI * 2
      const particle = document.createElement('div')
      particle.className = `absolute w-1.5 h-1.5 rounded-full ${SPARK_COLORS[i % SPARK_COLORS.length]} pointer-events-none`
      particle.style.left = `${x}px`
      particle.style.top = `${y}px`
      particle.style.transition = 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)'
      particle.style.opacity = '1'

      document.body.appendChild(particle)

      // Animar para fora
      requestAnimationFrame(() => {
        const distance = 20 + Math.random() * 20
        particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`
        particle.style.opacity = '0'
      })

      // Remover após animação
      setTimeout(() => {
        particle.remove()
      }, 400)
    }
  }, [])

  React.useEffect(() => {
    document.addEventListener('click', handleClick)
    document.addEventListener('touchstart', handleClick, { passive: true })
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [handleClick])

  return null // Não renderiza nada, só o efeito
}
