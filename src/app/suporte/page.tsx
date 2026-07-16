'use client'

import { PageTransition } from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MessageSquare, Mail, HelpCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function SuportePage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <h1 className="font-display font-extrabold text-3xl text-surface-900 mb-3">Central de Ajuda</h1>
        <p className="text-surface-500 mb-8">Estamos aqui para ajudar. Escolha o canal que preferir.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: HelpCircle, title: 'FAQ', desc: 'Respostas rápidas para as dúvidas mais comuns', href: '/faq', cta: 'Ver FAQ' },
            { icon: MessageSquare, title: 'Ticket de Suporte', desc: 'Abra um ticket e nossa equipe responde em até 24h', href: '#', cta: 'Abrir Ticket' },
            { icon: Mail, title: 'E-mail Comercial', desc: 'Parcerias e assuntos comerciais', href: 'mailto:contato@playdex.com.br', cta: 'Enviar E-mail' },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="card-base p-6 group hover:border-brand-200">
              <item.icon size={28} className="text-brand-600 mb-3" />
              <h3 className="font-display font-bold text-surface-900">{item.title}</h3>
              <p className="text-sm text-surface-500 mt-1">{item.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold mt-3 group-hover:gap-2 transition-all">{item.cta} <ExternalLink size={14} /></span>
            </Link>
          ))}
        </div>

        <h2 className="font-display font-bold text-xl text-surface-900 mb-4">Links Úteis</h2>
        <div className="card-base divide-y divide-surface-100">
          {[
            { href: '/como-funciona', label: 'Como funciona' },
            { href: '/tarifas', label: 'Tarifas e prazos' },
            { href: '/pagamentos', label: 'Formas de pagamento' },
            { href: '/reembolso', label: 'Política de reembolso' },
            { href: '/recompensas', label: 'Programa de recompensas' },
            { href: '/termos', label: 'Termos de uso' },
            { href: '/privacidade', label: 'Política de privacidade' },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-surface-700 hover:text-brand-600 hover:bg-brand-50 transition-all">
              {link.label}
              <ExternalLink size={14} className="text-surface-300" />
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
