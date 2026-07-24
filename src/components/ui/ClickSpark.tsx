'use client'
// ─────────────────────────────────────────────────────────────
// ClickSpark v3 — Faíscas + ondulação no clique.
// CORRIGIDO: usa requestAnimationFrame com pausa inteligente em tab oculta,
// throttling de spawn, clean-up sem vazamento e resiliência a prefers-reduced-motion.
// Sem dependências pesadas. Comentários em PT-BR.
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
  rotation: number
  rotationSpeed: number
}

interface Ripple {
  x: number
  y: number
  life: number
  maxLife: number
  radius: number
}

interface ClickSparkProps {
  count?: number
  colors?: string[]
  duration?: number
  speed?: number
  size?: number
  /** Mostra ondulação em botões (melhor feedback de clique) */
  showRipple?: boolean
}

const DEFAULT_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#8B5CF6', '#A855F7', '#EC4899', '#FBBF24', '#FFFFFF']

export function ClickSpark({
  count = 12,
  colors = DEFAULT_COLORS,
  duration = 650,
  speed = 4.5,
  size = 2.8,
  showRipple = true,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const ripplesRef = useRef<Ripple[]>([])
  const rafRef = useRef<number | null>(null)
  const runningRef = useRef<boolean>(false)
  const lastTsRef = useRef<number>(0)
  const lastSpawnRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Respeita reduce motion: se o usuário prefere sem animação, não spawna nada
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

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

    function startLoop() {
      if (runningRef.current) return
      runningRef.current = true
      lastTsRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    }
    function stopLoop() {
      runningRef.current = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    function spawn(px: number, py: number) {
      const pool = sparksRef.current
      // Limita partículas ativas para não travar
      if (pool.length > 200) pool.splice(0, pool.length - 200)
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        const spd = speed * (0.4 + Math.random() * 1.1)
        pool.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 0,
          maxLife: duration * (0.55 + Math.random() * 0.6),
          color: colors[Math.floor(Math.random() * colors.length)],
          size: size * (0.6 + Math.random() * 0.9),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
        })
      }
      if (showRipple) {
        ripplesRef.current.push({
          x: px,
          y: py,
          life: 0,
          maxLife: 480,
          radius: 0,
        })
      }
      startLoop()
    }

    function handleClick(e: MouseEvent) {
      const now = performance.now()
      if (now - lastSpawnRef.current < 40) return // throttling para evitar spam
      lastSpawnRef.current = now
      spawn(e.clientX, e.clientY)
    }

    function handleTouch(e: TouchEvent) {
      const now = performance.now()
      if (now - lastSpawnRef.current < 80) return
      lastSpawnRef.current = now
      for (let i = 0; i < e.changedTouches.length; i += 1) {
        const t = e.changedTouches[i]
        spawn(t.clientX, t.clientY)
      }
    }

    function tick(now: number) {
      if (!runningRef.current) return
      const dt = Math.min(now - lastTsRef.current, 48)
      lastTsRef.current = now
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Desenhar ondulações
      const ripples = ripplesRef.current
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        const r = ripples[i]
        r.life += dt
        const t = r.life / r.maxLife
        if (t >= 1) { ripples.splice(i, 1); continue }
        r.radius = t * 48
        ctx.globalAlpha = (1 - t) * 0.25
        ctx.strokeStyle = '#2563EB'
        ctx.lineWidth = 2 * (1 - t)
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Desenhar faíscas
      const pool = sparksRef.current
      for (let i = pool.length - 1; i >= 0; i -= 1) {
        const p = pool[i]
        p.life += dt
        const t = p.life / p.maxLife
        if (t >= 1) { pool.splice(i, 1); continue }
        p.vx *= 0.92
        p.vy = p.vy * 0.92 + 0.07
        p.x += p.vx * (dt / 16)
        p.y += p.vy * (dt / 16)
        p.rotation += p.rotationSpeed

        const alpha = Math.pow(1 - t, 1.4)
        const radius = p.size * (1 - t * 0.55)

        ctx.save()
        ctx.translate(p.x, p.y)
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const angle = Math.atan2(p.vy, p.vx)
        ctx.rotate(angle)
        const len = radius * 2.5 + spd * 0.3
        const grad = ctx.createLinearGradient(-len / 2, 0, len / 2, 0)
        grad.addColorStop(0, p.color + '00')
        grad.addColorStop(0.5, p.color)
        grad.addColorStop(1, p.color + '00')
        ctx.globalAlpha = alpha
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.ellipse(0, 0, len / 2, radius * 0.5, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.globalAlpha = alpha * 0.8
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      ctx.globalAlpha = 1

      // Se não há mais partículas, pausar loop para economizar CPU
      if (pool.length === 0 && ripples.length === 0) {
        stopLoop()
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    function onVisibility() {
      if (document.hidden) {
        stopLoop()
      } else {
        // Retoma: só volta a animar se houver partículas pendentes
        if (sparksRef.current.length > 0 || ripplesRef.current.length > 0) {
          startLoop()
        }
      }
    }

    window.addEventListener('mousedown', handleClick)
    window.addEventListener('touchstart', handleTouch, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousedown', handleClick)
      window.removeEventListener('touchstart', handleTouch)
      document.removeEventListener('visibilitychange', onVisibility)
      stopLoop()
    }
  }, [count, colors, duration, speed, size, showRipple])

  return <canvas ref={canvasRef} className="click-spark-canvas" aria-hidden="true" />
}

export default ClickSpark
