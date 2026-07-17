// ─────────────────────────────────────────────────────────────
// BlogSection — Posts reais do Supabase
// Busca posts publicados em tempo real, zero mock
// ─────────────────────────────────────────────────────────────

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { ArrowRight, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  image_url: string | null
  author_name: string
  author_avatar: string | null
  read_time: string
  created_at: string
  category: string
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/v1/blog?limit=3')
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
        }
      } catch {
        // Erro silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (!loading && posts.length === 0) {
    return null // Não mostra seção se não há posts
  }

  return (
    <section className="py-16 lg:py-20 bg-surface-50 dark:bg-surface-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white">
              Blog Kiyvo
            </h2>
            <p className="mt-1 text-surface-500 dark:text-surface-400 text-sm">Dicas, guias e novidades do mundo digital</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors font-display"
          >
            Ver mais <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="card-base overflow-hidden">
                <div className="aspect-[16/9] bg-surface-200 dark:bg-surface-800 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-20" />
                  <div className="h-5 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-full" />
                  <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded animate-pulse w-3/4" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {posts.map((post, i) => (
              <Card key={post.id} delay={i * 0.08}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {post.image_url ? (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-400 dark:from-brand-800 dark:to-brand-600 flex items-center justify-center">
                        <span className="text-white text-3xl font-display font-bold">P</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 mb-3">{post.category}</span>
                    <h3 className="font-display font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{post.excerpt}</p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-surface-400">
                      {post.author_avatar ? (
                        <img src={post.author_avatar} alt={post.author_name} className="w-5 h-5 rounded-full" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-brand-600">{post.author_name.charAt(0)}</span>
                        </div>
                      )}
                      <span>{post.author_name}</span>
                      <span>•</span>
                      <Clock size={12} />
                      <span>{post.read_time || '5 min'}</span>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
