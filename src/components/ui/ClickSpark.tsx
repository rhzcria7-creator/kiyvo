'use client'
// ─────────────────────────────────────────────────────────────
// ClickSpark — Efeito de faíscas no clique (canvas, leve).
// Sem dependências pesadas.
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface ClickSparkProps {
  /** Quantidade de partículas por clique */
  count?: number
  /** Cores das faíscas */
  colors?: string[]
  /** Duração da animação em ms */
  duration?: number
  /** Velocidade inicial das partículas */
  speed?: number
  /** Tamanho base das partículas */
  size?: number
}

const DEFAULT_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#FFFFFF', '#2563EB']

export function ClickSpark({
  count = 8,
  colors = DEFAULT_COLORS,
  duration = 650,
  speed = 3.5,
  size = 2.5,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function spawn(px: number, py: number) {
      const pool = sparksRef.current
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        const spd = speed * (0.6 + Math.random() * 0.9)
        pool.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0,
          maxLife: duration * (0.7 + Math.random() * 0.5),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: size * (0.6 + Math.random() * 0.8),
        })
      }
    }

    function handleClick(e: MouseEvent) {
      spawn(e.clientX, e.clientY)
    }

    function handleTouch(e: TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i += 1) {
        const t = e.changedTouches[i]
        spawn(t.clientX, t.clientY)
      }
    }

    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min(now - last, 48)
      last = now
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const pool = sparksRef.current
      for (let i = pool.length - 1; i >= 0; i -= 1) {
        const p = pool[i]
        p.life += dt
        const t = p.life / p.maxLife
        if (t >= 1) {
          pool.splice(i, 1)
          continue
        }
        // Desaceleração + gravidade leve
        p.vx *= 0.94
        p.vy = p.vy * 0.94 + 0.05
        p.x += p.vx * (dt / 16)
        p.y += p.vy * (dt / 16)
        const alpha = 1 - t
        const radius = p.size * (1 - t * 0.5)
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousedown', handleClick)
    window.addEventListener('touchstart', handleTouch, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('touchstart', handleTouch)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [count, colors, duration, speed, size])

  return <canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true" />
}

export default ClickSpark
