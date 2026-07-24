'use client'
import { motion } from 'framer-motion'
import { Shield, TrendingDown, Zap, Clock, Bot, Sparkles, Handshake, BadgeCheck } from 'lucide-react'

const diferenciais = [
  {
    icone: <TrendingDown className="w-6 h-6" />,
    cor: 'from-emerald-500 to-green-600',
    titulo: 'Taxa de 8% com teto de R$50',
    desc: 'Vendeu um produto de R$10.000? Você paga R$50, não R$800 como nos concorrentes. Essa é a diferença de quem é justo.',
  },
  {
    icone: <Zap className="w-6 h-6" />,
    cor: 'from-amber-500 to-orange-600',
    titulo: 'Saque em 1 dia útil',
    desc: 'Receba seu dinheiro rápido via PIX. Mínimo de R$30 com taxa fixa de R$0,99. Sem burocracia, sem segurar seu dinheiro.',
  },
  {
    icone: <Bot className="w-6 h-6" />,
    cor: 'from-brand-500 to-indigo-600',
    titulo: '200+ agentes de IA inclusos',
    desc: 'Copy, banners, SEO, thumbnails, email, upsell, script de venda, calculadoras — tudo de graça, direto na plataforma.',
  },
  {
    icone: <Shield className="w-6 h-6" />,
    cor: 'from-rose-500 to-red-600',
    titulo: 'Garantia de 7 dias',
    desc: 'Comprador protegido pelo CDC. Se o produto não entregar o prometido, devolução 100% sem enrolação.',
  },
  {
    icone: <Clock className="w-6 h-6" />,
    cor: 'from-purple-500 to-violet-600',
    titulo: 'Acesso imediato',
    desc: 'Assim que o pagamento confirma, o produto digital chega no email e na conta do comprador em segundos.',
  },
  {
    icone: <Handshake className="w-6 h-6" />,
    cor: 'from-teal-500 to-cyan-600',
    titulo: 'Afiliados sem leilão',
    desc: 'Sistema de afiliados transparente. Você escolhe quem pode divulgar seus produtos, comissão e janela de cookie.',
  },
  {
    icone: <Sparkles className="w-6 h-6" />,
    cor: 'from-fuchsia-500 to-pink-600',
    titulo: 'KD Points (cashback)',
    desc: 'Comprador ganha pontos que viram desconto em compras futuras (100 KD = R$1). Fideliza e faz vender mais.',
  },
  {
    icone: <BadgeCheck className="w-6 h-6" />,
    cor: 'from-slate-700 to-slate-900',
    titulo: 'Verificação & Selo Oficial',
    desc: 'Vendedores verificados ganham selo e destaque. Produtos oficiais são auditados antes de ir ao ar.',
  },
]

export function HomeDiferenciais() {
  return (
    <section className="py-16 md:py-24 bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="inline-block text-[11px] font-black uppercase tracking-widest text-brand-500 mb-3">Por que KIYVO</div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Feito por quem vende digital.
            <br />
            <span className="text-slate-500 dark:text-slate-400">Sem pegadinhas.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {diferenciais.map((d, i) => (
            <motion.div
              key={d.titulo}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white dark:bg-[#111827] rounded-[1.75rem] p-6 border border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-lg transition group"
            >
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${d.cor} text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition`}>
                {d.icone}
              </div>
              <h3 className="text-base md:text-lg font-black text-[#0F172A] dark:text-white mb-1.5">{d.titulo}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
