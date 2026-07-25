// v0.0.1 — Taxas oficiais sem teto, com isenção inicial e benefício por reputação.
export type FeePlanV2 = 'free' | 'plus' | 'pro' | 'vendor_pro'
export type SellerLevelV2 = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend'
const rules: Record<FeePlanV2,{percent:number;fixed:number}> = { free:{percent:.08,fixed:.5}, plus:{percent:.065,fixed:.4}, pro:{percent:.05,fixed:.3}, vendor_pro:{percent:.03,fixed:.2} }
const levelDiscount: Record<SellerLevelV2,number> = { bronze:0,silver:.02,gold:.04,platinum:.06,diamond:.08,legend:.1 }
export function calculateFeeV2(plan: FeePlanV2, amount: number, salesCount: number, level: SellerLevelV2 = 'bronze') { if (!Number.isFinite(amount) || amount < 0) throw new Error('Valor inválido.'); const exempt = salesCount < 5000 && (plan === 'free' || plan === 'vendor_pro'); const rule=rules[plan]; const percent=exempt?0:rule.percent*(1-levelDiscount[level]); const fixed=exempt?0:rule.fixed; const platformFee=Math.round((amount*percent+fixed)*100)/100; return { platformFee, sellerReceives:Math.max(0,Math.round((amount-platformFee)*100)/100), feePercent:percent*100, fixed, exempt, levelDiscount:levelDiscount[level]*100 } }
