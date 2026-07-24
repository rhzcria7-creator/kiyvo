'use client'
// SimpleConfetti — confete leve em canvas (sem bibliotecas externas)
// Dispara automaticamente quando `trigger` muda. Respeita prefers-reduced-motion.
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rot: number
  vrot: number
  shape: 'square' | 'circle' | 'rect'
  life: number
}

const COLORS = [
  '#2563EB', '#7C3AED', '#EC4899', '#F59E0B', '#10B981',
  '#EF4444', '#06B6D4', '#F97316', '#84CC16', '#A855F7'
]

export function SimpleConfetti({ trigger, duration = 2500, pieces = 120 }: { trigger: number | boolean | string; duration?: number; pieces?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    // resize
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = []
    const dpr = window.devicePixelRatio || 1
    for (let i = 0; i < pieces; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 6 + Math.random() * 8
      particles.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        shape: Math.random() < 0.5 ? 'square' : Math.random() < 0.7 ? 'rect' : 'circle',
        life: 1,
      })
    }

    let raf = 0
    const start = performance.now()
    const gravity = 0.25
    const friction = 0.99

    const tick = (now: number) => {
      const t = (now - start) / duration
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0
      for (const p of particles) {
        if (p.life <= 0) continue
        p.vy += gravity
        p.vx *= friction
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vrot
        p.life = Math.max(0, 1 - t - (p.y > canvas.height ? 1 : 0))
        if (p.life <= 0) continue
        alive++
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2 * dpr, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size/2 * dpr, -p.size/4 * dpr, p.size * dpr, p.size/2 * dpr)
        } else {
          ctx.fillRect(-p.size/2 * dpr, -p.size/2 * dpr, p.size * dpr, p.size * dpr)
        }
        ctx.restore()
      }
      if (alive > 0 && t < 1.2) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[100]"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
