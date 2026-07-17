'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, AtSign, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FloatingDots } from '@/components/svgs/AnimatedSVGs'
import toast from 'react-hot-toast'

export default function CadastroPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '', confirmPassword: '' })

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handleNext = () => {
    if (step === 1) {
      if (!form.username || !form.fullName) { setError('Preencha todos os campos'); return }
      setError('')
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem'); return }
    if (form.password.length < 6) { setError('Senha deve ter no mínimo 6 caracteres'); return }
    setLoading(true)
    setError('')

    const { error } = await signUp(form.email, form.password, form.username, form.fullName)
    if (error) {
      setError(error.includes('already registered') ? 'Este e-mail já está cadastrado' : error)
      toast.error('Erro ao criar conta')
    } else {
      toast.success('Conta criada! Verifique seu e-mail.')
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const steps = [
    { num: 1, label: 'Dados pessoais' },
    { num: 2, label: 'Acesso' },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <FloatingDots count={15} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md mx-4"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow"
          >
            <span className="text-white font-display font-extrabold text-2xl">P</span>
          </motion.div>
          <h1 className="font-display font-extrabold text-2xl text-surface-900">Crie sua conta</h1>
          <p className="text-surface-500 text-sm mt-1">Comece a comprar e vender na Kiyvo</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: step >= s.num ? '#2563EB' : '#F1F5F9',
                  color: step >= s.num ? '#fff' : '#94A3B8',
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-display"
              >
                {step > s.num ? <CheckCircle size={16} /> : s.num}
              </motion.div>
              <span className={`text-sm font-medium ${step >= s.num ? 'text-surface-900' : 'text-surface-400'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-8 h-0.5 bg-surface-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="card-base p-8">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">Nome de usuário</label>
                    <div className="relative">
                      <AtSign size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="text"
                        value={form.username}
                        onChange={(e) => update('username', e.target.value.replace(/[^a-zA-Z0-9_.]/g, ''))}
                        placeholder="seuusername"
                        required
                        className="input-base pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">Nome completo</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="text"
                        value={form.fullName}
                        onChange={(e) => update('fullName', e.target.value)}
                        placeholder="Seu Nome Completo"
                        required
                        className="input-base pl-10"
                      />
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleNext}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary py-3.5"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Continuar <ArrowRight size={18} />
                    </span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">E-mail</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                        className="input-base pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">Senha</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="input-base pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-surface-700 mb-1.5 block">Confirmar senha</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => update('confirmPassword', e.target.value)}
                        placeholder="Repita a senha"
                        required
                        className="input-base pl-10"
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 btn-secondary py-3.5"
                    >
                      Voltar
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 btn-primary py-3.5 relative overflow-hidden"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'Criar conta'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="text-center text-xs text-surface-400 mt-4">
            Ao criar sua conta, você concorda com nossos{' '}
            <Link href="/termos" className="text-brand-600 hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="/privacidade" className="text-brand-600 hover:underline">Política de Privacidade</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-surface-500 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">Entrar</Link>
        </p>
      </motion.div>
    </div>
  )
}
