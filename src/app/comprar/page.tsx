'use client'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Search, Shield, CreditCard, Zap, Heart, Star, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const steps = [
  { icon: Search, title: 'Encontre o produto', desc: 'Busque entre milhares de produtos digitais com filtros avançados.' },
  { icon: Heart, title: 'Escolha e proteja', desc: 'Compare preços, leia avaliações e adicione aos favoritos.' },
  { icon: CreditCard, title: 'Pague com segurança', desc: 'PIX, cartão de crédito ou boleto. Pagamento retido até a entrega.' },
  { icon: Zap, title: 'Receba instantaneamente', desc: 'Produtos digitais entregues em segundos após a confirmação.' },
  { icon: Star, title: 'Avalie e ganhe', desc: 'Avalie o vendedor e ganhe PD Points em cada compra.' },
]

const guarantees = [
  'Dinheiro de volta se não receber o produto',
  'Pagamento retido até confirmação de entrega',
  'Verificação de identidade de todos os vendedores',
  'Suporte 24/7 para resolução de problemas',
  'Disputa automática em caso de problemas',
  'Avaliações reais de compradores verificados',
]

export default function ComprarPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/40 rounded-full text-sm font-medium text-brand-700 dark:text-brand-400 mb-4">
            <Shield size={14} /> Compra 100% segura
          </span>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white leading-tight">
            Compre digital com <span className="gradient-text">total segurança</span>
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 mt-4 max-w-2xl mx-auto">
            Produtos digitais verificados, pagamento protegido e entrega instantânea. Sua compra garantida ou seu dinheiro de volta.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/categorias"><Button size="lg" icon={<Search size={18} />}>Explorar Catálogo</Button></Link>
            <Link href="/garantia"><Button variant="secondary" size="lg">Saiba sobre Garantia</Button></Link>
          </div>
        </motion.div>

        <div className="mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-8">Como comprar</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mx-auto mb-3">
                  <step.icon size={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white mb-1">{step.title}</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-base p-8 mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-6">🛡️ Garantia Playdex</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guarantees.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }} className="flex items-center gap-3 p-3">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span className="text-sm text-surface-700 dark:text-surface-300">{g}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center">
          <div className="card-base p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
            <h2 className="font-display font-extrabold text-2xl">Encontre o que precisa</h2>
            <p className="text-brand-100 mt-2">+10.000 produtos digitais esperando por você.</p>
            <Link href="/categorias"><Button size="lg" className="mt-6 bg-white text-brand-600 hover:bg-brand-50">Ver Categorias <ArrowRight size={16} /></Button></Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
