// Global loading state — Skeleton shimmer with dark mode
export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-white font-display font-extrabold text-2xl">P</span>
          </div>
          <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl animate-ping opacity-20" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-surface-400 dark:text-surface-500 font-medium">Carregando...</p>
      </div>
    </div>
  )
}
