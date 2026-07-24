'use client'
// FloatingCTA — botão flutuante "Quero vender" ou "Explorar" no mobile
// CTA secundário visível em páginas de produto/busca para incentivar cadastro
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function FloatingCTA() {
  const pathname = usePathname()
  // Só aparece em páginas de navegação/produto (não em checkout/login/cadastro)
  const hiddenPaths = ['/checkout', '/login', '/cadastro', '/auth', '/dashboard', '/vendor', '/vender', '/admin']
  const hide = hiddenPaths.some((p) => pathname.startsWith(p))

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 2 }}
          className="lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] right-4 z-[50]"
        >
          <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.08 }}>
            <Link
              href="/vender"
              className="group flex items-center gap-2 bg-brand-600 text-white rounded-full pl-3 pr-4 py-3 font-black text-sm shadow-2xl shadow-brand-600/40 pulse-glow"
              aria-label="Vender na Kiyvo"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              Vender
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FloatingCTA
