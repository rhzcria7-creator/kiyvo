'use client'
import { useEffect } from 'react'
import { clientLogger } from '@/lib/observability/client-logger'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { clientLogger.error('Page error', { metadata: { message: error.message, digest: (error as Error & { digest?: string }).digest } }) }, [error])
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 mx-auto bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-red-500 dark:text-red-400" />
        </div>
        <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">Algo deu errado</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">Tente novamente ou volte mais tarde.</p>
        <button onClick={reset} className="mt-4 btn-primary text-sm flex items-center gap-2 mx-auto">
          <RefreshCw size={16} /> Tentar novamente
        </button>
      </div>
    </div>
  )
}
