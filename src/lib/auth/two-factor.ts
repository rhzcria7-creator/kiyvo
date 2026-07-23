// ─────────────────────────────────────────────────────────────
// KIYVO — Autenticação de Dois Fatores (2FA) Backend
// TOTP (Time-based One-Time Password) + Códigos de Backup
// Compatível com Google Authenticator, Authy, etc.
// AES-256-GCM real para secrets TOTP (Web Crypto API)
// QR Code real via biblioteca `qrcode`
// ─────────────────────────────────────────────────────────────

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability'

// ─── CONFIGURAÇÃO DE CRIPTOGRAFIA ────────────────────────────

/** Versão do envelope de criptografia */
const ENC_VERSION_V1 = 'enc_v1_'
const ENC_VERSION_V2 = 'enc_v2_'

/**
 * Deriva a chave AES-256-GCM a partir de segredo da aplicação.
 * Usa HKDF-SHA256 com salt fixo e info de contexto.
 *
 * Em produção, TOTP_ENCRYPTION_KEY deve ser uma chave hex de 32 bytes
 * definida no .env.local. Gerada com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 * Se a chave não estiver definida, cai para uma chave derivada do SUPABASE_URL + NEXTAUTH_SECRET
 * (protege básico mas NÃO é seguro contra atacantes com acesso ao .env — exigir chave explícita em produção).
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const rawMaterial =
    process.env.TOTP_ENCRYPTION_KEY ||
    `${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}:${process.env.NEXTAUTH_SECRET || process.env.NEXT_PUBLIC_SUPABASE_URL || 'kiyvo-dev'}`

  // Se TOTP_ENCRYPTION_KEY for hex de 64 chars (32 bytes), usar direto
  let keyMaterial: CryptoKey
  if (/^[0-9a-fA-F]{64}$/.test(rawMaterial)) {
    const rawBytes = hexToBytes(rawMaterial)
    keyMaterial = await crypto.subtle.importKey(
      'raw',
      toBufferSource(rawBytes),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    )
    return keyMaterial
  }

  // Derivar via HKDF de uma senha/material textual
  const enc = new TextEncoder()
  const materialCopy = toBufferSource(enc.encode(rawMaterial))
  const saltBytes = toBufferSource(enc.encode('kiyvo-totp-v2-salt'))
  const infoBytes = toBufferSource(enc.encode('kiyvo-2fa-aes256gcm-v2'))

  const baseKey = await crypto.subtle.importKey(
    'raw',
    materialCopy,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  )
  keyMaterial = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: saltBytes,
      info: infoBytes,
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  if (!process.env.TOTP_ENCRYPTION_KEY) {
    logger.warn('TOTP_ENCRYPTION_KEY não configurada — usando chave derivada. Defina TOTP_ENCRYPTION_KEY em .env.local para produção.')
  }

  return keyMaterial
}

// ─── CONFIGURAÇÃO TOTP ──────────────────────────────────────

const TOTP_WINDOW = 1 // Permite 1 período antes/depois (30s cada)
const TOTP_PERIOD = 30 // Segundos por código
const TOTP_DIGITS = 6 // Número de dígitos
const BACKUP_CODES_COUNT = 10 // Códigos de backup gerados
const BACKUP_CODE_LENGTH = 8 // Caracteres por código

// ─── TOTP IMPLEMENTATION (RFC 6238) ─────────────────────────

/**
 * Gera uma chave secreta TOTP (Base32) para o usuário
 * Esta chave deve ser armazenada criptografada no banco
 */
export function generateTOTPSecret(): string {
  // Gerar 20 bytes aleatórios e codificar em Base32
  const bytes = new Uint8Array(20)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    // Fallback para ambientes sem crypto
    for (let i = 0; i < 20; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
  }
  return base32Encode(bytes)
}

/**
 * Gera a URL otpauth:// para QR Code
 * Formato padrão compatível com todos os apps TOTP
 */
export function generateTOTPURI(params: {
  secret: string
  email: string
  issuer?: string
}): string {
  const issuer = encodeURIComponent(params.issuer || 'KIYVO')
  const email = encodeURIComponent(params.email)
  const secret = encodeURIComponent(params.secret)
  return `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`
}

/**
 * Verifica um código TOTP contra o segredo
 * Implementa o algoritmo HOTP/TOTP (RFC 4226 / RFC 6238)
 */
export function verifyTOTP(
  secret: string,
  code: string,
  timestamp?: number
): boolean {
  if (!secret || !code || code.length !== TOTP_DIGITS) return false

  const now = timestamp || Math.floor(Date.now() / 1000)
  const timeStep = Math.floor(now / TOTP_PERIOD)

  // Verificar janela de tempo (permite drift de relógio)
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    const candidateStep = timeStep + i
    const candidateCode = generateHOTP(secret, candidateStep)
    if (timingSafeEqual(code, candidateCode)) {
      return true
    }
  }

  return false
}

/**
 * Gera um código HOTP (HMAC-based One-Time Password)
 * Core do algoritmo TOTP
 */
function generateHOTP(secret: string, counter: number): string {
  const secretBytes = base32Decode(secret)

  // Converter counter para 8 bytes big-endian
  const counterBytes = new Uint8Array(8)
  let tempCounter = counter
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = tempCounter & 0xff
    tempCounter = Math.floor(tempCounter / 256)
  }

  // HMAC-SHA1 usando Web Crypto API
  // Nota: Em server-side Node.js, usamos crypto.createHmac
  // Aqui usamos uma implementação simplificada para compatibilidade
  const hmac = computeHMACSHA1(secretBytes, counterBytes)

  // Dynamic truncation (RFC 4226, Section 5.3)
  const offset = hmac[hmac.length - 1] & 0x0f
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)

  const otp = binary % Math.pow(10, TOTP_DIGITS)
  return otp.toString().padStart(TOTP_DIGITS, '0')
}

// ─── HMAC-SHA1 IMPLEMENTATION ────────────────────────────────
// Implementação simplificada — em produção usar crypto.subtle

function computeHMACSHA1(key: Uint8Array, message: Uint8Array): Uint8Array {
  // Bloco size para SHA-1 = 64 bytes
  const blockSize = 64

  let keyBlock = key
  if (keyBlock.length > blockSize) {
    keyBlock = sha1(keyBlock)
  }

  // Pad key to block size
  const paddedKey = new Uint8Array(blockSize)
  paddedKey.set(keyBlock)

  // Inner pad (0x36) e outer pad (0x5c)
  const innerPad = new Uint8Array(blockSize)
  const outerPad = new Uint8Array(blockSize)
  for (let i = 0; i < blockSize; i++) {
    innerPad[i] = paddedKey[i] ^ 0x36
    outerPad[i] = paddedKey[i] ^ 0x5c
  }

  // Inner hash
  const innerData = new Uint8Array(blockSize + message.length)
  innerData.set(innerPad)
  innerData.set(message, blockSize)
  const innerHash = sha1(innerData)

  // Outer hash
  const outerData = new Uint8Array(blockSize + innerHash.length)
  outerData.set(outerPad)
  outerData.set(innerHash, blockSize)
  return sha1(outerData)
}

/**
 * SHA-1 hash simplificado
 * Em produção, preferir crypto.subtle.digest('SHA-1', data)
 */
function sha1(data: Uint8Array): Uint8Array {
  // Implementação SHA-1 (FIPS 180-4) — simplificada
  // Para compatibilidade com ambientes sem crypto.subtle
  let h0 = 0x67452301
  let h1 = 0xEFCDAB89
  let h2 = 0x98BADCFE
  let h3 = 0x10325476
  let h4 = 0xC3D2E1F0

  // Pre-processing: adding padding bits
  const msgLen = data.length
  const bitLen = msgLen * 8

  // Append bit '1' (0x80 byte)
  const paddedLen = Math.ceil((msgLen + 9) / 64) * 64
  const padded = new Uint8Array(paddedLen)
  padded.set(data)
  padded[msgLen] = 0x80

  // Append original length in bits as 64-bit big-endian
  const view = new DataView(padded.buffer)
  view.setUint32(paddedLen - 4, bitLen, false)

  // Process each 512-bit (64-byte) block
  const w = new Int32Array(80)
  for (let offset = 0; offset < paddedLen; offset += 64) {
    // Prepare message schedule
    for (let i = 0; i < 16; i++) {
      w[i] = view.getInt32(offset + i * 4, false)
    }
    for (let i = 16; i < 80; i++) {
      w[i] = leftRotate(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1)
    }

    // Initialize working variables
    let a = h0, b = h1, c = h2, d = h3, e = h4

    // 80 rounds
    for (let i = 0; i < 80; i++) {
      let f: number
      let k: number
      if (i < 20) {
        f = (b & c) | (~b & d)
        k = 0x5A827999
      } else if (i < 40) {
        f = b ^ c ^ d
        k = 0x6ED9EBA1
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d)
        k = 0x8F1BBCDC
      } else {
        f = b ^ c ^ d
        k = 0xCA62C1D6
      }

      const temp = (leftRotate(a, 5) + f + e + k + w[i]) | 0
      e = d
      d = c
      c = leftRotate(b, 30)
      b = a
      a = temp
    }

    h0 = (h0 + a) | 0
    h1 = (h1 + b) | 0
    h2 = (h2 + c) | 0
    h3 = (h3 + d) | 0
    h4 = (h4 + e) | 0
  }

  // Produce the final hash value (big-endian)
  const result = new Uint8Array(20)
  const resultView = new DataView(result.buffer)
  resultView.setUint32(0, h0, false)
  resultView.setUint32(4, h1, false)
  resultView.setUint32(8, h2, false)
  resultView.setUint32(12, h3, false)
  resultView.setUint32(16, h4, false)
  return result
}

function leftRotate(n: number, d: number): number {
  return ((n << d) | (n >>> (32 - d))) | 0
}

// ─── BASE32 ENCODING/DECODING ────────────────────────────────

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32Encode(bytes: Uint8Array): string {
  let result = ''
  let bits = 0
  let value = 0

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8

    while (bits >= 5) {
      bits -= 5
      result += BASE32_ALPHABET[(value >>> bits) & 0x1f]
    }
  }

  if (bits > 0) {
    result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f]
  }

  return result
}

function base32Decode(str: string): Uint8Array {
  const cleaned = str.replace(/[=\s]/g, '').toUpperCase()
  const bytes: number[] = []
  let bits = 0
  let value = 0

  for (let i = 0; i < cleaned.length; i++) {
    const index = BASE32_ALPHABET.indexOf(cleaned[i])
    if (index === -1) continue
    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      bits -= 8
      bytes.push((value >>> bits) & 0xff)
    }
  }

  return new Uint8Array(bytes)
}

// ─── TIMING-SAFE COMPARISON ──────────────────────────────────

/**
 * Comparação constante-tempo para prevenir timing attacks
 * Sempre compara todos os caracteres, independente de mismatch
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ─── BACKUP CODES ────────────────────────────────────────────

/**
 * Gera códigos de backup para recuperação de conta
 * Cada código é de uso único — após uso, é removido
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < BACKUP_CODES_COUNT; i++) {
    codes.push(generateSingleBackupCode())
  }
  return codes
}

function generateSingleBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sem I, O, 0, 1 (ambíguos)
  let code = ''
  for (let i = 0; i < BACKUP_CODE_LENGTH; i++) {
    const randomIndex = cryptoRandomInt(chars.length)
    code += chars[randomIndex]
    // Adicionar hífen no meio para legibilidade (XXXX-XXXX)
    if (i === Math.floor(BACKUP_CODE_LENGTH / 2) - 1) {
      code += '-'
    }
  }
  return code
}

/**
 * Hash de código de backup para armazenamento seguro
 * Nunca armazene códigos em texto plano
 */
export function hashBackupCode(code: string): string {
  // Hash simples para Edge runtime — produção: usar bcrypt/argon2
  const salt = process.env.NEXT_PUBLIC_SITE_URL || 'kiyvo-2fa'
  const combined = code.toLowerCase().replace(/-/g, '') + salt
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `bk_${Math.abs(hash).toString(36)}`
}

// ─── CRIPTOGRAFIA AES-256-GCM REAL ───────────────────────────

/**
 * Criptografa o segredo TOTP para armazenamento seguro usando AES-256-GCM.
 * Formato: enc_v2_<base64(iv:12)><base64(ciphertext+tag:16)>
 *
 * O IV é gerado aleatoriamente por operação (12 bytes é o tamanho recomendado para GCM).
 * A tag de autenticação (16 bytes) é incluída pelo AES-GCM e anexada ao ciphertext.
 */
export async function encryptTOTPSecret(secret: string): Promise<string> {
  if (!secret) return ''
  const key = await getEncryptionKey()
  const enc = new TextEncoder()

  // IV de 12 bytes (96 bits) — recomendado pelo NIST para GCM
  const iv = new Uint8Array(new ArrayBuffer(12))
  crypto.getRandomValues(iv)

  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toBufferSource(iv), tagLength: 128 },
    key,
    toBufferSource(enc.encode(secret))
  )

  // Formato: iv || ciphertext+tag
  const ciphertextBytes = new Uint8Array(ciphertextBuf)
  const combined = new Uint8Array(new ArrayBuffer(iv.length + ciphertextBytes.length))
  combined.set(new Uint8Array(iv), 0)
  combined.set(ciphertextBytes, iv.length)

  return `${ENC_VERSION_V2}${bytesToBase64url(combined)}`
}

/**
 * Descriptografa o segredo TOTP.
 * Suporta os formatos:
 *  - enc_v2_<...> (AES-256-GCM real — formato atual)
 *  - enc_v1_<...> (legado — texto plano com prefixo, lido mas deve ser migrado)
 *  - texto puro legado (sem prefixo)
 */
export async function decryptTOTPSecret(encrypted: string): Promise<string> {
  if (!encrypted) return ''

  // V2: AES-GCM real
  if (encrypted.startsWith(ENC_VERSION_V2)) {
    const key = await getEncryptionKey()
    const combined = base64urlToBytes(encrypted.slice(ENC_VERSION_V2.length))
    if (combined.length <= 12 + 16) {
      logger.error('decryptTOTPSecret: payload criptografado corrompido ou muito curto')
      throw new Error('Erro ao descriptografar segredo TOTP')
    }
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    try {
      const plainBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: toBufferSource(iv), tagLength: 128 },
        key,
        toBufferSource(ciphertext)
      )
      return new TextDecoder().decode(plainBuf)
    } catch (err) {
      logger.error('decryptTOTPSecret: falha na decriptografia (chave ou dados inválidos)', {
        metadata: { errorMessage: err instanceof Error ? err.message : String(err) },
      })
      throw new Error('Não foi possível descriptografar o segredo 2FA. Contate o suporte se o problema persistir.')
    }
  }

  // V1: placeholder legado (texto plano)
  if (encrypted.startsWith(ENC_VERSION_V1)) {
    logger.warn('Segredo TOTP armazenado em formato legado enc_v1_ (sem criptografia). Migrar para enc_v2_ (AES-256-GCM).')
    return encrypted.slice(ENC_VERSION_V1.length)
  }

  // Texto puro (sem prefixo) — legado
  return encrypted
}

/**
 * Síncrono: mantido para compatibilidade com código antigo que chama decryptTOTPSecret sincronamente.
 * Usa o formato v1 legado (síncrono). Se receber um payload v2, lança — código chamador deve
 * ser migrado para a versão assíncrona.
 *
 * @deprecated Use decryptTOTPSecret (async) — AES-256-GCM é assíncrono por natureza.
 */
export function decryptTOTPSecretSync(encrypted: string): string {
  if (!encrypted) return ''
  if (encrypted.startsWith(ENC_VERSION_V2)) {
    throw new Error('decryptTOTPSecretSync não suporta payloads enc_v2_; use decryptTOTPSecret (async)')
  }
  if (encrypted.startsWith(ENC_VERSION_V1)) {
    return encrypted.slice(ENC_VERSION_V1.length)
  }
  return encrypted
}

// ─── HELPERS DE CODIFICAÇÃO ──────────────────────────────────

/**
 * Wrapper de tipagem para BufferSource — resolve incompatibilidade
 * entre os tipos de @types/node e lib.dom.d.ts (ArrayBuffer vs ArrayBufferLike).
 * Em runtime é um Uint8Array normal, compatível com crypto.subtle.
 */
function toBufferSource(bytes: Uint8Array): BufferSource {
  return bytes as unknown as BufferSource
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.length % 2 === 0 ? hex : `0${hex}`
  const buf = new ArrayBuffer(normalized.length / 2)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(normalized.substring(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function bytesToBase64url(bytes: Uint8Array): string {
  // Conversão segura evitando String.fromCharCode.apply com muitos argumentos
  let binary = ''
  const chunk = 8192
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk)
    binary += String.fromCharCode(...Array.from(slice))
  }
  const b64 = btoa(binary)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64urlToBytes(str: string): Uint8Array {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  const binary = atob(b64)
  const buf = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// ─── QR CODE REAL (qrcode npm) ───────────────────────────────

/**
 * Gera um QR Code como Data URL (data:image/png;base64,...) a partir da URI TOTP.
 * Usado na tela de setup do 2FA — usuário escaneia com Google Authenticator/Authy/etc.
 *
 * NOTA: Usa importação dinâmica pois `qrcode` depende de APIs Node que não devem
 * ser incluídas em bundles client-side. Esta função só deve ser chamada em Server Components
 * ou Route Handlers (server-side).
 */
export async function generateTOTPQRDataURL(uri: string, size = 256): Promise<string> {
  // Importação dinâmica para evitar inclusão no bundle client
  const qrcode = await import('qrcode')
  const dataUrl = await qrcode.toDataURL(uri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: size,
    color: {
      dark: '#0F172A', // dark surface (contraste alto)
      light: '#FFFFFF',
    },
  })
  return dataUrl
}

/**
 * Gera QR Code como string SVG (útil para inline em UI, mais leve que PNG).
 */
export async function generateTOTPQRSVG(uri: string, size = 256): Promise<string> {
  const qrcode = await import('qrcode')
  const svg = await qrcode.toString(uri, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: size,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  })
  return svg
}

// ─── CRYPTO HELPERS ──────────────────────────────────────────

function cryptoRandomInt(max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    return array[0] % max
  }
  return Math.floor(Math.random() * max)
}

// ─── DATABASE OPERATIONS ─────────────────────────────────────

interface TwoFactorSetup {
  secret: string
  uri: string
  backupCodes: string[]
}

/**
 * Inicia o setup do 2FA para um usuário
 * Retorna segredo, URI para QR Code e códigos de backup
 * O 2FA SÓ é ativado após verifyTOTPSetup() ser chamado com sucesso
 */
export async function setupTwoFactor(userId: string, email: string): Promise<TwoFactorSetup> {
  const secret = generateTOTPSecret()
  const uri = generateTOTPURI({ secret, email })
  const backupCodes = generateBackupCodes()

  // Armazenar segredo criptografado (AES-256-GCM) — pendente de verificação
  // O campo two_factor_enabled continua false até verificação
  const admin = createAdminClient()
  if (admin) {
    const hashedBackupCodes = backupCodes.map(hashBackupCode)
    const encryptedSecret = await encryptTOTPSecret(secret)

    await admin
      .from('profiles')
      .update({
        two_factor_secret: encryptedSecret,
        two_factor_backup_codes: hashedBackupCodes,
        two_factor_enabled: false, // Ainda não habilitado
      })
      .eq('id', userId)
  }

  return { secret, uri, backupCodes }
}

/**
 * Verifica o primeiro código TOTP durante o setup
 * Se válido, ATIVA o 2FA definitivamente
 */
export async function verifyTOTPSetup(
  userId: string,
  code: string
): Promise<{ success: boolean; error: string | null }> {
  const admin = createAdminClient()

  if (!admin) {
    return { success: false, error: 'Serviço indisponível' }
  }

  // Buscar segredo temporário
  const { data: profile } = await admin
    .from('profiles')
    .select('two_factor_secret, two_factor_enabled')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { success: false, error: 'Perfil não encontrado' }
  }

  const profileData = profile as Record<string, unknown>
  if (profileData.two_factor_enabled) {
    return { success: false, error: '2FA já está habilitado' }
  }

  const encryptedSecret = profileData.two_factor_secret as string | null
  if (!encryptedSecret) {
    return { success: false, error: 'Setup não iniciado' }
  }

  let secret: string
  try {
    secret = await decryptTOTPSecret(encryptedSecret)
  } catch {
    return { success: false, error: 'Erro ao recuperar o segredo 2FA. Contate o suporte.' }
  }
  const isValid = verifyTOTP(secret, code)

  if (!isValid) {
    return { success: false, error: 'Código inválido. Tente novamente.' }
  }

  // Ativar 2FA
  await admin
    .from('profiles')
    .update({ two_factor_enabled: true })
    .eq('id', userId)

  // Registrar no audit log
  await admin.from('audit_log').insert({
    user_id: userId,
    action: '2fa_enabled',
    resource: 'profile',
    severity: 'info',
    metadata: { method: 'totp' },
  })

  return { success: true, error: null }
}

/**
 * Verifica código TOTP durante login (2º fator)
 * Usado no fluxo de autenticação
 */
export async function verifyTwoFactorLogin(
  userId: string,
  code: string
): Promise<{ success: boolean; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) {
    return { success: false, error: 'Serviço indisponível' }
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('two_factor_secret, two_factor_backup_codes, two_factor_enabled')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { success: false, error: 'Perfil não encontrado' }
  }

  const profileData = profile as Record<string, unknown>
  if (!profileData.two_factor_enabled) {
    return { success: false, error: '2FA não está habilitado' }
  }

  // 1. Tentar verificação TOTP
  const encryptedSecret = profileData.two_factor_secret as string | null
  if (encryptedSecret) {
    let secret: string
    try {
      secret = await decryptTOTPSecret(encryptedSecret)
    } catch {
      return { success: false, error: 'Erro ao recuperar o segredo 2FA. Contate o suporte.' }
    }
    if (verifyTOTP(secret, code)) {
      await admin.from('audit_log').insert({
        user_id: userId,
        action: '2fa_login_success',
        resource: 'auth',
        severity: 'info',
        metadata: { method: 'totp' },
      })
      return { success: true, error: null }
    }
  }

  // 2. Tentar código de backup
  const backupCodes = (profileData.two_factor_backup_codes as string[]) || []
  const codeHash = hashBackupCode(code)
  const codeIndex = backupCodes.indexOf(codeHash)

  if (codeIndex !== -1) {
    // Remover código de backup usado (uso único)
    backupCodes.splice(codeIndex, 1)
    await admin
      .from('profiles')
      .update({ two_factor_backup_codes: backupCodes })
      .eq('id', userId)

    await admin.from('audit_log').insert({
      user_id: userId,
      action: '2fa_backup_code_used',
      resource: 'auth',
      severity: 'warning',
      metadata: { remaining_codes: backupCodes.length },
    })

    // Alertar se poucos códigos restam
    if (backupCodes.length <= 3) {
      await admin.from('notifications').insert({
        user_id: userId,
        type: 'security',
        title: '⚠️ Códigos de backup baixos',
        message: `Você tem apenas ${backupCodes.length} códigos de backup restantes. Gere novos códigos nas configurações.`,
        link: '/2fa/setup',
      })
    }

    return { success: true, error: null }
  }

  // Falha na verificação
  await admin.from('audit_log').insert({
    user_id: userId,
    action: '2fa_login_failed',
    resource: 'auth',
    severity: 'warning',
    metadata: { method: 'unknown' },
  })

  return { success: false, error: 'Código inválido' }
}

/**
 * Desativa o 2FA para um usuário
 * Requer verificação de senha ou código TOTP
 */
export async function disableTwoFactor(
  userId: string,
  verificationCode: string
): Promise<{ success: boolean; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) {
    return { success: false, error: 'Serviço indisponível' }
  }

  // Verificar código TOTP ou backup
  const verifyResult = await verifyTwoFactorLogin(userId, verificationCode)
  if (!verifyResult.success) {
    return { success: false, error: 'Código de verificação inválido' }
  }

  // Desativar 2FA
  await admin
    .from('profiles')
    .update({
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: [],
    })
    .eq('id', userId)

  await admin.from('audit_log').insert({
    user_id: userId,
    action: '2fa_disabled',
    resource: 'profile',
    severity: 'warning',
    metadata: {},
  })

  return { success: true, error: null }
}

/**
 * Gera novos códigos de backup (invalida os anteriores)
 * Requer código TOTP válido
 */
export async function regenerateBackupCodes(
  userId: string,
  totpCode: string
): Promise<{ codes: string[]; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) {
    return { codes: [], error: 'Serviço indisponível' }
  }

  // Verificar TOTP
  const verifyResult = await verifyTwoFactorLogin(userId, totpCode)
  if (!verifyResult.success) {
    return { codes: [], error: 'Código TOTP inválido' }
  }

  const newCodes = generateBackupCodes()
  const hashedCodes = newCodes.map(hashBackupCode)

  await admin
    .from('profiles')
    .update({ two_factor_backup_codes: hashedCodes })
    .eq('id', userId)

  await admin.from('audit_log').insert({
    user_id: userId,
    action: '2fa_backup_codes_regenerated',
    resource: 'profile',
    severity: 'info',
    metadata: {},
  })

  return { codes: newCodes, error: null }
}
