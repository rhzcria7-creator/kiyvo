// ─────────────────────────────────────────────────────────────
// KIYVO — Cookies de referência (lado servidor)
// Guarda o código do afiliado que indicou o visitante.
// ─────────────────────────────────────────────────────────────

import { cookies } from 'next/headers'
import { REFERRAL_COOKIE, AFFILIATE } from './constants'

export function readReferralCookie(): string | null {
  const store = cookies()
  const code = store.get(REFERRAL_COOKIE)?.value
  return code && code.length >= 3 && code.length <= 32 ? code : null
}

export function writeReferralCookie(code: string) {
  const store = cookies()
  const maxAge = 60 * 60 * 24 * AFFILIATE.cookieDurationDays
  store.set(REFERRAL_COOKIE, code, {
    maxAge,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export function clearReferralCookie() {
  cookies().delete(REFERRAL_COOKIE)
}
