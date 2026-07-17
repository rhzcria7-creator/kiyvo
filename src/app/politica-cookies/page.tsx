'use client'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Cookie } from 'lucide-react'

const cookieTypes = [
  { name: 'Essenciais', desc: 'Necessários para o funcionamento básico do site. Não podem ser desativados.', required: true, examples: ['Supabase Auth (sessão)', 'CSRF Token', 'Preferência de tema', 'Carrinho de compras'] },
  { name: 'Performance', desc: 'Ajuda a entender como os visitantes interagem com o site.', required: false, examples: ['Google Analytics', 'Tempo de carregamento', 'Erros de página'] },
  { name: 'Funcionalidade', desc: 'Permite funcionalidades aprimoradas e personalização.', required: false, examples: ['Preferências do usuário', 'Histórico de busca', 'Recomendações personalizadas'] },
  { name: 'Marketing', desc: 'Usados para rastrear visitantes e exibir anúncios relevantes.', required: false, examples: ['Meta Pixel', 'Google Ads', 'Remarketing'] },
]

export default function PoliticaCookiesPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white flex items-center gap-3"><Cookie size={32} className="text-brand-600 dark:text-brand-400" /> Política de Cookies</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Última atualização: Julho 2026</p>
        </motion.div>

        <div className="mt-8 prose prose-slate dark:prose-invert max-w-none space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">O que são cookies?</h2>
            <p className="text-surface-600 dark:text-surface-400">Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles ajudam a melhorar sua experiência, lembrar preferências e garantir o funcionamento seguro da plataforma.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">Tipos de cookies que usamos</h2>
            <div className="space-y-4 mt-4">
              {cookieTypes.map((ct, i) => (
                <div key={ct.name} className="card-base p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-display font-bold text-surface-900 dark:text-white">{ct.name}</h3>
                    {ct.required && <span className="px-2 py-0.5 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-full">Obrigatório</span>}
                    {!ct.required && <span className="px-2 py-0.5 bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-xs font-bold rounded-full">Opcional</span>}
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">{ct.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {ct.examples.map(ex => (
                      <span key={ex} className="px-2 py-0.5 bg-surface-50 dark:bg-surface-800 text-xs text-surface-500 dark:text-surface-400 rounded">{ex}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">Como gerenciar cookies</h2>
            <p className="text-surface-600 dark:text-surface-400">Você pode gerenciar suas preferências de cookies a qualquer momento nas configurações do navegador. Note que desativar cookies essenciais pode afetar o funcionamento da plataforma.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white">Contato</h2>
            <p className="text-surface-600 dark:text-surface-400">Para dúvidas sobre cookies, entre em contato: <span className="text-brand-600 dark:text-brand-400">privacidade@kiyvo.com.br</span></p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
