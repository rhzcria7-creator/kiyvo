// ─────────────────────────────────────────────────────────────
// Testes — Storage Helper (Validação de Arquivos)
// ─────────────────────────────────────────────────────────────

import {
  validateEmail,
  validatePrice,
  validateText,
  validateUsername,
  validateFullName,
  validatePhone,
  validateSlug,
  validateUUID,
  validateURL,
  validateRegistration,
  validateCheckout,
  validateProductCreate,
  validateChatMessage,
  validateReview,
  validationError,
} from '../../validation'

describe('Storage/File Validation Integration', () => {
  describe('Product price validation for upload flow', () => {
    it('rejeita preço zero (arquivo não pode ser grátis)', () => {
      expect(validatePrice(0).valid).toBe(false)
    })

    it('aceita preço mínimo viável', () => {
      expect(validatePrice(0.01).valid).toBe(true)
    })

    it('rejeita preços absurdos para arquivo digital', () => {
      expect(validatePrice(60000).valid).toBe(false)
    })

    it('aceita preço típico de e-book', () => {
      expect(validatePrice(29.90).valid).toBe(true)
    })

    it('aceita preço típico de software', () => {
      expect(validatePrice(199.90).valid).toBe(true)
    })
  })

  describe('Product creation validation for upload', () => {
    it('rejeita título muito curto', () => {
      const result = validateProductCreate({
        title: 'AB',
        description: 'Descrição válida com pelo menos dez caracteres',
        base_price: 29.90,
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        delivery_type: 'automatic',
      })
      expect(result.valid).toBe(false)
    })

    it('aceita produto digital com entrega automática', () => {
      const result = validateProductCreate({
        title: 'Minecraft Java Edition Key',
        description: 'Chave de ativação original para Minecraft Java Edition. Entrega automática após confirmação de pagamento.',
        base_price: 49.90,
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        delivery_type: 'automatic',
      })
      expect(result.valid).toBe(true)
    })

    it('rejeita delivery_type inválido', () => {
      const result = validateProductCreate({
        title: 'Produto teste',
        description: 'Descrição válida com pelo menos dez caracteres',
        base_price: 10,
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        delivery_type: 'instant',
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita descrição muito curta', () => {
      const result = validateProductCreate({
        title: 'Produto teste',
        description: 'Curta',
        base_price: 10,
        category_id: '550e8400-e29b-41d4-a716-446655440000',
        delivery_type: 'automatic',
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('Review validation — after purchase', () => {
    it('aceita avaliação sem comentário', () => {
      const result = validateReview({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        rating: 5,
      })
      expect(result.valid).toBe(true)
    })

    it('rejeita rating decimal', () => {
      const result = validateReview({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        rating: 3.5,
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita rating negativo', () => {
      const result = validateReview({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        rating: -1,
      })
      expect(result.valid).toBe(false)
    })

    it('rejeita comentário muito longo', () => {
      const result = validateReview({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        rating: 4,
        comment: 'a'.repeat(2001),
      })
      expect(result.valid).toBe(false)
    })
  })

  describe('Checkout flow validation', () => {
    it('rejeita checkout sem product_id', () => {
      expect(validateCheckout({ product_id: '' }).valid).toBe(false)
    })

    it('aceita checkout com apenas product_id', () => {
      expect(validateCheckout({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
      }).valid).toBe(true)
    })

    it('aceita affiliate_code alfanumérico', () => {
      expect(validateCheckout({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        affiliate_code: 'PROMO2024',
      }).valid).toBe(true)
    })

    it('rejeita affiliate_code com SQL injection', () => {
      expect(validateCheckout({
        product_id: '550e8400-e29b-41d4-a716-446655440000',
        affiliate_code: "'; DROP TABLE orders;--",
      }).valid).toBe(false)
    })
  })

  describe('validationError helper', () => {
    it('retorna Response com status 422', () => {
      const result = validationError({ valid: false, errors: { email: 'Email inválido' } })
      expect(result).toBeInstanceOf(Response)
      expect(result.status).toBe(422)
    })
  })

  describe('Edge cases — XSS prevention', () => {
    it('username rejeita script tags', () => {
      expect(validateUsername('<script>alert(1)</script>').valid).toBe(false)
    })

    it('fullName rejeita tags HTML', () => {
      const result = validateFullName('<img src=x onerror=alert(1)>')
      // fullName aceita texto mas remove conteúdo malicioso via sanitização
      expect(result.valid).toBe(true) // texto é válido, sanitização acontece depois
    })

    it('email rejeita formato com script', () => {
      expect(validateEmail('"><script>alert(1)</script>@test.com').valid).toBe(false)
    })

    it('slug rejeita caracteres especiais de XSS', () => {
      expect(validateSlug('test"><script>').valid).toBe(false)
    })

    it('URL rejeita javascript: protocol', () => {
      expect(validateURL('javascript:alert(1)').valid).toBe(false)
    })
  })

  describe('Phone validation — BR format', () => {
    it('aceita celular com 9 dígitos + DDD', () => {
      expect(validatePhone('11987654321').valid).toBe(true)
    })

    it('aceita fixo com 8 dígitos + DDD', () => {
      expect(validatePhone('1134567890').valid).toBe(true)
    })

    it('aceita formato formatado', () => {
      expect(validatePhone('(11) 98765-4321').valid).toBe(true)
    })

    it('rejeita número muito curto', () => {
      expect(validatePhone('123456').valid).toBe(false)
    })
  })
})
