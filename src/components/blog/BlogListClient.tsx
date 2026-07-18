'use client'

// ─────────────────────────────────────────────────────────────
// BlogListClient — Lista de posts do blog
// Recebe dados via props do server component
// ─────────────────────────────────────────────────────────────

import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { Clock, AlertCircle, FileText } from 'lucide-react'

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

// Formata data ISO para DD/MM/YY
function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  } catch {
    return isoDate
  }
}

export function BlogListClient({
  posts,
  error: initialError,
}: {
  posts: BlogPostData[]
  error: string | null
}) {
  // Error state
  if (initialError) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2">
            Blog KIYVO
          </h1>
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle size={32} className="text-red-500" />
            <p className="text-surface-600 dark:text-surface-400 text-sm">{initialError}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary text-sm mt-2"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </PageTransition>
    )
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2">
            Blog KIYVO
          </h1>
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FileText size={32} className="text-surface-300" />
            <p className="text-surface-500 dark:text-surface-400 text-lg font-display font-bold">
              Em breve!
            </p>
            <p className="text-surface-400 dark:text-surface-500 text-sm">
              Estamos preparando conteúdo incrível para você.
            </p>
          </div>
        </div>
      </PageTransition>
    )
  }

  const [featured, ...rest] = posts

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 dark:text-white mb-2">
          Blog KIYVO
        </h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">
          Dicas, novidades e guias sobre produtos digitais
        </p>

        {/* Featured post */}
        {featured && (
          <Card delay={0} className="mb-8">
            <Link href={`/blog/${featured.slug}`} className="block group">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto bg-surface-100 dark:bg-surface-800">
                  {featured.image_url ? (
                    <Image
                      src={featured.image_url}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      📝
                    </div>
                  )}
                </div>
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <Badge variant="brand" className="w-fit mb-3">{featured.category}</Badge>
                  <h2 className="font-display font-bold text-xl lg:text-2xl text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-surface-500 dark:text-surface-400 text-sm mt-3 line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-surface-400">
                    <span>{featured.author_name}</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {featured.read_time}
                    </span>
                    <span>{formatDate(featured.created_at)}</span>
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        )}

        {/* Rest of posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post, i) => (
            <Card key={post.id} delay={i * 0.05}>
              <Link href={`/blog/${post.slug}`} className="block group">
                <div className="relative aspect-video bg-surface-100 dark:bg-surface-800">
                  {post.image_url ? (
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      📝
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <Badge variant="brand" className="mb-2">{post.category}</Badge>
                  <h3 className="font-display font-bold text-surface-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-surface-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {post.read_time}
                    </span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
