'use client'

// ─────────────────────────────────────────────────────────────
// ImageGallery v0.0.1 — Galeria de imagens com zoom
// Thumbnails, navegação, zoom lupa, fullscreen
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import clsx from 'clsx'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export default function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)

  const currentImage = images[currentIndex] || images[0]
  const hasMultiple = images.length > 1

  const next = useCallback(() => {
    setCurrentIndex(i => (i + 1) % images.length)
  }, [images.length])

  const prev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + images.length) % images.length)
  }, [images.length])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || !zoom) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [zoom])

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <span className="text-zinc-400 text-sm">Sem imagem</span>
      </div>
    )
  }

  return (
    <>
      <div className={clsx('relative', className)}>
        {/* Main Image */}
        <div
          ref={imageRef}
          className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-crosshair group"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
        >
          <img
            src={currentImage}
            alt={`${alt} ${currentIndex + 1}`}
            className={clsx(
              'w-full h-full object-cover transition-transform duration-200',
              zoom && 'scale-150'
            )}
            style={zoom ? {
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            } : undefined}
          />

          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <Expand className="w-4 h-4" />
          </button>

          {/* Index badge */}
          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded-full">
              {currentIndex + 1}/{images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={clsx(
                  'w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all',
                  index === currentIndex
                    ? 'border-zinc-900 dark:border-white opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-80'
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={currentImage}
              alt={alt}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />

            {hasMultiple && (
              <>
                <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
