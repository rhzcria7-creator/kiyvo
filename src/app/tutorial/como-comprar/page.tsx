// ─────────────────────────────────────────────────────────────
// KIYVO — Tutorial: Como Comprar com Segurança
// Guia completo de compra com proteção anti-golpe
// ─────────────────────────────────────────────────────────────

'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, ScaleInOnScroll } from '@/components/animations'
import { Shield, Lock, Eye, CreditCard, CheckCircle, AlertTriangle, Zap, ArrowRight, Heart } from 'lucide-react'
import Link from 'next/link'

const buySteps = [
  { icon: Search, title: 'Encontre o produto', desc: 'Busque por nome, categoria ou vendedor. Verifique avaliações e número de vendas.' },
  { icon: Eye, title: 'Verifique o vendedor', desc: 'Confira o badge de verificação, rating e histórico. Vendedores verificados passaram por KYC.' },
  { icon: CreditCard, title: 'Pague com segurança', desc: 'Seu pagamento vai para o Escrow do Kiyvo. O vendedor não recebe até você confirmar.' },
  { icon: Zap, title: 'Receba o produto', desc: 'Produtos digitais são entregues automaticamente em segundos. Copie a chave ou faça download.' },
  { icon: CheckCircle, title: 'Confirme o recebimento', desc: 'Só confirme quando tiver o produto na mão. Após confirmar, o pagamento é liberado ao vendedor.' },
]

import { Search } from 'lucide-react'

const antiScam = [
  { red: 'Vendedor pede pagamento fora do Kiyvo', green: 'Só pague pela plataforma — Escrow protege seu dinheiro' },
  { red: 'Preço muito abaixo do mercado', green: 'Desconfie de ofertas irreais — pode ser golpe' },
  { red: 'Vendedor sem verificação KYC', green: 'Prefira vendedores com badge "Verificado"' },
  { red: 'Produto sem fotos ou descrição clara', green: 'Só compre de anúncios completos e detalhados' },
  { red: 'Pedido para compartilhar senhas', green: 'O Kiyvo nunca pede senhas ou códigos por mensagem' },
  { red: 'Promessas de ganho garantido', green: 'Desconfie de promessas de lucro fácil' },
]

export default function TutorialComprarPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
          >
            <Shield size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Como Comprar com Segurança
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Guia completo para comprar sem risco no Kiyvo — 100% protegido contra golpes
          </p>
        </motion.div>

        {/* Passos */}
        <div className="space-y-6 mb-16">
          {buySteps.map((step, i) => (
            <FadeInOnScroll key={step.title}>
              <div className="flex items-start gap-5 card-base p-6 hover:shadow-card-hover transition-shadow">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <step.icon size={22} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Como funciona o Escrow */}
        <FadeInOnScroll className="mb-16">
          <div className="card-base p-8 bg-gradient-to-br from-brand-50 to-white dark:from-brand-950/20 dark:to-surface-900 border-brand-200 dark:border-brand-800/40">
            <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6 flex items-center gap-3">
              <Lock size={24} className="text-brand-600 dark:text-brand-400" />
              Sistema de Escrow — Seu Dinheiro Protegido
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Você paga', desc: 'Pagamento vai para conta segura do Kiyvo (Stripe)', icon: CreditCard },
                { step: '2', title: 'Recebe o produto', desc: 'Vendedor entrega — produto fica criptografado até confirmação', icon: Zap },
                { step: '3', title: 'Libera o pagamento', desc: 'Você confirma → vendedor recebe. Não confirmou? Dinheiro de volta.', icon: CheckCircle },
              ].map((item) => (
                <ScaleInOnScroll key={item.step}>
                  <div className="text-center p-4">
                    <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <item.icon size={24} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <h3 className="font-display font-bold text-surface-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{item.desc}</p>
                  </div>
                </ScaleInOnScroll>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Anti-Golpe */}
        <FadeInOnScroll className="mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6 flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-500" />
            Anti-Golpe: Sinais de Alerta vs. Práticas Seguras
          </h2>
          <div className="space-y-3">
            {antiScam.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{item.red}</p>
                </div>
                <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl">
                  <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{item.green}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeInOnScroll>

        {/* CTA */}
        <FadeInOnScroll className="text-center">
          <Link href="/buscar" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            <Heart size={20} /> Explorar Produtos
          </Link>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
