// ─────────────────────────────────────────────────────────────
// 2FA Metadata — SEO para páginas de autenticação de dois fatores
// ─────────────────────────────────────────────────────────────

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Autenticação de Dois Fatores — Segurança da Conta',
  description: 'Proteja sua conta KIYVO com autenticação de dois fatores (2FA). Configure TOTP e códigos de backup.',
  robots: { index: false, follow: true },
}

export default function TwoFactorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
