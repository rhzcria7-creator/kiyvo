'use client'

// ─────────────────────────────────────────────────────────────
// /2fa/verify — Verificação do 2º fator durante login
// Aceita código TOTP ou código de backup
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import {
  ShieldCheck,
  Loader2,
  Key,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react'

export default function TwoFactorVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBackupHint, setShowBackupHint] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  const verify = useCallback(async () => {
    const sanitizedCode = code.replace(/[^A-Za-z0-9-]/g, '')
    if (sanitizedCode.length < 4) {
      setError('Insira o código completo')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sanitizedCode, purpose: 'login' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setAttemptsLeft((prev) => Math.max(0, prev - 1))
        if (attemptsLeft <= 1) {
          setError('Muitas tentativas. Aguarde 5 minutos antes de tentar novamente.')
        } else {
          setError(data.error || 'Código inválido')
        }
        return
      }

      // Sucesso — redirecionar
      router.push(redirectTo)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsVerifying(false)
    }
  }, [code, attemptsLeft, router, redirectTo])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && code.length >= 4) {
        verify()
      }
    },
    [code, verify]
  )

  return (
    <PageTransition>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <ShieldCheck size={36} className="text-white" />
            </motion.div>
            <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white mb-2">
              Verificação em Duas Etapas
            </h1>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Insira o código do seu app autenticador
            </p>
          </div>

          {/* Input */}
          <div className="card-base p-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="2fa-code"
                  className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2"
                >
                  Código de verificação
                </label>
                <input
                  id="2fa-code"
                  type="text"
                  inputMode="text"
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase()
                    setCode(val)
                    setError(null)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="000000 ou XXXX-XXXX"
                  maxLength={20}
                  className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-surface-50 dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-600 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-surface-900 dark:text-white"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/40"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {attemptsLeft < 5 && attemptsLeft > 0 && (
                <p className="text-xs text-amber-500 text-center">
                  {attemptsLeft} tentativa{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''}
                </p>
              )}

              <button
                onClick={verify}
                disabled={isVerifying || code.length < 4}
                className="w-full btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Key size={18} />
                )}
                Verificar
              </button>
            </div>

            {/* Backup code hint */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowBackupHint(!showBackupHint)}
                className="text-xs text-surface-400 hover:text-brand-500 transition-colors inline-flex items-center gap-1"
              >
                <HelpCircle size={12} />
                Não tem acesso ao app?
              </button>

              {showBackupHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-xs text-surface-500 dark:text-surface-400"
                >
                  <AlertTriangle size={14} className="inline mr-1 text-amber-500" />
                  Use um dos códigos de backup que você salvou durante a configuração do 2FA.
                  Cada código pode ser usado apenas uma vez.
                </motion.div>
              )}
            </div>
          </div>

          {/* Cancel */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              Cancelar e voltar ao login
            </button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
