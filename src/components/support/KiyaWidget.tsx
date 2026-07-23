'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Msg { role: 'user' | 'assistant'; text: string }

export default function KiyaWidget() {
  const [open, setOpen] = useState(false)
  const [mensagens, setMensagens] = useState<Msg[]>([
    { role: 'assistant', text: 'Oi! 👋 Sou a Kiya. Posso te ajudar com entregas, pagamentos, cadastro, venda, afiliados, KD Points e mais. Qual a sua duvida?' },
  ])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensagens, open])

  async function enviar(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || enviando) return
    const pergunta = input.trim()
    setInput('')
    setEnviando(true)
    setMensagens((m) => [...m, { role: 'user', text: pergunta }])
    try {
      const resp = await fetch('/api/agents/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta }),
      })
      const data = await resp.json()
      setMensagens((m) => [...m, { role: 'assistant', text: data.resposta || 'Desculpe, tente novamente.' }])
    } catch {
      setMensagens((m) => [...m, { role: 'assistant', text: 'Erro de conexao. Tente de novo em instantes.' }])
    } finally { setEnviando(false) }
  }

  return (
    <>
      {/* Botao flutuante */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Falar com a Kiya"
      >
        <AnimatePresence mode="wait">
          {open ? <X key="x" size={22} /> : <MessageCircle key="msg" size={22} />}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0F1A] animate-pulse" />
        )}
      </motion.button>

      {/* Painel do chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="flex-1">
                <div className="font-black text-sm">Kiya — Suporte 24h</div>
                <div className="text-xs opacity-90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" /> Online agora
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {mensagens.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' ? 'bg-[#2563EB]' : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    {m.role === 'user' ? <User size={13} className="text-white" /> : <Sparkles size={13} className="text-white" />}
                  </div>
                  <div className={`max-w-[78%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#2563EB] text-white rounded-tr-sm'
                      : 'bg-slate-100 dark:bg-white/5 text-[#0F172A] dark:text-slate-100 rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {enviando && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-white/5 rounded-xl rounded-tl-sm px-3 py-3 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={enviar} className="p-2 border-t border-black/5 dark:border-white/5 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Mande sua duvida..."
                disabled={enviando}
                className="flex-1 rounded-full bg-slate-100 dark:bg-white/5 px-4 py-2.5 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" />
              <button type="submit" disabled={enviando || !input.trim()}
                className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50">
                <Send size={14} />
              </button>
            </form>
            <div className="px-3 pb-2 text-center">
              <Link href="/suporte" onClick={() => setOpen(false)} className="text-[10px] text-[#94A3B8] hover:text-emerald-500">
                Abrir chat completo →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
