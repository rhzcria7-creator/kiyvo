// HomeTrustBand — Banda de confiança e segurança (comprador + vendedor).
// Reforça os dois lados do marketplace com prova social e selos reais.
// Componente de apresentação (server). Comentários em PT-BR.
import Link from 'next/link'
import { ShieldCheck, BadgeCheck, Lock, Zap, TrendingDown, Headphones } from 'lucide-react'

const ITEMS = [
  { icon: ShieldCheck, title: 'KYC & LGPD', desc: 'Identidade verificada e dados protegidos por lei.' },
  { icon: BadgeCheck, title: 'Garantia de 7 dias', desc: 'Não gostou? Reembolso garantido para o comprador.' },
  { icon: Lock, title: 'Anti-fraude 24/7', desc: 'Bloqueio de bots, chargebacks e contas falsas.' },
  { icon: Zap, title: 'Saque PIX em 1 dia', desc: 'O vendedor recebe rápido, direto na conta.' },
  { icon: TrendingDown, title: 'Taxa de 8% sem teto', desc: 'A menor do Brasil — mais lucro pra você.' },
  { icon: Headphones, title: 'Suporte humano', desc: 'Atendimento real no Telegram quando a IA não resolve.' },
]

export function HomeTrustBand() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="rounded-[2rem] border border-black/5 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/[0.04] dark:to-transparent shadow-card overflow-hidden">
          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-widest mb-3">
                Compra e venda com segurança
              </span>
              <h2 className="font-black text-2xl sm:text-3xl text-[#0F172A] dark:text-white tracking-tight">
                Do lado de cá e do lado de lá, você está protegido
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
                Seja para comprar com tranquilidade ou vender e receber certo, a KIYVO cuida do que importa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 p-4 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-sm text-[#0F172A] dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/vender"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] rounded-full px-6 py-3 text-sm font-black hover:shadow-xl transition"
              >
                Começar a vender grátis
              </Link>
              <Link
                href="/buscar"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-full px-6 py-3 text-sm font-black hover:bg-emerald-600 transition"
              >
                Explorar produtos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
