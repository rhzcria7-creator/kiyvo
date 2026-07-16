import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton h-4 w-full', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div className="card-base p-0 overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
