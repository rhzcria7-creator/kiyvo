'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem } from '@/components/ui/AdvancedAnimations'
import { AnimatedDocument, AnimatedSearch } from '@/components/svgs/AnimatedSVGs2'
import { Badge } from '@/components/ui/Badge'

const endpoints = [
  { method: 'GET', path: '/api/products', desc: 'Listar produtos com filtros', auth: false, params: 'category, search, sort, page, limit' },
  { method: 'GET', path: '/api/products/:id', desc: 'Detalhes de um produto', auth: false, params: 'id' },
  { method: 'POST', path: '/api/orders', desc: 'Criar novo pedido', auth: true, params: 'product_id, payment_method' },
  { method: 'GET', path: '/api/orders', desc: 'Listar pedidos', auth: true, params: 'user_id, status' },
  { method: 'GET', path: '/api/search', desc: 'Busca global', auth: false, params: 'q, type (all/products/categories/sellers)' },
  { method: 'GET', path: '/api/users', desc: 'Perfil de usuário', auth: false, params: 'id' },
  { method: 'GET', path: '/api/notifications', desc: 'Listar notificações', auth: true, params: '' },
  { method: 'PUT', path: '/api/notifications', desc: 'Marcar notificação como lida', auth: true, params: 'id' },
]

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-50 text-emerald-700',
  POST: 'bg-blue-50 text-blue-700',
  PUT: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-red-50 text-red-700',
}

export default function ApiDocsPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        <FadeInOnScroll className="text-center mb-12">
          <AnimatedDocument className="w-16 h-16 mx-auto mb-3" />
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">API Documentation</h1>
          <p className="text-surface-500 mt-2 max-w-md mx-auto">Integre a Playdex ao seu sistema. RESTful API com autenticação.</p>
        </FadeInOnScroll>

        {/* Base URL */}
        <FadeInOnScroll className="mb-8">
          <div className="card-base p-5">
            <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Base URL</p>
            <code className="text-sm font-mono text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg">https://api.playdex.com.br/v1</code>
          </div>
        </FadeInOnScroll>

        {/* Auth */}
        <FadeInOnScroll className="mb-8">
          <div className="card-base p-5">
            <h3 className="font-display font-bold text-lg text-surface-900 mb-2">Autenticação</h3>
            <p className="text-sm text-surface-600 mb-3">Endpoints protegidos requerem header Authorization com Bearer token.</p>
            <div className="bg-surface-900 rounded-xl p-4">
              <code className="text-sm font-mono text-emerald-400">Authorization: Bearer {`{your_token}`}</code>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Endpoints */}
        <FadeInOnScroll className="mb-6">
          <h3 className="font-display font-bold text-xl text-surface-900 mb-4">Endpoints</h3>
        </FadeInOnScroll>

        <StaggerContainer className="space-y-3">
          {endpoints.map((ep) => (
            <StaggerItem key={`${ep.method}-${ep.path}`}>
              <motion.div whileHover={{ x: 4 }} className="card-base p-4 hover:shadow-card-hover transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${methodColors[ep.method]}`}>{ep.method}</span>
                  <code className="text-sm font-mono text-surface-900 flex-1">{ep.path}</code>
                  {ep.auth && <Badge variant="warning">Auth</Badge>}
                </div>
                <p className="text-sm text-surface-500 mt-2 ml-16">{ep.desc}</p>
                {ep.params && (
                  <div className="mt-2 ml-16">
                    <span className="text-xs text-surface-400">Params: </span>
                    <code className="text-xs font-mono text-brand-600">{ep.params}</code>
                  </div>
                )}
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Rate Limits */}
        <FadeInOnScroll className="mt-8">
          <div className="card-base p-5">
            <h3 className="font-display font-bold text-lg text-surface-900 mb-2">Rate Limits</h3>
            <div className="grid grid-cols-3 gap-4 mt-3">
              {[
                { plan: 'Free', limit: '100 req/h' },
                { plan: 'Pro', limit: '1.000 req/h' },
                { plan: 'Enterprise', limit: '10.000 req/h' },
              ].map((r) => (
                <div key={r.plan} className="text-center p-3 bg-surface-50 rounded-xl">
                  <p className="text-sm font-semibold text-surface-900">{r.plan}</p>
                  <p className="text-xs text-surface-500">{r.limit}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
