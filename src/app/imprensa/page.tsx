'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Newspaper } from 'lucide-react'
import Link from 'next/link'

export default function Page() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30"
          >
            <Newspaper size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Imprensa & Media
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Kit de imprensa, logos oficiais e contatos para mídia
          </p>
        </motion.div>

        <FadeInOnScroll>
          <div className="card-base p-8 text-center">
            <p className="text-surface-500 dark:text-surface-400 mb-4">
              Conteúdo em construção. Em breve disponível com dados reais do Supabase.
            </p>
            <Link href="/buscar" className="btn-primary text-sm inline-block">Explorar Produtos</Link>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
