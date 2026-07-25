import { calculateSellerReputation } from '@/domain/reputation/ReputationEngine'
import { maxKdDiscount, purchaseKdReward, reviewKdReward } from '@/domain/rewards/KDPointsEngine'
import { calculateReferralReward } from '@/domain/referrals/ReferralEngine'
import { applyCoupon } from '@/domain/coupons/CouponEngine'
import { generateLicense, verifyLicense } from '@/domain/licensing/LicenseEngine'
import { suggestPrice } from '@/domain/pricing/DynamicPricingEngine'
import { createBundleQuote } from '@/domain/bundles/BundleEngine'
import { recommendProducts } from '@/domain/recommendations/RecommendationEngine'
import { evaluatePasswordStrength } from '@/lib/security/passwordStrength'

describe('v0.0.1 commerce domain services', () => {
  it('calcula níveis, pontos e referral com guardrails', () => {
    expect(calculateSellerReputation({ completedOrders: 120, fulfillmentRate: 100, disputeRate: 0, responseMinutes: 30, verified: true }).level).toBe('top_rated')
    expect(maxKdDiscount(100, 9000)).toEqual({ points: 5000, discount: 50 })
    expect(purchaseKdReward(2)).toBe(10); expect(reviewKdReward(true)).toBe(50)
    expect(calculateReferralReward({ referrerId: 'a', referredId: 'a', firstOrderTotal: 10, attributionExpiresAt: new Date(Date.now() + 1000) }).eligible).toBe(false)
  })
  it('protege preço, cupom, licença e bundle', () => {
    expect(applyCoupon({ code: 'TESTE', discountType: 'percent', value: 10, minOrder: 10, usedCount: 0 }, 100)).toMatchObject({ valid: true, total: 90 })
    expect(suggestPrice({ basePrice: 100, stock: 1, targetStock: 10, views7d: 5, conversionRate: .1 }).suggestedPrice).toBe(105)
    const license = generateLicense('commercial'); expect(verifyLicense(license.key, license.keyHash)).toBe(true)
    expect(createBundleQuote([{ productId: 'a', price: 50 }, { productId: 'b', price: 50 }], 20).total).toBe(80)
  })
  it('recomenda por sinais e exige senha forte', () => {
    expect(recommendProducts(['design'], [{ productId: 'a', category: 'design', sales: 10, rating: 4, boost: false }, { productId: 'b', category: 'games', sales: 100, rating: 5, boost: false }], 1)).toHaveLength(1)
    expect(evaluatePasswordStrength('Senha123!Senha', 'ana@example.com').acceptable).toBe(true)
  })
})
