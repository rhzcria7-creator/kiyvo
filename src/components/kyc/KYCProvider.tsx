'use client'
// KYCProvider — inicializa TODOS os stores client-side na ordem correta.
// Adicionado aqui para garantir que qualquer página (não só checkout/library)
// tenha os stores carregados. Comentários em PT-BR.
import { useEffect } from 'react'
import { useKYC } from '@/lib/kyc/store'
import { useCart } from '@/lib/cart/store'
import { useFavorites } from '@/lib/favorites/store'
import { useUserProducts } from '@/lib/userProducts/store'
import { useSellerCoupons } from '@/lib/coupons/store'
import { useReviews } from '@/lib/reviews/store'
import { useShorts } from '@/lib/shorts/store'
import { usePlatformRecs } from '@/lib/recommendations/store'
import { usePurchases } from '@/lib/purchases/store'
import { useKD } from '@/lib/kd/store'
import { useRecent } from '@/lib/recent/store'
import { useNotif } from '@/lib/notifications/store'
import { useBoost } from '@/lib/boost/store'

export function KYCProvider({ children }: { children: React.ReactNode }) {
  const kycInit = useKYC(s => s.init)
  const cartInit = useCart(s => s.init)
  const favInit = useFavorites(s => s.init)
  const upInit = useUserProducts(s => s.init)
  const couponsInit = useSellerCoupons(s => s.init)
  const reviewsInit = useReviews(s => s.init)
  const shortsInit = useShorts(s => s.init)
  const recsInit = usePlatformRecs(s => s.init)
  const purchasesInit = usePurchases(s => s.init)
  const kdInit = useKD(s => s.init)
  const recentInit = useRecent(s => s.init)
  const notifInit = useNotif(s => s.init)
  const boostInit = useBoost(s => s.init)

  useEffect(() => {
    kycInit(); cartInit(); favInit(); upInit(); couponsInit(); reviewsInit()
    shortsInit(); recsInit(); purchasesInit(); kdInit(); recentInit(); notifInit()
    boostInit()
  }, [kycInit, cartInit, favInit, upInit, couponsInit, reviewsInit, shortsInit, recsInit, purchasesInit, kdInit, recentInit, notifInit, boostInit])

  return <>{children}</>
}
