'use client'
// HomeCompradores — Seção dedicada aos COMPRADORES com benefícios e categorias quentes.
// Equilibra o foco da plataforma, que não é só para vendedores.
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Zap, Download, Gift, Star, Clock,
  ArrowRight, Sparkles, ShoppingBag, CreditCard, Headphones, Percent
} from 'lucide-react'

const BENEFICIOS = [
  { icon: ShieldCheck, titulo: 'Garantia de 7 dias', desc: 'Se não curtir, devolvemos 100% do dinheiro sem burocracia.', cor: 'from-emerald-500 to-teal-600' },
  { icon: Download, titulo: 'Download instantâneo', desc: 'Assim que o pagamento confirma, o produto já está na sua biblioteca.', cor: 'from-blue-500 to-indigo-600' },
  { icon: Gift, titulo: 'Cupom em TODO produto', desc: 'Cada página de produto já te dá um cupom automático de desconto.', cor: 'from-fuchsia-500 to-pink-600' },
  { icon: CreditCard, titulo: 'PIX com 5% OFF', desc: 'Pague no PIX e ganhe desconto instantâneo em qualquer compra.', cor: 'from-amber-500 to-orange-600' },
  { icon: Star, titulo: 'Avaliações reais', desc: 'Veja reviews de quem realmente comprou, com fotos e comentários.', cor: 'from-yellow-400 to-amber-500' },
  { icon: Headphones, titulo: 'Suporte humano', desc: 'Nosso time responde no Telegram em minutos, sempre que precisar.', cor: 'from-sky-500 to-cyan-600' },
]

const CATEGORIAS_QUENTES = [
  { nome: 'Cursos', emoji: '📚', qtd: '180+', href: '/buscar?q=curso', cor: 'from-brand-500 to-indigo-600' },
  { nome: 'Templates', emoji: '🎨', qtd: '120+', href: '/buscar?q=template', cor: 'from-pink-500 to-rose-600' },
  { nome: 'Software', emoji: '⚙️', qtd: '90+', href: '/buscar?q=software', cor: 'from-slate-600 to-slate-800' },
  { nome: 'Marketing', emoji: '📈', qtd: '140+', href: '/buscar?q=marketing', cor: 'from-emerald-500 to-green-600' },
  { nome: 'Pack de IA', emoji: '🤖', qtd: '85+', href: '/buscar?q=prompt', cor: 'from-violet-500 to-purple-700' },
  { nome: 'Planilhas', emoji: '📊', qtd: '60+', href: '/buscar?q=planilha', cor: 'from-cyan-500 to-blue-600' },
]

export function HomeCompradores() {
  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-white to-slate-50 dark:from-[#0B0F1A] dark:to-[#0B0F1A] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity:0,y:10 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">
            <ShoppingBag className="w-3.5 h-3.5" /> Para você, comprador
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white leading-tight">
            A melhor experiência em <span className="kiyvo-gradient-text">produtos digitais</span>
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            789 produtos de 60+ lojas verificadas, com entrega imediata, garantia real e o
            melhor preço do Brasil. Tudo num lugar só.
          </p>
        </motion.div>

        {/* Benefícios */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
          {BENEFICIOS.map((b, i) => (
            <motion.div key={b.titulo}
              initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
              transition={{ delay: i*0.06, type:'spring', stiffness:200,damping:20 }}
              className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.cor} flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                <b.icon className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm md:text-base text-[#0F172A] dark:text-white mb-1">{b.titulo}</h3>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-snug">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Categorias quentes */}
        <motion.div initial={{ opacity:0,y:10 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
          className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-brand-500/5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> Categorias em alta
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Encontre o que você procura em segundos</p>
            </div>
            <Link href="/categorias" className="inline-flex items-center gap-1.5 text-xs font-black text-brand-600 dark:text-brand-400 hover:underline">
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORIAS_QUENTES.map((c, i) => (
              <motion.div key={c.nome}
                initial={{ opacity:0,scale:0.9 }} whileInView={{ opacity:1,scale:1 }} viewport={{ once:true }}
                transition={{ delay:i*0.05, type:'spring', stiffness:200,damping:20 }}>
                <Link href={c.href}
                  className="block group">
                  <div className={`aspect-square rounded-2xl bg-gradient-to-br ${c.cor} flex items-center justify-center text-4xl md:text-5xl shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all`}>
                    {c.emoji}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-black text-xs md:text-sm text-[#0F172A] dark:text-white">{c.nome}</p>
                    <p className="text-[10px] md:text-xs text-slate-500">{c.qtd} produtos</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
            <Link href="/ofertas" className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-2.5 font-black text-sm shadow-lg shadow-red-500/30 hover:scale-105 transition">
              <Percent className="w-4 h-4" /> Ver ofertas
            </Link>
            <Link href="/buscar" className="inline-flex items-center gap-2 bg-[#0F172A] dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-black rounded-full px-5 py-2.5 font-black text-sm hover:scale-105 transition">
              <Zap className="w-4 h-4" /> Explorar tudo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/lojas" className="inline-flex items-center gap-2 border-2 border-slate-200 dark:border-slate-700 rounded-full px-5 py-2.5 font-black text-sm text-[#0F172A] dark:text-white hover:border-brand-500 transition">
              <Clock className="w-4 h-4" /> Lojas
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
