// v0.0.1 — Códigos únicos de gift card com hash para armazenamento seguro.
import { createHash, randomBytes } from 'crypto'
export function generateGiftCardCode(prefix = 'KYV'): { code: string; hash: string } { const code = `${prefix.toUpperCase()}-${randomBytes(15).toString('hex').toUpperCase().match(/.{1,5}/g)?.join('-')}`; return { code, hash: createHash('sha256').update(code).digest('hex') } }
export function validateGiftCardAmount(amount: number): boolean { return Number.isFinite(amount) && amount >= 5 && amount <= 5000 && Math.round(amount * 100) === amount * 100 }
