import { canTransitionDispute } from '@/domain/disputes/DisputeEngine'

describe('DisputeEngine', () => {
  it('permite resposta do vendedor e mediação administrativa', () => {
    expect(canTransitionDispute('open', 'seller_response', 'seller')).toEqual({ allowed: true })
    expect(canTransitionDispute('admin_review', 'refunded', 'admin')).toEqual({ allowed: true })
  })

  it('não permite reembolso unilateral por comprador', () => {
    expect(canTransitionDispute('open', 'refunded', 'buyer')).toMatchObject({ allowed: false })
  })
})
