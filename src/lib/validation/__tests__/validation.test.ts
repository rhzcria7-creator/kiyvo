// ─────────────────────────────────────────────────────────────
// Testes — Input Validation (OWASP Compliant)
// ─────────────────────────────────────────────────────────────

import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validateCPFInput,
  validatePrice,
  validateSlug,
  validateUUID,
  validateText,
  validateURL,
  validateRegistration,
  validateCheckout,
  validateChatMessage,
  validateReview,
} from '../index'

describe('validateEmail', () => {
  it('aceita email válido', () => {
    expect(validateEmail('user@test.com').valid).toBe(true)
  })

  it('rejeita email vazio', () => {
    expect(validateEmail('').valid).toBe(false)
  })

  it('rejeita email sem @', () => {
    expect(validateEmail('usertest.com').valid).toBe(false)
  })

  it('rejeita email sem domínio', () => {
    expect(validateEmail('user@').valid).toBe(false)
  })

  it('rejeita não-string', () => {
    expect(validateEmail(123).valid).toBe(false)
  })

  it('rejeita email muito longo', () => {
    const long = 'a'.repeat(250) + '@test.com'
    expect(validateEmail(long).valid).toBe(false)
  })
})

describe('validatePassword', () => {
  it('aceita senha forte', () => {
    expect(validatePassword('K!yv0Segur@').valid).toBe(true)
  })

  it('rejeita senha curta', () => {
    expect(validatePassword('Ab1').valid).toBe(false)
  })

  it('rejeita sem maiúscula', () => {
    expect(validatePassword('abcdefg1').valid).toBe(false)
  })

  it('rejeita sem minúscula', () => {
    expect(validatePassword('ABCDEFG1').valid).toBe(false)
  })

  it('rejeita sem número', () => {
    expect(validatePassword('Abcdefgh').valid).toBe(false)
  })

  it('rejeita não-string', () => {
    expect(validatePassword(null).valid).toBe(false)
  })
})

describe('validateUsername', () => {
  it('aceita username válido', () => {
    expect(validateUsername('joao_silva').valid).toBe(true)
  })

  it('aceita números', () => {
    expect(validateUsername('user123').valid).toBe(true)
  })

  it('rejeita muito curto', () => {
    expect(validateUsername('ab').valid).toBe(false)
  })

  it('rejeita muito longo', () => {
    expect(validateUsername('a'.repeat(31)).valid).toBe(false)
  })

  it('rejeita caracteres especiais', () => {
    expect(validateUsername('joão silva').valid).toBe(false)
  })

  it('aceita hífen e underscore', () => {
    expect(validateUsername('user-name_123').valid).toBe(true)
  })
})

describe('validateCPFInput', () => {
  it('aceita CPF válido', () => {
    expect(validateCPFInput('529.982.247-25').valid).toBe(true)
  })

  it('aceita CPF sem formatação', () => {
    expect(validateCPFInput('52998224725').valid).toBe(true)
  })

  it('rejeita CPF inválido', () => {
    expect(validateCPFInput('123.456.789-00').valid).toBe(false)
  })

  it('rejeita CPF com dígitos repetidos', () => {
    expect(validateCPFInput('111.111.111-11').valid).toBe(false)
  })

  it('rejeita CPF curto', () => {
    expect(validateCPFInput('123').valid).toBe(false)
  })
})

describe('validatePrice', () => {
  it('aceita preço válido', () => {
    expect(validatePrice(99.9).valid).toBe(true)
  })

  it('aceita preço como string', () => {
    expect(validatePrice('50.00').valid).toBe(true)
  })

  it('rejeita preço zero', () => {
    expect(validatePrice(0).valid).toBe(false)
  })

  it('rejeita preço negativo', () => {
    expect(validatePrice(-10).valid).toBe(false)
  })

  it('rejeita preço muito alto', () => {
    expect(validatePrice(60000).valid).toBe(false)
  })

  it('rejeita NaN', () => {
    expect(validatePrice('abc').valid).toBe(false)
  })
})

describe('validateSlug', () => {
  it('aceita slug válido', () => {
    expect(validateSlug('meu-produto-digital').valid).toBe(true)
  })

  it('rejeita maiúsculas', () => {
    expect(validateSlug('Meu-Produto').valid).toBe(false)
  })

  it('rejeita espaços', () => {
    expect(validateSlug('meu produto').valid).toBe(false)
  })

  it('rejeita caracteres especiais', () => {
    expect(validateSlug('produto@especial').valid).toBe(false)
  })
})

describe('validateUUID', () => {
  it('aceita UUID válido', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000').valid).toBe(true)
  })

  it('rejeita UUID inválido', () => {
    expect(validateUUID('not-a-uuid').valid).toBe(false)
  })

  it('rejeita vazio', () => {
    expect(validateUUID('').valid).toBe(false)
  })
})

describe('validateCheckout', () => {
  it('aceita checkout válido', () => {
    const result = validateCheckout({
      product_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.valid).toBe(true)
  })

  it('rejeita sem product_id', () => {
    const result = validateCheckout({ product_id: 'invalid' })
    expect(result.valid).toBe(false)
  })

  it('aceita affiliate_code válido', () => {
    const result = validateCheckout({
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      affiliate_code: 'PROMO10',
    })
    expect(result.valid).toBe(true)
  })

  it('rejeita affiliate_code com caracteres especiais', () => {
    const result = validateCheckout({
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      affiliate_code: 'promo @10',
    })
    expect(result.valid).toBe(false)
  })
})

describe('validateChatMessage', () => {
  it('aceita mensagem válida', () => {
    const result = validateChatMessage({
      conversation_id: '550e8400-e29b-41d4-a716-446655440000',
      content: 'Olá, tudo bem?',
    })
    expect(result.valid).toBe(true)
  })

  it('rejeita conteúdo vazio', () => {
    const result = validateChatMessage({
      conversation_id: '550e8400-e29b-41d4-a716-446655440000',
      content: '',
    })
    expect(result.valid).toBe(false)
  })

  it('rejeita conteúdo muito longo', () => {
    const result = validateChatMessage({
      conversation_id: '550e8400-e29b-41d4-a716-446655440000',
      content: 'a'.repeat(2001),
    })
    expect(result.valid).toBe(false)
  })
})

describe('validateReview', () => {
  it('aceita review válido', () => {
    const result = validateReview({
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 5,
      comment: 'Excelente produto!',
    })
    expect(result.valid).toBe(true)
  })

  it('rejeita rating fora do range', () => {
    expect(validateReview({
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 0,
    }).valid).toBe(false)

    expect(validateReview({
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 6,
    }).valid).toBe(false)
  })

  it('rejeita rating decimal', () => {
    expect(validateReview({
      product_id: '550e8400-e29b-41d4-a716-446655440000',
      rating: 3.5,
    }).valid).toBe(false)
  })
})

describe('validateRegistration', () => {
  it('aceita registro válido', () => {
    const result = validateRegistration({
      email: 'user@test.com',
      password: 'Senha123',
      username: 'testuser',
      fullName: 'Test User',
    })
    expect(result.valid).toBe(true)
  })

  it('rejeita com múltiplos erros', () => {
    const result = validateRegistration({
      email: 'invalid',
      password: '123',
      username: 'ab',
      fullName: '',
    })
    expect(result.valid).toBe(false)
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(3)
  })
})
