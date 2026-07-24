'use client'
// HomeDoisPublicos — Cards lado a lado para COMPRADORES e VENDEDORES balanceando a plataforma
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag, Rocket, ArrowRight, Shield, Zap, Download, Star, Gift, TrendingUp } from 'lucide-react'

export function HomeDoisPublicos() {
  return (
    <section className="py-14 md:py-20 bg-white dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity:0,y:10 }} whileInView={{ opacity:1,y:0 }} viewport={{ once: true }}
          className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            <span className="w-6 h-px bg-brand-500" /> Para todo mundo <span className="w-6 h-px bg-brand-500" />
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-tight">
            Feito para quem <span className="kiyvo-gradient-text">compra</span> e quem <span className="kiyvo-gradient-text">vende</span>
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            Não somos só para vendedores: a KIYVO foi construída para ser o lugar mais confiável
            para descobrir e comprar produtos digitais, com preço justo e entrega imediata.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* CARD COMPRADORES */}
          <motion.div
            initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once: true }} transition={{ delay:0.1 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-700 text-white p-7 md:p-9 group hover:shadow-2xl hover:shadow-brand-500/30 transition-shadow">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-5 -bottom-5 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/80 mb-1">Para compradores</p>
              <h3 className="text-2xl md:text-3xl font-black mb-2">Descubra, compre, use.</h3>
              <p className="text-white/85 text-sm mb-5 max-w-md">
                789 produtos digitais de 60+ vendedores verificados.
                Entrega automática em segundos, garantia de 7 dias, cupons em todo produto e PIX na hora.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  { icon: Shield, t: 'Garantia de 7 dias em todas as compras' },
                  { icon: Download, t: 'Download imediato após aprovação' },
                  { icon: Gift, t: 'Cupom automático em cada produto' },
                  { icon: Star, t: 'Avaliações reais de quem comprou' },
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <b.icon className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <span>{b.t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/buscar" className="inline-flex items-center gap-2 bg-white text-[#0F172A] rounded-full px-6 py-3 font-black text-sm shadow-xl hover:scale-105 transition">
                Explorar produtos <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="ml-3 inline-flex items-center gap-1.5 text-xs font-bold text-white/90">
                <Zap className="w-3.5 h-3.5" /> ou <Link href="/ofertas" className="underline font-black text-white hover:text-yellow-200">ver ofertas</Link>
              </span>
            </div>
          </motion.div>

          {/* CARD VENDEDORES */}
          <motion.div
            initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once: true }} transition={{ delay:0.2 }}
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 text-white p-7 md:p-9 group hover:shadow-2xl hover:shadow-emerald-500/30 transition-shadow">
            <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-5 -bottom-5 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-white/80 mb-1">Para vendedores</p>
              <h3 className="text-2xl md:text-3xl font-black mb-2">Crie, venda, cresça.</h3>
              <p className="text-white/85 text-sm mb-5 max-w-md">
                Taxa Zero nas primeiras 5.000 vendas. Menores taxas do Brasil, saque em 1 dia via PIX,
                200+ agentes de IA para escalar. Publique seu produto em 5 minutos.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  { icon: TrendingUp, t: '0% nas primeiras 5.000 vendas' },
                  { icon: Zap, t: 'Saque em 1 dia via PIX a partir de R$30' },
                  { icon: Star, t: 'Boost de destaque e tráfego pago' },
                  { icon: Gift, t: '200+ agentes de IA gratuitos' },
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <b.icon className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                    <span>{b.t}</span>
                  </li>
                ))}
              </ul>
              <Link href="/vender" className="inline-flex items-center gap-2 bg-white text-[#0F172A] rounded-full px-6 py-3 font-black text-sm shadow-xl hover:scale-105 transition">
                Começar a vender <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="ml-3 inline-flex items-center gap-1.5 text-xs font-bold text-white/90">
                <Zap className="w-3.5 h-3.5" /> ou <Link href="/planos" className="underline font-black text-white hover:text-yellow-200">ver planos</Link>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
