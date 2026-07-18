// ─────────────────────────────────────────────────────────────
// KIYVO — Chat Realtime via Supabase Realtime
// Substitui polling por WebSocket para mensagens instantâneas
// Usa canal Realtime do Supabase para escutar inserts
// ─────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js'

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

interface NewMessageCallback {
  (message: ChatMessage): void
}

// ─── REALTIME SUBSCRIPTION ───────────────────────────────────

/**
 * Cria uma inscrição Realtime para mensagens de uma conversa
 * Retorna o canal para gerenciamento de ciclo de vida
 */
export function subscribeToConversation(
  conversationId: string,
  onNewMessage: NewMessageCallback
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: RealtimePostgresInsertPayload<Record<string, unknown>>) => {
        const message: ChatMessage = {
          id: payload.new.id as string,
          conversation_id: payload.new.conversation_id as string,
          sender_id: payload.new.sender_id as string,
          content: payload.new.content as string,
          message_type: (payload.new.message_type as ChatMessage['message_type']) || 'text',
          is_read: (payload.new.is_read as boolean) || false,
          created_at: payload.new.created_at as string,
        }
        onNewMessage(message)
      }
    )
    .subscribe()

  return channel
}

/**
 * Cria uma inscrição Realtime para todas as conversas do usuário
 * Escuta updates em conversas (nova mensagem, status change)
 */
export function subscribeToUserConversations(
  userId: string,
  onUpdate: (conversation: Record<string, unknown>) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
      },
      (payload) => {
        // Filtrar conversas do usuário
        const newRecord = payload.new as Record<string, unknown>
        if (newRecord.buyer_id === userId || newRecord.vendor_id === userId) {
          onUpdate(newRecord)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_conversations',
      },
      (payload) => {
        const newRecord = payload.new as Record<string, unknown>
        if (newRecord.buyer_id === userId || newRecord.vendor_id === userId) {
          onUpdate(newRecord)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Desinscreve de um canal Realtime
 * Deve ser chamado no cleanup do useEffect
 */
export async function unsubscribeFromChannel(channel: RealtimeChannel): Promise<void> {
  await channel.unsubscribe()
}

/**
 * Presença — mostra quem está online na conversa
 */
export function trackPresence(
  conversationId: string,
  userId: string,
  userName: string
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase.channel(`presence:${conversationId}`, {
    config: { presence: { key: userId } },
  })

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        user_id: userId,
        user_name: userName,
        online_at: new Date().toISOString(),
      })
    }
  })

  return channel
}

/**
 * Obtém presença dos participantes da conversa
 */
export function getPresenceUsers(channel: RealtimeChannel): Array<{ user_id: string; user_name: string; online_at: string }> {
  const state = channel.presenceState()
  const users: Array<{ user_id: string; user_name: string; online_at: string }> = []

  for (const key of Object.keys(state)) {
    const presences = state[key]
    if (presences) {
      presences.forEach((presence) => {
        const p = presence as Record<string, unknown>
        users.push({
          user_id: p.user_id as string,
          user_name: p.user_name as string,
          online_at: p.online_at as string,
        })
      })
    }
  }

  return users
}

// ─── TYPING INDICATOR ────────────────────────────────────────

/**
 * Envia indicador de digitação
 */
export async function sendTypingIndicator(
  channel: RealtimeChannel,
  userId: string,
  userName: string
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { user_id: userId, user_name: userName, typing: true },
  })
}

/**
 * Escuta indicador de digitação
 */
export function onTypingIndicator(
  channel: RealtimeChannel,
  callback: (data: { user_id: string; user_name: string; typing: boolean }) => void
): void {
  channel.on('broadcast', { event: 'typing' }, (payload) => {
    callback(payload.payload as { user_id: string; user_name: string; typing: boolean })
  })
}
