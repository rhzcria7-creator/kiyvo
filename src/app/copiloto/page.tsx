'use client'
// Copiloto KIYVO — agente universal da plataforma.
// O motor interno é invisível: o usuário vê apenas "Copiloto" respondendo.
// Comentários em PT-BR.
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Search, Loader2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { toast } from 'react-hot-toast'

interface Msg {
  role: 'user' | 'assistant'
  content: string
  searchUsed?: boolean
}

const SUGESTOES = [
  'Escreva copy de vendas para um curso de Excel avançado',
  'Crie 5 títulos virais para reels sobre marketing digital',
  'Como calcular preço justo para meus templates?',
  'Quais são as tendências de marketing digital para 2026?',
  'Crie um script de vendas WhatsApp que converte',
  'Como pedir review sem parecer chato?',
]

export default function CopilotoPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content: '👋 Olá! Eu sou o Copiloto KIYVO.\n\nPosso te ajudar com marketing, copy, vendas, preços, anúncios, títulos, scripts, SEO, planilhas e muito mais. O que você precisa hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [webSearch, setWebSearch] = useState(true)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content }])
    setLoading(true)
    try {
      const res = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, webSearch, agentId: 'copiloto', agentName: 'Copiloto KIYVO' }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setMessages(m => [...m, { role: 'assistant', content: `❌ ${data.error || 'Tive um problema. Tente novamente.'}` }])
      } else {
        // NÃO exibimos provider/latência/provedores na UI — o motor é invisível
        setMessages(m => [...m, {
          role: 'assistant',
          content: data.content,
          searchUsed: !!data.searchUsed,
        }])
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: '❌ Erro de conexão. Tente novamente ou fale com nosso suporte no Telegram.' }])
    } finally {
      setLoading(false)
    }
  }

  function copyText(idx: number, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      toast.success('Copiado!')
      setTimeout(() => setCopiedIdx(null), 1500)
    })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#FAFAFA] to-white dark:from-[#0B0F1A] dark:to-[#0B0F1A] flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 pt-6 pb-28 sm:pb-6 flex-1 flex flex-col">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">Copiloto</h1>
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Online · Responde em segundos
                </p>
              </div>
            </div>
          </motion.div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[60vh] min-h-[400px]">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-brand-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[80%] group ${m.role === 'user' ? 'order-1' : ''}`}>
                    <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                      m.role === 'user'
                        ? 'bg-[#0F172A] text-white rounded-tr-md'
                        : 'bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-tl-md text-[#0F172A] dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                    {m.role === 'assistant' && (
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[10px]">
                        {m.searchUsed && (
                          <span className="inline-flex items-center gap-1 bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">
                            <Search className="w-2.5 h-2.5" /> Pesquisa atualizada
                          </span>
                        )}
                        <button
                          onClick={() => copyText(i, m.content)}
                          className="flex items-center gap-0.5 text-slate-400 hover:text-brand-500 transition"
                        >
                          {copiedIdx === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          <span className="font-bold">{copiedIdx === i ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center shrink-0 order-2 text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shrink-0 text-white shadow-md shadow-brand-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                    <span className="text-sm text-slate-500">Pensando...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sugestões iniciais */}
          <AnimatePresence>
            {messages.length <= 1 && !loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-4 grid sm:grid-cols-2 gap-2">
                {SUGESTOES.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => send(s)}
                    className="text-left text-xs sm:text-sm bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2.5 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-700 dark:text-slate-300 transition flex items-center gap-2 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span className="line-clamp-1">{s}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="mt-4 sticky bottom-0 sm:bottom-auto pt-2 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent dark:from-[#0B0F1A] dark:via-[#0B0F1A]">
            <div className="flex items-center gap-2 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-lg focus-within:border-brand-500 transition">
              <button
                type="button"
                onClick={() => setWebSearch(v => !v)}
                className={`hidden sm:flex w-9 h-9 rounded-xl items-center justify-center shrink-0 transition ${
                  webSearch ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
                title={webSearch ? 'Pesquisa atualizada ligada' : 'Pesquisa atualizada desligada'}
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Pergunte algo ao Copiloto..."
                className="flex-1 bg-transparent outline-none text-sm text-[#0F172A] dark:text-white placeholder:text-slate-400 px-2"
                disabled={loading}
                maxLength={2000}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 disabled:opacity-40 hover:scale-105 transition shadow-md"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <label className="sm:hidden flex items-center gap-1.5 text-[11px] text-slate-500">
                <input type="checkbox" checked={webSearch} onChange={e => setWebSearch(e.target.checked)} className="accent-emerald-500 w-3.5 h-3.5" />
                <Search className="w-3 h-3" /> Pesquisa atualizada
              </label>
              <p className="text-[10px] text-slate-400 ml-auto font-bold uppercase tracking-wider">
                IA pode errar · confira informações importantes
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
