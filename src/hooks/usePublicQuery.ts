'use client'
// Hook genérico para buscar dados de APIs públicas da KIYVO com loading/error/empty/success
import { useEffect, useState } from 'react'

export interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePublicQuery<T>(url: string, options?: { enabled?: boolean; deps?: any[] }): QueryState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const enabled = options?.enabled !== false

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(url, { headers: { 'Content-Type': 'application/json' } })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({ error: 'Erro na requisição' }))
          throw new Error(j.error || `HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json.data || json)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.message || 'Erro ao carregar')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [url, enabled, tick, ...(options?.deps || [])])

  const refetch = async () => setTick((t) => t + 1)

  return { data, loading, error, refetch }
}
