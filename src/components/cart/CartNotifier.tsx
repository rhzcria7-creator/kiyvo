'use client'
// ─────────────────────────────────────────────────────────────
// CartNotifier — observa o carrinho e, quando um item é adicionado,
// mostra um toast "Adicionado ao carrinho" com CTA "Ver carrinho"
// que abre o MiniCart (via evento global kiyvo:open-cart).
// Não renderiza nada visual além do toast.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useCart } from '@/lib/cart/store'

export function CartNotifier() {
  const count = useCart((s) => s.total().itens)
  const prev = useRef(count)

  useEffect(() => {
    if (count > prev.current) {
      toast.custom(
        (t) => (
          <div
            className="flex items-center gap-3 rounded-2xl bg-[#0F172A] text-white px-4 py-3 shadow-2xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="text-sm font-bold">Adicionado ao carrinho 🛒</span>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new Event('kiyvo:open-cart'))
                toast.dismiss(t.id)
              }}
              className="text-xs font-black uppercase tracking-wide bg-brand-600 hover:bg-brand-500 transition-colors rounded-full px-3 py-1.5"
            >
              Ver carrinho
            </button>
          </div>
        ),
        { id: 'cart-add', duration: 2600 },
      )
    }
    prev.current = count
  }, [count])

  return null
}

export default CartNotifier
