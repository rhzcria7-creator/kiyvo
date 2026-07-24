'use client'
// ─────────────────────────────────────────────────────────────
// useIsMobile — detecta viewport < breakpoint (padrão 768px).
// Observa matchMedia (sem poluir com resize listeners) e remove
// o listener no cleanup, evitando memory leak.
// Padrão TRUE (mobile/leve) no SSR e no primeiro render do cliente
// para manter o paint inicial barato e evitar mismatch de hidratação.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'

export function useIsMobile(breakpoint = 768): boolean {
  // Inicia como mobile (leve): SSR e primeiro paint do cliente coincidem,
  // depois faz upgrade para o modo pesado apenas em telas largas.
  const [isMobile, setIsMobile] = useState<boolean>(true)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [breakpoint])

  return isMobile
}

// ─────────────────────────────────────────────────────────────
// usePrefersReducedMotion — respeita a preferência do SO.
// Usado para desligar animações contínuas em quem pediu menos motion.
// ─────────────────────────────────────────────────────────────
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}
