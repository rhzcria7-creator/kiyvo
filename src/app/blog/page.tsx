'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { Clock, Loader2, AlertCircle, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  image_url: string | null
  category: string
  read_time: string
  created_at: string
  author_name: string
  author_avatar: string | null
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/v1/blog?limit=20')
        if (!res.ok) throw new Error('Erro ao carregar posts')
        const data = await res.json()
        setPosts(data.posts || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  // Formata data ISO para DD/MM/YY
  const formatDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate)
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
    } catch {
      return isoDate
    }
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-2">Blog Kiyvo</h1>
        <p className="text-surface-500 mb-8">Dicas, guias e novidades do mundo digital</p>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={32} className="animate-spin text-brand-600" />
            <p className="text-surface-500 text-sm">Carregando artigos...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-surface-600 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-sm mt-2">Tentar novamente</button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FileText size={32} className="text-surface-300" />
            <p className="text-surface-500 text-lg font-display font-bold">Nenhum artigo publicado ainda</p>
            <p className="text-surface-400 text-sm">Novos conteúdos serão adicionados em breve.</p>
          </div>
        )}

        {/* Posts grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <Card key={post.id} delay={i * 0.06}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  {post.image_url && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image src={post.image_url} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                  )}
                  <div className="p-5">
                    <Badge variant="brand" className="mb-2">{post.category}</Badge>
                    <h2 className="font-display font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{post.title}</h2>
                    <p className="mt-2 text-sm text-surface-500 line-clamp-2">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-surface-400">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt={post.author_name} className="w-5 h-5 rounded-full" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-[10px] font-bold">{post.author_name[0]}</div>
                      )}
                      <span>{post.author_name}</span>
                      <span>•</span>
                      <Clock size={12} />
                      <span>{post.read_time}</span>
                      <span>•</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
