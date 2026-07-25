import { quoteMultiVendorCheckout } from '@/domain/checkout/MultiVendorCheckout'

describe('quoteMultiVendorCheckout', () => {
  it('separa pedidos e calcula cada vendedor', () => {
    const result = quoteMultiVendorCheckout([
      { productId: 'a', sellerId: 'seller-a', sellerPlan: 'free', unitPrice: 50, quantity: 1 },
      { productId: 'b', sellerId: 'seller-b', sellerPlan: 'plus', unitPrice: 100, quantity: 1 },
    ], { 'seller-a': 5000, 'seller-b': 10 })
    expect(result.orders).toHaveLength(2)
    expect(result.subtotal).toBe(150)
    expect(result.orders[0].platformFee).toBe(4.5)
    expect(result.orders[1].platformFee).toBe(6.9)
  })
})
