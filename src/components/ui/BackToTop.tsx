'use client'
// BackToTop — botão flutuante "voltar ao topo" (só aparece depois de 500px scroll)
// Com animação de mola e ícone de seta
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="btt"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          onClick={toTop}
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -3, scale: 1.08 }}
          aria-label="Voltar ao topo"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-4 z-[55] w-12 h-12 rounded-full bg-[#0F172A] text-white shadow-xl shadow-brand-500/30 flex items-center justify-center hover:bg-brand-600 transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default BackToTop
