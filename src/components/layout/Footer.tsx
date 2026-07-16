import Link from 'next/link'

const footerLinks = {
  Plataforma: [
    { href: '/como-funciona', label: 'Como Funciona' },
    { href: '/categorias', label: 'Categorias' },
    { href: '/anunciar', label: 'Anunciar' },
    { href: '/tarifas', label: 'Tarifas e Prazos' },
    { href: '/pagamentos', label: 'Formas de Pagamento' },
  ],
  Suporte: [
    { href: '/faq', label: 'Perguntas Frequentes' },
    { href: '/suporte', label: 'Central de Ajuda' },
    { href: '/reembolso', label: 'Política de Reembolso' },
    { href: '/recompensas', label: 'Programa de Recompensas' },
  ],
  Legal: [
    { href: '/termos', label: 'Termos de Uso' },
    { href: '/privacidade', label: 'Política de Privacidade' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-surface-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-extrabold text-sm">P</span>
              </div>
              <span className="font-display font-extrabold text-xl">
                Play<span className="text-brand-400">dex</span>
              </span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed mb-4">
              O marketplace de tudo que é digital. Compre e venda jogos, software, cursos, e-books, templates, gift cards e muito mais com total segurança.
            </p>
            <div className="flex gap-3">
              {['Discord', 'Twitter', 'YouTube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-brand-600 flex items-center justify-center text-surface-400 hover:text-white transition-all text-xs font-bold"
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-sm text-white mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-400 hover:text-brand-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-surface-500">
            © 2026 Playdex. Todos os direitos reservados. Playdex Tecnologia da Informação Ltda.
          </p>
          <div className="flex items-center gap-4 text-xs text-surface-500">
            <span>🔒 Pagamentos seguros</span>
            <span>⚡ PIX instantâneo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
