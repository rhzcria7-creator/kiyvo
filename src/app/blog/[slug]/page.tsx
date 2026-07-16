'use client'

import { mockBlog } from '@/data/mockBlog'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, ArrowLeft, Heart, Share2 } from 'lucide-react'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const post = mockBlog.find(p => p.slug === slug) || mockBlog[0]

  return (
    <PageTransition>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold mb-6 hover:text-brand-700">
          <ArrowLeft size={16} /> Voltar ao Blog
        </Link>

        <Badge variant="brand" className="mb-3">{post.category}</Badge>
        <h1 className="font-display font-extrabold text-3xl text-surface-900 leading-snug">{post.title}</h1>

        <div className="flex items-center gap-3 mt-4 mb-6">
          <img src={post.authorAvatar} alt={post.author} className="w-8 h-8 rounded-full" />
          <span className="text-sm font-medium text-surface-700">{post.author}</span>
          <span className="text-surface-300">•</span>
          <Clock size={14} className="text-surface-400" />
          <span className="text-sm text-surface-400">{post.readTime}</span>
          <span className="text-surface-300">•</span>
          <span className="text-sm text-surface-400">{post.createdAt}</span>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden mb-8">
          <Image src={post.image} alt={post.title} fill className="object-cover" sizes="800px" priority />
        </div>

        <div className="prose prose-slate max-w-none text-surface-600 leading-relaxed">
          <p>{post.excerpt}</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <h2 className="font-display font-bold text-xl text-surface-900 mt-8">Detalhes e Dicas</h2>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-100">
          <button className="flex items-center gap-2 text-sm text-surface-500 hover:text-red-500 transition-colors">
            <Heart size={18} /> Curtir
          </button>
          <button className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors">
            <Share2 size={18} /> Compartilhar
          </button>
        </div>
      </article>
    </PageTransition>
  )
}
