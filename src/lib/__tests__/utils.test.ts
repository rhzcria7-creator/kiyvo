// ─────────────────────────────────────────────────────────────
// Testes — Utilitários (formatPrice, slugify, cn, etc.)
// ─────────────────────────────────────────────────────────────

import { formatPrice, slugify, getDiscount, formatNumber, cn } from '../utils'

describe('formatPrice', () => {
  it('formata valor em BRL corretamente', () => {
    const result = formatPrice(99.9)
    expect(result).toContain('99')
    expect(result).toContain('R$')
  })

  it('formata zero', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
  })

  it('formata valores grandes', () => {
    const result = formatPrice(99999.99)
    expect(result).toContain('99.999')
  })

  it('formata valores decimais', () => {
    const result = formatPrice(10.5)
    expect(result).toContain('10')
  })
})

describe('slugify', () => {
  it('converte texto para slug', () => {
    expect(slugify('Produto Teste')).toBe('produto-teste')
  })

  it('remove acentos', () => {
    expect(slugify('Produção Digital')).toBe('producao-digital')
  })

  it('remove caracteres especiais', () => {
    expect(slugify('Jogo @#$% Top!')).toBe('jogo-top')
  })

  it('trata string vazia', () => {
    expect(slugify('')).toBe('')
  })

  it('remove hífens nas pontas', () => {
    expect(slugify('--teste--')).toBe('teste')
  })

  it('colapsa múltiplos espaços', () => {
    expect(slugify('teste   com   espaços')).toBe('teste-com-espacos')
  })
})

describe('getDiscount', () => {
  it('calcula desconto corretamente', () => {
    expect(getDiscount(80, 100)).toBe(20)
  })

  it('retorna 0 para mesmo preço', () => {
    expect(getDiscount(100, 100)).toBe(0)
  })

  it('calcula desconto de 50%', () => {
    expect(getDiscount(50, 100)).toBe(50)
  })

  it('arredonda corretamente', () => {
    const result = getDiscount(33.33, 100)
    expect(Number.isInteger(result)).toBe(true)
  })
})

describe('formatNumber', () => {
  it('formata números abaixo de 1000 como string', () => {
    expect(formatNumber(500)).toBe('500')
  })

  it('formata 1000+ com k', () => {
    expect(formatNumber(1500)).toBe('1.5k')
  })

  it('formata 10000+ com k', () => {
    expect(formatNumber(10500)).toBe('10.5k')
  })
})

describe('cn (className merger)', () => {
  it('mescla classes', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('lida com undefined', () => {
    expect(cn('px-4', undefined)).toBe('px-4')
  })

  it('lida com condicionais', () => {
    const isActive = true
    expect(cn('base', isActive && 'active')).toBe('base active')
  })

  it('filtra falsy values', () => {
    expect(cn('base', false, null, undefined, '')).toBe('base')
  })
})
