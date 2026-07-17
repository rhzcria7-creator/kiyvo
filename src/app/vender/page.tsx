'use client'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Rocket, ShoppingBag, Shield, CreditCard, Star, Users, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const steps = [
  { icon: Users, title: 'Crie sua conta', desc: 'Cadastro gratuito em 30 segundos. Sem cartão de crédito.' },
  { icon: Shield, title: 'Verifique sua identidade', desc: 'KYC rápido: CPF, data de nascimento e selfie. Aprovação em até 24h.' },
  { icon: ShoppingBag, title: 'Crie seu anúncio', desc: 'Adicione título, descrição, preço e imagens. Publique em segundos.' },
  { icon: CreditCard, title: 'Receba pagamentos', desc: 'Comprador paga via Stripe (PIX, cartão, boleto). Dinheiro retido com segurança.' },
  { icon: Star, title: 'Entregue e receba', desc: 'Entregue o produto digital. Após confirmação, o pagamento é liberado.' },
]

const benefits = [
  'Sem taxa de listagem — pague só quando vender',
  'Proteção ao vendedor — dinheiro garantido',
  'Checkout otimizado — 3x mais conversão',
  'Dashboard completo — métricas em tempo real',
  'Suporte prioritário — chat direto com a equipe',
  'KD Points — ganhe recompensas em cada venda',
]

export default function VenderPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-4">
            <Rocket size={14} /> Venda sem limites
          </span>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white leading-tight">
            Comece a vender em <span className="gradient-text">5 minutos</span>
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 mt-4 max-w-2xl mx-auto">
            Venda jogos, software, cursos, e-books, templates, APIs e qualquer produto digital. Zero burocracia, máxima segurança.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/cadastro"><Button size="lg" icon={<Rocket size={18} />}>Criar Conta Grátis</Button></Link>
            <Link href="/planos"><Button variant="secondary" size="lg">Ver Planos</Button></Link>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-8">Como funciona</h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-brand-600 dark:text-brand-400">{i + 1}</span>
                </div>
                <div className="card-base p-5 flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <step.icon size={18} className="text-brand-600 dark:text-brand-400" />
                    <h3 className="font-display font-bold text-surface-900 dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-base p-8 mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-6">Por que vender na Kiyvo?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }} className="flex items-center gap-3 p-3">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span className="text-sm text-surface-700 dark:text-surface-300">{b}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
          <div className="card-base p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
            <h2 className="font-display font-extrabold text-2xl">Pronto para começar?</h2>
            <p className="text-brand-100 mt-2">Junte-se a +1M usuários que já confiam na Kiyvo.</p>
            <Link href="/cadastro"><Button size="lg" className="mt-6 bg-white text-brand-600 hover:bg-brand-50">Criar Conta Grátis <ArrowRight size={16} /></Button></Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
