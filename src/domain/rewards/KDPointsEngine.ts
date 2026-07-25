// v0.0.1 — KD Points: 100 KD = R$1, com proteção de desconto máximo.
export const KD_PER_BRL = 100
export function kdToBrl(points: number): number { return Math.max(0, Math.floor(points)) / KD_PER_BRL }
export function brlToKd(value: number): number { return Math.ceil(Math.max(0, value) * KD_PER_BRL) }
export function maxKdDiscount(orderTotal: number, availablePoints: number): { points: number; discount: number } { const points = Math.min(Math.max(0, Math.floor(availablePoints)), brlToKd(orderTotal * 0.5)); return { points, discount: kdToBrl(points) } }
export function purchaseKdReward(paidTotal: number): number { return Math.max(10, Math.floor(Math.max(0, paidTotal) * 5)) }
export function reviewKdReward(hasPhotos: boolean): number { return hasPhotos ? 50 : 25 }
