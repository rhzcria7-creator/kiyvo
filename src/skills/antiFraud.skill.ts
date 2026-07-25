// v0.0.1 — Skill de avaliação local de risco de checkout.
import { z } from 'zod'
import { clientAntiFraudCheck } from '@/lib/security/clientAntiFraud'
import type { Skill } from './contracts'

const inputSchema = z.object({ email: z.string().email().optional(), cpf: z.string().optional(), cardNumber: z.string().optional(), nome: z.string().optional() })
type Input = z.infer<typeof inputSchema>

export const antiFraudSkill: Skill<Input, ReturnType<typeof clientAntiFraudCheck>> = {
  name: 'anti-fraud', description: 'Detecta e-mail descartável, CPF inválido e cartões de teste antes do pagamento.', inputSchema,
  run: (input) => clientAntiFraudCheck(input),
}
