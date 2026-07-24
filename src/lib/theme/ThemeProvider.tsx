'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ReactNode } from 'react'

/**
 * ThemeProvider — Dark/Light mode com next-themes
 * - Persiste preferência no localStorage
 * - Respeita preferência do sistema operacional
 * - Transição animada entre temas
 * - Suporte a class-based dark mode (Tailwind)
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
      storageKey="kiyvo-theme"
      forcedTheme={undefined}
    >
      {children}
    </NextThemesProvider>
  )
}
