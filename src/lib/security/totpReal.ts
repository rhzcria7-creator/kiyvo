// ─────────────────────────────────────────────────────────────
// TOTP Real v0.0.1 — Autenticação de dois fatores
// AES-256-GCM para backup codes + TOTP (RFC 6238)
// 10 backup codes de uso único
// ─────────────────────────────────────────────────────────────

import { createHmac, randomBytes, createCipheriv, createDecipheriv, timingSafeEqual } from 'crypto'

export interface TOTPSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
  encryptedBackupCodes: string
}

export interface TOTPVerifyResult {
  valid: boolean
  remainingAttempts: number
  backupCodeUsed?: boolean
}

const TOTP_STEP_SECONDS = 30
const TOTP_CODE_LENGTH = 6
const BACKUP_CODE_LENGTH = 10
const BACKUP_CODES_COUNT = 10
const MAX_ATTEMPTS = 3
const WINDOW_SIZE = 1 // +/- 1 step (total 3 windows)

/**
 * Gera setup TOTP completo com backup codes
 */
export function generateTOTPSetup(
  accountName: string,
  issuer: string = 'KIYVO'
): TOTPSetup {
  // 1. Gerar secret (20 bytes = 160 bits)
  const secretBytes = randomBytes(20)
  const secret = base32Encode(secretBytes)

  // 2. Gerar QR Code URL (otpauth://)
  const qrCodeUrl = generateOTPAuthURL(secret, accountName, issuer)

  // 3. Gerar backup codes
  const backupCodes: string[] = []
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    const code = randomBytes(6).toString('hex').toUpperCase().slice(0, BACKUP_CODE_LENGTH)
    backupCodes.push(code)
  }

  // 4. Criptografar backup codes
  const encryptedBackupCodes = encryptBackupCodes(backupCodes)

  return {
    secret,
    qrCodeUrl,
    backupCodes,
    encryptedBackupCodes,
  }
}

/**
 * Gera código TOTP para um timestamp
 */
export function generateTOTP(secret: string, timestamp: number = Date.now()): string {
  const counter = Math.floor(timestamp / 1000 / TOTP_STEP_SECONDS)
  return generateHOTP(secret, counter)
}

/**
 * Verifica código TOTP com janela de tolerância
 */
export function verifyTOTP(
  secret: string,
  code: string,
  timestamp: number = Date.now()
): boolean {
  const counter = Math.floor(timestamp / 1000 / TOTP_STEP_SECONDS)

  for (let i = -WINDOW_SIZE; i <= WINDOW_SIZE; i++) {
    const expectedCode = generateHOTP(secret, counter + i)
    if (timingSafeCompare(code, expectedCode)) {
      return true
    }
  }

  return false
}

/**
 * Gera código HOTP (RFC 4226) - base do TOTP
 */
function generateHOTP(secret: string, counter: number): string {
  const decodedSecret = base32Decode(secret)
  const counterBytes = Buffer.alloc(8)
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff
    counter = counter >> 8
  }

  const hmac = createHmac('sha1', Buffer.from(decodedSecret))
  hmac.update(counterBytes)
  const hash = hmac.digest()

  const offset = hash[hash.length - 1] & 0xf
  const binaryCode =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)

  const code = binaryCode % Math.pow(10, TOTP_CODE_LENGTH)
  return code.toString().padStart(TOTP_CODE_LENGTH, '0')
}

/**
 * Gera URL do tipo otpauth:// para QR Code
 */
function generateOTPAuthURL(secret: string, accountName: string, issuer: string): string {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedAccount = encodeURIComponent(accountName)
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${TOTP_CODE_LENGTH}&period=${TOTP_STEP_SECONDS}`
}

/**
 * Criptografa backup codes com AES-256-GCM
 */
export function encryptBackupCodes(codes: string[]): string {
  const encryptionKey = getEncryptionKey()
  const iv = randomBytes(12) // 96 bits para GCM
  const cipher = createCipheriv('aes-256-gcm', encryptionKey, iv)

  const plaintext = JSON.stringify(codes)
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag().toString('hex')

  // Formato: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

/**
 * Descriptografa backup codes
 */
export function decryptBackupCodes(encrypted: string): string[] {
  const encryptionKey = getEncryptionKey()
  const [ivHex, authTagHex, encryptedData] = encrypted.split(':')

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = createDecipheriv('aes-256-gcm', encryptionKey, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return JSON.parse(decrypted)
}

/**
 * Valida e consome um backup code
 */
export function validateBackupCode(
  code: string,
  encryptedCodes: string,
  usedCodes: string[]
): { valid: boolean; remainingCodes: string[] } {
  const allCodes = decryptBackupCodes(encryptedCodes)

  // Verificar se o código existe e não foi usado
  const codeIndex = allCodes.findIndex(c => c === code && !usedCodes.includes(c))
  if (codeIndex === -1) {
    return { valid: false, remainingCodes: allCodes }
  }

  const remainingCodes = allCodes.filter(c => c !== code)
  return { valid: true, remainingCodes }
}

/**
 * Obtém chave de criptografia do ambiente
 */
function getEncryptionKey(): Buffer {
  const key = process.env.TOTP_ENCRYPTION_KEY
  if (!key) {
    // Fallback para desenvolvimento (NUNCA usar em produção)
    return Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
  }
  return Buffer.from(key, 'hex')
}

/**
 * Comparação timing-safe para evitar timing attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  try {
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * Base32 encode (RFC 4648)
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let value = 0
  let output = ''

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i]
    bits += 8
    while (bits >= 5) {
      output += alphabet[(value >> (bits - 5)) & 0x1f]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 0x1f]
  }

  return output
}

/**
 * Base32 decode
 */
function base32Decode(encoded: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleaned = encoded.replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []

  for (let i = 0; i < cleaned.length; i++) {
    value = (value << 5) | alphabet.indexOf(cleaned[i])
    bits += 5
    if (bits >= 8) {
      bytes.push((value >> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}
