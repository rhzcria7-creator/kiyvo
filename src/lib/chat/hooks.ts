'use client'

// ─────────────────────────────────────────────────────────────
// KIYVO — Hook de Chat Realtime
// Gerencia subscriptions, mensagens, presença e typing
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  subscribeToConversation,
  unsubscribeFromChannel,
  trackPresence,
  getPresenceUsers,
  sendTypingIndicator,
  onTypingIndicator,
} from '@/lib/chat/realtime'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── TYPES ───────────────────────────────────────────────────

interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'system'
  is_read: boolean
  created_at: string
}

interface PresenceUser {
  user_id: string
  user_name: string
  online_at: string
}

interface TypingIndicator {
  user_id: string
  user_name: string
  typing: boolean
}

// ─── HOOK: useChatRealtime ───────────────────────────────────

export function useChatRealtime(
  conversationId: string | null,
  currentUserId: string | null,
  currentUserName: string | null
) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map())
  const [isConnected, setIsConnected] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const presenceChannelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Inscrever na conversa
  useEffect(() => {
    if (!conversationId || !currentUserId) return

    // Channel de mensagens
    const channel = subscribeToConversation(conversationId, (message) => {
      setMessages((prev) => {
        // Evitar duplicatas
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
    })

    channelRef.current = channel
    setIsConnected(true)

    // Channel de presença
    if (currentUserName) {
      const presenceChannel = trackPresence(
        conversationId,
        currentUserId,
        currentUserName
      )

      presenceChannelRef.current = presenceChannel

      // Atualizar lista de online periodicamente
      const interval = setInterval(() => {
        const users = getPresenceUsers(presenceChannel)
        setOnlineUsers(users)
      }, 5000)

      // Typing indicator
      onTypingIndicator(presenceChannel, (data) => {
        if (data.user_id === currentUserId) return

        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.set(data.user_id, data)
          return next
        })

        // Remover indicador após 3 segundos
        const existingTimeout = typingTimeoutRef.current.get(data.user_id)
        if (existingTimeout) clearTimeout(existingTimeout)

        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Map(prev)
            next.delete(data.user_id)
            return next
          })
        }, 3000)

        typingTimeoutRef.current.set(data.user_id, timeout)
      })

      return () => {
        clearInterval(interval)
        unsubscribeFromChannel(channel)
        unsubscribeFromChannel(presenceChannel)
        setIsConnected(false)
      }
    }

    return () => {
      unsubscribeFromChannel(channel)
      setIsConnected(false)
    }
  }, [conversationId, currentUserId, currentUserName])

  // Carregar mensagens iniciais
  const loadMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      const res = await fetch(
        `/api/v1/chat/messages?conversation_id=${conversationId}&limit=100`
      )
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {
      // Erro silencioso
    }
  }, [conversationId])

  // Enviar mensagem
  const sendMessage = useCallback(
    async (content: string, messageType: string = 'text') => {
      if (!conversationId || !content.trim()) return

      try {
        const res = await fetch('/api/v1/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            content,
            message_type: messageType,
          }),
        })

        if (!res.ok) {
          throw new Error('Erro ao enviar mensagem')
        }
        // A mensagem chega via Realtime — não precisamos adicionar manualmente
      } catch {
        // Fallback: adicionar localmente
      }
    },
    [conversationId]
  )

  // Enviar indicador de digitação
  const sendTyping = useCallback(() => {
    if (!presenceChannelRef.current || !currentUserId || !currentUserName) return
    sendTypingIndicator(presenceChannelRef.current, currentUserId, currentUserName)
  }, [currentUserId, currentUserName])

  return {
    messages,
    onlineUsers,
    typingUsers: Array.from(typingUsers.values()),
    isConnected,
    loadMessages,
    sendMessage,
    sendTyping,
  }
}

// ─── HOOK: useConversationsList ──────────────────────────────

interface Conversation {
  id: string
  buyer_id: string
  vendor_id: string
  status: string
  last_message: string | null
  last_message_at: string | null
  product: { title: string } | null
  buyer: { full_name: string } | null
  vendor: { full_name: string } | null
}

export function useConversationsList(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/chat/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      } else {
        setError('Erro ao carregar conversas')
      }
    } catch {
      setError('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return { conversations, isLoading, error, refresh: loadConversations }
}
