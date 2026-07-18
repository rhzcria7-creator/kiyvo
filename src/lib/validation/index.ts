// ─────────────────────────────────────────────────────────────
// KIYVO — Validação de Input Server-Side (OWASP Compliant)
// Validação rigorosa para todos os dados que entram no sistema
// Nunca confie no client — valide TUDO no servidor
// ─────────────────────────────────────────────────────────────

// ─── RESULTADO DE VALIDAÇÃO ──────────────────────────────────

interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

function valid(): ValidationResult {
  return { valid: true, errors: {} }
}

function invalid(errors: Record<string, string>): ValidationResult {
  return { valid: false, errors }
}

// ─── VALIDADORES DE CAMPO ────────────────────────────────────

/**
 * Valida email
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== 'string') return invalid({ email: 'Email deve ser texto' })
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return invalid({ email: 'Email é obrigatório' })
  if (trimmed.length > 254) return invalid({ email: 'Email muito longo' })

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(trimmed)) return invalid({ email: 'Email inválido' })

  return valid()
}

/**
 * Valida senha
 */
export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== 'string') return invalid({ password: 'Senha deve ser texto' })
  if (password.length < 8) return invalid({ password: 'Mínimo 8 caracteres' })
  if (password.length > 128) return invalid({ password: 'Máximo 128 caracteres' })
  if (!/[A-Z]/.test(password)) return invalid({ password: 'Adicione letras maiúsculas' })
  if (!/[a-z]/.test(password)) return invalid({ password: 'Adicione letras minúsculas' })
  if (!/[0-9]/.test(password)) return invalid({ password: 'Adicione números' })

  return valid()
}

/**
 * Valida username
 */
export function validateUsername(username: unknown): ValidationResult {
  if (typeof username !== 'string') return invalid({ username: 'Username deve ser texto' })
  const trimmed = username.trim()
  if (!trimmed) return invalid({ username: 'Username é obrigatório' })
  if (trimmed.length < 3) return invalid({ username: 'Mínimo 3 caracteres' })
  if (trimmed.length > 30) return invalid({ username: 'Máximo 30 caracteres' })
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return invalid({ username: 'Apenas letras, números, _ e -' })

  return valid()
}

/**
 * Valida nome completo
 */
export function validateFullName(name: unknown): ValidationResult {
  if (typeof name !== 'string') return invalid({ name: 'Nome deve ser texto' })
  const trimmed = name.trim()
  if (!trimmed) return invalid({ name: 'Nome é obrigatório' })
  if (trimmed.length < 2) return invalid({ name: 'Mínimo 2 caracteres' })
  if (trimmed.length > 100) return invalid({ name: 'Máximo 100 caracteres' })

  return valid()
}

/**
 * Valida CPF (formato + dígitos verificadores)
 */
export function validateCPFInput(cpf: unknown): ValidationResult {
  if (typeof cpf !== 'string') return invalid({ cpf: 'CPF deve ser texto' })
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return invalid({ cpf: 'CPF deve ter 11 dígitos' })
  if (/^(\d)\1{10}$/.test(digits)) return invalid({ cpf: 'CPF inválido' })

  // Validação dos dígitos verificadores
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return invalid({ cpf: 'CPF inválido' })

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return invalid({ cpf: 'CPF inválido' })

  return valid()
}

/**
 * Valida telefone brasileiro
 */
export function validatePhone(phone: unknown): ValidationResult {
  if (typeof phone !== 'string') return invalid({ phone: 'Telefone deve ser texto' })
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 11) return invalid({ phone: 'Telefone inválido' })
  if (!digits.startsWith('0') && digits.length === 11 && !digits.startsWith('1')) {
    // Celular: 11 dígitos começando com DDD
  }
  return valid()
}

/**
 * Valida preço (valor monetário)
 */
export function validatePrice(price: unknown): ValidationResult {
  if (typeof price !== 'number' && typeof price !== 'string') {
    return invalid({ price: 'Preço deve ser um número' })
  }
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return invalid({ price: 'Preço inválido' })
  if (num <= 0) return invalid({ price: 'Preço deve ser positivo' })
  if (num > 50000) return invalid({ price: 'Preço máximo é R$ 50.000' })

  return valid()
}

/**
 * Valida slug de produto
 */
export function validateSlug(slug: unknown): ValidationResult {
  if (typeof slug !== 'string') return invalid({ slug: 'Slug deve ser texto' })
  if (!slug) return invalid({ slug: 'Slug é obrigatório' })
  if (slug.length < 3) return invalid({ slug: 'Slug muito curto' })
  if (slug.length > 200) return invalid({ slug: 'Slug muito longo' })
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return invalid({ slug: 'Slug inválido (use letras minúsculas, números e hífens)' })

  return valid()
}

/**
 * Valida UUID
 */
export function validateUUID(id: unknown): ValidationResult {
  if (typeof id !== 'string') return invalid({ id: 'ID deve ser texto' })
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) return invalid({ id: 'ID inválido' })

  return valid()
}

/**
 * Valida texto genérico com tamanho
 */
export function validateText(
  value: unknown,
  field: string,
  minLen: number = 0,
  maxLen: number = 10000
): ValidationResult {
  if (typeof value !== 'string') return invalid({ [field]: `${field} deve ser texto` })
  if (value.length < minLen) return invalid({ [field]: `Mínimo ${minLen} caracteres` })
  if (value.length > maxLen) return invalid({ [field]: `Máximo ${maxLen} caracteres` })

  return valid()
}

/**
 * Valida URL — bloqueia protocolos perigosos (javascript:, data:, vbscript:)
 */
export function validateURL(url: unknown): ValidationResult {
  if (typeof url !== 'string') return invalid({ url: 'URL deve ser texto' })
  const trimmed = url.trim()
  // Bloqueia protocolos perigosos (case-insensitive)
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'blob:', 'file:']
  const lowerUrl = trimmed.toLowerCase()
  for (const proto of dangerousProtocols) {
    if (lowerUrl.startsWith(proto)) return invalid({ url: 'Protocolo não permitido' })
  }
  // Apenas http/https permitidos
  if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://')) {
    return invalid({ url: 'Apenas URLs http/https são aceitas' })
  }
  try {
    new URL(trimmed)
    return valid()
  } catch {
    return invalid({ url: 'URL inválida' })
  }
}

// ─── VALIDADORES COMPOSTOS ───────────────────────────────────

/**
 * Valida dados de registro
 */
export function validateRegistration(data: {
  email: unknown
  password: unknown
  username: unknown
  fullName: unknown
}): ValidationResult {
  const errors: Record<string, string> = {}

  const emailResult = validateEmail(data.email)
  if (!emailResult.valid) Object.assign(errors, emailResult.errors)

  const passwordResult = validatePassword(data.password)
  if (!passwordResult.valid) Object.assign(errors, passwordResult.errors)

  const usernameResult = validateUsername(data.username)
  if (!usernameResult.valid) Object.assign(errors, usernameResult.errors)

  const nameResult = validateFullName(data.fullName)
  if (!nameResult.valid) Object.assign(errors, nameResult.errors)

  return Object.keys(errors).length > 0 ? invalid(errors) : valid()
}

/**
 * Valida dados de checkout
 */
export function validateCheckout(data: {
  product_id: unknown
  variant_id?: unknown
  affiliate_code?: unknown
}): ValidationResult {
  const errors: Record<string, string> = {}

  const productResult = validateUUID(data.product_id)
  if (!productResult.valid) errors.product_id = 'Produto inválido'

  if (data.variant_id && typeof data.variant_id === 'string' && data.variant_id.trim()) {
    const variantResult = validateUUID(data.variant_id)
    if (!variantResult.valid) errors.variant_id = 'Variante inválida'
  }

  if (data.affiliate_code && typeof data.affiliate_code === 'string') {
    if (data.affiliate_code.length > 50) errors.affiliate_code = 'Código de afiliado muito longo'
    if (!/^[a-zA-Z0-9_-]+$/.test(data.affiliate_code)) errors.affiliate_code = 'Código de afiliado inválido'
  }

  return Object.keys(errors).length > 0 ? invalid(errors) : valid()
}

/**
 * Valida criação de produto
 */
export function validateProductCreate(data: {
  title: unknown
  description: unknown
  base_price: unknown
  category_id: unknown
  delivery_type: unknown
}): ValidationResult {
  const errors: Record<string, string> = {}

  const titleResult = validateText(data.title, 'title', 3, 200)
  if (!titleResult.valid) Object.assign(errors, titleResult.errors)

  const descResult = validateText(data.description, 'description', 10, 50000)
  if (!descResult.valid) Object.assign(errors, descResult.errors)

  const priceResult = validatePrice(data.base_price)
  if (!priceResult.valid) Object.assign(errors, priceResult.errors)

  const catResult = validateUUID(data.category_id)
  if (!catResult.valid) errors.category_id = 'Categoria inválida'

  const validDeliveryTypes = ['automatic', 'manual', 'semi_automatic']
  if (!validDeliveryTypes.includes(data.delivery_type as string)) {
    errors.delivery_type = 'Tipo de entrega inválido'
  }

  return Object.keys(errors).length > 0 ? invalid(errors) : valid()
}

/**
 * Valida mensagem de chat
 */
export function validateChatMessage(data: {
  conversation_id: unknown
  content: unknown
  message_type?: unknown
}): ValidationResult {
  const errors: Record<string, string> = {}

  const convResult = validateUUID(data.conversation_id)
  if (!convResult.valid) errors.conversation_id = 'Conversa inválida'

  const contentResult = validateText(data.content, 'content', 1, 2000)
  if (!contentResult.valid) Object.assign(errors, contentResult.errors)

  const validTypes = ['text', 'image', 'file', 'system']
  if (data.message_type && !validTypes.includes(data.message_type as string)) {
    errors.message_type = 'Tipo de mensagem inválido'
  }

  return Object.keys(errors).length > 0 ? invalid(errors) : valid()
}

/**
 * Valida review/avaliação
 */
export function validateReview(data: {
  product_id: unknown
  rating: unknown
  comment?: unknown
}): ValidationResult {
  const errors: Record<string, string> = {}

  const productResult = validateUUID(data.product_id)
  if (!productResult.valid) errors.product_id = 'Produto inválido'

  if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
    errors.rating = 'Avaliação deve ser entre 1 e 5'
  }
  if (!Number.isInteger(data.rating as number)) {
    errors.rating = 'Avaliação deve ser número inteiro'
  }

  if (data.comment && typeof data.comment === 'string' && data.comment.length > 2000) {
    errors.comment = 'Comentário muito longo (máximo 2000 caracteres)'
  }

  return Object.keys(errors).length > 0 ? invalid(errors) : valid()
}

// ─── HELPER PARA API ROUTES ──────────────────────────────────

/**
 * Retorna erros de validação como resposta JSON
 * Use em API routes: if (!result.valid) return validationError(result)
 */
export function validationError(result: ValidationResult): Response {
  return new Response(
    JSON.stringify({ error: 'Dados inválidos', details: result.errors }),
    {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
