'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Flame, Tag, Shield, Zap, ArrowRight } from 'lucide-react'

const ofertas = [
  { produto: 'Curso Completo de Tráfego Pago', precoDe: 497, precoPor: 197, vendedor: 'Rocket Digital', desconto: 60, badge: 'MAIS VENDIDO' },
  { produto: 'Template Notion Produtividade Pro', precoDe: 97, precoPor: 47, vendedor: 'Pro Brasil', desconto: 52 },
  { produto: 'Pack 300 Criativos para Reels', precoDe: 147, precoPor: 67, vendedor: 'CriativoBR', desconto: 55 },
  { produto: 'E-book 7 Passos para Vender Online', precoDe: 47, precoPor: 19, vendedor: 'KIYVO', desconto: 60 },
  { produto: 'Plugin SEO WordPress Premium', precoDe: 197, precoPor: 97, vendedor: 'WP Brasil', desconto: 51 },
  { produto: 'Mentoria Grupo VIP Marketing', precoDe: 1497, precoPor: 797, vendedor: 'Acad Digital', desconto: 47, badge: 'VIP' },
]

export default function BlackFridayClient() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white pb-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-orange-600 opacity-95" />
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-black/25 backdrop-blur px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Flame className="w-4 h-4" /> Black Friday KIYVO 2026
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
            BLACK FRIDAY<br />
            <span className="text-yellow-300">ATÉ 60% OFF</span>
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Produtos digitais com desconto REAL. Sem pegadinha, sem letrinhas miúdas, com garantia de 7 dias.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="#ofertas" className="bg-yellow-300 hover:bg-yellow-400 text-black rounded-full px-8 py-4 font-black text-sm flex items-center justify-center gap-2">
              Ver ofertas <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/vender" className="border-2 border-white/30 rounded-full px-8 py-4 font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10">
              Quero vender na BF
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/70 font-semibold flex-wrap">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Garantia 7 dias</span>
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Descontos reais</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Entrega instantânea</span>
          </div>
        </div>
      </section>

      <section id="ofertas" className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-3xl md:text-4xl font-black mb-8">Ofertas da semana</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ofertas.map((o, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 hover:bg-white/10 transition relative overflow-hidden">
              {o.badge && (
                <span className="absolute top-4 right-4 bg-yellow-300 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{o.badge}</span>
              )}
              <div className="text-6xl font-black text-red-400">-{o.desconto}%</div>
              <h3 className="font-black text-xl mt-4">{o.produto}</h3>
              <p className="text-white/60 text-sm mt-1">por {o.vendedor}</p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-white/50 line-through text-sm">R$ {o.precoDe.toFixed(2).replace('.', ',')}</span>
                <span className="text-3xl font-black text-yellow-300">R$ {o.precoPor.toFixed(2).replace('.', ',')}</span>
              </div>
              <span className="text-xs text-white/60">à vista ou 12x de R$ {(o.precoPor / 12).toFixed(2).replace('.', ',')}</span>
              <button className="mt-5 w-full bg-white text-black rounded-full py-3 font-black text-sm flex items-center justify-center gap-2 hover:bg-yellow-300 transition">
                Quero aproveitar <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-14">
        <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-[2rem] p-8 md:p-10 text-center">
          <h2 className="text-3xl font-black">Quer vender na Black Friday?</h2>
          <p className="mt-3 text-white/90">Cadastre seu produto na KIYVO e lucre com o maior evento de compras do ano. Taxa de 8% máxima (teto R$50).</p>
          <Link href="/vender" className="mt-6 inline-flex items-center gap-2 bg-black text-white rounded-full px-8 py-4 font-black text-sm hover:bg-white hover:text-black transition">
            Começar a vender <Zap className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
