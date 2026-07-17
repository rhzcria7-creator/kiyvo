// ─────────────────────────────────────────────────────────────
// KIYVO — Tutorial: Primeiros Passos
// Guia completo para novos usuários
// ─────────────────────────────────────────────────────────────

'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '@/components/animations'
import { UserPlus, Shield, Search, ShoppingCart, Star, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const steps = [
  {
    icon: UserPlus,
    title: 'Crie sua conta',
    desc: 'Cadastro grátis em 30 segundos. Basta e-mail e senha para começar a explorar o marketplace.',
    detail: 'Você pode se cadastrar com Google ou GitHub para mais rapidez. Após o cadastro, confirme seu e-mail para ativar a conta.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    href: '/cadastro',
  },
  {
    icon: Shield,
    title: 'Verifique sua identidade',
    desc: 'Para vender e sacar dinheiro, complete a verificação KYC. Processo rápido e seguro.',
    detail: 'Enviamos seus dados com criptografia AES-256. O processo leva menos de 24h. Contas verificadas recebem badge de confiança.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    href: '/vendor/onboarding/kyc',
  },
  {
    icon: Search,
    title: 'Encontre produtos digitais',
    desc: 'Busque entre milhares de produtos: jogos, software, cursos, templates e muito mais.',
    detail: 'Use filtros avançados por categoria, preço, tipo e avaliação. Cada produto é verificado pelo nosso sistema anti-fraude.',
    color: 'from-brand-500 to-brand-600',
    bgColor: 'bg-brand-50 dark:bg-brand-950/30',
    href: '/buscar',
  },
  {
    icon: ShoppingCart,
    title: 'Compre com segurança',
    desc: 'Seu pagamento fica em Escrow — só é liberado ao vendedor após você confirmar o recebimento.',
    detail: 'Aceitamos PIX, cartão de crédito e boleto. Se o produto não for entregue, você recebe 100% do dinheiro de volta.',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    href: '/institucional/protecao-comprador',
  },
  {
    icon: Star,
    title: 'Comece a vender',
    desc: 'Anuncie grátis. Upload de produtos digitais no Cofre Digital com entrega automática.',
    detail: 'Seus produtos ficam criptografados com AES-256-GCM. A entrega é instantânea após confirmação de pagamento. Zero risco de cópia.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    href: '/anunciar',
  },
]

export default function TutorialPrimeirosPassosPage() {
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
            className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/30"
          >
            <Star size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Primeiros Passos no Kiyvo
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            Aprenda a usar o maior marketplace digital do Brasil em 5 passos simples
          </p>
        </motion.div>

        {/* Steps */}
        <StaggerContainer className="space-y-8">
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className={`card-base p-6 lg:p-8 hover:shadow-card-hover dark:hover:shadow-dark-glow transition-all duration-300 border-l-4 border-l-brand-500`}>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Step Number + Icon */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        <step.icon size={24} className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-surface-900 rounded-full border-2 border-brand-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-brand-600">{i + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-display font-extrabold text-xl text-surface-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-surface-600 dark:text-surface-400 leading-relaxed mb-3">
                      {step.desc}
                    </p>
                    <p className="text-sm text-surface-500 dark:text-surface-500 leading-relaxed mb-4">
                      {step.detail}
                    </p>
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                    >
                      Começar agora <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Dicas de segurança */}
        <FadeInOnScroll className="mt-16">
          <div className="card-base p-8 bg-gradient-to-br from-surface-900 to-surface-800 text-white border-0">
            <h2 className="font-display font-extrabold text-2xl mb-4 flex items-center gap-3">
              <Shield size={24} className="text-emerald-400" />
              Dicas de Segurança
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Nunca compartilhe sua senha ou códigos 2FA',
                'Ative a verificação em duas etapas (2FA)',
                'Só faça pagamentos pela plataforma — nunca fora',
                'Denuncie vendedores suspeitos imediatamente',
                'Verifique sempre o badge de vendedor verificado',
                'O Kiyvo NUNCA pede dados por e-mail ou WhatsApp',
              ].map((dica) => (
                <div key={dica} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-surface-300">{dica}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* CTA */}
        <FadeInOnScroll className="mt-12 text-center">
          <Link href="/cadastro" className="btn-primary text-lg px-10 py-4 inline-block">
            Criar Conta Grátis
          </Link>
          <p className="text-surface-400 text-sm mt-3">Já tem conta? <Link href="/login" className="text-brand-600 font-semibold">Entrar</Link></p>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
