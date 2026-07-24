'use client'
// Página bonita de erro 429/403 — "Muitas requisições"
// Com contador regressivo e botão de tentar novamente.
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert, Clock, ArrowLeft, RefreshCw, Home, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function RateLimitPage() {
  const router = useRouter()
  const search = useSearchParams()
  const code = search.get('code') || 'rate_limit'
  const initialSeconds = Math.min(60, Math.max(5, Number(search.get('wait') || 15)))
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [seconds])

  const isBot = code === 'bot_detected'
  const isBanned = code === 'banned'

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-10 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-8 lg:p-10 shadow-xl border border-red-100 dark:border-red-900/30 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${isBanned ? 'bg-red-500' : isBot ? 'bg-orange-500' : 'bg-amber-500'} shadow-lg`}
            style={{ boxShadow: isBanned ? '0 20px 50px -12px rgba(239,68,68,0.5)' : isBot ? '0 20px 50px -12px rgba(249,115,22,0.4)' : '0 20px 50px -12px rgba(245,158,11,0.4)' }}
          >
            {isBanned ? (
              <ShieldAlert className="w-10 h-10 text-white" strokeWidth={2.5} />
            ) : isBot ? (
              <AlertTriangle className="w-10 h-10 text-white" strokeWidth={2.5} />
            ) : (
              <Clock className="w-10 h-10 text-white" strokeWidth={2.5} />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-3xl lg:text-4xl font-black text-[#0F172A] dark:text-white mb-2"
          >
            {isBanned ? 'Acesso bloqueado' : isBot ? 'Atividade suspeita detectada' : 'Calma aí! 🐢'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-slate-600 dark:text-slate-400 text-sm lg:text-base mb-6 leading-relaxed"
          >
            {isBanned ? (
              'Seu IP foi bloqueado temporariamente por excesso de requisições ou atividade suspeita. Se acredita que foi um engano, aguarde ou contate o suporte.'
            ) : isBot ? (
              'Nosso sistema detectou comportamento automatizado (script/bot). Se você é humano, aguarde o tempo abaixo e tente novamente.'
            ) : (
              'Você fez muitas requisições em pouco tempo. Por segurança e estabilidade, aguarde o tempo abaixo para voltar a usar a plataforma.'
            )}
          </motion.p>

          {!isBanned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="mb-8 inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50"
            >
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">Tente novamente em</span>
              <motion.span
                key={seconds}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-4xl font-black tabular-nums text-brand-600 min-w-[3ch]"
              >
                {seconds}s
              </motion.span>
            </motion.div>
          )}

          {isBanned && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-left">
              <p className="text-xs font-black uppercase tracking-widest text-red-700 dark:text-red-400 mb-2">Por quê?</p>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                <li>• Excesso de requisições em curto período</li>
                <li>• Comportamento automatizado detectado</li>
                <li>• Múltiplas tentativas de login falhas</li>
                <li>• Uso de script ou crawler não autorizado</li>
              </ul>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileHover={seconds === 0 ? { scale: 1.03 } : {}}
              whileTap={seconds === 0 ? { scale: 0.97 } : {}}
              disabled={seconds > 0}
              onClick={() => router.back()}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-black text-sm uppercase tracking-wide transition ${seconds === 0 ? 'bg-[#0F172A] text-white hover:bg-slate-800 shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}`}
            >
              <RefreshCw className={`w-4 h-4 ${seconds === 0 ? '' : 'opacity-40'}`} />
              {seconds === 0 ? 'Tentar novamente' : 'Aguarde...'}
            </motion.button>
            <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-black text-sm uppercase tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              <Home className="w-4 h-4" /> Voltar pra home
            </Link>
          </motion.div>

          <button onClick={() => router.back()} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition">
            <ArrowLeft className="w-3 h-3" /> Página anterior
          </button>

          <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Código: {code.toUpperCase()} • Anti-bot KIYVO
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
