'use client'
// ─────────────────────────────────────────────────────────────
// Modal de Aviso — Modo Demonstração (sem login)
// Aparece quando usuário tenta comprar/favoritar/usar funções protegidas SEM estar logado.
// Mostra aviso claro sobre perda de dados, suporte limitado, riscos — e pede aceite legal.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ShieldAlert, LogIn, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

const STORAGE_KEY = 'kiyvo_demo_accepted'
const EXPIRY_MS = 1000 * 60 * 60 * 24 // 24h

export function hasAcceptedDemo(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const { acceptedAt } = JSON.parse(raw) as { acceptedAt: number }
    if (Date.now() - acceptedAt > EXPIRY_MS) return false
    return true
  } catch { return false }
}

interface DemoWarningProps {
  open: boolean
  onClose: () => void
  onContinue: () => void
  context?: 'checkout' | 'cart' | 'favorite' | 'sell' | 'default'
}

export function DemoWarningModal({ open, onClose, onContinue, context = 'default' }: DemoWarningProps) {
  const [checked, setChecked] = useState({ t1: false, t2: false, t3: false })
  const [showPulse, setShowPulse] = useState(true)

  useEffect(() => {
    if (open) {
      setChecked({ t1: false, t2: false, t3: false })
      setShowPulse(true)
    }
  }, [open])

  const allChecked = checked.t1 && checked.t2 && checked.t3

  const handleContinue = () => {
    if (!allChecked) {
      toast.error('Marque todos os campos para confirmar que leu e aceita os riscos')
      setShowPulse(true)
      setTimeout(() => setShowPulse(false), 900)
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ acceptedAt: Date.now(), context }))
    } catch { /* noop */ }
    onContinue()
  }

  const contextText: Record<string, { title: string; action: string; risk: string }> = {
    checkout: {
      title: 'Comprar sem conta?',
      action: 'finalizar sua compra',
      risk: 'Você pode PERDER o acesso aos produtos digitais se limpar cache/trocar de dispositivo.',
    },
    cart: {
      title: 'Adicionar ao carrinho sem conta?',
      action: 'adicionar itens ao carrinho',
      risk: 'Seu carrinho pode ser PERDIDO ao limpar o navegador ou trocar de dispositivo.',
    },
    favorite: {
      title: 'Favoritar sem conta?',
      action: 'salvar favoritos',
      risk: 'Sua lista de favoritos pode ser PERDIDA sem aviso prévio.',
    },
    sell: {
      title: 'Vender sem conta verificada?',
      action: 'publicar produtos',
      risk: 'Para vender você PRECISA de cadastro completo + KYC aprovado.',
    },
    default: {
      title: 'Continuar sem login?',
      action: 'prosseguir como visitante',
      risk: 'Seus dados NÃO ficam salvos na nuvem e podem ser perdidos.',
    },
  }

  const ctx = contextText[context] || contextText.default

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-warning-title"
        >
          <motion.div
            initial={{ scale: 0.9, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-[1.75rem] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com alerta vermelho */}
            <div className="relative p-6 pb-4 bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-3 rounded-2xl bg-white/20 backdrop-blur-sm"
              >
                <ShieldAlert className="w-9 h-9" strokeWidth={2.5} />
              </motion.div>
              <h2 id="demo-warning-title" className="text-2xl font-black leading-tight">
                {ctx.title}
              </h2>
              <p className="mt-1 text-white/90 text-sm font-medium">
                Você está prestes a {ctx.action} no <b>modo demonstração</b> (sem fazer login).
              </p>
            </div>

            {/* Avisos de risco */}
            <div className="p-6 pt-5 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 p-4 flex gap-3"
              >
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-amber-900 dark:text-amber-300 text-sm uppercase tracking-wide">Atenção — Riscos do modo demo</p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-200/90 leading-relaxed">
                    {ctx.risk}
                  </p>
                </div>
              </motion.div>

              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {[
                  'Compras e dados ficam salvos APENAS neste navegador (localStorage)',
                  'Suporte pode DEMORAR horas/dias para contas demo',
                  'Você NÃO poderá acessar seus produtos em outro dispositivo',
                  'Cupons, KD Points e recompensas podem não ser creditados',
                  'Recomendamos FORTEMENTE criar uma conta gratuita',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-red-500 mt-0.5 text-lg leading-none">•</span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Checkboxes legais */}
              <div className="pt-3 space-y-3 border-t border-slate-200 dark:border-slate-700">
                {[
                  {
                    key: 't1' as const,
                    label: (
                      <>Li e concordo com os <Link href="/termos" target="_blank" className="text-brand-600 underline font-semibold">Termos de Uso</Link> e <Link href="/politica-privacidade" target="_blank" className="text-brand-600 underline font-semibold">Política de Privacidade</Link></>
                    ),
                  },
                  {
                    key: 't2' as const,
                    label: 'Estou ciente de que posso PERDER dados, compras e favoritos sem possibilidade de recuperação',
                  },
                  {
                    key: 't3' as const,
                    label: 'Aceito utilizar no modo demonstração por minha conta e risco, isentando a KIYVO de perdas',
                  },
                ].map((cb, i) => (
                  <motion.label
                    key={cb.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-start gap-3 cursor-pointer group select-none"
                  >
                    <div
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        checked[cb.key]
                          ? 'bg-[#2563EB] border-[#2563EB]'
                          : 'border-slate-400 dark:border-slate-500 group-hover:border-[#2563EB]'
                      }`}
                      onClick={(e) => { e.preventDefault(); setChecked(c => ({ ...c, [cb.key]: !c[cb.key] })) }}
                    >
                      {checked[cb.key] && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-sm leading-snug text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                      {cb.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked[cb.key]}
                      onChange={(e) => setChecked(c => ({ ...c, [cb.key]: e.target.checked }))}
                      className="sr-only"
                    />
                  </motion.label>
                ))}
              </div>

              {/* Botões */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleContinue}
                  animate={!allChecked && showPulse ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-black tracking-wide uppercase transition-all ${
                    allChecked
                      ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Prosseguir como demo
                </motion.button>

                <Link href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-black tracking-wide uppercase bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors shadow-lg shadow-brand-500/20"
                >
                  <LogIn className="w-4 h-4" />
                  Fazer login (recomendado)
                </Link>
              </div>

              <p className="text-center text-[11px] font-black uppercase tracking-widest text-slate-400 pt-2">
                🔒 Criar conta é GRÁTIS e leva 30 segundos
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────
// Hook para uso em componentes
// ─────────────────────────────────────────────────────────────
export function useDemoGuard() {
  // Retorna função que verifica e mostra modal se necessário
  return { hasAccepted: hasAcceptedDemo() }
}
