'use client'

import { motion } from 'framer-motion'
import { Users, DollarSign, TrendingUp, Copy, Check, ArrowRight, Gift } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, GlowCard, NumberTicker, MorphingBlob } from '@/components/ui/AdvancedAnimations'
import { AnimatedRocket, AnimatedWallet } from '@/components/svgs/AnimatedSVGs2'
import { Button } from '@/components/ui/Button'
import NextLink from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function AfiliadosPage() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'KIYVO10'
  const referralLink = `https://kiyvo.com.br/r/${referralCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 relative">
        <FadeInOnScroll className="text-center mb-12">
          <AnimatedRocket className="w-16 h-16 mx-auto mb-3" />
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white">Programa de Afiliados</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-md mx-auto">Indique amigos e ganhe comissões em cada compra que eles fizerem</p>
        </FadeInOnScroll>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { step: '1', icon: ArrowRight, title: 'Compartilhe seu link', desc: 'Envie seu link de afiliado para amigos e seguidores' },
            { step: '2', icon: Users, title: 'Eles se cadastram', desc: 'Quando alguém se cadastra pelo seu link, vira sua indicação' },
            { step: '3', icon: DollarSign, title: 'Ganhe comissões', desc: 'Receba 5% de cada compra feita por suas indicações' },
          ].map((item, i) => (
            <FadeInOnScroll key={item.step} delay={i * 0.15}>
              <GlowCard color="brand" className="p-6 text-center h-full">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <item.icon size={22} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div className="w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-display font-bold text-sm">{item.step}</div>
                <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-2">{item.desc}</p>
              </GlowCard>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Referral Link */}
        <FadeInOnScroll className="mb-12">
          <div className="p-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl text-white">
            <h2 className="font-display font-extrabold text-xl mb-2">Seu Link de Afiliado</h2>
            <p className="text-brand-200 text-sm mb-4">Compartilhe este link e comece a ganhar</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white dark:bg-surface-900/10 backdrop-blur rounded-xl px-4 py-3 font-mono text-sm truncate">
                {referralLink}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyLink}
                className="px-5 py-3 bg-white dark:bg-surface-900 text-brand-700 font-display font-bold rounded-xl flex items-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado!' : 'Copiar'}
              </motion.button>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Indicações', value: 47, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Comissões ganhas', value: 1234, prefix: 'R$ ', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Conversão', value: 23, suffix: '%', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
            { label: 'A pagar', value: 89, prefix: 'R$ ', icon: Gift, color: 'text-purple-600 bg-purple-50' },
          ].map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.08}>
              <div className="card-base p-5">
                <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon size={16} />
                </div>
                <p className="font-display font-extrabold text-2xl text-surface-900 dark:text-white">
                  {stat.prefix}<NumberTicker value={stat.value} />{stat.suffix}
                </p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Commission tiers */}
        <FadeInOnScroll>
          <h2 className="font-display font-extrabold text-xl text-surface-900 dark:text-white mb-4">Níveis de Comissão</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { level: 'Bronze', referrals: '0-24', commission: '5%', color: 'border-amber-300 bg-amber-50/50' },
              { level: 'Prata', referrals: '25-99', commission: '7%', color: 'border-surface-300 bg-surface-50 dark:bg-surface-800/50' },
              { level: 'Ouro', referrals: '100+', commission: '10%', color: 'border-amber-400 bg-amber-50/50' },
            ].map((tier) => (
              <GlowCard key={tier.level} color="brand" className={`p-5 border-2 ${tier.color}`}>
                <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{tier.level}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{tier.referrals} indicações</p>
                <p className="font-display font-extrabold text-3xl text-brand-600 dark:text-brand-400 mt-2">{tier.commission}</p>
                <p className="text-xs text-surface-400">por compra</p>
              </GlowCard>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
