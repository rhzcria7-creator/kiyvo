'use client'

// ─────────────────────────────────────────────────────────────
// ShareButton v0.0.1 — Compartilhar via Web Share API + clipboard
// Fallback para clipboard, suporta link + texto + imagem
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Share2, Link, Check, X } from 'lucide-react'
import clsx from 'clsx'

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  imageUrl?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ShareButton({ url, title, description, imageUrl, size = 'md', className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    // Tentar Web Share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        })
        return
      } catch (err: any) {
        if (err.name === 'AbortError') return
      }
    }

    // Fallback: copiar link
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Último fallback
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [url, title, description])

  const sizeClasses = size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className={clsx(
        'rounded-full flex items-center justify-center transition-colors',
        copied
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
        sizeClasses,
        className
      )}
      title={copied ? 'Link copiado!' : 'Compartilhar'}
    >
      {copied ? <Check className={iconSize} /> : <Share2 className={iconSize} />}
    </motion.button>
  )
}
