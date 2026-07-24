// hooks/useHermes.ts
// Hook React (TypeScript estrito) para conversar com o Hermes Agent
// através da Supabase Edge Function `hermes-proxy`.
//
// Gerencia: loading, error e o histórico de mensagens (messages).
// Tipagem estrita das mensagens: { id, role, content }.

import { useCallback, useState } from 'react'
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
}

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface Choice {
  message?: { content?: string }
}

export function useHermes({
  supabase,
  functionName = 'hermes-proxy',
  initialMessages = [],
  model = 'hermes',
}: UseHermesOptions) {
  const [messages, setMessages] = useState<HermesMessage[]>(initialMessages)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string, options?: { stream?: boolean }) => {
      const text = content.trim()
      if (!text || loading) return

      const userMessage: HermesMessage = { id: uid(), role: 'user', content: text }
      const history: HermesMessage[] = [...messages, userMessage]
      setMessages(history)
      setLoading(true)
      setError(null)

      try {
        const { data, error: fnError } = await supabase.functions.invoke(functionName, {
          body: {
            model,
            stream: options?.stream ?? false,
            messages: history.map(({ role, content: c }) => ({ role, content: c })),
          },
        })

        if (fnError) throw new Error(fnError.message)

        // Extrai o conteúdo da resposta OpenAI-compatible (data.choices[0].message.content)
        let assistantContent = ''
        if (data && typeof data === 'object' && 'choices' in data) {
          const choices = (data as { choices?: Choice[] }).choices
          assistantContent = choices?.[0]?.message?.content ?? ''
        }
        if (!assistantContent && data) assistantContent = JSON.stringify(data)

        setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content: assistantContent }])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro desconhecido ao falar com o assistente.')
      } finally {
        setLoading(false)
      }
    },
    [messages, loading, supabase, functionName, model],
  )

  const reset = useCallback(() => {
    setMessages(initialMessages)
    setError(null)
  }, [initialMessages])

  return { messages, loading, error, sendMessage, reset }
}
