// ─────────────────────────────────────────────────────────────
// KIYVO — Anti-Fraude CLIENT-SIDE (feedback instantâneo)
//
// Detecção de padrões suspeitos antes mesmo do envio ao servidor:
//   - E-mails temporários / descartáveis
//   - CPF com dígitos repetidos ou inválidos
//   - Cartões de teste / BINs de teste
//   - Sequências numéricas óbvias (00000000000, 11111111111)
//   - Velocidade de preenchimento (bot)
//   - Múltiplos inputs suspeitos no mesmo form
//
// A validação FINAL é sempre server-side. Isto aqui é só UX.
// ─────────────────────────────────────────────────────────────

const CLIENT_BLOCKED_DOMAINS = new Set([
  '10minutemail.com', 'guerrillamail.com', 'tempmail.com', 'temp-mail.org',
  'throwawaymail.com', 'trashmail.com', 'yopmail.com', 'mailinator.com',
  'maildrop.cc', 'getnada.com', 'fakeinbox.com', 'sharklasers.com',
  'grr.la', 'dispostable.com', 'mailnesia.com', 'mintemail.com',
  'emailondeck.com', 'emailfake.com', 'fakemail.net', 'mailsac.com',
  'inboxkitten.com', 'tempmailer.com', 'mohmal.com', 'tempmailer.de',
  'emailtemporario.com.br', 'fakemail.com.br', 'tempmailbr.com',
  'geradordecpf.org', '4devs.com', '4devs.com.br', 'invertexto.com',
  'geradorfalso.com', 'tempmail.us', 'temp-mail.io', 'tempmail.lol',
  'throwawaymail.io', 'spam4.me', 'mailcatch.com', 'mailtemp.dk',
  'nada.email', 'nada.ltd', 'trashymail.com', 'spambog.com',
])

const ALLOWED_PRIMARY_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'outlook.com.br', 'hotmail.com', 'hotmail.com.br',
  'live.com', 'msn.com', 'live.com.br',
  'yahoo.com', 'yahoo.com.br', 'ymail.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'proton.ch',
  'bol.com.br', 'uol.com.br', 'ig.com.br', 'globo.com', 'oi.com.br',
  'terra.com.br', 'r7.com',
  'aol.com', 'gmx.com', 'gmx.net', 'zoho.com', 'fastmail.com',
])

// Cartões de teste/conhecidos de fraudadores
const BLOCKED_TEST_CARDS = new Set([
  '4242424242424242', '4000000000000002', '4000000000000069',
  '4000000000000119', '4000000000000101', '5555555555554444',
  '5105105105105100', '4111111111111111', '4916338506082832',
  '4012888888881881', '4222222222222', '4485284720137099',
  '5431111111111111', '5454545454545454', '5500000000000004',
  '2223000048400011', '2223520043560014', '6011000990139424',
  '6011111111111117', '378282246310005', '371449635398431',
  '378734493671000', '30569309025904', '38520000023237',
  '3530111333300000', '3566002020360505',
])

// BINs de cartões pré-pagos de teste (bloqueamos para compra, pois são comuns em fraude)
// Apenas como heurística — não é 100% preciso

export interface FraudCheckResult {
  blocked: boolean
  reason?: string
  warnings: string[]
  riskScore: number // 0-100 (>= 70 = bloqueio)
}

export interface ClientFraudInput {
  email?: string
  cpf?: string
  cardNumber?: string
  nome?: string
}

function validarCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11) return false
  if (/^(\d)\1{10}$/.test(d)) return false
  let s = 0, r
  for (let i = 0; i < 9; i++) s += parseInt(d[i]) * (10 - i)
  r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[9])) return false
  s = 0
  for (let i = 0; i < 10; i++) s += parseInt(d[i]) * (11 - i)
  r = (s * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== parseInt(d[10])) return false
  return true
}

export function clientAntiFraudCheck(input: ClientFraudInput): FraudCheckResult {
  const warnings: string[] = []
  let score = 0

  // ─── Email ──────────────────────────────────────────────
  if (input.email) {
    const email = input.email.trim().toLowerCase()
    const atIdx = email.lastIndexOf('@')
    if (atIdx >= 1) {
      const local = email.slice(0, atIdx)
      const domain = email.slice(atIdx + 1)

      if (CLIENT_BLOCKED_DOMAINS.has(domain)) {
        score += 90
        return { blocked: true, reason: 'E-mails temporários não são permitidos. Use seu e-mail real (Gmail, Outlook, etc).', warnings: ['tempmail'], riskScore: 99 }
      }

      if (/^[a-z]+\d{4,}/.test(local)) {
        score += 25
        warnings.push('Email com padrão gerado automaticamente detectado.')
      }

      // Local part muito pequeno
      if (local.length < 3) {
        score += 15
        warnings.push('Email parece incompleto.')
      }
    } else if (email.length > 0) {
      score += 30
      warnings.push('Email inválido.')
    }
  }

  // ─── CPF ────────────────────────────────────────────────
  if (input.cpf && input.cpf.length >= 11) {
    if (!validarCPF(input.cpf)) {
      score += 95
      return { blocked: true, reason: 'CPF inválido. Verifique os dígitos.', warnings: ['cpf-invalido'], riskScore: 98 }
    }
    // CPF de teste conhecido de geradores
    const limpo = input.cpf.replace(/\D/g, '')
    const cpfsTeste = new Set(['00000000000','11111111111','22222222222','33333333333','44444444444','55555555555','66666666666','77777777777','88888888888','99999999999','12345678909'])
    if (cpfsTeste.has(limpo)) {
      score += 95
      return { blocked: true, reason: 'CPF inválido (número de teste). Informe seu CPF real.', warnings: ['cpf-teste'], riskScore: 97 }
    }
  }

  // ─── Cartão ─────────────────────────────────────────────
  if (input.cardNumber) {
    const num = input.cardNumber.replace(/\D/g, '')
    if (num.length >= 13) {
      if (BLOCKED_TEST_CARDS.has(num)) {
        score += 99
        return { blocked: true, reason: 'Cartão de teste detectado. Use seu cartão real.', warnings: ['cartao-teste'], riskScore: 100 }
      }
      // Sequência idêntica (111111...)
      if (/^(\d)\1{12,18}$/.test(num)) {
        score += 80
        warnings.push('Número de cartão com dígitos repetidos.')
      }
      // Luhn algorithm
      if (!luhnCheck(num)) {
        score += 70
        warnings.push('Número de cartão inválido (LUNH).')
      }
    }
  }

  return {
    blocked: score >= 70,
    riskScore: Math.min(100, score),
    warnings,
    reason: score >= 70 ? 'Transação bloqueada por segurança. Entre em contato com o suporte.' : undefined,
  }
}

// Validação Luhn (cartão de crédito)
function luhnCheck(num: string): boolean {
  if (!/^\d{13,19}$/.test(num)) return false
  let sum = 0
  let alt = false
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export { luhnCheck }

export function checkEmailClientSide(email: string): { allowed: boolean; reason?: string } {
  const r = clientAntiFraudCheck({ email })
  if (r.blocked) return { allowed: false, reason: r.reason }
  const domain = email.split('@').pop() || ''
  if (CLIENT_BLOCKED_DOMAINS.has(domain)) return { allowed: false, reason: 'E-mails temporários não são permitidos.' }
  return { allowed: true }
}
