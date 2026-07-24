// hooks/useHermes.ts
// -----------------------------------------------------------------------------
// Hook React (TypeScript estrito) para conversar com o Hermes Agent através da
// Supabase Edge Function `hermes-proxy`.
//
// - Usa o SDK @supabase/supabase-js para invocar a Edge Function.
// - Suporta resposta JSON (padrão) OU streaming SSE (opcional).
// - Injeta o ID token do Firebase no corpo, quando fornecido via `getIdToken`,
//   para que a Edge Function valide a sessão do Firebase.
// - Gerencia loading, error e o histórico de mensagens (messages).
// - Tipagem estrita das mensagens: { id, role, content }.
// -----------------------------------------------------------------------------

import { useCallback, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export type HermesRole = 'user' | 'assistant'

export interface HermesMessage {
  id: string
  role: HermesRole
  content: string
}

interface UseHermesOptions {
  /** Cliente Supabase já inicializado (usado para chamar a Edge Function). */
  supabase: SupabaseClient
  /** Nome da Edge Function (padrão: hermes-proxy). */
  functionName?: string
  /** Mensagens iniciais (ex.: histórico persistido). */
  initialMessages?: HermesMessage[]
  /** Modelo enviado ao Hermes (padrão: hermes). */
  model?: string
  /** Retorna o ID token do Firebase (opcional). */
  getIdToken?: () => Promise<string | null>
  /** Callback de erro opcional. */
  onError?: (message: string) => void
}

interface OpenAiChoice {
  message?: { content?: string }
  delta?: { content?: string }
}

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function extractContent(data: unknown): string {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'choices' in (data as object)) {
    const choices = (data as { choices?: OpenAiChoice[] }).choices
    return choices?.[0]?.message?.content ?? ''
  }
  return ''
}

interface SendOptions {
  stream?: boolean
}

export function useHermes({
  supabase,
  functionName = 'hermes-proxy',
  initialMessages = [],
  model = 'hermes',
  getIdToken,
  onError,
}: UseHermesOptions) {
  const [messages, setMessages] = useState<HermesMessage[]>(initialMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const setAssistantContent = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content } : m)),
    )
  }, [])

  const streamCompletion = useCallback(
    async (body: Record<string, unknown>, assistantId: string, signal: AbortSignal) => {
      const base = (supabase as SupabaseClient & { supabaseUrl: string }).supabaseUrl
      const fnUrl = `${base}/functions/v1/${functionName}`
      const { data: sessionData } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }))
      const accessToken = sessionData?.session?.access_token ?? ''

      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
        signal,
      })

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => '')
        throw new Error(detail || `Erro ${res.status} ao falar com o assistente.`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let acc = ''

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const payload = trimmed.slice(5).trim()
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload) as { choices?: OpenAiChoice[] }
            const delta = parsed.choices?.[0]?.delta?.content ?? ''
            if (delta) {
              acc += delta
              setAssistantContent(assistantId, acc)
            }
          } catch {
            // linha parcial; ignora
          }
        }
      }
    },
    [supabase, functionName, setAssistantContent],
  )

  const sendMessage = useCallback(
    async (content: string, options?: SendOptions) => {
      const text = content.trim()
      if (!text || loading) return

      const userMessage: HermesMessage = { id: uid(), role: 'user', content: text }
      const history: HermesMessage[] = [...messages, userMessage]
      setMessages(history)
      setLoading(true)
      setError(null)

      const assistantId = uid()
      const firebaseToken = getIdToken ? await getIdToken().catch(() => null) : null

      const body: Record<string, unknown> = {
        model,
        stream: Boolean(options?.stream),
        messages: history.map(({ role, content: c }) => ({ role, content: c })),
      }
      if (firebaseToken) body.firebaseToken = firebaseToken

      const controller = new AbortController()
      abortRef.current = controller

      try {
        if (options?.stream) {
          setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])
          await streamCompletion(body, assistantId, controller.signal)
        } else {
          const { data, error: fnError } = await supabase.functions.invoke(functionName, { body })
          if (fnError) throw new Error(fnError.message)
          const assistantContent = extractContent(data) || JSON.stringify(data ?? {})
          setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: assistantContent }])
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Erro desconhecido ao falar com o assistente.'
        setError(message)
        onError?.(message)
        // Remove a bolha vazia do assistente em caso de falha no streaming.
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      } finally {
        setLoading(false)
        abortRef.current = null
      }
    },
    [messages, loading, supabase, functionName, model, getIdToken, onError, streamCompletion],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages(initialMessages)
    setError(null)
  }, [initialMessages])

  return { messages, loading, error, sendMessage, stop, reset }
}
