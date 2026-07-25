'use client'
// v0.0.1 — Pull-to-refresh com threshold e sem listener global permanente.
import { useEffect, useRef, useState } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<void> | void, threshold = 72) {
  const [pullDistance, setPullDistance] = useState(0); const [refreshing, setRefreshing] = useState(false); const startY = useRef<number | null>(null)
  useEffect(() => {
    const onStart = (event: TouchEvent) => { if (window.scrollY === 0 && !refreshing) startY.current = event.touches[0]?.clientY ?? null }
    const onMove = (event: TouchEvent) => { if (startY.current === null) return; const distance = Math.max(0, (event.touches[0]?.clientY ?? startY.current) - startY.current); setPullDistance(Math.min(threshold * 1.5, distance * .45)) }
    const onEnd = async () => { const shouldRefresh = pullDistance >= threshold; startY.current = null; setPullDistance(0); if (!shouldRefresh || refreshing) return; setRefreshing(true); try { await onRefresh() } finally { setRefreshing(false) } }
    window.addEventListener('touchstart', onStart, { passive: true }); window.addEventListener('touchmove', onMove, { passive: true }); window.addEventListener('touchend', onEnd, { passive: true }); return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
  }, [onRefresh, pullDistance, refreshing, threshold])
  return { pullDistance, refreshing, ready: pullDistance >= threshold }
}
