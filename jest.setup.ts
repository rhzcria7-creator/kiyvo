// Jest setup — importa jest-dom matchers + polyfills

import '@testing-library/jest-dom'

// Polyfill para Response (não existe em jsdom)
if (typeof globalThis.Response === 'undefined') {
  class ResponsePolyfill {
    status: number
    ok: boolean
    headers: Map<string, string>
    private _body: string

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).Response = ResponsePolyfill
}
