'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { clientLogger } from '@/lib/observability/client-logger'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    clientLogger.error('Application error', {
      metadata: {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      },
    })
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        <motion.div
          className="w-20 h-20 mx-auto bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <AlertTriangle size={40} className="text-red-500 dark:text-red-400" />
        </motion.div>

        <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
          Algo deu errado
        </h1>

        <p className="text-surface-500 dark:text-surface-400 mt-3 text-lg">
          Ocorreu um erro inesperado. Tente novamente ou volte ao início.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary flex items-center justify-center gap-2">
            <RefreshCw size={18} /> Tentar Novamente
          </button>
          <Link href="/">
            <Button variant="secondary" icon={<Home size={18} />}>
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
