'use client'

/**
 * Footer — tema dark chique (#0F172A) consistente com o novo design.
 * Estilo Linear/Apple — tipografia forte, cinzas suaves, sem gradientes baratos.
 */

import Link from 'next/link'
import { KiyvoLogoSvg } from '@/components/brand'
import { Github, Twitter, Instagram, Linkedin } from 'lucide-react'

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
          <div className="flex items-center gap-3 text-white/40">
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:text-white transition"><Twitter size={16}/></a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:text-white transition"><Instagram size={16}/></a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:text-white transition"><Github size={16}/></a>
            <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:text-white transition"><Linkedin size={16}/></a>
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
