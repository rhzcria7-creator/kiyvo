'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Zap, Shield, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-[#0B0F1A]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Marketplace #1 do Brasil
              </div>

              {/* Main title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight">
                O marketplace mais{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  justo
                </span>{' '}
                para quem vende digital
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                Taxa <strong className="text-zinc-900 dark:text-white">ZERO</strong> nas primeiras R$ 5.000 em vendas.
                Saque em <strong className="text-zinc-900 dark:text-white">1 dia</strong> via PIX.
                +200 agentes de IA gratuitos.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-3 mt-8"
            >
              <a
                href="/search"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-full text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <Search className="w-4 h-4" />
                Explorar Produtos
              </a>
              <a
                href="/sell"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold rounded-full text-sm border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all active:scale-[0.98]"
              >
                <TrendingUp className="w-4 h-4" />
                Começar a Vender
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-10"
            >
              {[
                { label: 'Usuários', value: '1M+' },
                { label: 'Produtos', value: '789+' },
                { label: 'Taxa Média', value: '3.5%' },
                { label: 'Saque', value: '1 dia' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-zinc-200/50 dark:border-zinc-800/50 p-6 md:p-8">
              {/* Floating cards */}
              <div className="grid grid-cols-2 gap-3 h-full">
                {[
                  { emoji: '💰', title: 'Taxa Zero', desc: 'Até R$ 5K' },
                  { emoji: '⚡', title: 'Saque PIX', desc: 'Em 1 dia' },
                  { emoji: '🤖', title: '200+ IAs', desc: 'Grátis' },
                  { emoji: '🛡️', title: 'Seguro', desc: 'Escrow 7d' },
                ].map((item) => (
                  <div key={item.title} className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl mb-1">{item.emoji}</span>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
