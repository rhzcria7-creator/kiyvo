// ─────────────────────────────────────────────────────────────
// FAQ Metadata — SEO para página de perguntas frequentes
// ─────────────────────────────────────────────────────────────

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes — Tire suas dúvidas',
  description: 'Perguntas frequentes sobre o KIYVO: como comprar, vender, pagamentos, retiradas, KD Points e segurança.',
  openGraph: {
    title: 'FAQ — Perguntas Frequentes | KIYVO',
    description: 'Tire suas dúvidas sobre compras, vendas, pagamentos e segurança no KIYVO.',
    url: 'https://kiyvo.com/faq',
  },
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
