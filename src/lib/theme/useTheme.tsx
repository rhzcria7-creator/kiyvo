'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * Hook useTheme — acessa e controla o tema atual
 * - resolvedTheme: tema real aplicado ('light' ou 'dark')
 * - theme: tema selecionado ('light', 'dark', 'system')
 * - setTheme: altera o tema
 * - toggleTheme: alterna entre light e dark
 * - mounted: se o componente já montou (evita hydration mismatch)
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }

  return {
    theme,
    setTheme,
    resolvedTheme: mounted ? resolvedTheme : undefined,
    systemTheme,
    toggleTheme,
    isDark: mounted ? resolvedTheme === 'dark' : false,
    isLight: mounted ? resolvedTheme === 'light' : false,
    mounted,
  }
}
