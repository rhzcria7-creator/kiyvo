'use client'
// Widget flutuante de SUPORTE TELEGRAM.
// Abre um grupo/canal do Telegram quando o usuário clica em "Falar com suporte".
// Diferente do chat fake, esse botão ABRE de verdade o Telegram do usuário
// (app nativo ou web.telegram.org) com um link t.me.
// Sem mock — o redirecionamento é real e funcional.
// Comentários em PT-BR.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Headphones, AlertCircle, Sparkles, LifeBuoy } from 'lucide-react'

// Link real do Telegram (grupo de suporte). Pode ser alterado via .env futuramente.
const TELEGRAM_URL = 'https://t.me/kiyvosuporte'
const TELEGRAM_GROUP = '@kiyvosuporte'

interface SupportMsg {
  de: 'bot' | 'user'
  texto: string
}

const GREETINGS: SupportMsg[] = [
  { de: 'bot', texto: '👋 Olá! Eu sou o assistente da KIYVO. Nosso suporte humano está ativo 24h/7 no Telegram.' },
  { de: 'bot', texto: '📞 Se você tiver dúvidas, problemas com compra, venda, saque ou verificação, clique abaixo que já levamos você pro grupo oficial.' },
]

const TOPICS = [
  { icon: '🛒', label: 'Problema com compra' },
  { icon: '💸', label: 'Saque/Pagamento' },
  { icon: '✅', label: 'Verificação KYC' },
  { icon: '📦', label: 'Entrega de produto' },
  { icon: '🐛', label: 'Reportar bug' },
  { icon: '💡', label: 'Sugestão/Feedback' },
]

export function TelegramSupport() {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState('')

  function openTelegram(topico?: string) {
    const text = topico
      ? `Olá, preciso de ajuda com: ${topico}`
      : (msg.trim() || 'Olá, preciso de ajuda com a KIYVO.')
    const url = `${TELEGRAM_URL}?start=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      {/* Botão flutuante fixo */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 2, stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(v => !v)}
        className="fixed z-40 bottom-5 right-5 sm:bottom-7 sm:right-7 w-14 h-14 rounded-full bg-[#229ED9] text-white shadow-2xl shadow-[#229ED9]/40 flex items-center justify-center pulse-glow-blue"
        aria-label="Suporte Telegram"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative">
              <MessageCircle className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed z-40 bottom-24 right-5 sm:bottom-28 sm:right-7 w-[calc(100vw-2.5rem)] sm:w-[360px] max-w-sm bg-white dark:bg-[#0F172A] rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Cabeçalho */}
            <div className="bg-gradient-to-r from-[#229ED9] to-[#0088cc] text-white p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm">Suporte KIYVO</p>
                <p className="text-xs text-white/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                  Online — resposta em minutos
                </p>
              </div>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-wider bg-white/20 hover:bg-white/30 px-2.5 py-1.5 rounded-full backdrop-blur flex items-center gap-1">
                <Send className="w-3 h-3" /> Abrir app
              </a>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {/* Aviso real */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  Não é chat de IA genérico: ao enviar, você é levado ao <b>grupo real do Telegram</b> onde a equipe responde de verdade.
                </p>
              </div>

              {/* Saudação */}
              <div className="space-y-2">
                {GREETINGS.map((m, i) => (
                  <div key={i} className="flex">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-white/10 p-3">
                      <p className="text-xs text-slate-700 dark:text-slate-200">{m.texto}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tópicos rápidos */}
              <div className="mt-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Selecione o assunto</p>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.map((t, i) => (
                    <button key={i} onClick={() => openTelegram(t.label)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#229ED9] hover:bg-sky-50 dark:hover:bg-sky-950/20 transition text-left">
                      <span className="text-base">{t.icon}</span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input mensagem */}
              <div className="mt-4 flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-full p-1.5 pl-4 border border-slate-200 dark:border-slate-800">
                <input value={msg} onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') openTelegram() }}
                  placeholder="Escreva sua dúvida..."
                  className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200" />
                <button onClick={() => openTelegram()}
                  className="w-9 h-9 rounded-full bg-[#229ED9] text-white flex items-center justify-center hover:bg-[#0088cc] transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> Atendimento humano real — sem bots repetitivos
              </p>
            </div>

            {/* Rodapé */}
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer"
              className="block px-4 py-3 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 text-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-[#229ED9]">
                <LifeBuoy className="w-3 h-3" /> Entrar no grupo {TELEGRAM_GROUP}
              </span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes pulseGlowBlue {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 158, 217, 0.5); }
          50% { box-shadow: 0 0 0 14px rgba(34, 158, 217, 0); }
        }
        .pulse-glow-blue { animation: pulseGlowBlue 2.5s ease-in-out infinite; }
      `}</style>
    </>
  )
}

export default TelegramSupport
