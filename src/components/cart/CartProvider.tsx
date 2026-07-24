'use client'
import { useEffect } from 'react'
import { useCart } from '@/lib/cart/store'
import { useFavorites } from '@/lib/favorites/store'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const initCart = useCart((s) => s.init)
  const initFavs = useFavorites((s) => s.init)
  useEffect(() => {
    initCart()
    initFavs()
  }, [initCart, initFavs])
  return <>{children}</>
}
