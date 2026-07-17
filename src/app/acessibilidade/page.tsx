'use client'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Accessibility, Eye, Keyboard, Volume2, Globe, Smartphone, CheckCircle } from 'lucide-react'

const features = [
  { icon: Eye, title: 'Alto Contraste', desc: 'Modo escuro com contraste WCAG 2.1 AA. Textos legíveis em qualquer condição de iluminação.' },
  { icon: Keyboard, title: 'Navegação por Teclado', desc: 'Todos os elementos interativos acessíveis via Tab, Enter e setas. Skip links em todas as páginas.' },
  { icon: Volume2, title: 'Leitores de Tela', desc: 'Markup semântico com ARIA labels, roles e descriptions. Compatível com NVDA, JAWS e VoiceOver.' },
  { icon: Globe, title: 'Multilíngue', desc: 'Interface em português brasileiro com suporte planejado para inglês e espanhol.' },
  { icon: Smartphone, title: 'Responsivo', desc: 'Design mobile-first. Funciona perfeitamente em qualquer dispositivo e tamanho de tela.' },
  { icon: Accessibility, title: 'Formulários Acessíveis', desc: 'Labels associados, mensagens de erro claras e validação em tempo real.' },
]

const standards = [
  'WCAG 2.1 Nível AA',
  'Lei Brasileira de Inclusão (LBI)',
  'eMAG (Modelo de Acessibilidade em Governo Eletrônico)',
  'WAI-ARIA 1.2',
  'HTML Semântico',
]

export default function AcessibilidadePage() {
  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white flex items-center gap-3 justify-center">
            <Accessibility size={32} className="text-brand-600 dark:text-brand-400" /> Acessibilidade
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-lg mt-3 max-w-2xl mx-auto">
            A Playdex está comprometida com a acessibilidade digital. Todos devem poder comprar e vender com facilidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-base p-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center mb-4">
                <f.icon size={24} className="text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-display font-bold text-surface-900 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-base p-8">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-6">Padrões que seguimos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {standards.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500 dark:text-surface-400">Encontrou um problema de acessibilidade? <a href="/suporte" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Entre em contato</a></p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
