'use client'
// ─────────────────────────────────────────────────────────────
// LogoLoop — Faixa infinita de logos/ícones (horizontal ou vertical)
// Inspirado no React Bits LogoLoop, sem dependências externas.
// Usa requestAnimationFrame + CSS transform (GPU-accelerated).
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, memo } from 'react'

interface NodeLogoItem {
  node: React.ReactNode
  title?: string
  href?: string
  ariaLabel?: string
}
interface SrcLogoItem {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  title?: string
  href?: string
  width?: number
  height?: number
}

export type LogoItem = NodeLogoItem | SrcLogoItem

interface LogoLoopProps {
  logos: LogoItem[]
  speed?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  width?: number | string
  logoHeight?: number
  gap?: number
  hoverSpeed?: number
  pauseOnHover?: boolean
  fadeOut?: boolean
  fadeOutColor?: string
  scaleOnHover?: boolean
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

function isSrcItem(item: LogoItem): item is SrcLogoItem {
  return 'src' in item
}

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 40,
  direction = 'left',
  width = '100%',
  logoHeight = 36,
  gap = 32,
  hoverSpeed,
  pauseOnHover = false,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Parceiros',
  className,
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const seqRef = useRef<HTMLUListElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const offsetRef = useRef(0)
  const velocityRef = useRef(0)
  const [isHovered, setIsHovered] = useState(false)
  const [seqSize, setSeqSize] = useState({ w: 0, h: 0 })
  const [copyCount, setCopyCount] = useState(2)

  const isVertical = direction === 'up' || direction === 'down'

  // Velocidade alvo em px/s (sinal conforme direção)
  const targetVelocity = useMemo(() => {
    const absSpeed = Math.abs(speed)
    let dirMult = 1
    if (isVertical) dirMult = direction === 'up' ? -1 : 1 // negativo = subir (translateY negativo)
    else dirMult = direction === 'left' ? -1 : 1 // negativo = ir pra esquerda
    const signFromSpeed = speed < 0 ? -1 : 1
    return absSpeed * dirMult * signFromSpeed
  }, [speed, direction, isVertical])

  // Velocidade efetiva durante hover
  const hoverVelocity = useMemo(() => {
    if (hoverSpeed !== undefined) return hoverSpeed * (targetVelocity >= 0 ? 1 : -1)
    if (pauseOnHover) return 0
    return targetVelocity
  }, [hoverSpeed, pauseOnHover, targetVelocity])

  // Medir a sequência inicial e calcular quantas cópias precisamos
  const measure = useCallback(() => {
    const container = containerRef.current
    const seq = seqRef.current
    if (!container || !seq) return
    const rect = seq.getBoundingClientRect()
    const w = Math.ceil(rect.width)
    const h = Math.ceil(rect.height)
    setSeqSize({ w, h })

    const containerRect = container.getBoundingClientRect()
    const viewport = isVertical ? containerRect.height : containerRect.width
    const itemSize = isVertical ? h : w
    if (itemSize > 0) {
      const copies = Math.ceil(viewport / itemSize) + 2
      setCopyCount(Math.max(2, copies))
    }

    // Altura do container em modo vertical
    if (isVertical) {
      const parentH = container.parentElement?.clientHeight ?? containerRect.height
      if (parentH > 0) container.style.height = `${Math.ceil(parentH)}px`
    }
  }, [isVertical])

  useLayoutEffect(() => {
    measure()
  }, [logos, gap, logoHeight, measure])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.ResizeObserver) {
      const onResize = () => measure()
      window.addEventListener('resize', onResize)
      measure()
      return () => window.removeEventListener('resize', onResize)
    }
    const obs = new ResizeObserver(() => measure())
    if (containerRef.current) obs.observe(containerRef.current)
    if (seqRef.current) obs.observe(seqRef.current)
    measure()
    return () => obs.disconnect()
  }, [measure])

  // Aguardar imagens carregarem antes de medir
  useEffect(() => {
    const seq = seqRef.current
    if (!seq) return
    const imgs = Array.from(seq.querySelectorAll('img'))
    if (imgs.length === 0) {
      measure()
      return
    }
    let remaining = imgs.length
    const done = () => {
      remaining -= 1
      if (remaining <= 0) measure()
    }
    imgs.forEach(img => {
      if (img.complete) done()
      else {
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
      }
    })
    return () => imgs.forEach(img => {
      img.removeEventListener('load', done)
      img.removeEventListener('error', done)
    })
  }, [logos, measure])

  // Loop de animação com rAF
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const itemSize = isVertical ? seqSize.h : seqSize.w
    if (itemSize > 0) {
      // Garantir loop sem emendas
      offsetRef.current = ((offsetRef.current % itemSize) + itemSize) % itemSize
    }

    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts
      const dt = Math.max(0, (ts - lastTsRef.current) / 1000)
      lastTsRef.current = ts

      const target = isHovered ? hoverVelocity : targetVelocity
      const tau = 0.15
      const k = 1 - Math.exp(-dt / tau)
      velocityRef.current += (target - velocityRef.current) * k

      if (itemSize > 0) {
        offsetRef.current += velocityRef.current * dt
        offsetRef.current = ((offsetRef.current % itemSize) + itemSize) % itemSize
        const x = isVertical ? 0 : -offsetRef.current
        const y = isVertical ? -offsetRef.current : 0
        track.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [targetVelocity, hoverVelocity, isHovered, isVertical, seqSize.w, seqSize.h])

  const renderLogoItem = useCallback((item: LogoItem, key: React.Key) => {
    if (renderItem) {
      return <li key={key} className="ll-item" role="listitem">{renderItem(item, key)}</li>
    }
    const isNode = !isSrcItem(item)
    const content = isNode ? (
      <span className="ll-node" aria-hidden={!!item.href && !item.ariaLabel}>{item.node}</span>
    ) : (
      <img
        src={item.src}
        srcSet={item.srcSet}
        sizes={item.sizes}
        width={item.width}
        height={item.height}
        alt={item.alt ?? ''}
        title={item.title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    )
    const aria = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title)
    const inner = item.href ? (
      <a
        className="ll-link"
        href={item.href}
        aria-label={aria || 'logo link'}
        target="_blank"
        rel="noreferrer noopener"
        tabIndex={-1}
      >{content}</a>
    ) : content
    return <li key={key} className="ll-item" role="listitem">{inner}</li>
  }, [renderItem])

  const lists = useMemo(
    () => Array.from({ length: copyCount }, (_, ci) => (
      <ul
        className={`ll-list ${isVertical ? 'll-list--v' : 'll-list--h'}`}
        key={`c-${ci}`}
        role="list"
        aria-hidden={ci > 0}
        ref={ci === 0 ? seqRef : undefined}
      >
        {logos.map((item, ii) => renderLogoItem(item, `${ci}-${ii}`))}
      </ul>
    )),
    [copyCount, logos, renderLogoItem, isVertical]
  )

  const rootStyle = useMemo(() => ({
    width: isVertical ? (typeof width === 'number' ? `${width}px` : width) : (typeof width === 'number' ? `${width}px` : width ?? '100%'),
    '--ll-gap': `${gap}px`,
    '--ll-logo-h': `${logoHeight}px`,
    ...(fadeOutColor ? { '--ll-fade': fadeOutColor } as React.CSSProperties : {}),
    ...style,
  }), [width, isVertical, gap, logoHeight, fadeOutColor, style])

  const rootClasses = [
    'll',
    isVertical ? 'll--v' : 'll--h',
    fadeOut ? 'll--fade' : '',
    scaleOnHover ? 'll--scale' : '',
    className || '',
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={containerRef}
      className={rootClasses}
      style={rootStyle}
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={() => { if (hoverVelocity !== undefined || pauseOnHover) setIsHovered(true) }}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div ref={trackRef} className="ll-track">
        {lists}
      </div>
    </div>
  )
})

export default LogoLoop
