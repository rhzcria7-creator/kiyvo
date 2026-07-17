'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">Erro ao carstrar taxas</h2>
      <p className="text-sm text-surface-500 dark:text-surface-400">{error.message}</p>
      <button onClick={reset} className="btn-primary">Tentar novamente</button>
    </div>
  )
}
