'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HomeHero } from '@/components/home/HomeHero'
import { Search, Star, Users, Zap, Shield, TrendingUp, ArrowRight, Package, CreditCard, Coins, Smartphone } from 'lucide-react'

// Daily deals mock
const DAILY_DEALS = [
  { id: '1', title: 'Curso Marketing Digital 2026', price: 97, originalPrice: 197, sales: 1234, rating: 4.8, emoji: '📚' },
  { id: '2', title: 'Template Bootstrap Pro', price: 47, originalPrice: 97, sales: 567, rating: 4.7, emoji: '🎨' },
  { id: '3', title: 'E-book Receitas Fit', price: 27, originalPrice: 67, sales: 3456, rating: 4.5, emoji: '📖' },
  { id: '4', title: 'Plugin WordPress Speed', price: 67, originalPrice: 147, sales: 890, rating: 4.9, emoji: '⚡' },
]

const CATEGORIES = [
  { name: 'Softwares', icon: '💻', count: 156 },
  { name: 'Cursos', icon: '📚', count: 234 },
  { name: 'E-books', icon: '📖', count: 189 },
  { name: 'Templates', icon: '🎨', count: 98 },
  { name: 'Design', icon: '🖌️', count: 67 },
  { name: 'Jogos', icon: '🎮', count: 45 },
]

const STEPS = [
  { icon: <Users className="w-6 h-6" />, title: 'Crie sua conta', desc: 'Cadastro grátis em 30 segundos' },
  { icon: <Package className="w-6 h-6" />, title: 'Publique seu produto', desc: 'Digital, curso ou serviço' },
  { icon: <CreditCard className="w-6 h-6" />, title: 'Venda e receba', desc: 'Saque em 1 dia via PIX' },
]

const TESTIMONIALS = [
  { name: 'Ana C.', text: 'Melhor plataforma para vender cursos! Taxa zero é imbatível.', rating: 5, role: 'Vendedora' },
  { name: 'Rafael O.', text: 'Comprei templates aqui. Entrega imediata e suporte excelente!', rating: 5, role: 'Comprador' },
  { name: 'Juliana S.', text: 'Maiores comissões do mercado. 50% em alguns produtos!', rating: 5, role: 'Afiliada' },
]

export default function HomePage() {
  return (
    <main className="bg-[#FAFAFA] dark:bg-[#0B0F1A] overflow-x-hidden">
      <HomeHero />

      {/* Daily Deals */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">🔥 Ofertas do Dia</h2>
          <a href="/deals" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {DAILY_DEALS.map((deal, i) => (
            <motion.a
              key={deal.id}
              href={`/product/${deal.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 p-4 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">{deal.emoji}</div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2">{deal.title}</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-zinc-500">{deal.rating}</span>
                <span className="text-xs text-zinc-400 ml-1">({deal.sales} vendas)</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-zinc-900 dark:text-white">R$ {deal.price.toFixed(2)}</span>
                <span className="text-xs text-zinc-400 line-through">R$ {deal.originalPrice.toFixed(2)}</span>
              </div>
              <div className="mt-2 px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold rounded-full inline-block">
                -{Math.round((1 - deal.price / deal.originalPrice) * 100)}%
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white dark:bg-zinc-900/50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-6 text-center">📂 Categorias</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.a
                key={cat.name}
                href={`/category/${cat.name.toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{cat.name}</span>
                <span className="text-xs text-zinc-400">{cat.count} itens</span>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-8 text-center">Como Funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-4">
                {step.icon}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold flex items-center justify-center mb-3">
                {i + 1}
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-950 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-8 text-center">💬 O que nossos usuários dizem</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/50 dark:border-zinc-800/50"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Zap className="w-5 h-5" />, title: 'Taxa Zero 5K', desc: 'Sem taxa até R$5 mil' },
            { icon: <Smartphone className="w-5 h-5" />, title: 'Saque PIX 1 dia', desc: 'Receba rápido' },
            { icon: <Shield className="w-5 h-5" />, title: 'Escrow 7 dias', desc: 'Compra segura' },
            { icon: <Coins className="w-5 h-5" />, title: 'KD Points', desc: 'Cashback de até 50%' },
          ].map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-3">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{feat.title}</h3>
              <p className="text-xs text-zinc-400">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-zinc-900 dark:bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white dark:text-zinc-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-zinc-400 dark:text-zinc-600 mb-8 max-w-lg mx-auto">
            Junte-se a mais de 1 milhão de usuários. Taxa zero nas primeiras R$ 5.000 em vendas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/register" className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-semibold rounded-full text-sm hover:opacity-90 transition-all">
              Criar Conta Grátis
            </a>
            <a href="/search" className="w-full sm:w-auto px-8 py-3.5 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded-full text-sm hover:opacity-90 transition-all">
              Explorar Produtos
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
