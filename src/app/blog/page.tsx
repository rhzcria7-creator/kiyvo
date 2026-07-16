'use client'

import Link from 'next/link'
import Image from 'next/image'
import { mockBlog } from '@/data/mockBlog'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageTransition } from '@/components/shared/PageTransition'
import { Clock } from 'lucide-react'

export default function BlogPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-2">Blog Playdex</h1>
        <p className="text-surface-500 mb-8">Dicas, guias e novidades do mundo gaming</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBlog.map((post, i) => (
            <Card key={post.id} delay={i * 0.06}>
              <Link href={`/blog/${post.slug}`} className="block group">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image src={post.image} alt={post.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-5">
                  <Badge variant="brand" className="mb-2">{post.category}</Badge>
                  <h2 className="font-display font-bold text-surface-900 group-hover:text-brand-600 transition-colors">{post.title}</h2>
                  <p className="mt-2 text-sm text-surface-500 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-surface-400">
                    <img src={post.authorAvatar} alt={post.author} className="w-5 h-5 rounded-full" />
                    <span>{post.author}</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{post.readTime}</span>
                    <span>•</span>
                    <span>{post.createdAt}</span>
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
