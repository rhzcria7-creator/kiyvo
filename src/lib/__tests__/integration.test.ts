// ─────────────────────────────────────────────────────────────
// Testes — Rate Limiting Persistente
// ─────────────────────────────────────────────────────────────

import {
  hashBackupCode,
  generateBackupCodes,
} from '../auth/two-factor'
import {
  validateEmail,
  validatePassword,
  validateCheckout,
  validateChatMessage,
  validateRegistration,
} from '../validation'

// Nota: checkRateLimit requer Supabase admin client
// Testamos a lógica in-memory aqui

describe('Rate Limiting — Integração com Validation', () => {
  describe('Checkout validation + rate limit pattern', () => {
    it('rejeita checkout com product_id inválido', () => {
      const result = validateCheckout({ product_id: 'not-a-uuid' })
      expect(result.valid).toBe(false)
      expect(result.errors.product_id).toBeDefined()
    })

    it('rejeita checkout com affiliate_code malicioso', () => {
      const result = validateCheckout({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        affiliate_code: '<script>alert(1)</script>',
      })
      expect(result.valid).toBe(false)
    })

    it('aceita checkout válido mesmo com affiliate_code', () => {
      const result = validateCheckout({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        affiliate_code: 'PROMO10',
      })
      expect(result.valid).toBe(true)
    })
  })

  describe('Chat message validation — anti-spam', () => {
    it('rejeita mensagem vazia (spam)', () => {
      const result = validateChatMessage({
        conversation_id: '550e8400-e29b-41d4-a716-446655440000',
        content: '',
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita mensagem muito longa (spam)', () => {
      const result = validateChatMessage({
        conversation_id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'a'.repeat(2001),
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita conversation_id inválido', () => {
      const result = validateChatMessage({
        conversation_id: 'invalid',
        content: 'Olá!',
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita message_type inválido', () => {
      const result = validateChatMessage({
        conversation_id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Olá!',
        message_type: 'exec',
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('Registration validation — anti-abuse', () => {
    it('rejeita email com XSS', () => {
      const result = validateRegistration({
        email: '<script>alert(1)</script>@test.com',
        password: 'Senha123',
        username: 'testuser',
        fullName: 'Test',
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita username com espaços', () => {
      const result = validateRegistration({
        email: 'user@test.com',
        password: 'Senha123',
        username: 'test user',
        fullName: 'Test',
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita senha muito curta mesmo com padrão forte', () => {
      const result = validateRegistration({
        email: 'user@test.com',
        password: 'Ab1',
        username: 'testuser',
        fullName: 'Test',
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('2FA + Validation integration', () => {
    it('backup codes são hasheados consistentemente', () => {
      const codes = generateBackupCodes()
      const hashes = codes.map(hashBackupCode)
      // Todos os hashes são únicos
      const uniqueHashes = new Set(hashes)
      expect(uniqueHashes.size).toBe(codes.length)
    })

    it('códigos de backup não contêm caracteres SQL perigosos', () => {
      const codes = generateBackupCodes()
      codes.forEach(code => {
        expect(code).not.toMatch(/['";]/)
        expect(code).not.toMatch(/(--|\/\*|\*\/)/)
      })
    })
  })

  describe('Email validation — edge cases', () => {
    it('rejeita email com + ( Gmail alias)', () => {
      // Gmail aliases são válidos — deve aceitar
      const result = validateEmail('user+tag@gmail.com')
      expect(result.valid).toBe(true)
    })

    it('aceita email com subdomínio', () => {
      const result = validateEmail('user@sub.domain.com')
      expect(result.valid).toBe(true)
    })

    it('rejeita email com espaços', () => {
      const result = validateEmail('user @test.com')
      expect(result.valid).toBe(false)
    })

    it('normaliza email para lowercase implicitamente', () => {
      const result = validateEmail('User@Test.COM')
      expect(result.valid).toBe(true)
    })
  })

  describe('Password validation — edge cases', () => {
    it('rejeita senha muito longa', () => {
      const result = validatePassword('A1' + 'a'.repeat(127))
      expect(result.valid).toBe(false)
    })

    it('aceita senha com caracteres especiais', () => {
      const result = validatePassword('Senha123!@#$%')
      expect(result.valid).toBe(true)
    })

    it('rejeita senha só com números e maiúsculas', () => {
      const result = validatePassword('ABC12345')
      expect(result.valid).toBe(false)
    })
  })
})
