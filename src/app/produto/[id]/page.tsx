// ─────────────────────────────────────────────────────────────
// Produto [id] — Redirect para /p/[slug] (versão real)
// Mantém compatibilidade com URLs antigas
// ─────────────────────────────────────────────────────────────

'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Loader2 } from 'lucide-react'

export default function ProdutoRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function resolveSlug() {
      const id = params.id as string

      // Se já é um slug (contém letras e hífens), redirecionar diretamente
      if (id && id.includes('-') && isNaN(Number(id))) {
        router.replace(`/p/${id}`)
        return
      }

      // Buscar slug pelo ID no Supabase
      try {
        const res = await fetch(`/api/products?id=${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.product?.slug) {
            router.replace(`/p/${data.product.slug}`)
            return
          }
        }
      } catch {
        // Erro na busca
      }

      setNotFound(true)
    }
    resolveSlug()
  }, [params.id, router])

  if (notFound) {
    return (
      <PageTransition>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-2">Produto não encontrado</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm">Este produto pode ter sido removido ou o link está incorreto.</p>
          <a href="/categorias" className="btn-primary inline-block mt-4">Ver Categorias</a>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={32} className="text-brand-600 dark:text-brand-400" />
        </motion.div>
      </div>
    </PageTransition>
  )
}
