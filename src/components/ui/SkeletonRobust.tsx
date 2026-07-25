'use client'

// ─────────────────────────────────────────────────────────────
// Skeleton Robust v0.0.1 — Shimmer GPU acelerado
// Usa CSS animation com transform GPU para performance
// Variantes para produtos, reviews, biblioteca, notificações, orders
// ─────────────────────────────────────────────────────────────

import React from 'react'
import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  count?: number
}

/**
 * Skeleton base com shimmer GPU acelerado
 */
function SkeletonBase({ className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-800',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/5 before:to-transparent',
        'before:animate-shimmer before:bg-[length:200%_100%]',
        className
      )}
    />
  )
}

/**
 * Skeleton para card de produto
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
      <SkeletonBase className="aspect-[4/3] !rounded-none" />
      <div className="p-4 space-y-3">
        <SkeletonBase className="h-4 w-3/4" />
        <SkeletonBase className="h-3 w-full" />
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-3 w-16" />
          <SkeletonBase className="h-3 w-12" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <SkeletonBase className="h-6 w-20" />
          <SkeletonBase className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton para lista de produtos
 */
export function ProductListSkeleton({ count = 6 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para review
 */
export function ReviewSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <SkeletonBase className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-3 w-16" />
        </div>
        <SkeletonBase className="h-3 w-1/3" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>
    </div>
  )
}

/**
 * Skeleton para biblioteca (grid de itens comprados)
 */
export function LibrarySkeleton({ count = 8 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
          <SkeletonBase className="aspect-video !rounded-none" />
          <div className="p-3 space-y-2">
            <SkeletonBase className="h-3 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para notificações
 */
export function NotificationSkeleton({ count = 5 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <SkeletonBase className="w-8 h-8 rounded-lg shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBase className="h-4 w-2/3" />
            <SkeletonBase className="h-3 w-full" />
            <SkeletonBase className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton para orders/pedidos
 */
export function OrderSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-3">
            <SkeletonBase className="h-4 w-32" />
            <SkeletonBase className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex gap-3">
            <SkeletonBase className="w-16 h-16 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBase className="h-4 w-2/3" />
              <SkeletonBase className="h-3 w-1/3" />
              <SkeletonBase className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export { SkeletonBase }
