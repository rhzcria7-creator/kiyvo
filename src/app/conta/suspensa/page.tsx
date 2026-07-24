'use client'
// Página bonita de conta suspensa (não é um 403 feio)
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldAlert, Mail, ArrowLeft, AlertTriangle, Clock, LifeBuoy } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function SuspensaPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-10 lg:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-8 lg:p-10 shadow-xl border-2 border-red-200 dark:border-red-900/40"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 250 }}
            className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 20px 60px -15px rgba(239,68,68,0.5)' }}
          >
            <ShieldAlert className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>

          <h1 className="text-3xl lg:text-4xl font-black text-center text-[#0F172A] dark:text-white mb-2">Conta suspensa</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
            Sua conta foi temporariamente suspensa por violação dos Termos de Uso ou por atividade suspeita.
          </p>

          <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 mb-6 space-y-2">
            <p className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span><b>Motivos comuns:</b> produtos ilegais, fraude, spam, abuso de reembolso, cópia de conteúdo, ou múltiplas contas.</span>
            </p>
            <p className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200">
              <Clock className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>Suspensões duram de <b>24h a permanente</b>, dependendo da gravidade.</span>
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/suporte"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3.5 font-black text-sm uppercase tracking-wide shadow-lg">
              <LifeBuoy className="w-4 h-4" /> Abrir chamado de recurso
            </Link>
            <a href="mailto:suporte@kiyvo.com.br?subject=Recurso%20de%20suspens%C3%A3o"
              className="w-full inline-flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-full px-6 py-3.5 font-black text-sm uppercase tracking-wide hover:bg-slate-50 dark:hover:bg-white/5">
              <Mail className="w-4 h-4" /> Enviar e-mail para suporte
            </a>
            <Link href="/"
              className="w-full inline-flex items-center justify-center gap-2 text-slate-500 rounded-full px-6 py-3 font-bold text-sm hover:text-brand-600">
              <ArrowLeft className="w-4 h-4" /> Voltar para a home
            </Link>
          </div>

          <p className="mt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest">
            Código: ACCOUNT_BANNED • KIYVO
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
