// ─────────────────────────────────────────────────────────────
// KIYVO — Banner de indicação (exibido quando usuário entra por /r/CODE)
// Mostra: "Bem-vindo! Você tem 5% OFF na primeira compra, cortesia de X"
// ─────────────────────────────────────────────────────────────

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, X, Sparkles } from 'lucide-react'

interface ReferralData {
  code: string
  referrerName?: string
  discountPct: number
}

export function ReferralBanner() {
  const [ref, setRef] = useState<ReferralData | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Lê ?ref=CODE da URL e salva no localStorage (client-side)
    const url = new URL(window.location.href)
    const codeParam = url.searchParams.get('ref')
    const welcome = url.searchParams.get('welcome') === '1'

    let code: string | null = null
    if (codeParam && codeParam !== 'invalid' && codeParam.length <= 32) {
      code = codeParam.toUpperCase()
      localStorage.setItem('kiyvo_ref_code', code)
      localStorage.setItem('kiyvo_ref_at', String(Date.now()))
      // Limpa da URL pra ficar limpo
      url.searchParams.delete('ref')
      url.searchParams.delete('welcome')
      window.history.replaceState({}, '', url.toString())
    } else {
      const stored = localStorage.getItem('kiyvo_ref_code')
      code = stored && stored.length <= 32 ? stored : null
    }

    if (code) {
      // Verifica se o usuário já se cadastrou/ativou (flag)
      const activated = localStorage.getItem('kiyvo_ref_used') === '1'
      if (!activated) {
        setRef({
          code,
          referrerName: undefined, // será preenchido via API no futuro
          discountPct: 5,
        })
        // Só mostra o banner grande quando é boas-vindas nova
        if (welcome || !localStorage.getItem('kiyvo_ref_seen')) {
          setVisible(true)
          localStorage.setItem('kiyvo_ref_seen', '1')
        }
      }
    }
  }, [])

  function dismiss() {
    setVisible(false)
  }

  if (!ref) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="sticky top-[64px] z-40 -mx-4 sm:mx-0"
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-3">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white px-5 py-4 shadow-[0_20px_50px_-20px_rgba(37,99,235,0.6)]">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl" />
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3 relative">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                  <Gift size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm sm:text-base flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-200" />
                    Você ganhou {ref.discountPct}% OFF na primeira compra!
                  </p>
                  <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                    Válido para qualquer produto da plataforma. O cupom é aplicado automaticamente no checkout.
                    Código: <span className="font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">{ref.code}</span>
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={dismiss}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-brand-700 font-black text-xs uppercase tracking-wider hover:bg-amber-200 transition"
                >
                  Entendido
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function getReferralCodeFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const code = localStorage.getItem('kiyvo_ref_code')
    return code && code.length <= 32 ? code : null
  } catch { return null }
}
