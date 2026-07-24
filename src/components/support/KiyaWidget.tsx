'use client'
// KiyaWidget — Chat rápido flutuante com a Kiya (assistente oficial da KIYVO).
// Conecta ao cérebro da plataforma com conhecimento real. O motor interno NUNCA é mencionado.
// Comentários em PT-BR.
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, User as UserIcon, Phone } from 'lucide-react'

interface Msg { role: 'user' | 'assistant'; text: string }

const GREETING = 'Oi! 👋 Eu sou a Kiya, assistente da KIYVO.\n\nPosso te ajudar com produtos, lojas, venda, pagamentos, cupons, KYC e mais. O que você precisa?'

export default function KiyaWidget() {
  const [open, setOpen] = useState(false)
  const [mensagens, setMensagens] = useState<Msg[]>([{ role: 'assistant', text: GREETING }])
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
      const resp = await fetch('/api/hermes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: pergunta }),
      })
      const data = await resp.json()
      const texto = data?.data?.texto || data?.resposta || 'Desculpe, não entendi. Tente novamente.'
      setMensagens((m) => [...m, { role: 'assistant', text: texto }])
    } catch {
      setMensagens((m) => [...m, { role: 'assistant', text: 'Erro de conexão. Tente novamente ou fale com nosso suporte humano no Telegram.' }])
    } finally { setEnviando(false) }
  }

  return (
    <>
      {/* Botao flutuante */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 18 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label="Falar com a Kiya"
      >
        <AnimatePresence mode="wait">
          {open ? <X key="x" size={22} /> : <MessageCircle key="msg" size={22} />}
        </AnimatePresence>
        {!open && (
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-emerald-400/40"
          />
        )}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0B0F1A]" />
        )}
      </motion.button>

      {/* Painel do chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-[#0F172A] rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden flex flex-col"
          >
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-4 text-white flex items-center gap-3 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-4 w-16 h-16 rounded-full bg-white/5" />
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center relative z-10">
                <Sparkles size={20} />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-black text-sm">Kiya — Assistente KIYVO</div>
                <div className="text-xs opacity-90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" /> Online · Responde em segundos
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 relative z-10 transition">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-transparent to-slate-50/30 dark:to-black/20">
              {mensagens.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' ? 'bg-[#2563EB]' : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    {m.role === 'user' ? <UserIcon size={13} className="text-white" /> : <Sparkles size={13} className="text-white" />}
                  </div>
                  <div className={`max-w-[78%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#2563EB] text-white rounded-tr-sm shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 dark:bg-white/5 text-[#0F172A] dark:text-slate-100 rounded-tl-sm'
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {enviando && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-white/5 rounded-xl rounded-tl-sm px-3 py-3 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </div>

            <form onSubmit={enviar} className="p-2 border-t border-black/5 dark:border-white/5 flex gap-2 bg-white dark:bg-[#0F172A]">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo à Kiya..."
                disabled={enviando}
                className="flex-1 rounded-full bg-slate-100 dark:bg-white/5 px-4 py-2.5 text-xs text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition" />
              <button type="submit" disabled={enviando || !input.trim()}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 shadow-lg shadow-emerald-500/30">
                <Send size={14} />
              </button>
            </form>
            <div className="px-3 pb-2.5 flex items-center justify-between bg-white dark:bg-[#0F172A]">
              <button
                onClick={() => { setOpen(false); window.location.href = '/copiloto' }}
                className="text-[10px] text-[#94A3B8] hover:text-emerald-500 transition font-bold"
              >
                Chat completo →
              </button>
              <a href="https://t.me/kiyvosuporte" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                <Phone className="w-3 h-3" /> Humano (Telegram)
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
