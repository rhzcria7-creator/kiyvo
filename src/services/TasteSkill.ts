// ─────────────────────────────────────────────────────────────
// TASTE Skill v0.0.1 — Apple/Linear/Stripe/Vercel Geist design tokens
// oklch gradients sutis, border white/10, shadow-2xl, etc
// ─────────────────────────────────────────────────────────────

/**
 * TASTE Design System — tokens de estilo consistentes
 * Inspirado em: Apple, Linear, Stripe, Vercel (Geist)
 */

export const TASTE = {
  // Border radius
  radius: {
    card: 'rounded-2xl',        // 16px
    button: 'rounded-full',     // Pill
    input: 'rounded-xl',        // 12px
    badge: 'rounded-full',
    modal: 'rounded-2xl',
  },

  // Borders
  border: {
    card: 'border border-zinc-200/50 dark:border-zinc-800/50',
    cardHover: 'hover:border-zinc-300 dark:hover:border-zinc-700',
    input: 'border border-zinc-300 dark:border-zinc-700',
    inputFocus: 'focus:border-zinc-500 dark:focus:border-zinc-400',
    divider: 'border-t border-zinc-100 dark:border-zinc-800',
  },

  // Shadows
  shadow: {
    card: 'shadow-sm',
    cardHover: 'hover:shadow-xl',
    modal: 'shadow-2xl',
    dropdown: 'shadow-lg',
    button: 'shadow-sm',
  },

  // Glassmorphism
  glass: {
    light: 'bg-white/80 backdrop-blur-xl',
    dark: 'dark:bg-zinc-900/80 dark:backdrop-blur-xl',
    mobile: 'max-md:backdrop-blur-none', // Desliga no mobile
  },

  // Gradients
  gradient: {
    brand: 'bg-gradient-to-r from-blue-600 to-purple-600',
    warm: 'bg-gradient-to-br from-amber-500 to-rose-500',
    cool: 'bg-gradient-to-br from-blue-500 to-indigo-500',
    accent: 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5',
    card: 'bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950',
  },

  // Text
  text: {
    heading: 'text-zinc-900 dark:text-white font-bold',
    body: 'text-zinc-600 dark:text-zinc-400',
    muted: 'text-zinc-400 dark:text-zinc-500',
    price: 'text-lg font-bold text-zinc-900 dark:text-white',
    small: 'text-xs text-zinc-500 dark:text-zinc-500',
  },

  // Transitions
  transition: {
    all: 'transition-all duration-200',
    transform: 'transition-transform duration-200',
    colors: 'transition-colors duration-200',
    shadow: 'transition-shadow duration-300',
  },

  // Animations (Framer Motion)
  animation: {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.97 },
    viewport: { once: true },
    transition: { type: 'spring' as const, damping: 22, stiffness: 200 },
  },

  // Input
  input: {
    base: 'w-full bg-transparent border outline-none text-base',
    size: 'h-11 px-4 py-2.5',
    mobile: 'text-base max-md:text-base', // 16px evita zoom iOS
    touch: 'touch-manipulation',
  },

  // Touch targets (44px minimum for mobile)
  touch: {
    min: 'min-w-[44px] min-h-[44px]',
    icon: 'w-11 h-11',
    button: 'h-11 px-6',
  },
} as const

/**
 * Classe utilitária para combinar tokens TASTE
 */
export function tasteClasses(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Gera classes para card no estilo TASTE
 */
export function tasteCard(extra?: string): string {
  return tasteClasses(
    TASTE.radius.card,
    TASTE.border.card,
    TASTE.border.cardHover,
    TASTE.shadow.card,
    TASTE.shadow.cardHover,
    TASTE.glass.light,
    TASTE.glass.dark,
    TASTE.glass.mobile,
    TASTE.transition.all,
    extra
  )
}

/**
 * Gera classes para botão primário
 */
export function tasteButton(extra?: string): string {
  return tasteClasses(
    TASTE.radius.button,
    TASTE.touch.button,
    'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900',
    'hover:opacity-90 active:scale-[0.98]',
    'font-medium text-sm',
    TASTE.shadow.button,
    TASTE.transition.all,
    extra
  )
}
