// ─────────────────────────────────────────────────────────────
// Anti-Fraud Skill v0.0.1 — AG-KIT skill para antifraude completo
// Device fingerprint + IP Intel + Email Temp + CPF + Card + File Scan + Risk Score
// ─────────────────────────────────────────────────────────────

import { z } from 'zod'
import { validateCPF, validatePhoneBR, validateCreditCardLuhn } from '@/lib/security/cpfPhoneValidator'
import { validateEmail } from '@/lib/security/emailTempBlock'
import { assessTransactionRisk } from '@/lib/security/riskScore'
import { validateCardForPayment } from '@/lib/security/cardTestBlock'
import { analyzeIP } from '@/lib/security/ipIntelligence'
import { scanFile } from '@/lib/security/fileScanner'
import { assessBotRisk } from '@/lib/security/honeypotBot'

const checkEmailSchema = z.object({
  email: z.string().email(),
})

const checkCpfSchema = z.object({
  cpf: z.string().min(11).max(14),
})

const checkCardSchema = z.object({
  cardNumber: z.string().min(13).max(19),
  cvc: z.string().optional(),
  envMode: z.enum(['test', 'production']).default('production'),
})

const checkRiskSchema = z.object({
  ip: z.string().optional(),
  email: z.string().optional(),
  isNewUser: z.boolean().default(false),
  isNewPaymentMethod: z.boolean().default(false),
  amount: z.number().optional(),
})

export async function checkEmail(input: z.infer<typeof checkEmailSchema>) {
  const { email } = checkEmailSchema.parse(input)
  return validateEmail(email)
}

export async function checkCpf(input: z.infer<typeof checkCpfSchema>) {
  const { cpf } = checkCpfSchema.parse(input)
  return validateCPF(cpf)
}

export async function checkCard(input: z.infer<typeof checkCardSchema>) {
  const validated = checkCardSchema.parse(input)
  return validateCardForPayment(validated.cardNumber, validated.cvc, validated.envMode)
}

export async function assessRisk(input: z.infer<typeof checkRiskSchema>) {
  const validated = checkRiskSchema.parse(input)
  return assessTransactionRisk(validated)
}

export async function checkIP(ip: string) {
  return analyzeIP(ip)
}

export async function checkFile(fileName: string, buffer: ArrayBuffer | Buffer) {
  return scanFile(fileName, buffer)
}

export async function checkBot(params: {
  formStartTime: number
  honeypotValue?: string
  mouseEvents?: number
}) {
  return assessBotRisk(params)
}
