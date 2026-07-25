// v0.0.1 — Saque PIX: valida chave, mínimo e taxa fixa de forma determinística.
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
export interface PayoutQuote { valid: boolean; netAmount: number; fee: number; reason?: string }
const cpf = (value: string) => /^\d{11}$/.test(value.replace(/\D/g, ''))
const cnpj = (value: string) => /^\d{14}$/.test(value.replace(/\D/g, ''))
export function validatePixKey(value: string, type: PixKeyType): boolean { const key = value.trim(); if (type === 'cpf') return cpf(key); if (type === 'cnpj') return cnpj(key); if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key); if (type === 'phone') return /^\+?55\d{10,11}$/.test(key.replace(/\D/g, '')); return /^[0-9a-fA-F-]{32,36}$/.test(key) }
export function quotePayout(amount: number, availableBalance: number): PayoutQuote { if (!Number.isFinite(amount) || amount < 30) return { valid: false, netAmount: 0, fee: 0.99, reason: 'O saque mínimo é R$ 30,00.' }; if (amount > availableBalance) return { valid: false, netAmount: 0, fee: 0.99, reason: 'Saldo disponível insuficiente.' }; const fee = 0.99; return { valid: true, fee, netAmount: Math.round((amount - fee) * 100) / 100 } }
