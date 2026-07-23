'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { KiyvoLogo } from '@/components/brand/KiyvoLogo'
import { toPtBrError } from '@/lib/errors/ptBrMessages'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })

    if (error) {
      const pt = toPtBrError(error, 'Recuperação')
      setError(pt.message)
      toast.error(pt.title)
    } else {
      setSent(true)
      toast.success('E-mail enviado com sucesso!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mx-auto mb-4">
            <KiyvoLogo variant="full" size="lg" className="text-surface-900 dark:text-white" />
          </div>
          <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">Recuperar senha</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Enviaremos um link para redefinir sua senha</p>
        </div>

        <div className="card-base p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-emerald-500" />
                </div>
                <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">E-mail enviado!</h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">
                  Verifique sua caixa de entrada em <strong className="text-surface-900 dark:text-white">{email}</strong>
                </p>
                <p className="text-xs text-surface-400 mt-3">Não recebeu? Verifique o spam ou tente novamente em alguns minutos.</p>
                <Link href="/login" className="btn-primary text-sm mt-6 inline-flex items-center gap-2">
                  <ArrowLeft size={16} /> Voltar ao login
                </Link>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm rounded-xl p-3 flex items-center gap-2"
                    >
                      <AlertCircle size={16} className="shrink-0" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5 block">E-mail cadastrado</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="input-base pl-10"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Enviar link de recuperação'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold">
            Fazer login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
