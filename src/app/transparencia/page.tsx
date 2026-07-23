'use client'
// Página de Transparência — o DIFERENCIAL da KIYVO contra concorrentes que roubam
// Taxas claras, sem surpresas, máximo 8%
import { motion } from 'framer-motion'
import { Shield, Percent, TrendingDown, CheckCircle2, XCircle, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'

const planos = [
  { nome: 'Grátis', cor: '#64748B', taxaProduto: '8%', taxaFixa: 'R$0,50', teto: 'R$50', texto: 'Para começar a vender' },
  { nome: 'Plus', cor: '#2563EB', taxaProduto: '6,5%', taxaFixa: 'R$0,40', teto: 'R$40', texto: 'Vendedor ativo' },
  { nome: 'Pro', cor: '#8B5CF6', taxaProduto: '5%', taxaFixa: 'R$0,30', teto: 'R$30', texto: 'Profissionais' },
  { nome: 'Vendor Pro', cor: '#F59E0B', taxaProduto: '3%', taxaFixa: 'R$0,20', teto: 'R$20', texto: 'Vendedores escalais, ZERO taxa nos primeiros R$5k' },
]

const concorrentes = [
  { nome: 'KIYVO', taxa: '3-8% + R$0,20-0,50', teto: 'R$20-50', escondeTaxa: false, saida: 'R$30', saqueCusto: 'R$0,99 fixo', justo: true },
  { nome: 'Hotmart', taxa: '10,99% + R$1,00', teto: 'Sem teto', escondeTaxa: true, saida: 'R$20', saqueCusto: 'R$1,99 + taxa', justo: false },
  { nome: 'Monetizze', taxa: '9,9% + R$1,00', teto: 'Sem teto', escondeTaxa: true, saida: 'R$20', saqueCusto: 'R$1,99', justo: false },
  { nome: 'Eduzz', taxa: '9,9% + R$1,00', teto: 'Sem teto', escondeTaxa: true, saida: 'R$50', saqueCusto: 'R$3,49', justo: false },
  { nome: 'Kiwifi', taxa: '12% + R$1', teto: 'Sem teto', escondeTaxa: true, saida: 'R$50', saqueCusto: 'Variável', justo: false },
  { nome: 'GGMax', taxa: '15% + escondidas', teto: 'Sem teto', escondeTaxa: true, saida: 'R$100+', saqueCusto: 'Alta', justo: false },
  { nome: 'Microsoft Store', taxa: '30% (um terço)', teto: 'Sem teto', escondeTaxa: false, saida: 'Complexo', saqueCusto: 'Internacional', justo: false },
]

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-10 md:pt-16">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">
            <Shield className="w-3.5 h-3.5" /> Transparência que você nunca viu
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] dark:text-white leading-[0.95]">
            A plataforma <span className="bg-gradient-to-r from-brand-500 to-emerald-500 bg-clip-text text-transparent">mais justa</span> do Brasil
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
            Não cobramos taxas escondidas como os concorrentes. <strong className="text-slate-900 dark:text-white">Taxa máxima de 8% com teto de R$50</strong> — se vender um produto de R$10.000, nunca pagará mais de R$50 pra KIYVO. Sim, é isso mesmo.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href="/anunciar" className="inline-flex items-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3 text-sm font-bold hover:scale-105 transition">
              Começar a vender <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/calcular-taxas" className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-full px-6 py-3 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Percent className="w-4 h-4" /> Calcular lucro real
            </Link>
          </div>
        </motion.div>

        {/* Taxas por plano */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-2">Taxas por plano — tudo na mesa</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Escolha o plano que faz sentido pra você. Sem letras miúdas.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {planos.map((p, i) => (
              <motion.div
                key={p.nome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden"
              >
                {p.nome === 'Vendor Pro' && (
                  <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-1 rounded-full">MELHOR</div>
                )}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: p.cor + '22', color: p.cor }}>
                  <TrendingDown className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-[#0F172A] dark:text-white">{p.nome}</h3>
                <p className="text-xs text-slate-500 mb-4">{p.texto}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taxa produto</span>
                    <span className="font-bold">{p.taxaProduto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Taxa fixa</span>
                    <span className="font-bold">{p.taxaFixa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Teto máx.</span>
                    <span className="font-bold">{p.teto}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Comparação com concorrentes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-2">Comparativo: a verdade crua</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Dados públicos dos sites oficiais (julho/2026). Nós não temos vergonha de mostrar.</p>
          <div className="bg-white dark:bg-[#111827] rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <th className="text-left p-4">Plataforma</th>
                  <th className="text-right p-4">Taxa de venda</th>
                  <th className="text-right p-4">Teto</th>
                  <th className="text-center p-4">Saída mín.</th>
                  <th className="text-center p-4">Saque</th>
                  <th className="text-center p-4">Taxas escondidas?</th>
                </tr>
              </thead>
              <tbody>
                {concorrentes.map((c) => (
                  <tr key={c.nome} className={`border-b border-slate-50 dark:border-slate-800/60 ${c.justo ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
                    <td className="p-4 font-black text-[#0F172A] dark:text-white">
                      {c.justo && <span className="mr-1">✅</span>}
                      {c.nome}
                    </td>
                    <td className="text-right p-4 font-semibold">{c.taxa}</td>
                    <td className="text-right p-4">{c.teto}</td>
                    <td className="text-center p-4">{c.saida}</td>
                    <td className="text-center p-4">{c.saqueCusto}</td>
                    <td className="text-center p-4">
                      {c.escondeTaxa ? <XCircle className="w-4 h-4 text-red-500 inline" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Obs: taxas de concorrentes podem ter sido alteradas após esta data. Consulte sempre os termos oficiais.
          </p>
        </motion.section>

        {/* Promessas KIYVO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white mb-6">Nossas promessas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { titulo: 'Taxa máxima de 8%', texto: 'JAMAIS cobraremos mais que 8% + taxa fixa por produto digital. Escrito em pedra no código.' },
              { titulo: 'Teto de R$50 por transação', texto: 'Se você vender um produto de R$10.000, pagará R$50 pra KIYVO, não R$800 como em outros lugares.' },
              { titulo: 'Saque mínimo R$30', texto: 'Saque quando chegar em R$30 com taxa fixa de R$0,99 — PIX em até 1 dia útil.' },
              { titulo: 'Sem taxas surpresa', texto: 'Nada de "taxa de processamento", "taxa de saque internacional", "taxa de resposta" e outros nomes bonitos.' },
              { titulo: 'Reembolso fácil', texto: '7 dias de garantia ao comprador e devolução automática sem burocracia se o cliente não ficar feliz.' },
              { titulo: 'Seus dados são seus', texto: 'Nunca vendemos seus dados nem de seus compradores. LGPD levado a sério.' },
            ].map((p, i) => (
              <motion.div
                key={p.titulo}
                initial={{ opacity: 0, x: i % 2 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.05 }}
                className="bg-white dark:bg-[#111827] rounded-[2rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-[#0F172A] dark:text-white mb-1">{p.titulo}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{p.texto}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] dark:from-brand-600 dark:to-brand-800 rounded-[2rem] p-8 md:p-12 text-white text-center"
        >
          <Lock className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-black mb-3">Chega de pagar taxas abusivas</h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Publique seu primeiro produto em 5 minutos. A KIYVO é brasileira, feita por quem vende digital pra quem vende digital.
          </p>
          <Link href="/anunciar" className="inline-flex items-center gap-2 bg-white text-[#0F172A] rounded-full px-8 py-4 text-sm font-black hover:scale-105 transition">
            Publicar produto grátis <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
