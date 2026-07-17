'use client'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Rocket, Shield, Palette, Database, CreditCard, Zap } from 'lucide-react'

const versions = [
  { version: '3.0.0', date: 'Julho 2026', badge: 'Atual', color: 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400', features: [
    { icon: Palette, text: 'Dark/Light Mode com transições animadas' },
    { icon: Shield, text: 'Segurança v2: CSRF, bot detection, auto-block IP' },
    { icon: Database, text: 'Setup automático via API — zero SQL manual' },
    { icon: CreditCard, text: 'Stripe com PIX, Boleto e Cartão' },
    { text: 'Health check automático em /api/health' },
    { text: 'SEO: sitemap.xml, robots.txt, Open Graph, JSON-LD' },
    { text: '7 novas páginas: Status, Setup, Vender, Comprar, Changelog, Parceiros, Cookies' },
    { text: 'Webhook Stripe com atualização automática de pedidos' },
    { text: '+65 páginas totais, 10 API routes' },
  ]},
  { version: '2.0.0', date: 'Junho 2026', badge: 'Estável', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400', features: [
    { text: 'Expansão para marketplace de TODOS os produtos digitais' },
    { text: '20 categorias de produtos digitais' },
    { text: 'Chat em tempo real entre comprador e vendedor' },
    { text: 'Comunidade e fórum de discussão' },
    { text: 'Programa de afiliados' },
    { text: '30+ tabelas no banco de dados' },
  ]},
  { version: '1.0.0', date: 'Maio 2026', badge: 'Legado', color: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400', features: [
    { text: 'Lançamento inicial — marketplace de jogos' },
    { text: 'Autenticação com Supabase Auth' },
    { text: 'KYC verificação de identidade' },
    { text: 'Checkout com Stripe' },
    { text: '58 páginas e 8 API routes' },
    { text: 'Framer Motion em 100% dos componentes' },
  ]},
]

export default function ChangelogPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white flex items-center gap-3"><Rocket size={32} className="text-brand-600 dark:text-brand-400" /> Changelog</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Histórico de todas as atualizações da Playdex</p>
        </motion.div>
        <div className="mt-10 space-y-8">
          {versions.map((v, vi) => (
            <motion.div key={v.version} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: vi * 0.1 }}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">v{v.version}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${v.color}`}>{v.badge}</span>
                <span className="text-xs text-surface-400">{v.date}</span>
              </div>
              <div className="card-base p-5">
                <ul className="space-y-2">
                  {v.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
                      {f.icon ? <f.icon size={16} className="text-brand-500 dark:text-brand-400 shrink-0" /> : <Zap size={16} className="text-brand-500 dark:text-brand-400 shrink-0" />}
                      {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
