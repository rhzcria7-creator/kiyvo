'use client'
// ─────────────────────────────────────────────────────────────
// PageLoader — loader de página reutilizável (logo + dots).
// Substitui os antigos "K" em caixa azul.
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import { KiyvoLogo } from '@/components/brand/KiyvoLogo'
import { motion } from 'framer-motion'

interface PageLoaderProps {
  size?: number
  showDots?: boolean
  minHeight?: string
  logoSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
}

export function PageLoader({
  showDots = true,
  minHeight = '60vh',
  logoSize = 'md',
}: PageLoaderProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight }}
      role="status"
      aria-label="Carregando"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <KiyvoLogo variant="icon" size={logoSize} animated />
        </motion.div>
        {showDots && (
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-brand-500"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.7,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageLoader
