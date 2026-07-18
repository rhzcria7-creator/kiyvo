'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { FloatingDots } from '@/components/svgs/AnimatedSVGs'
import toast from 'react-hot-toast'

function RecoverForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) toast.error('Erro ao enviar e-mail')
    else { setSent(true); toast.success('E-mail enviado!') }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <FloatingDots count={12} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-white font-display font-extrabold text-2xl">K</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-2xl text-surface-900">Recuperar Senha</h1>
          <p className="text-surface-500 text-sm mt-1">Enviaremos um link para redefinir sua senha</p>
        </div>

        <div className="card-base p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-3" />
                <h2 className="font-display font-bold text-lg text-surface-900">E-mail enviado!</h2>
                <p className="text-sm text-surface-500 mt-2">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
                <Link href="/login" className="btn-primary mt-6 inline-block">Voltar ao login</Link>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-surface-700 mb-1.5 block">E-mail cadastrado</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="input-base pl-10" />
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="w-full btn-primary py-3.5">
                  {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">Enviar Link <ArrowRight size={18} /></span>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Voltar ao login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><div className="skeleton w-96 h-96 rounded-2xl" /></div>}>
      <RecoverForm />
    </Suspense>
  )
}
