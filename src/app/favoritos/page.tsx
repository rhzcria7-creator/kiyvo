'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { StaggerContainer, StaggerItem } from '@/components/animations'
import { mockProducts } from '@/data/mockProducts'
import { ProductCard } from '@/components/product/ProductCard'

export default function FavoritosPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      supabase.from('favorites').select('product_id').eq('user_id', user.id).then(({ data }) => {
        if (data) setFavorites(data.map(f => f.product_id))
      })
    }
  }, [user, supabase])

  const favProducts = mockProducts.filter(p => favorites.includes(p.id) || p.featured)

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-3xl text-surface-900 flex items-center gap-3">
            <Heart size={28} className="text-red-500" /> Meus Favoritos
          </h1>
          <p className="text-surface-500 text-sm mt-1">{favProducts.length} produtos salvos</p>
        </motion.div>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
          {favProducts.map((product) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={0} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {favProducts.length === 0 && (
          <div className="text-center py-20">
            <Heart size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-400 text-lg">Nenhum favorito ainda</p>
            <p className="text-surface-400 text-sm mt-2">Clique no ❤️ em produtos para salvar aqui</p>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
