// ─────────────────────────────────────────────────────────────
// Honeypot Bot Detection v0.0.1 — Detecção de bots invisível
// Honeypot hidden input + mouse tracking + tempo de formulário
// ─────────────────────────────────────────────────────────────

export interface BotDetectionResult {
  isBot: boolean
  confidence: number // 0-1
  flags: BotFlag[]
  reason?: string
}

export type BotFlag =
  | 'honeypot_filled'
  | 'too_fast'
  | 'no_mouse_movement'
  | 'no_touch'
  | 'js_disabled_suspicious'
  | 'hidden_field_filled'
  | 'form_submit_instant'
  | 'suspicious_pattern'

/**
 * Verifica honeypot (campo invisível preenchido = bot)
 */
export function checkHoneypot(honeypotValue: string): boolean {
  return honeypotValue.length > 0
}

/**
 * Verifica tempo de preenchimento do formulário
 * Menos de 2 segundos = bot
 */
export function checkFormTiming(startTime: number): { tooFast: boolean; elapsedMs: number } {
  const elapsed = Date.now() - startTime
  return {
    tooFast: elapsed < 2000, // menos de 2s = bot
    elapsedMs: elapsed,
  }
}

/**
 * Verifica movimento do mouse (ausência = bot)
 */
export function checkMouseMovement(mouseEvents: number): boolean {
  return mouseEvents < 3 // menos de 3 eventos = suspeito
}

/**
 * Avaliação completa de bot
 */
export function assessBotRisk(params: {
  honeypotValue?: string
  hiddenFieldValue?: string
  formStartTime: number
  mouseEvents?: number
  hasJavaScript?: boolean
  userAgent?: string
  touchEvents?: number
}): BotDetectionResult {
  const flags: BotFlag[] = []
  let confidence = 0

  // 1. Honeypot preenchido
  if (params.honeypotValue && params.honeypotValue.length > 0) {
    flags.push('honeypot_filled')
    confidence = 1.0
    return {
      isBot: true,
      confidence: 1.0,
      flags,
      reason: 'Campo honeypot preenchido (bot detectado)',
    }
  }

  // 2. Campo hidden preenchido
  if (params.hiddenFieldValue && params.hiddenFieldValue.length > 0) {
    flags.push('hidden_field_filled')
    confidence = 1.0
    return {
      isBot: true,
      confidence: 1.0,
      flags,
      reason: 'Campo oculto preenchido (bot detectado)',
    }
  }

  // 3. Tempo muito rápido
  const timing = checkFormTiming(params.formStartTime)
  if (timing.tooFast) {
    flags.push('too_fast')
    confidence = Math.max(confidence, 0.7)
  }

  // 4. Sem movimento de mouse
  if (params.mouseEvents !== undefined && params.mouseEvents < 3) {
    flags.push('no_mouse_movement')
    confidence = Math.max(confidence, 0.5)
  }

  // 5. Sem eventos touch (dispositivo móvel)
  if (params.touchEvents !== undefined && params.touchEvents === 0 && isMobileUserAgent(params.userAgent)) {
    flags.push('no_touch')
    confidence = Math.max(confidence, 0.4)
  }

  // 6. JS desabilitado suspeito (não consegue enviar fingerprint)
  if (params.hasJavaScript === false) {
    flags.push('js_disabled_suspicious')
    confidence = Math.max(confidence, 0.3)
  }

  return {
    isBot: confidence >= 0.5,
    confidence,
    flags,
    reason: flags.length > 0 ? `Flags: ${flags.join(', ')}` : undefined,
  }
}

/**
 * Gera nome de campo honeypot aleatório (muda a cada render)
 */
export function generateHoneypotFieldName(): string {
  const prefixes = ['fax_', 'website_', 'company_', 'nickname_', 'extra_', 'alt_']
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffix}`
}

/**
 * Verifica se user-agent parece mobile
 */
function isMobileUserAgent(ua?: string): boolean {
  if (!ua) return false
  return /android|iphone|ipad|ipod|mobile|tablet/i.test(ua)
}
