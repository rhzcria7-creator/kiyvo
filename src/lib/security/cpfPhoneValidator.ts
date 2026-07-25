// ─────────────────────────────────────────────────────────────
// CPF & Phone Validator v0.0.1 — Validação real com algoritmo
// CPF: dígitos verificadores + blacklist + formatação
// Telefone: Brasil (11 dígitos) + internacional + operadora
// ─────────────────────────────────────────────────────────────

/**
 * Valida CPF brasileiro com algoritmo de dígitos verificadores
 * Retorna { valid, formatted, digitsOnly, reason }
 */
export function validateCPF(cpf: string): {
  valid: boolean
  formatted: string
  digitsOnly: string
  reason?: string
} {
  // Limpar formatação
  const digits = cpf.replace(/\D/g, '')

  if (digits.length !== 11) {
    return {
      valid: false,
      formatted: cpf,
      digitsOnly: digits,
      reason: 'CPF deve ter 11 dígitos',
    }
  }

  // Rejeitar todos dígitos iguais (CPF inválido conhecido)
  if (/^(\d)\1{10}$/.test(digits)) {
    return {
      valid: false,
      formatted: cpf,
      digitsOnly: digits,
      reason: 'CPF com todos dígitos iguais',
    }
  }

  // Calcular primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) {
    return {
      valid: false,
      formatted: cpf,
      digitsOnly: digits,
      reason: 'Primeiro dígito verificador inválido',
    }
  }

  // Calcular segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) {
    return {
      valid: false,
      formatted: cpf,
      digitsOnly: digits,
      reason: 'Segundo dígito verificador inválido',
    }
  }

  // Formatar
  const formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`

  return { valid: true, formatted, digitsOnly: digits }
}

/**
 * Valida telefone brasileiro
 * Aceita: (11) 99999-9999, 11999999999, +5511999999999
 */
export function validatePhoneBR(phone: string): {
  valid: boolean
  formatted: string
  digitsOnly: string
  carrier?: string
  region?: string
  reason?: string
} {
  const digits = phone.replace(/\D/g, '')

  // Aceitar com ou sem +55
  const cleanDigits = digits.startsWith('55') && digits.length >= 12
    ? digits.slice(2)
    : digits

  if (cleanDigits.length < 10 || cleanDigits.length > 11) {
    return {
      valid: false,
      formatted: phone,
      digitsOnly: cleanDigits,
      reason: 'Telefone deve ter 10 ou 11 dígitos (DDD + número)',
    }
  }

  // Validar DDD
  const ddd = parseInt(cleanDigits.slice(0, 2))
  const validDDDs = [
    11, 12, 13, 14, 15, 16, 17, 18, 19,
    21, 22, 24, 27, 28,
    31, 32, 33, 34, 35, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48, 49,
    51, 53, 54, 55,
    61, 62, 63, 64, 65, 66, 67, 68, 69,
    71, 73, 74, 75, 77, 79,
    81, 82, 83, 84, 85, 86, 87, 88, 89,
    91, 92, 93, 94, 95, 96, 97, 98, 99,
  ]

  if (!validDDDs.includes(ddd)) {
    return {
      valid: false,
      formatted: phone,
      digitsOnly: cleanDigits,
      reason: `DDD ${ddd} inválido`,
    }
  }

  // Identificar operadora pelo prefixo
  const prefix = parseInt(cleanDigits.slice(2, 6))
  const carrierMap: Record<string, [number, number][]> = {
    'Vivo': [[981, 999], [940, 949], [930, 939], [920, 929]],
    'TIM': [[971, 979], [961, 969], [951, 959], [941, 949], [931, 939], [921, 929]],
    'Claro': [[991, 999], [981, 989], [971, 979], [961, 969]],
    'Oi': [[988, 989], [984, 985], [964, 965], [924, 925]],
    'Nextel': [[970, 979], [960, 969], [950, 959]],
    'Algar': [[992, 999], [982, 989]],
    'Sercomtel': [[943, 949], [933, 939]],
  }

  let carrier: string | undefined
  for (const [name, ranges] of Object.entries(carrierMap)) {
    for (const [start, end] of ranges) {
      if (prefix >= start && prefix <= end) {
        carrier = name
        break
      }
    }
    if (carrier) break
  }

  // Mapa de DDD para região
  const regionMap: Record<string, string> = {
    '11': 'SP (Capital)', '12': 'SP (Vale do Paraíba)', '13': 'SP (Baixada Santista)',
    '14': 'SP (Bauru)', '15': 'SP (Sorocaba)', '16': 'SP (Ribeirão Preto)',
    '17': 'SP (São José do Rio Preto)', '18': 'SP (Presidente Prudente)', '19': 'SP (Campinas)',
    '21': 'RJ (Capital)', '22': 'RJ (Interior)', '24': 'RJ (Região Serrana)',
    '27': 'ES (Capital)', '28': 'ES (Sul)',
    '31': 'MG (Capital)', '32': 'MG (Zona da Mata)', '33': 'MG (Vale do Rio Doce)',
    '34': 'MG (Triângulo Mineiro)', '35': 'MG (Sul de Minas)', '37': 'MG (Centro-Oeste)',
    '38': 'MG (Norte)',
    '41': 'PR (Capital)', '42': 'PR (Ponta Grossa)', '43': 'PR (Londrina)',
    '44': 'PR (Maringá)', '45': 'PR (Oeste)', '46': 'PR (Sudoeste)',
    '47': 'SC (Vale do Itajaí)', '48': 'SC (Capital)', '49': 'SC (Oeste)',
    '51': 'RS (Capital)', '53': 'RS (Pelotas)', '54': 'RS (Serra)',
    '55': 'RS (Fronteira Oeste)',
    '61': 'DF (Brasília)', '62': 'GO (Capital)', '63': 'TO (Capital)',
    '64': 'GO (Interior)', '65': 'MT (Capital)', '66': 'MT (Interior)',
    '67': 'MS (Capital)', '68': 'AC (Capital)', '69': 'RO (Capital)',
    '71': 'BA (Capital)', '73': 'BA (Sul)', '74': 'BA (Norte)',
    '75': 'BA (Feira de Santana)', '77': 'BA (Oeste)', '79': 'SE (Capital)',
    '81': 'PE (Capital)', '82': 'AL (Capital)', '83': 'PB (Capital)',
    '84': 'RN (Capital)', '85': 'CE (Capital)', '86': 'PI (Capital)',
    '87': 'PE (Interior)', '88': 'CE (Interior)', '89': 'PI (Interior)',
    '91': 'PA (Capital)', '92': 'AM (Capital)', '93': 'PA (Interior)',
    '94': 'PA (Interior)', '95': 'RR (Capital)', '96': 'AP (Capital)',
    '97': 'AM (Interior)', '98': 'MA (Capital)', '99': 'MA (Interior)',
  }

  // Formatar
  const hasNinthDigit = cleanDigits.length === 11
  const formatted = hasNinthDigit
    ? `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 3)} ${cleanDigits.slice(3, 7)}-${cleanDigits.slice(7)}`
    : `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6)}`

  return {
    valid: true,
    formatted,
    digitsOnly: cleanDigits,
    carrier: carrier || 'Outra',
    region: regionMap[ddd.toString()] || `DDD ${ddd}`,
  }
}

/**
 * Valida cartão de crédito (Luhn algorithm)
 */
export function validateCreditCardLuhn(cardNumber: string): {
  valid: boolean
  brand?: string
  formatted?: string
} {
  const digits = cardNumber.replace(/\D/g, '')

  if (digits.length < 13 || digits.length > 19) {
    return { valid: false }
  }

  // Algoritmo de Luhn
  let sum = 0
  let alternate = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i])
    if (alternate) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alternate = !alternate
  }

  if (sum % 10 !== 0) {
    return { valid: false }
  }

  // Identificar bandeira
  const brand = identifyCardBrand(digits)

  // Formatar
  const formatted = formatCardNumber(digits)

  return { valid: true, brand, formatted }
}

/**
 * Identifica bandeira do cartão
 */
export function identifyCardBrand(digits: string): string {
  if (/^4[0-9]/.test(digits)) return 'Visa'
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'Amex'
  if (/^6011|^65/.test(digits) || /^64[4-9]/.test(digits)) return 'Discover'
  if (/^36|^38|^30[0-5]/.test(digits)) return 'Diners'
  if (/^35(?:2[89]|[3-8][0-9])/.test(digits)) return 'JCB'
  if (/^50|^63|^67/.test(digits)) return 'Elo'
  if (/^606282|^3841(?:00|20|3[456])/.test(digits)) return 'Hipercard'
  if (/^60(?:0|1[1-5]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])/.test(digits)) return 'Hipercard'
  return 'Desconhecida'
}

/**
 * Formata número do cartão
 */
export function formatCardNumber(digits: string): string {
  if (digits.length === 15) { // Amex
    return `${digits.slice(0, 4)} ${digits.slice(4, 10)} ${digits.slice(10)}`
  }
  // Demais bandeiras: 16 dígitos
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
}

/**
 * Testa cartão de teste 4242 (Stripe test mode)
 */
export function isTestCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '')
  const testCards = [
    '4242424242424242', '4000056655665556', '5555555555554444',
    '2223003122003222', '5200828282828210', '5105105105105100',
    '378282246310005', '371449635398431', '6011111111111117',
    '6011000990139424', '30569309025904', '38520000023237',
    '3566002020360505', '6200000000000005',
  ]
  return testCards.includes(digits)
}
