// ─────────────────────────────────────────────────────────────
// Testes — Storage Helper (Validação de Arquivos e Lógica)
// ─────────────────────────────────────────────────────────────

import {
  validateFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_DIGITAL_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_DIGITAL_SIZE,
} from '..'

// Mock File para jsdom
class MockFile {
  name: string
  size: number
  type: string
  constructor(bits: BlobPart[], name: string, options?: { type?: string }) {
    this.name = name
    this.size = bits.reduce((acc: number, b: BlobPart) => acc + (typeof b === 'string' ? b.length : (b as ArrayBuffer).byteLength || 0), 0)
    this.type = options?.type || ''
  }
}

// Substituir File global se não existir
const FileConstructor = typeof File !== 'undefined' ? File : MockFile as unknown as typeof File

describe('Storage — Validação de Arquivo', () => {
  describe('validateFile', () => {
    it('rejeita arquivo nulo/indefinido', () => {
      expect(validateFile(null as unknown as File, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(false)
    })

    it('rejeita tipo de arquivo não permitido', () => {
      const file = new FileConstructor(['x'.repeat(100)], 'test.exe', { type: 'application/x-msdownload' })
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(false)
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).error).toContain('Tipo não permitido')
    })

    it('aceita imagem JPEG válida', () => {
      const file = new FileConstructor(['x'.repeat(100)], 'photo.jpg', { type: 'image/jpeg' })
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(true)
    })

    it('aceita imagem PNG válida', () => {
      const file = new FileConstructor(['x'.repeat(100)], 'image.png', { type: 'image/png' })
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(true)
    })

    it('aceita imagem WebP válida', () => {
      const file = new FileConstructor(['x'.repeat(100)], 'image.webp', { type: 'image/webp' })
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(true)
    })

    it('rejeita arquivo SVG (XSS prevention)', () => {
      const file = new FileConstructor(['<svg onload="alert(1)">'], 'malicious.svg', { type: 'image/svg+xml' })
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(false)
    })

    it('rejeita arquivo muito grande', () => {
      // Simular arquivo de 10MB para limite de 5MB
      const largeContent = 'x'.repeat(10 * 1024 * 1024)
      const file = new FileConstructor([largeContent], 'big.jpg', { type: 'image/jpeg' })
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(false)
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).error).toContain('grande')
    })

    it('rejeita arquivo vazio (0 bytes)', () => {
      const file = new FileConstructor([], 'empty.jpg', { type: 'image/jpeg' })
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).valid).toBe(false)
      expect(validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE).error).toContain('vazio')
    })

    it('aceita PDF como documento', () => {
      const file = new FileConstructor(['x'.repeat(100)], 'doc.pdf', { type: 'application/pdf' })
      expect(validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE).valid).toBe(true)
    })

    it('aceita ZIP como documento', () => {
      const file = new FileConstructor(['x'.repeat(100)], 'file.zip', { type: 'application/zip' })
      expect(validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE).valid).toBe(true)
    })

    it('aceita EXE como arquivo digital', () => {
      const file = new FileConstructor(['x'.repeat(100)], 'software.exe', { type: 'application/x-msdownload' })
      expect(validateFile(file, ALLOWED_DIGITAL_TYPES, MAX_DIGITAL_SIZE).valid).toBe(true)
    })
  })
})

describe('Storage — Constantes de Configuração', () => {
  it('permite tipos de imagem comuns', () => {
    expect(ALLOWED_IMAGE_TYPES).toContain('image/jpeg')
    expect(ALLOWED_IMAGE_TYPES).toContain('image/png')
    expect(ALLOWED_IMAGE_TYPES).toContain('image/webp')
    expect(ALLOWED_IMAGE_TYPES).toContain('image/gif')
  })

  it('não permite SVG como tipo de imagem (prevenção XSS)', () => {
    expect(ALLOWED_IMAGE_TYPES).not.toContain('image/svg+xml')
  })

  it('permite tipos de documento comuns', () => {
    expect(ALLOWED_DOCUMENT_TYPES).toContain('application/pdf')
    expect(ALLOWED_DOCUMENT_TYPES).toContain('application/zip')
  })

  it('tipos digitais incluem documentos + executáveis', () => {
    expect(ALLOWED_DIGITAL_TYPES).toContain('application/pdf')
    expect(ALLOWED_DIGITAL_TYPES).toContain('application/x-msdownload')
    expect(ALLOWED_DIGITAL_TYPES).toContain('application/octet-stream')
  })

  it('limite de imagem é 5MB', () => {
    expect(MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024)
  })

  it('limite de documento é 50MB', () => {
    expect(MAX_DOCUMENT_SIZE).toBe(50 * 1024 * 1024)
  })

  it('limite de arquivo digital é 500MB', () => {
    expect(MAX_DIGITAL_SIZE).toBe(500 * 1024 * 1024)
  })

  it('limites estão em ordem crescente', () => {
    expect(MAX_IMAGE_SIZE).toBeLessThan(MAX_DOCUMENT_SIZE)
    expect(MAX_DOCUMENT_SIZE).toBeLessThan(MAX_DIGITAL_SIZE)
  })
})
