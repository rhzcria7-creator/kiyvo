'use client'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Handshake, Globe, GraduationCap, Gamepad2, Code, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

const partners = [
  { icon: Globe, name: 'TechBrasil', type: 'Integração', desc: 'API de verificação de identidade em tempo real.' },
  { icon: GraduationCap, name: 'EduTech Academy', type: 'Conteúdo', desc: 'Cursos verificados com certificação digital.' },
  { icon: Gamepad2, name: 'GameKeys Pro', type: 'Games', desc: 'Distribuidor oficial de chaves Steam e consoles.' },
  { icon: Code, name: 'DevTools Cloud', type: 'Software', desc: 'Licenças de software para desenvolvedores.' },
  { icon: ShoppingBag, name: 'DigiStore BR', type: 'Marketplace', desc: 'Integração de catálogo cross-platform.' },
]

export default function ParceirosPage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white flex items-center gap-3 justify-center">
            <Handshake size={32} className="text-brand-600 dark:text-brand-400" /> Parceiros
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-lg mt-3 max-w-2xl mx-auto">
            Empresas e plataformas que confiam na Kiyvo para entregar produtos digitais com segurança.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {partners.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-base p-6 hover:shadow-card-hover dark:hover:shadow-dark-glow">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mb-4">
                <p.icon size={24} className="text-brand-600 dark:text-brand-400" />
              </div>
              <span className="inline-flex px-2 py-0.5 bg-surface-100 dark:bg-surface-800 rounded-full text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">{p.type}</span>
              <h3 className="font-display font-bold text-surface-900 dark:text-white">{p.name}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-8">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-6">Seja um parceiro</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {['Integração de API gratuita', 'Comissão sobre vendas indicadas', 'Acesso antecipado a novos recursos', 'Suporte dedicado para parceiros', 'Co-branding na plataforma', 'Dashboard de métricas compartilhado'].map((b, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span className="text-sm text-surface-700 dark:text-surface-300">{b}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/suporte"><Button size="lg" icon={<ArrowRight size={16} />}>Solicitar Parceria</Button></Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
