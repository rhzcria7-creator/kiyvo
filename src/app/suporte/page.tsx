'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Msg { role: 'user' | 'assistant'; text: string; acoes?: string[]; artigos?: Array<{titulo: string; url: string}> }

const SUGESTOES = [
  'Como funciona a entrega?',
  'Quero vender na KIYVO',
  'Como pedir reembolso?',
  'O que são KD Points?',
  'Como funciona o afiliado?',
  'Quais as taxas?',
]

export default function SuportePage() {
  const [mensagens, setMensagens] = useState<Msg[]>([
    {
      role: 'assistant',
      text: 'Olá! 👋 Eu sou a Kiya, assistente da KIYVO — 24h por dia, 7 dias por semana, sem tempo de espera.\n\nMe pergunte qualquer coisa sobre entregas, pagamentos, cadastro, venda, afiliados, planos ou problema com pedido. Respondo em segundos!',
      acoes: ['Falar com humano', 'Ver central de ajuda', 'Status do site'],
    },
  ])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensagens])

  async function enviar(texto?: string) {
    const pergunta = (texto ?? input).trim()
    if (!pergunta || enviando) return
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
      setMensagens((m) => [...m, {
        role: 'assistant',
        text: data.resposta || 'Desculpe, nao consegui responder. Vou encaminhar para um humano.',
        acoes: data.acoesRapidas,
        artigos: data.artigosRelacionados,
      }])
    } catch {
      setMensagens((m) => [...m, { role: 'assistant', text: 'Ops, erro de conexao. Tente novamente em instantes.' }])
    } finally { setEnviando(false) }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-8">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#0F172A] dark:text-white">
                Fale com a Kiya
              </h1>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Online • Resposta instantânea • 24h • Gratuita e ilimitada
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0F172A] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-xl overflow-hidden flex flex-col"
          style={{ height: 'calc(100vh - 200px)', minHeight: 500, maxHeight: 800 }}>
          {/* Chat */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4">
            <AnimatePresence>
              {mensagens.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    m.role === 'user' ? 'bg-[#2563EB]' : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  }`}>
                    {m.role === 'user' ? <User size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
                  </div>
                  <div className={`max-w-[80%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#2563EB] text-white rounded-tr-sm'
                        : 'bg-slate-100 dark:bg-white/5 text-[#0F172A] dark:text-slate-100 rounded-tl-sm'
                    }`}>
                      {m.text}
                    </div>
                    {m.artigos && m.artigos.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.artigos.map((a) => (
                          <Link key={a.url} href={a.url}
                            className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20">
                            📚 {a.titulo}
                          </Link>
                        ))}
                      </div>
                    )}
                    {m.acoes && m.acoes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.acoes.map((a) => (
                          <button key={a} onClick={() => enviar(a)}
                            className="text-[11px] font-black px-3 py-1.5 rounded-full bg-slate-200 dark:bg-white/10 text-[#0F172A] dark:text-white hover:bg-[#2563EB] hover:text-white transition-colors">
                            {a}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {enviando && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Sugestoes rápidas */}
          {mensagens.length <= 1 && (
            <div className="px-5 pb-3 flex gap-2 overflow-x-auto">
              {SUGESTOES.map((s) => (
                <button key={s} onClick={() => enviar(s)}
                  className="shrink-0 text-xs font-black px-3 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-[#0F172A] dark:text-white hover:bg-[#2563EB] hover:text-white transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0F172A]">
            <form onSubmit={(e) => { e.preventDefault(); enviar() }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={enviando}
                className="flex-1 rounded-full bg-slate-100 dark:bg-white/5 px-5 py-3 text-sm text-[#0F172A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50" />
              <button type="submit" disabled={enviando || !input.trim()}
                className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100">
                <Send size={18} />
              </button>
            </form>
            <div className="flex items-center gap-1.5 mt-2 px-2 text-[10px] text-[#94A3B8]">
              <AlertCircle size={11} />
              A Kiya é um agente IA. Para assuntos sensíveis (reembolso, conta hackeada), responda "quero falar com humano".
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
