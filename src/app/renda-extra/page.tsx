'use client'
// Página "Renda Extra" — apresenta todas formas de ganhar dinheiro NA KIYVO
// (sem ser ladrão: afiliado, indicação, vender produto, freelance, vender gift card)
import { motion } from 'framer-motion'
import { Wallet, Users, Briefcase, Gift, TrendingUp, ArrowRight, Sparkles, BadgeCheck, Zap, Shield } from 'lucide-react'
import Link from 'next/link'

const formas = [
  {
    icone: <Wallet className="w-7 h-7" />,
    cor: 'from-emerald-500 to-green-700',
    titulo: 'Venda seus produtos digitais',
    desc: 'Publique cursos, e-books, templates, plugins, artes, serviços ou qualquer produto digital. Taxa justa de 8% (menor do Brasil), receba em PIX quando passar de R$30.',
    ganhoPotencial: 'R$500 a R$50.000/mês',
    como: [
      '1. Crie sua conta grátis',
      '2. Publique em 5 minutos',
      '3. Venda com PIX, cartão, boleto',
      '4. Saque quando chegar em R$30',
    ],
    cta: 'Publicar produto',
    href: '/anunciar',
    dificuldade: 'Baixa',
  },
  {
    icone: <Users className="w-7 h-7" />,
    titulo: 'Afiliado de produtos',
    desc: 'Divulgue produtos de outros vendedores e ganhe de 10% a 50% de comissão por venda. Links rastreáveis, saque das comissões em R$50.',
    cor: 'from-blue-500 to-indigo-700',
    ganhoPotencial: 'R$200 a R$10.000/mês',
    como: [
      '1. Encontre um produto que você recomenda',
      '2. Gere seu link de afiliado',
      '3. Compartilhe (sem spam!)',
      '4. Ganhe a cada venda',
    ],
    cta: 'Ver produtos de afiliado',
    href: '/afiliados',
    dificuldade: 'Média',
  },
  {
    icone: <Users className="w-7 h-7" />,
    titulo: 'Indique um amigo',
    desc: 'Indique a KIYVO para amigos que vendem ou compram. Quando eles comprarem ou venderem R$100+, você ganha R$5 em crédito (500 KD Points = R$5).',
    cor: 'from-pink-500 to-fuchsia-700',
    ganhoPotencial: 'R$50 a R$500/mês',
    como: [
      '1. Pegue seu link único',
      '2. Compartilhe com amigos',
      '3. Eles se cadastram',
      '4. Você ganha KD Points',
    ],
    cta: 'Pegar link',
    href: '/indique-ganhe',
    dificuldade: 'Muito baixa',
  },
  {
    icone: <Briefcase className="w-7 h-7" />,
    titulo: 'Freelancer digital',
    desc: 'Ofereça seus serviços de design, copy, programação, edição, tráfego, consultoria, suporte. Receba propostas e feche projetos.',
    cor: 'from-purple-500 to-violet-700',
    ganhoPotencial: 'R$1.000 a R$20.000/mês',
    como: [
      '1. Monte seu portfólio',
      '2. Dê bid em jobs abertos',
      '3. Seja contratado',
      '4. Receba pela plataforma (proteção)',
    ],
    cta: 'Ver jobs',
    href: '/freelance',
    dificuldade: 'Média',
  },
  {
    icone: <Gift className="w-7 h-7" />,
    titulo: 'Revenda gift cards / códigos',
    desc: 'Venda gift cards, licenças de software, contas premium ou códigos digitais. Entrega automática.',
    cor: 'from-orange-500 to-amber-700',
    ganhoPotencial: 'R$300 a R$3.000/mês',
    como: [
      '1. Cadastre o gift card',
      '2. Defina preço e estoque',
      '3. Entrega automática',
      '4. Receba por venda',
    ],
    cta: 'Cadastrar gift card',
    href: '/anunciar',
    dificuldade: 'Baixa',
  },
  {
    icone: <Sparkles className="w-7 h-7" />,
    titulo: 'Use agentes para vender MAIS',
    desc: 'Deixe os 120+ agentes IA da KIYVO escreverem copies, títulos, emails, thumbnails, ofertas, scripts de lançamento e upsell pra você. Muitos são gratuitos.',
    cor: 'from-cyan-500 to-blue-700',
    ganhoPotencial: '+20-300% nas suas vendas',
    como: [
      '1. Escolha um agente',
      '2. Responda perguntas',
      '3. Copie o resultado',
      '4. Use no seu produto',
    ],
    cta: 'Ver agentes',
    href: '/agentes',
    dificuldade: 'Zero',
  },
]

export default function RendaExtraPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-10 md:pt-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> Ganhe dinheiro de verdade
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] dark:text-white leading-[0.95]">
            Formas de ganhar <span className="bg-gradient-to-r from-emerald-500 to-brand-500 bg-clip-text text-transparent">dinheiro</span><br className="hidden md:block" /> com a KIYVO
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Sem taxas abusivas, sem pegadinhas, sem precisar ser influencer. Formas REAIS de fazer
            renda extra (ou renda principal) dentro da plataforma.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold"><Shield className="w-3.5 h-3.5" /> Taxa máx 8%</span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold"><BadgeCheck className="w-3.5 h-3.5" /> PIX em 1 dia</span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold"><Zap className="w-3.5 h-3.5" /> Saque a partir de R$30</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {formas.map((f, i) => (
            <motion.div
              key={f.titulo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col relative overflow-hidden"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.cor} flex items-center justify-center text-white mb-4 shadow-lg`}>
                {f.icone}
              </div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-white mb-1">{f.titulo}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">{f.desc}</p>

              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mb-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Potencial</div>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{f.ganhoPotencial}</div>
                <div className="text-[11px] text-slate-500 mt-1">Dificuldade: {f.dificuldade}</div>
              </div>

              <ul className="space-y-1.5 mb-5">
                {f.como.map((p, j) => (
                  <li key={j} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{p}
                  </li>
                ))}
              </ul>

              <Link href={f.href} className="w-full bg-[#0F172A] dark:bg-white dark:text-black text-white rounded-full py-3 text-sm font-bold inline-flex items-center justify-center gap-2 hover:bg-black transition">
                {f.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-br from-[#0F172A] to-[#1E293B] dark:from-brand-600 dark:to-brand-800 rounded-[2rem] p-8 md:p-10 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3">Não deixe seu talento parado</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6">
            Mais de 2.000 pessoas já estão ganhando dinheiro na KIYVO. Seja mais um. Começar é de graça.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-2 bg-white text-[#0F172A] rounded-full px-8 py-3.5 font-black text-sm hover:scale-105 transition">
            Criar conta grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
