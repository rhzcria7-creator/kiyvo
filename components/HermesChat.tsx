// components/HermesChat.tsx
// -----------------------------------------------------------------------------
// Chat moderno (Tailwind, Dark Mode) para o Hermes Agent.
//
// REGRA DO PROJETO KIYVO: o nome exibido na UI é "Kiya" (nunca "Hermes").
// Os identificadores internos mantêm "Hermes" conforme solicitado.
//
// SEGURANÇA: só renderiza se houver um usuário autenticado no Firebase
// (onAuthStateChanged / currentUser). Sem sessão ativa, mostra CTA de login.
// O ID token do Firebase é injetado no hook para validação na Edge Function.
// -----------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getFirebaseAuth } from '@/lib/firebase/client'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { useHermes, type HermesMessage } from '../hooks/useHermes'
import { Send, Bot, User as UserIcon, RotateCcw, AlertCircle, Lock, Square } from 'lucide-react'

interface HermesChatProps {
  /** Cliente Supabase usado para chamar a Edge Function. */
  supabase: SupabaseClient
  functionName?: string
  /** Rótulo na UI (padrão "Kiya" — convenção KIYVO). */
  assistantName?: string
  placeholder?: string
  /** Altura máxima da área de mensagens (qualquer classe/valor Tailwind). */
  className?: string
  /** Usa streaming SSE (typing em tempo real). Padrão: true. */
  stream?: boolean
}

export function HermesChat({
  supabase,
  functionName = 'hermes-proxy',
  assistantName = 'Kiya',
  placeholder = 'Pergunte qualquer coisa...',
  className = 'h-[28rem]',
  stream = true,
}: HermesChatProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setAuthReady(true)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u)
      setAuthReady(true)
    })
    return () => unsub()
  }, [])

  if (!authReady) return null

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0B0F1A] p-8 text-center text-slate-300"
      >
        <Lock className="h-8 w-8 text-slate-500" />
        <p className="text-sm font-medium">Faça login para conversar com {assistantName}.</p>
      </motion.div>
    )
  }

  return (
    <ChatWindow
      supabase={supabase}
      functionName={functionName}
      assistantName={assistantName}
      placeholder={placeholder}
      className={className}
      stream={stream}
      getIdToken={useCallback(() => currentUser.getIdToken(), [currentUser])}
    />
  )
}

interface ChatWindowProps {
  supabase: SupabaseClient
  functionName: string
  assistantName: string
  placeholder: string
  className: string
  stream: boolean
  getIdToken: () => Promise<string | null>
}

function ChatWindow({
  supabase,
  functionName,
  assistantName,
  placeholder,
  className,
  stream,
  getIdToken,
}: ChatWindowProps) {
  const { messages, loading, error, sendMessage, stop, reset } = useHermes({
    supabase,
    functionName,
    getIdToken,
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    void sendMessage(input, { stream })
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] shadow-2xl"
    >
      {/* Cabeçalho */}
      <header className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{assistantName}</p>
            <p className="text-[10px] text-emerald-400">online</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Limpar conversa"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </header>

      {/* Histórico */}
      <div ref={scrollRef} className={`flex-1 space-y-3 overflow-y-auto p-4 ${className}`}>
        {messages.length === 0 && (
          <p className="text-center text-xs text-slate-500">Diga olá para começar 👋</p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m: HermesMessage) => (
            <Bubble key={m.id} role={m.role} content={m.content} assistantName={assistantName} />
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Bot className="h-4 w-4 animate-pulse" /> {assistantName} está digitando...
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Entrada */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-white/10 bg-white/5 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={placeholder}
          className="max-h-32 flex-1 resize-none rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-violet-500"
        />
        {loading ? (
          <button
            type="button"
            onClick={stop}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Parar"
          >
            <Square className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        )}
      </form>
    </motion.div>
  )
}

function Bubble({
  role,
  content,
  assistantName,
}: {
  role: HermesMessage['role']
  content: string
  assistantName: string
}) {
  const isUser = role === 'user'
  const Icon: ReactNode = isUser ? (
    <UserIcon className="h-4 w-4" />
  ) : (
    <Bot className="h-4 w-4" />
  )
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-white/10 text-white' : 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white'
        }`}
      >
        {Icon}
      </div>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
          isUser ? 'rounded-tr-sm bg-violet-600 text-white' : 'rounded-tl-sm bg-white/5 text-slate-100'
        }`}
      >
        {content || `(${assistantName} não retornou conteúdo)`}
      </div>
    </motion.div>
  )
}
