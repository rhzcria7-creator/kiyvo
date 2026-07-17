'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          className="text-[120px] sm:text-[160px] font-display font-extrabold leading-none gradient-text select-none"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mt-4"
        >
          Página não encontrada
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-surface-500 dark:text-surface-400 mt-3 text-lg"
        >
          Parece que esta página se perdeu no universo digital. Que tal explorar nosso catálogo?
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <Button size="lg" icon={<Home size={18} />}>
              Voltar ao Início
            </Button>
          </Link>
          <Link href="/buscar">
            <Button variant="secondary" size="lg" icon={<Search size={18} />}>
              Buscar Produtos
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
