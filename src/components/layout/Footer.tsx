'use client'

/**
 * Footer — tema dark chique (#0F172A) consistente com o novo design.
 * Estilo Linear/Apple — tipografia forte, cinzas suaves, sem gradientes baratos.
 */

import Link from 'next/link'
import { KiyvoLogoSvg } from '@/components/brand'
import { Instagram, Facebook, Youtube } from 'lucide-react'

// Ícones custom (SVG) — lucide não tem TikTok/Kwai
function TiktokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9a8.16 8.16 0 0 0 4.77 1.52V7.06a4.85 4.85 0 0 1-1.84-.37z"/>
    </svg>
  )
}
function KwaiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.3 2.5c-.3-.4-.8-.5-1.2-.3-.6.3-.9 1-.7 1.7 1.3 4.3-.9 8.6-4.9 10.1-.4.2-.7.5-.8.9-.3.8.2 1.6 1 1.7 4.8.4 8.8-2.7 10.1-7.3.2-.8.1-1.5-.2-2.2l-.1-.2-2.7-3.7-.5-.7zm-3.7 5.2c-.2-.3-.6-.4-.9-.3-2.4 1-4 3.5-3.9 6.1 0 .4.3.7.7.7.4 0 .7-.3.8-.7 0-2 1.2-3.8 3-4.7.3-.1.5-.6.3-1.1zM6.9 6.1c-.4-.3-1-.2-1.3.2C3.6 8.8 2.5 12 3.4 15c.1.4.5.6.9.6h.2c.5-.1.8-.6.7-1.1-.7-2.4.1-4.9 2-6.6.3-.3.3-.8-.1-1.2l-.2-.6z"/>
    </svg>
  )
}

// Links oficiais (substitua pelos handles reais quando estiverem prontos)
const SOCIALS = [
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/kiyvo.br', label: '@kiyvo.br' },
  { name: 'TikTok', icon: TiktokIcon, href: 'https://tiktok.com/@kiyvo.br', label: '@kiyvo.br' },
  { name: 'Kwai', icon: KwaiIcon, href: 'https://kwai.com/@kiyvo', label: '@kiyvo' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com/@KIYVOBR', label: '@KIYVOBR' },
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/kiyvo.br', label: '/kiyvo.br' },
]

const COLS = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Explorar', href: '/categorias' },
      { label: 'Loja Oficial', href: '/oficial' },
      { label: 'KD Points', href: '/tutorial/kd-points' },
      { label: 'Como funciona', href: '/como-funciona' },
      { label: 'Planos', href: '/planos' },
    ],
  },
  {
    title: 'Comprar',
    links: [
      { label: 'Carrinho', href: '/cart' },
      { label: 'Favoritos', href: '/favoritos' },
      { label: 'Meus pedidos', href: '/buyer/orders' },
      { label: 'Biblioteca', href: '/buyer/library' },
      { label: 'Proteção ao comprador', href: '/protecao-comprador' },
    ],
  },
  {
    title: 'Vender',
    links: [
      { label: 'Anunciar grátis', href: '/anunciar' },
      { label: 'Dashboard vendedor', href: '/vendor/dashboard' },
      { label: 'Comissões', href: '/tarifas' },
      { label: 'Stripe Connect', href: '/ajuda/stripe-connect' },
      { label: 'Afiliados', href: '/afiliados' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Blog', href: '/blog' },
      { label: 'Carreiras', href: '/carreiras' },
      { label: 'Imprensa', href: '/imprensa' },
      { label: 'Contato', href: '/suporte' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de uso', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
      { label: 'Reembolso', href: '/politica-reembolso' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'LGPD', href: '/lgpd' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#0B0F1A] text-white/70 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top row: logo + newsletter */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12 border-b border-white/10">
          <div className="max-w-sm">
            <KiyvoLogoSvg size={36} variant="full" className="text-white" />
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              O marketplace de tudo que é digital. Compre, venda e ganhe pontos.
              Feito por brasileiros, para brasileiros.
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Siga a KIYVO</p>
            <div className="flex flex-wrap items-center gap-2">
              {SOCIALS.map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                   title={`${s.name} — ${s.label}`}
                   className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-white/30 transition">
                  <s.icon size={16} />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-white/40 mt-3">Conteúdo novo todo dia — promoções, dicas, lançamentos e bastidores.</p>
          </div>
        </div>

        {/* Colunas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 py-12">
          {COLS.map(col => (
            <div key={col.title}>
              <p className="font-display font-black text-xs uppercase tracking-widest text-white mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/50 hover:text-white transition">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="py-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-white/40">
          <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400">🔒</span> SSL 256-bit</div>
          <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-brand-400">🛡️</span> Escrow Protegido</div>
          <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-400">⚡</span> Entrega instantânea</div>
          <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/80">🇧🇷</span> Feito no Brasil</div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} KIYVO. Todos os direitos reservados. CNPJ 00.000.000/0001-00</p>
          <div className="flex items-center gap-5">
            <span>PIX</span><span>Visa</span><span>Mastercard</span><span>Boleto</span><span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
