import { runSkill } from '@/skills/contracts'
import { feeEngineSkill } from '@/skills/feeEngine.skill'
import { antiFraudSkill } from '@/skills/antiFraud.skill'
import { riskScoreSkill } from '@/skills/riskScore.skill'

describe('skills v0.0.1', () => {
  it('aplica taxa sem teto e isenção inicial', () => {
    expect(runSkill(feeEngineSkill, { plan: 'free', amount: 100, salesCount: 0 })).toMatchObject({ platformFee: 0, isFeeExempt: true })
    expect(runSkill(feeEngineSkill, { plan: 'free', amount: 10000, salesCount: 5000 })).toMatchObject({ platformFee: 800.5, sellerReceives: 9199.5 })
  })

  it('bloqueia cartão público de teste', () => {
    expect(runSkill(antiFraudSkill, { cardNumber: '4242424242424242' })).toMatchObject({ blocked: true })
  })

  it('explica elevação de risco', () => {
    expect(runSkill(riskScoreSkill, { accountAgeDays: 0, disputeCount: 2, isNewDevice: true, ipRisk: 90, failedPayments: 3 })).toMatchObject({ level: 'blocked' })
  })
})
