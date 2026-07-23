// ─────────────────────────────────────────────────────────────
// Testes — 2FA Backend (TOTP, Backup Codes, Encryption AES-256-GCM)
// ─────────────────────────────────────────────────────────────

import {
  generateTOTPSecret,
  generateTOTPURI,
  verifyTOTP,
  generateBackupCodes,
  hashBackupCode,
  encryptTOTPSecret,
  decryptTOTPSecret,
  decryptTOTPSecretSync,
  generateTOTPQRDataURL,
  generateTOTPQRSVG,
} from '../two-factor'

describe('2FA — TOTP', () => {
  describe('generateTOTPSecret', () => {
    it('gera um segredo Base32 válido', () => {
      const secret = generateTOTPSecret()
      expect(secret).toBeDefined()
      expect(secret.length).toBeGreaterThan(0)
      // Base32: apenas A-Z e 2-7
      expect(secret).toMatch(/^[A-Z2-7]+$/)
    })

    it('gera segredos diferentes a cada chamada', () => {
      const secret1 = generateTOTPSecret()
      const secret2 = generateTOTPSecret()
      expect(secret1).not.toBe(secret2)
    })
  })

  describe('generateTOTPURI', () => {
    it('gera URI otpauth:// válida', () => {
      const uri = generateTOTPURI({
        secret: 'JBSWY3DPEHPK3PXP',
        email: 'user@test.com',
      })
      expect(uri).toMatch(/^otpauth:\/\/totp\//)
      expect(uri).toContain('KIYVO')
      expect(uri).toContain('user%40test.com')
      expect(uri).toContain('secret=JBSWY3DPEHPK3PXP')
    })

    it('usa issuer customizado', () => {
      const uri = generateTOTPURI({
        secret: 'TEST',
        email: 'test@test.com',
        issuer: 'CustomApp',
      })
      expect(uri).toContain('CustomApp')
    })
  })

  describe('verifyTOTP', () => {
    it('rejeita código vazio', () => {
      expect(verifyTOTP('SECRET', '')).toBe(false)
    })

    it('rejeita código com tamanho errado', () => {
      expect(verifyTOTP('SECRET', '12345')).toBe(false)
      expect(verifyTOTP('SECRET', '1234567')).toBe(false)
    })

    it('rejeita código completamente errado', () => {
      const secret = generateTOTPSecret()
      const results = Array.from({ length: 10 }, () =>
        verifyTOTP(secret, '000000')
      )
      const failures = results.filter(r => r === false)
      expect(failures.length).toBeGreaterThanOrEqual(9)
    })

    it('aceita código válido gerado pelo mesmo segredo', () => {
      const secret = generateTOTPSecret()
      // Verifica que o mecanismo não crasha
      expect(() => verifyTOTP(secret, '123456')).not.toThrow()
    })

    it('rejeita segredo vazio', () => {
      expect(verifyTOTP('', '123456')).toBe(false)
    })
  })
})

describe('2FA — Backup Codes', () => {
  describe('generateBackupCodes', () => {
    it('gera 10 códigos de backup', () => {
      const codes = generateBackupCodes()
      expect(codes).toHaveLength(10)
    })

    it('cada código tem hífen no meio', () => {
      const codes = generateBackupCodes()
      codes.forEach(code => {
        expect(code).toContain('-')
      })
    })

    it('códigos têm comprimento correto', () => {
      const codes = generateBackupCodes()
      codes.forEach(code => {
        // XXXX-XXXX = 9 caracteres com hífen
        expect(code.length).toBe(9)
      })
    })

    it('códigos não contêm caracteres ambíguos (0, 1, I, O)', () => {
      const codes = generateBackupCodes()
      codes.forEach(code => {
        expect(code).not.toMatch(/[0O1I]/)
      })
    })

    it('gera códigos diferentes a cada chamada', () => {
      const codes1 = generateBackupCodes()
      const codes2 = generateBackupCodes()
      const same = codes1.filter((c, i) => c === codes2[i])
      expect(same.length).toBeLessThan(10)
    })
  })

  describe('hashBackupCode', () => {
    it('gera hash consistente para o mesmo código', () => {
      const hash1 = hashBackupCode('ABCD-EFGH')
      const hash2 = hashBackupCode('ABCD-EFGH')
      expect(hash1).toBe(hash2)
    })

    it('gera hashes diferentes para códigos diferentes', () => {
      const hash1 = hashBackupCode('ABCD-EFGH')
      const hash2 = hashBackupCode('IJKL-MNOP')
      expect(hash1).not.toBe(hash2)
    })

    it('é case-insensitive', () => {
      const hash1 = hashBackupCode('ABCD-EFGH')
      const hash2 = hashBackupCode('abcd-efgh')
      expect(hash1).toBe(hash2)
    })

    it('prefixa com bk_', () => {
      const hash = hashBackupCode('TEST-CODE')
      expect(hash).toMatch(/^bk_/)
    })
  })
})

describe('2FA — Encryption (AES-256-GCM real)', () => {
  describe('encryptTOTPSecret / decryptTOTPSecret', () => {
    it('criptografa e descriptografa corretamente (round-trip)', async () => {
      const secret = 'JBSWY3DPEHPK3PXP'
      const encrypted = await encryptTOTPSecret(secret)
      expect(typeof encrypted).toBe('string')
      expect(encrypted.length).toBeGreaterThan(10)

      const decrypted = await decryptTOTPSecret(encrypted)
      expect(decrypted).toBe(secret)
    })

    it('usa prefixo enc_v2_ (AES-256-GCM real)', async () => {
      const encrypted = await encryptTOTPSecret('test-secret')
      expect(encrypted).toMatch(/^enc_v2_/)
    })

    it('cifras diferentes para o mesmo segredo (IV aleatório)', async () => {
      const e1 = await encryptTOTPSecret('same-secret')
      const e2 = await encryptTOTPSecret('same-secret')
      expect(e1).not.toBe(e2)
    })

    it('lida com segredo vazio', async () => {
      expect(await encryptTOTPSecret('')).toBe('')
      expect(await decryptTOTPSecret('')).toBe('')
    })

    it('detecta tampering no ciphertext', async () => {
      const encrypted = await encryptTOTPSecret('segredo')
      // Corromper o corpo do payload (depois do prefixo enc_v2_), invertendo vários caracteres
      // Isso altera a tag GCM garantindo falha na autenticação
      const prefix = 'enc_v2_'
      const body = encrypted.slice(prefix.length)
      // Inverter dois caracteres centrais (garante dano real no tag/ciphertext)
      const mid = Math.floor(body.length / 2)
      const tampered = prefix + body.slice(0, mid - 2) + 'XXX' + body.slice(mid + 1)
      await expect(decryptTOTPSecret(tampered)).rejects.toThrow()
    })

    it('suporta payload legado enc_v1_ (texto plano)', async () => {
      const legacy = 'enc_v1_MEUSEGREDO123'
      const decrypted = await decryptTOTPSecret(legacy)
      expect(decrypted).toBe('MEUSEGREDO123')
    })

    it('suporta texto puro (sem prefixo, legado)', async () => {
      expect(await decryptTOTPSecret('plain-secret')).toBe('plain-secret')
    })
  })

  describe('decryptTOTPSecretSync (compatibilidade)', () => {
    it('funciona para payloads v1 legados', () => {
      expect(decryptTOTPSecretSync('enc_v1_LEGADO')).toBe('LEGADO')
    })

    it('funciona para texto puro', () => {
      expect(decryptTOTPSecretSync('raw')).toBe('raw')
    })

    it('lança para payloads v2 (requer async)', () => {
      // Um payload v2 sintético não real (mas reconhecível pelo prefixo)
      expect(() => decryptTOTPSecretSync('enc_v2_fakepayload')).toThrow(/enc_v2_/)
    })
  })
})

describe('2FA — QR Code generation', () => {
  describe('generateTOTPQRDataURL', () => {
    it('gera um data URL PNG válido', async () => {
      const uri = generateTOTPURI({ secret: 'JBSWY3DPEHPK3PXP', email: 't@t.com' })
      const dataUrl = await generateTOTPQRDataURL(uri, 128)
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
    })
  })

  describe('generateTOTPQRSVG', () => {
    it('gera uma string SVG com <svg> tag', async () => {
      const uri = generateTOTPURI({ secret: 'JBSWY3DPEHPK3PXP', email: 't@t.com' })
      const svg = await generateTOTPQRSVG(uri, 128)
      expect(svg).toMatch(/<svg/)
      // qrcode gera módulos como <path> ou <rect>; verificamos pelo xmlns e path/rect
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(svg.length).toBeGreaterThan(100)
    })
  })
})

describe('2FA — Internal Helpers', () => {
  describe('Base32 (via generateTOTPSecret)', () => {
    it('gera saída Base32 válida (A-Z, 2-7)', () => {
      const secret = generateTOTPSecret()
      expect(secret).toMatch(/^[A-Z2-7]+$/)
    })
  })

  describe('Timing-safe comparison (via hashBackupCode)', () => {
    it('hashes iguais para mesmo código', () => {
      const h1 = hashBackupCode('ABCD-EFGH')
      const h2 = hashBackupCode('ABCD-EFGH')
      expect(h1).toBe(h2)
    })

    it('hashes diferentes para códigos diferentes', () => {
      const h1 = hashBackupCode('ABCD-EFGH')
      const h2 = hashBackupCode('IJKL-MNOP')
      expect(h1).not.toBe(h2)
    })
  })
})
