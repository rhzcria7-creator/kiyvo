'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowLeft, Heart, Share2, Loader2, AlertCircle, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string | null
  image_url: string | null
  category: string
  read_time: string
  created_at: string
  author_name: string
  author_avatar: string | null
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPostData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/v1/blog?slug=${encodeURIComponent(slug)}`)
        if (!res.ok) throw new Error('Erro ao carregar artigo')
        const data = await res.json()
        setPost(data.post || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchPost()
  }, [slug])

  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    } catch {
      return isoDate
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand-600" />
          <p className="text-surface-500 text-sm">Carregando artigo...</p>
        </div>
      </PageTransition>
    )
  }

  if (error || !post) {
    return (
      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-3">
          <AlertCircle size={32} className="text-red-500" />
          <p className="text-surface-600 text-sm">{error || 'Artigo não encontrado'}</p>
          <Link href="/blog" className="btn-secondary text-sm mt-2">Voltar ao Blog</Link>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold mb-6 hover:text-brand-700">
          <ArrowLeft size={16} /> Voltar ao Blog
        </Link>

        <Badge variant="brand" className="mb-3">{post.category}</Badge>
        <h1 className="font-display font-extrabold text-3xl text-surface-900 leading-snug">{post.title}</h1>

        <div className="flex items-center gap-3 mt-4 mb-6">
          {post.author_avatar ? (
            <img src={post.author_avatar} alt={post.author_name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-sm font-bold">{post.author_name[0]}</div>
          )}
          <span className="text-sm font-medium text-surface-700">{post.author_name}</span>
          <span className="text-surface-300">•</span>
          <Clock size={14} className="text-surface-400" />
          <span className="text-sm text-surface-400">{post.read_time}</span>
          <span className="text-surface-300">•</span>
          <span className="text-sm text-surface-400">{formatDate(post.created_at)}</span>
        </div>

        {post.image_url && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
            <Image src={post.image_url} alt={post.title} fill className="object-cover" sizes="800px" priority />
          </div>
        )}

        <div className="prose prose-slate max-w-none text-surface-600 leading-relaxed">
          <p className="font-medium text-surface-700">{post.excerpt}</p>
          {post.content ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <div className="mt-6 p-6 bg-surface-50 rounded-2xl text-center">
              <FileText size={24} className="text-surface-300 mx-auto mb-2" />
              <p className="text-surface-400 text-sm">Conteúdo completo será disponibilizado em breve.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-100">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-sm text-surface-500 hover:text-red-500 transition-colors">
            <Heart size={18} /> Curtir
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors">
            <Share2 size={18} /> Compartilhar
          </motion.button>
        </div>
      </article>
    </PageTransition>
  )
}
