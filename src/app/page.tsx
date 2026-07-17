'use client'

import { Hero } from '@/components/home/Hero'
import { CategoriesGrid } from '@/components/home/CategoriesGrid'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Reviews } from '@/components/home/Reviews'
import { BlogSection } from '@/components/home/BlogSection'
import { PageTransition } from '@/components/shared/PageTransition'
import { AnimatedCounter, FadeInOnScroll, ScaleInOnScroll } from '@/components/animations'
import { AnimatedShield, AnimatedLightning, AnimatedStar, AnimatedGlobe, WaveDivider } from '@/components/svgs/AnimatedSVGs'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <CategoriesGrid />
      <FeaturedProducts />

      {/* Como Funciona */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-12">
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white">
              Como Funciona
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-lg mx-auto">
              Comprar e vender na Kiyvo é simples, rápido e seguro
            </p>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { svg: <AnimatedGlobe className="w-16 h-16" />, title: 'Encontre o produto', desc: 'Navegue por categorias ou busque por jogos, software, cursos, templates e muito mais.' },
              { svg: <AnimatedShield className="w-16 h-16" />, title: 'Compra segura', desc: 'O pagamento é intermediado pela Kiyvo. Seu dinheiro só chega ao vendedor após a entrega.' },
              { svg: <AnimatedLightning className="w-16 h-16" />, title: 'Receba na hora', desc: 'Produtos digitais com entrega automática em segundos. É rápido, é seguro, é Kiyvo.' },
            ].map((item, i) => (
              <ScaleInOnScroll key={item.title} delay={i * 0.15}>
                <div className="text-center p-8 card-base hover:shadow-card-hover dark:hover:shadow-dark-glow transition-shadow">
                  <div className="flex justify-center mb-4">{item.svg}</div>
                  <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </ScaleInOnScroll>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Stats */}
      <section className="py-16 bg-surface-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: 1, suffix: 'M+', label: 'Usuários ativos', icon: '👥' },
              { num: 500, suffix: 'K+', label: 'Transações seguras', icon: '🔒' },
              { num: 20, suffix: '+', label: 'Categorias digitais', icon: '📦' },
              { num: 4, suffix: '.8★', label: 'Avaliação média', icon: '⭐' },
            ].map((stat, i) => (
              <FadeInOnScroll key={stat.label} delay={i * 0.1}>
                <div>
                  <p className="text-3xl mb-2">{stat.icon}</p>
                  <p className="font-display font-extrabold text-3xl lg:text-4xl text-white">
                    <AnimatedCounter target={stat.num} suffix={stat.suffix} />
                  </p>
                  <p className="font-display font-semibold text-brand-400 mt-1 text-sm">{stat.label}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Formas de Pagamento */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInOnScroll className="text-center mb-10">
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
              Formas de Pagamento
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-sm mt-2">Pague como preferir — tudo processado com segurança</p>
          </FadeInOnScroll>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'PIX', desc: 'Instantâneo', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400' },
              { name: 'Cartão', desc: 'Crédito/Débito', color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800/40 dark:text-blue-400' },
              { name: 'Boleto', desc: 'Até 3 dias', color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400' },
              { name: 'Crypto', desc: 'Bitcoin/USDT', color: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-800/40 dark:text-orange-400' },
              { name: 'Saldo PD', desc: 'Kiyvo', color: 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/30 dark:border-brand-800/40 dark:text-brand-400' },
              { name: 'KD Points', desc: 'Recompensas', color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-800/40 dark:text-purple-400' },
            ].map((method, i) => (
              <motion.div
                key={method.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`px-6 py-4 rounded-2xl border-2 ${method.color} cursor-default`}
              >
                <p className="font-display font-bold text-sm">{method.name}</p>
                <p className="text-xs opacity-70">{method.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Reviews />
      <BlogSection />

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <FadeInOnScroll>
            <AnimatedStar className="w-12 h-12 mx-auto mb-4" />
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl text-white">
              Comece a vender na Kiyvo
            </h2>
            <p className="text-brand-200 mt-4 max-w-lg mx-auto text-lg">
              Transforme seus produtos digitais em renda. Cadastro grátis, sem mensalidade.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/cadastro">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-brand-700 font-display font-bold rounded-2xl text-lg hover:shadow-2xl transition-shadow"
                >
                  Criar Conta Grátis
                </motion.button>
              </Link>
              <Link href="/como-funciona">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white font-display font-bold rounded-2xl text-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Saiba Mais
                </motion.button>
              </Link>
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </PageTransition>
  )
}
