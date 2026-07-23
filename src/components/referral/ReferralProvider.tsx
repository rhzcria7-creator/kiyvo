// ─────────────────────────────────────────────────────────────
// KIYVO — ReferralProvider
// Wrapper client-only que injeta o banner de boas-vindas do afiliado
// no topo do site (abaixo do header). É renderizado em TODO o site
// para detectar ?ref=CODE ou /r/CODE em qualquer página.
// ─────────────────────────────────────────────────────────────

'use client'

import { ReferralBanner } from './ReferralBanner'

export function ReferralProvider() {
  return <ReferralBanner />
}
