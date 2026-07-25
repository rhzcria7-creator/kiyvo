'use client'

// ─────────────────────────────────────────────────────────────
// BlogCard v0.0.1 — Card de blog para listagem
// Capa, título, excerpt, tags, tempo de leitura, autor
// ─────────────────────────────────────────────────────────────

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Eye, ArrowRight, Calendar } from 'lucide-react'
import clsx from 'clsx'

interface BlogCardProps {
  title: string
  slug: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  authorName: string
  authorAvatar?: string
  readingTime: number
  viewCount: number
  publishedAt: string
  index?: number
}

export default function BlogCard({
  title, slug, excerpt, coverImage, category, tags,
  authorName, authorAvatar, readingTime, viewCount, publishedAt, index = 0,
}: BlogCardProps) {
  const date = new Date(publishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <motion.a
      href={`/blog/${slug}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, type: 'spring', damping: 22 }}
      className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl transition-all"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {coverImage ? (
          <img src={coverImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📝</span>
          </div>
        )}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-[10px] font-semibold rounded-full text-zinc-700 dark:text-zinc-300">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-sm md:text-base text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 flex-1">
          {excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">{authorName}</p>
              <p className="text-[10px] text-zinc-400">{date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{readingTime}min</span>
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{viewCount}</span>
          </div>
        </div>
      </div>
    </motion.a>
  )
}
