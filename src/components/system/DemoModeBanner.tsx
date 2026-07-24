'use client'
// DemoModeBanner — aviso exibido quando o KIYVO roda em modo LocalDB (sem backend
// persistente). Avisa que os dados podem ser perdidos e o acesso pode ser revogado.
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X, LogIn } from 'lucide-react'
import { isLocalBackend } from '@/lib/backend/detect'
import Link from 'next/link'

const STORAGE_KEY = 'kiyvo_demo_banner_dismissed'

export function DemoModeBanner() {
  const isDemo = isLocalBackend()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    if (!isDemo) return
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === '1')
    } catch {
      setDismissed(false)
    }
  }, [isDemo])

  if (!isDemo) return null

  function fechar() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* noop */
    }
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500 text-amber-950 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3 text-sm font-semibold">
            <Info className="w-4 h-4 flex-shrink-0" />
            <p className="flex-1 min-w-0">
              <b>Modo Demonstração:</b> seus dados ficam salvos localmente e podem ser perdidos ao reiniciar o servidor.
              Crie uma conta para não perder seu acesso e seus produtos.
            </p>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1 bg-amber-950/15 hover:bg-amber-950/25 rounded-full px-3 py-1 transition"
            >
              <LogIn className="w-3.5 h-3.5" /> Entrar
            </Link>
            <button onClick={fechar} aria-label="Fechar aviso" className="flex-shrink-0 hover:bg-amber-950/15 rounded-full p-1 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
