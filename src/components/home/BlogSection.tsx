'use client'

import Link from 'next/link'
import Image from 'next/image'
import { mockBlog } from '@/data/mockBlog'
import { Card } from '@/components/ui/Card'
import { ArrowRight, Clock } from 'lucide-react'

export function BlogSection() {
  return (
    <section className="py-16 lg:py-20 bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900">
              Blog Playdex
            </h2>
            <p className="mt-1 text-surface-500 text-sm">Dicas, guias e novidades do mundo digital</p>
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors font-display"
          >
            Ver mais <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {mockBlog.slice(0, 3).map((post, i) => (
            <Card key={post.id} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`} className="block group">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <span className="badge bg-brand-50 text-brand-700 mb-3">{post.category}</span>
                  <h3 className="font-display font-bold text-surface-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-surface-500 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-surface-400">
                    <img src={post.authorAvatar} alt={post.author} className="w-5 h-5 rounded-full" />
                    <span>{post.author}</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
