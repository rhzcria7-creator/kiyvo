'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Shield, Zap, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const Hero3D = dynamic(() => import('./Hero3D').then((mod) => ({ default: mod.Hero3D })), {
  ssr: false,
  loading: () => <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-brand-100/30" />,
})

const features = [
  { icon: Shield, label: 'Compra Segura', desc: 'Dinheiro de volta garantido' },
  { icon: Zap, label: 'Entrega Rápida', desc: 'Produtos em segundos' },
  { icon: Award, label: 'PD Points', desc: 'Recompensas em toda compra' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-white">
      {/* 3D Background */}
      <Hero3D />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-brand-700 font-display">+1M jogadores confiam</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-surface-900 leading-[1.1] tracking-tight"
          >
            Compre e venda{' '}
            <span className="gradient-text">ativos digitais</span>{' '}
            com segurança
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-lg text-surface-500 leading-relaxed max-w-lg"
          >
            Contas, keys, itens, gold e gift cards para seus jogos favoritos. Tudo intermediado com garantia de entrega.
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

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap gap-6"
          >
            {features.map((feat) => (
              <div key={feat.label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
                  <feat.icon size={18} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 font-display">{feat.label}</p>
                  <p className="text-xs text-surface-400">{feat.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
