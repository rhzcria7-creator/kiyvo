'use client'
// ─────────────────────────────────────────────────────────────
// PageError — erro de rota reutilizável (PT-BR, logo, actions).
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { clientLogger } from '@/lib/observability/client-logger'
import { toPtBrError } from '@/lib/errors/ptBrMessages'

interface PageErrorProps {
  error: Error & { digest?: string }
  reset?: () => void
  /** Contexto adicional (ex: "Login", "Carrinho") */
  context?: string
  /** Mensagem de título PT-BR sobrescrita */
  title?: string
  /** Mensagem descritiva PT-BR sobrescrita */
  message?: string
  /** Altura mínima do container */
  minHeight?: string
  /** Mostrar link para início */
  showHome?: boolean
}

export function PageError({
  error,
  reset,
  context,
  title,
  message,
  minHeight = '60vh',
  showHome = true,
}: PageErrorProps) {
  useEffect(() => {
    clientLogger.error('Page error', {
      metadata: {
        context,
        message: error?.message,
        digest: error?.digest,
        stack: error?.stack,
      },
    })
  }, [error, context])

  const pt = toPtBrError(error, context)
  const finalTitle = title || pt.title || 'Algo deu errado'
  const finalMessage = message || pt.message || 'Tente novamente ou volte mais tarde.'

  return (
    <div
      className="flex items-center justify-center px-4 py-16"
      style={{ minHeight }}
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm"
      >
        <motion.div
          className="w-16 h-16 mx-auto bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-5"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AlertTriangle size={30} className="text-red-500 dark:text-red-400" />
        </motion.div>

        <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">
          {finalTitle}
        </h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">{finalMessage}</p>

        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="btn-primary text-sm inline-flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Tentar novamente
            </button>
          )}
          {showHome && (
            <Link href="/" className="btn-secondary text-sm inline-flex items-center justify-center gap-2">
              <Home size={16} /> Voltar ao início
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default PageError
