// ─────────────────────────────────────────────────────────────
// Testes — Security Utilities (Rate Limiting, Sanitização, CPF, Fraude)
// ─────────────────────────────────────────────────────────────

import {
  rateLimit,
  sanitizeInput,
  sanitizeSearchQuery,
  validateCPF,
  validateCEP,
  isBot,
  isHoneypotTriggered,
  detectFraud,
  checkPasswordStrength,
  generateCSRFToken,
  validateCSRFToken,
  generateSecureToken,
} from '../index'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Limpar rate limits entre testes
    // Como o Map é module-scoped, não podemos limpar diretamente
    // Usamos IPs únicos para cada teste
  })

  it('permite requisições dentro do limite', () => {
    const ip = `test-allow-${Date.now()}`
    const result = rateLimit(ip, 5, 60000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('decrementa remaining a cada requisição', () => {
    const ip = `test-decr-${Date.now()}`
    rateLimit(ip, 3, 60000)
    rateLimit(ip, 3, 60000)
    const result = rateLimit(ip, 3, 60000)
    expect(result.remaining).toBe(0)
  })

  it('bloqueia requisições após exceder limite', () => {
    const ip = `test-block-${Date.now()}`
    rateLimit(ip, 2, 60000)
    rateLimit(ip, 2, 60000)
    const result = rateLimit(ip, 2, 60000)
    expect(result.allowed).toBe(false)
  })

  it('auto-bloqueia após 3x o limite', () => {
    const ip = `test-autoblock-${Date.now()}`
    // Esgotar o limite (1 req permitida, próximas negadas)
    rateLimit(ip, 1, 60000) // count=1 (allowed)
    rateLimit(ip, 1, 60000) // count=2 (denied, not yet 3x)
    rateLimit(ip, 1, 60000) // count=3 (denied, 3x limit → auto-block)
    const result = rateLimit(ip, 1, 60000) // blocked=true
    expect(result.blocked).toBe(true)
  })
})

describe('Input Sanitization', () => {
  it('remove tags HTML', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>')
  })

  it('remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:')
  })

  it('remove event handlers', () => {
    expect(sanitizeInput('onclick=alert(1)')).not.toContain('onclick=')
  })

  it('remove eval()', () => {
    expect(sanitizeInput('eval(malicious)')).not.toContain('eval')
  })

  it('remove document access', () => {
    expect(sanitizeInput('document.cookie')).not.toContain('document.')
  })

  it('preserva texto normal', () => {
    expect(sanitizeInput('Produto digital Kiyvo')).toBe('Produto digital Kiyvo')
  })

  it('trunca strings longas', () => {
    const long = 'a'.repeat(20000)
    expect(sanitizeInput(long).length).toBeLessThanOrEqual(10000)
  })
})

describe('Search Query Sanitization', () => {
  it('remove SQL keywords', () => {
    expect(sanitizeSearchQuery("'; DROP TABLE users;--")).not.toContain('DROP')
    expect(sanitizeSearchQuery("'; DROP TABLE users;--")).not.toContain('--')
  })

  it('remove caracteres especiais', () => {
    expect(sanitizeSearchQuery('test<>{}[]')).not.toContain('<')
    expect(sanitizeSearchQuery('test<>{}[]')).not.toContain('{')
  })

  it('preserva texto normal', () => {
    expect(sanitizeSearchQuery('jogos digitais')).toBe('jogos digitais')
  })

  it('limita comprimento', () => {
    const long = 'a'.repeat(500)
    expect(sanitizeSearchQuery(long).length).toBeLessThanOrEqual(200)
  })
})

describe('CPF Validation', () => {
  it('valida CPF válido', () => {
    // CPF válido gerado por algoritmo
    expect(validateCPF('529.982.247-25')).toBe(true)
  })

  it('rejeita CPF inválido', () => {
    expect(validateCPF('123.456.789-00')).toBe(false)
  })

  it('rejeita CPF com dígitos repetidos', () => {
    expect(validateCPF('111.111.111-11')).toBe(false)
  })

  it('rejeita CPF com tamanho errado', () => {
    expect(validateCPF('123.456')).toBe(false)
  })

  it('aceita CPF sem formatação', () => {
    expect(validateCPF('52998224725')).toBe(true)
  })
})

describe('CEP Validation', () => {
  it('valida CEP com hífen', () => {
    expect(validateCEP('01310-100')).toBe(true)
  })

  it('valida CEP sem hífen', () => {
    expect(validateCEP('01310100')).toBe(true)
  })

  it('rejeita CEP inválido', () => {
    expect(validateCEP('1234')).toBe(false)
    expect(validateCEP('abcdefgh')).toBe(false)
  })
})

describe('Bot Detection', () => {
  it('detecta user agents de bot', () => {
    expect(isBot('GoogleBot/1.0')).toBe(true)
    expect(isBot('Mozilla/5.0 (compatible; curl/7.68.0)')).toBe(true)
    expect(isBot('python-requests/2.28.0')).toBe(true)
  })

  it('aceita user agents normais', () => {
    expect(isBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')).toBe(false)
  })

  it('rejeita user agent vazio', () => {
    expect(isBot('')).toBe(true)
  })
})

describe('Honeypot Detection', () => {
  it('detecta campos honeypot preenchidos', () => {
    expect(isHoneypotTriggered({ website: 'http://spam.com', name: 'John' })).toBe(true)
    expect(isHoneypotTriggered({ url: 'something', name: 'John' })).toBe(true)
  })

  it('aceita dados sem campos honeypot', () => {
    expect(isHoneypotTriggered({ name: 'John', email: 'john@test.com' })).toBe(false)
  })
})

describe('Fraud Detection', () => {
  it('retorna risk baixo para transação normal', () => {
    const result = detectFraud({
      amount: 50,
      userId: 'user-1',
      ip: '192.168.1.1',
      timeSinceSignup: 30,
      previousOrders: 5,
      previousDisputes: 0,
      paymentMethod: 'pix',
    })
    expect(result.risk).toBe('low')
    expect(result.recommendedAction).toBe('allow')
  })

  it('retorna risk alto para conta nova com valor alto', () => {
    const result = detectFraud({
      amount: 3000,
      userId: 'user-2',
      ip: 'unknown',
      timeSinceSignup: 0.001,
      previousOrders: 0,
      previousDisputes: 0,
      paymentMethod: 'crypto',
    })
    expect(['high', 'critical']).toContain(result.risk)
  })

  it('detecta velocity attack', () => {
    const result = detectFraud({
      amount: 100,
      userId: 'user-3',
      ip: '192.168.1.1',
      timeSinceSignup: 30,
      previousOrders: 10,
      previousDisputes: 0,
      paymentMethod: 'pix',
      velocityCheck: 10,
    })
    expect(result.flags).toContain('velocity_attack')
  })

  it('detecta serial disputer', () => {
    const result = detectFraud({
      amount: 100,
      userId: 'user-4',
      ip: '192.168.1.1',
      timeSinceSignup: 30,
      previousOrders: 10,
      previousDisputes: 5,
      paymentMethod: 'pix',
    })
    expect(result.flags).toContain('serial_disputer')
  })

  it('detecta bot', () => {
    const result = detectFraud({
      amount: 50,
      userId: 'user-5',
      ip: '192.168.1.1',
      timeSinceSignup: 30,
      previousOrders: 1,
      previousDisputes: 0,
      paymentMethod: 'pix',
      userAgent: 'python-requests/2.28.0',
    })
    expect(result.flags).toContain('bot_detected')
    expect(result.risk).toBe('critical')
  })
})

describe('Password Strength', () => {
  it('classifica senha fraca', () => {
    const result = checkPasswordStrength('123456')
    expect(result.label).toBe('Fraca')
  })

  it('classifica senha média', () => {
    const result = checkPasswordStrength('Senha123')
    expect(['Média', 'Forte']).toContain(result.label)
  })

  it('classifica senha forte', () => {
    const result = checkPasswordStrength('K!yv0_S3gur@2024!')
    expect(result.label).toBe('Forte')
  })

  it('detecta senha comum', () => {
    const result = checkPasswordStrength('password')
    expect(result.label).toBe('Fraca')
    expect(result.suggestions).toContain('Esta senha é muito comum. Use uma senha única.')
  })

  it('sugere melhorias para senha curta', () => {
    const result = checkPasswordStrength('abc')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })
})

describe('CSRF Tokens', () => {
  it('gera e valida token CSRF', () => {
    const sessionId = `session-${Date.now()}`
    const token = generateCSRFToken(sessionId)
    expect(token).toBeDefined()
    expect(token.length).toBeGreaterThan(0)
    expect(validateCSRFToken(sessionId, token)).toBe(true)
  })

  it('rejeita token inválido', () => {
    const sessionId = `session-invalid-${Date.now()}`
    generateCSRFToken(sessionId)
    expect(validateCSRFToken(sessionId, 'wrong-token')).toBe(false)
  })

  it('rejeita token para sessão inexistente', () => {
    expect(validateCSRFToken('nonexistent', 'any-token')).toBe(false)
  })
})

describe('Secure Token', () => {
  it('gera token do comprimento especificado', () => {
    const token = generateSecureToken(16)
    expect(token.length).toBe(16)
  })

  it('gera tokens únicos', () => {
    const token1 = generateSecureToken()
    const token2 = generateSecureToken()
    expect(token1).not.toBe(token2)
  })
})
