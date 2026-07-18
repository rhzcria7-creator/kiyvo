'use client'

// ─────────────────────────────────────────────────────────────
// KIYVO — Chat Client com Realtime
// Substitui dados mock por integração Supabase Realtime
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Paperclip, Image, MoreVertical, Shield,
  CheckCheck, Clock, Search, Phone, Video, Smile,
  ArrowLeft, Circle, AlertTriangle
} from 'lucide-react'
import { useChatRealtime, useConversationsList } from '@/lib/chat/hooks'
import { useAuth } from '@/lib/auth/context'

// ─── TYPES ───────────────────────────────────────────────────

interface ChatConversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread: number
  product: string
  status: 'delivered' | 'pending' | 'disputed'
  isOnline?: boolean
}

// ─── CONVERSATION ITEM ──────────────────────────────────────

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: ChatConversation
  isActive: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(37,99,235,0.03)' }}
      onClick={onClick}
      className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${
        isActive ? 'bg-brand-50 dark:bg-brand-950/30 border-l-4 border-brand-500' : 'border-l-4 border-transparent'
      }`}
    >
      {/* Avatar com indicador online */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold text-sm">
          {conversation.name.charAt(0).toUpperCase()}
        </div>
        {conversation.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-surface-900 rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
            {conversation.name}
          </p>
          <span className="text-xs text-surface-400 dark:text-surface-500 shrink-0 ml-2">
            {conversation.time}
          </span>
        </div>
        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
          {conversation.lastMessage}
        </p>
        <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
          {conversation.product}
        </p>
      </div>

      {/* Badge de não lidas */}
      {conversation.unread > 0 && (
        <span className="w-5 h-5 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">
          {conversation.unread}
        </span>
      )}
    </motion.button>
  )
}

// ─── MESSAGE BUBBLE ─────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
}: {
  message: { id: string; sender: string; text: string; time: string; type: string }
  isOwn: boolean
}) {
  if (message.type === 'system') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <div className="px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-xl text-xs text-surface-600 dark:text-surface-400 text-center max-w-md">
          {message.text}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] sm:max-w-xs px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
          isOwn
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-bl-md'
        }`}
      >
        {message.text}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <p className={`text-[10px] ${isOwn ? 'text-brand-200' : 'text-surface-400 dark:text-surface-500'}`}>
            {message.time}
          </p>
          {isOwn && (
            <CheckCheck size={12} className={message.type === 'read' ? 'text-brand-200' : 'text-brand-300'} />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── TYPING INDICATOR ───────────────────────────────────────

function TypingIndicator({ userName }: { userName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex items-center gap-2 px-2"
    >
      <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-2">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-surface-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <span className="text-xs text-surface-500 dark:text-surface-400">{userName} está digitando...</span>
      </div>
    </motion.div>
  )
}

// ─── EMPTY STATE ─────────────────────────────────────────────

function ChatEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Send size={24} className="text-surface-400 dark:text-surface-500" />
        </div>
        <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">
          Suas mensagens
        </h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs">
          Selecione uma conversa para começar a enviar mensagens. Todas as conversas são protegidas e monitoradas.
        </p>
      </div>
    </div>
  )
}

// ─── MAIN CHAT CLIENT ───────────────────────────────────────

export function ChatClient() {
  const { user } = useAuth()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Dados da conversa via hook de realtime
  const {
    messages: realtimeMessages,
    typingUsers,
    isConnected,
    loadMessages,
    sendMessage: sendRealtimeMessage,
    sendTyping,
  } = useChatRealtime(
    activeConversationId,
    user?.id ?? null,
    user?.email ?? null
  )

  // Lista de conversas
  const {
    conversations: conversationsList,
    isLoading: isLoadingConversations,
    error: conversationsError,
  } = useConversationsList(user?.id ?? null)

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [realtimeMessages])

  // Carregar mensagens quando trocar de conversa
  useEffect(() => {
    if (activeConversationId) {
      loadMessages()
    }
  }, [activeConversationId, loadMessages])

  // Enviar mensagem
  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return

    const content = message
    setMessage('')
    await sendRealtimeMessage(content)
  }, [message, sendRealtimeMessage])

  // Handle Enter key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      } else {
        // Enviar indicador de digitação
        sendTyping()
      }
    },
    [handleSendMessage, sendTyping]
  )

  // Filtrar conversas pela busca
  const filteredConversations = conversationsList.filter((conv) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (conv.product?.title || '').toLowerCase().includes(q) ||
      (conv.buyer?.full_name || '').toLowerCase().includes(q) ||
      (conv.vendor?.full_name || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="card-base overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      <div className="flex h-full">
        {/* ─── Conversations Sidebar ─── */}
        <div className={`w-full md:w-80 border-r border-surface-100 dark:border-surface-800 flex flex-col shrink-0 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Header + Search */}
          <div className="p-3 border-b border-surface-100 dark:border-surface-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-sm text-surface-900 dark:text-white">
                Conversas
              </h2>
              <span className="text-xs text-surface-400">
                {isConnected ? (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <Circle size={6} fill="currentColor" /> Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-surface-400">
                    <Circle size={6} /> Offline
                  </span>
                )}
              </span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base text-sm pl-9"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-surface-200 dark:bg-surface-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-24" />
                    <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded w-32" />
                  </div>
                </div>
              ))
            ) : conversationsError ? (
              <div className="p-4 text-center">
                <AlertTriangle size={24} className="mx-auto text-amber-500 mb-2" />
                <p className="text-sm text-surface-500">{conversationsError}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-surface-400">
                  {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={{
                    id: conv.id,
                    name: conv.buyer?.full_name || conv.vendor?.full_name || 'Usuário',
                    avatar: '',
                    lastMessage: conv.last_message || 'Sem mensagens',
                    time: conv.last_message_at
                      ? new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      : '',
                    unread: 0,
                    product: conv.product?.title || '',
                    status: conv.status === 'active' ? 'delivered' : 'pending',
                  }}
                  isActive={activeConversationId === conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id)
                    setShowMobileChat(true)
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ─── Chat Area ─── */}
        <div className={`flex-1 flex flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
          {activeConversationId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg"
                  >
                    <ArrowLeft size={18} className="text-surface-500" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold text-xs">
                    K
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm text-surface-900 dark:text-white">
                      Conversa
                    </p>
                    <p className="text-xs text-surface-400 flex items-center gap-1">
                      <Shield size={10} className="text-emerald-500" /> Protegido pela Kiyvo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
                    <Phone size={16} className="text-surface-400" />
                  </button>
                  <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
                    <Video size={16} className="text-surface-400" />
                  </button>
                  <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
                    <MoreVertical size={16} className="text-surface-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Aviso de segurança */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800/40 rounded-xl p-3 flex items-start gap-2"
                >
                  <Shield size={16} className="text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                      Compra protegida
                    </p>
                    <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">
                      O pagamento está em custódia. Confirme o recebimento para liberar o valor ao vendedor.
                    </p>
                  </div>
                </motion.div>

                {/* Mensagens via Realtime */}
                {realtimeMessages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={{
                      id: msg.id,
                      sender: msg.sender_id,
                      text: msg.content,
                      time: new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      type: msg.message_type,
                    }}
                    isOwn={msg.sender_id === user?.id}
                  />
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
                    <TypingIndicator userName={typingUsers[0].user_name} />
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-surface-100 dark:border-surface-800">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
                    <Paperclip size={18} className="text-surface-400" />
                  </button>
                  <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
                    <Image size={18} className="text-surface-400" />
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="input-base flex-1 text-sm"
                    aria-label="Mensagem"
                  />
                  <button className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors">
                    <Smile size={18} className="text-surface-400" />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Enviar mensagem"
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>
    </div>
  )
}
