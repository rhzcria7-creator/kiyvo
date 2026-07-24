'use client'
// /hermes — Chat completo com a Kiya (assistente oficial da KIYVO).
// Internamente usa o cérebro unificado mas o usuário SÓ VÊ "Kiya".
// NUNCA mencionar "Hermes", "orquestrador" ou nomes internos na UI.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, ArrowLeft, Bot, User as UserIcon, Package, Store, X } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { toast } from 'react-hot-toast'

type ReplyData = {
  texto: string
  acoes?: { label: string; href: string; icon?: string }[]
  produtos?: { titulo: string; preco: number; href: string }[]
  lojas?: { nome: string; handle: string; categoria: string }[]
  confianca: number
}

type Msg = {
  id: string
  de: 'user' | 'kiya'
  texto: string
  reply?: ReplyData
  hora: number
}

function uid() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2,5) }

const QUICK_ACTIONS = [
  { icon: '🚀', label: 'Quero vender na KIYVO', msg: 'quero vender na kiyvo como funciona?' },
  { icon: '🔍', label: 'Quero comprar algo', msg: 'quais produtos vocês tem? me recomende' },
  { icon: '💸', label: 'Quanto custa?', msg: 'quais são as taxas e planos?' },
  { icon: '🤖', label: 'Ver agentes de IA', msg: 'me fale sobre os agentes de IA' },
  { icon: '🎬', label: 'KIYVO Shorts', msg: 'o que é o KIYVO Shorts?' },
  { icon: '📨', label: 'Falar com humano', msg: 'suporte' },
]

export default function KiyaChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMsgs([{
      id: uid(),
      de: 'kiya',
      texto: `Olá! 👋 Eu sou a Kiya, assistente oficial da KIYVO.\n\nConheço todo o catálogo de 789 produtos, as 60+ lojas, taxas, saques, KYC e tudo mais da plataforma. Em que posso te ajudar hoje?`,
      hora: Date.now(),
    }])
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, enviando])

  async function enviar(texto?: string) {
    const m = (texto || input).trim()
    if (!m || enviando) return
    const userMsg: Msg = { id: uid(), de: 'user', texto: m, hora: Date.now() }
    setMsgs(prev => [...prev, userMsg])
    setInput('')
    setEnviando(true)
    try {
      const history = msgs.slice(-6).map(x => ({ de: x.de === 'kiya' ? 'agente' as const : 'user' as const, texto: x.texto }))
      const res = await fetch('/api/hermes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: m, history }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Erro')
      const reply = data.data as ReplyData
      setMsgs(prev => [...prev, { id: uid(), de: 'kiya', texto: reply.texto, reply, hora: Date.now() }])
    } catch {
      toast.error('Erro de conexão com a Kiya')
      setMsgs(prev => [...prev, { id: uid(), de: 'kiya', texto: 'Desculpa, tive um problema de conexão. Tente novamente ou fale com nosso suporte no Telegram.', hora: Date.now() }])
    } finally {
      setEnviando(false)
      setTimeout(() => inputRef.current?.focus(), 60)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white dark:from-[#0B0F1A] dark:to-[#0B0F1A] pb-2">
        <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col min-h-[92vh]">
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-[#0F172A] dark:text-white">Kiya</h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Online · Assistente oficial KIYVO
              </p>
            </div>
          </motion.div>

          {/* Chat */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {msgs.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity:0, y:8, scale: 0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: m.de === 'kiya' && i === msgs.length-1 ? 0.1 : 0 }}
                className={`flex gap-2 ${m.de === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.de === 'kiya' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[82%] ${m.de === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.de === 'user'
                      ? 'bg-[#0F172A] text-white rounded-br-sm shadow-lg'
                      : 'bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 text-[#0F172A] dark:text-slate-200 rounded-bl-sm shadow-sm'
                  }`}>
                    {m.texto}
                  </div>
                  {m.reply && (m.reply.produtos?.length || m.reply.lojas?.length || m.reply.acoes?.length) ? (
                    <div className="mt-2 space-y-2">
                      {m.reply.produtos && m.reply.produtos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.reply.produtos.map((p, j) => (
                            <Link key={j} href={p.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-xs font-bold text-[#0F172A] dark:text-white transition">
                              <Package className="w-3 h-3" /> {p.titulo.slice(0, 35)}{p.titulo.length > 35 ? '…' : ''} · R${p.preco.toFixed(2).replace('.',',')}
                            </Link>
                          ))}
                        </div>
                      )}
                      {m.reply.lojas && m.reply.lojas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.reply.lojas.map((l, j) => (
                            <Link key={j} href={`/loja/${l.handle}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-xs font-bold transition">
                              <Store className="w-3 h-3" /> {l.nome}
                            </Link>
                          ))}
                        </div>
                      )}
                      {m.reply.acoes && m.reply.acoes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.reply.acoes.map((a, j) => (
                            <Link key={j} href={a.href} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 text-xs font-black shadow-md shadow-brand-500/20 transition hover:scale-105">
                              {a.icon || '→'} {a.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                {m.de === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 order-2">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
            <AnimatePresence>
              {enviando && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2 items-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/30">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ações rápidas (só no começo) */}
          <AnimatePresence>
            {msgs.length <= 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {QUICK_ACTIONS.map(a => (
                  <button key={a.label} onClick={() => enviar(a.msg)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition text-xs font-bold text-left">
                    <span>{a.icon}</span><span className="truncate">{a.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="sticky bottom-0 pt-2 pb-4 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent dark:from-[#0B0F1A] dark:via-[#0B0F1A]">
            <form onSubmit={e => { e.preventDefault(); enviar() }}
              className="flex items-center gap-2 bg-white dark:bg-[#0F172A] rounded-full border border-slate-200 dark:border-slate-800 pl-5 pr-2 py-2 shadow-lg focus-within:border-emerald-500 focus-within:shadow-emerald-500/20 transition">
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                placeholder="Pergunte algo à Kiya..."
                className="flex-1 bg-transparent outline-none text-sm text-[#0F172A] dark:text-white placeholder-slate-400"
                maxLength={800}
              />
              <button type="submit" disabled={enviando || !input.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition shadow-md shadow-emerald-500/30">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
              A Kiya pode errar — confira informações importantes. Para atendimento humano, fale no{' '}
              <a href="https://t.me/kiyvosuporte" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline">Telegram</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
