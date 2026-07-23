// ─────────────────────────────────────────────────────────────
// Jest polyfills PRE-JSDOM — rodam ANTES que o jsdom crie o window.
// Necessário porque jsdom define `crypto` (sem subtle) e depois o setupFilesAfterEnv
// não consegue sobrescrever de forma confiável.
// ─────────────────────────────────────────────────────────────

// TextEncoder/TextDecoder são exigidos por WebCrypto em algumas versões do jsdom
import { TextEncoder, TextDecoder } from 'util'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).TextEncoder = TextEncoder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).TextDecoder = TextDecoder

// Web Crypto API (subtle, getRandomValues, randomUUID) vinda do Node
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const nodeCrypto = require('crypto') as {
  webcrypto: Crypto
  randomBytes: (size: number) => Buffer
  randomUUID?: () => string
}

// Injetar crypto ANTES que o jsdom crie seu getter no Window
// Usamos Object.defineProperty com writable/configurable para garantir que prevaleça
Object.defineProperty(globalThis, 'crypto', {
  configurable: true,
  writable: true,
  value: {
    subtle: nodeCrypto.webcrypto.subtle,
    getRandomValues<T extends ArrayBufferView>(arr: T): T {
      const buf = arr as unknown as Uint8Array
      const bytes = nodeCrypto.randomBytes(buf.length)
      buf.set(bytes)
      return arr
    },
    randomUUID(): string {
      if (typeof nodeCrypto.randomUUID === 'function') return nodeCrypto.randomUUID()
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
  },
})

// Response polyfill (caso o jsdom da versão instalada não tenha)
if (typeof (globalThis as Record<string, unknown>).Response === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).Response = class ResponsePolyfill {
    status: number
    ok: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headers: Map<string, string>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _body: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(body: string, init?: { status?: number; headers?: Record<string, string> }) {
      this._body = body
      this.status = init?.status ?? 200
      this.ok = this.status >= 200 && this.status < 300
      this.headers = new Map(Object.entries(init?.headers ?? {}))
    }
    async json(): Promise<unknown> {
      return JSON.parse(this._body)
    }
    async text(): Promise<string> {
      return this._body
    }
  }
}

// Variáveis de ambiente padrão para testes
process.env.TOTP_ENCRYPTION_KEY =
  process.env.TOTP_ENCRYPTION_KEY ||
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
if (!process.env.LOG_LEVEL) process.env.LOG_LEVEL = 'info'
