'use client'

/**
 * Confetti — confete clássico de celebração (canvas, leve).
 * Dispara automaticamente ao montar.
 */

import { useEffect, useRef } from 'react'

interface ConfettiProps {
  duration?: number
  particleCount?: number
  colors?: string[]
}

interface Piece {
  x: number
  y: number
  w: number
  h: number
  vx: number
  vy: number
  rot: number
  vrot: number
  color: string
  shape: 'rect' | 'circle'
}

const DEFAULT_COLORS = ['#2563EB', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#F97316']

export default function Confetti({
  duration = 3000,
  particleCount = 140,
  colors = DEFAULT_COLORS,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    function resize() {
      if (!canvas || !ctx) return
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = window.innerWidth
    const pieces: Piece[] = []
    for (let i = 0; i < particleCount; i++) {
      pieces.push({
        x: Math.random() * W,
        y: -20 - Math.random() * 200,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.6 ? 'circle' : 'rect',
      })
    }

    const start = performance.now()
    let raf = 0
    function frame(now: number) {
      if (!ctx || !canvas) return
      const elapsed = now - start
      ctx.clearRect(0, 0, W, window.innerHeight)
      for (const p of pieces) {
        p.vy += 0.12
        p.vx *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, 1 - elapsed / duration)
        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
      }
      if (elapsed < duration) {
        raf = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, W, window.innerHeight)
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [duration, particleCount, colors])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  )
}
