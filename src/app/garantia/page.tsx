'use client'

import { motion } from 'framer-motion'
import { Shield, RefreshCcw, HeadphonesIcon, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '@/components/animations'
import { AnimatedShield, AnimatedHandshake } from '@/components/svgs/AnimatedSVGs'
import Link from 'next/link'

const guarantees = [
  { icon: Shield, title: 'Pagamento Seguro', desc: 'Seu dinheiro fica retido pela Playdex e só é liberado ao vendedor após a confirmação de entrega. Se o produto não for entregue, você recebe 100% do valor de volta.' },
  { icon: RefreshCcw, title: 'Reembolso Garantido', desc: 'Se o produto não corresponder à descrição ou não for entregue, você pode abrir uma disputa e solicitar reembolso integral.' },
  { icon: HeadphonesIcon, title: 'Suporte 24/7', desc: 'Nossa equipe de moderação está disponível para resolver qualquer problema entre comprador e vendedor.' },
  { icon: Lock, title: 'Dados Protegidos', desc: 'Suas informações pessoais e de pagamento são criptografadas e protegidas com os mais altos padrões de segurança.' },
]

const steps = [
  { step: '1', title: 'Você compra', desc: 'O pagamento fica retido pela Playdex' },
  { step: '2', title: 'Vendedor entrega', desc: 'Produto é enviado via chat ou automaticamente' },
  { step: '3', title: 'Você confirma', desc: 'Confirma o recebimento e libera o pagamento' },
]

export default function GarantiaPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <FadeInOnScroll className="text-center mb-12">
          <AnimatedShield className="w-20 h-20 mx-auto mb-4" />
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">
            Compra Garantida Playdex
          </h1>
          <p className="text-surface-500 mt-3 max-w-lg mx-auto">
            Todas as transações na Playdex são protegidas. Seu dinheiro e seus dados estão sempre seguros.
          </p>
        </FadeInOnScroll>

        {/* How it works */}
        <FadeInOnScroll delay={0.1} className="mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {steps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-2">
                    <span className="font-display font-extrabold text-brand-600 text-xl">{s.step}</span>
                  </div>
                  <p className="font-display font-bold text-surface-900">{s.title}</p>
                  <p className="text-xs text-surface-500 mt-0.5">{s.desc}</p>
                </div>
                {i < steps.length - 1 && <ArrowRight size={20} className="text-surface-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        </FadeInOnScroll>

        {/* Guarantees */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {guarantees.map((g) => (
            <StaggerItem key={g.title}>
              <div className="card-base p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <g.icon size={22} className="text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-surface-900">{g.title}</h3>
                    <p className="text-sm text-surface-500 mt-2 leading-relaxed">{g.desc}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Trust stats */}
        <FadeInOnScroll>
          <div className="p-8 bg-surface-900 rounded-3xl text-center">
            <AnimatedHandshake className="w-16 h-16 mx-auto mb-4" />
            <h2 className="font-display font-extrabold text-2xl text-white mb-2">Dados que Geram Confiança</h2>
            <p className="text-surface-400 mb-8 max-w-md mx-auto">Mais de 1 milhão de usuários confiam na Playdex para comprar e vender com segurança</p>
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              {[
                { value: '99.2%', label: 'Taxa de entrega' },
                { value: '< 2h', label: 'Tempo médio de resolução' },
                { value: 'R$ 0', label: 'Custo da proteção' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display font-extrabold text-2xl text-white">{stat.value}</p>
                  <p className="text-sm text-surface-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
