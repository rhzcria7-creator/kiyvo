'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Shield, Zap, Award, Globe, Layers } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const Hero3D = dynamic(() => import('./Hero3D').then((mod) => ({ default: mod.Hero3D })), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-brand-100/30 dark:from-brand-950/50 dark:via-surface-950 dark:to-brand-950/30" />,
})

const features = [
  { icon: Shield, label: 'Compra Segura', desc: 'Dinheiro de volta garantido' },
  { icon: Zap, label: 'Entrega Rápida', desc: 'Produtos digitais em segundos' },
  { icon: Award, label: 'KD Points', desc: 'Recompensas em toda compra' },
]

const categories = [
  { icon: '🎮', label: 'Jogos' },
  { icon: '💿', label: 'Software' },
  { icon: '🎓', label: 'Cursos' },
  { icon: '📚', label: 'E-books' },
  { icon: '🎨', label: 'Design' },
  { icon: '🎬', label: 'Streaming' },
  { icon: '🎁', label: 'Gift Cards' },
  { icon: '🌐', label: 'Domínios' },
  { icon: '⚡', label: 'APIs' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-white dark:from-brand-950/30 dark:via-surface-950 dark:to-surface-950">
      {/* 3D Background */}
      <Hero3D />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent dark:from-surface-950/90 dark:via-surface-950/50 dark:to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/40 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-brand-700 dark:text-brand-300 font-display">+1M usuários confiam no Kiyvo</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-surface-900 dark:text-white leading-[1.1] tracking-tight"
          >
            O marketplace de{' '}
            <span className="gradient-text">tudo que é digital</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-lg text-surface-500 dark:text-surface-400 leading-relaxed max-w-lg"
          >
            Jogos, software, cursos, e-books, templates, gift cards e muito mais. Compre e venda com segurança nível bancário no Kiyvo.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/categorias">
              <Button size="lg" icon={<ArrowRight size={18} />}>
                Explorar Catálogo
              </Button>
            </Link>
            <Link href="/anunciar">
              <Button variant="secondary" size="lg">
                Comece a Vender
              </Button>
            </Link>
          </motion.div>

          {/* Category chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={`/categoria/${cat.label.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-50 dark:bg-surface-800 hover:bg-brand-50 dark:hover:bg-brand-950/50 border border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-700 rounded-full text-xs font-medium text-surface-600 dark:text-surface-400 hover:text-brand-700 dark:hover:text-brand-300 transition-all duration-200"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-6"
          >
            {features.map((feat) => (
              <div key={feat.label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center">
                  <feat.icon size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white font-display">{feat.label}</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500">{feat.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
