'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Pencil, Code, Palette, Music, Video, Briefcase, GraduationCap, ArrowRight } from 'lucide-react'

const categorias = [
  { icone: <BookOpen />, nome: 'Cursos e mentorias', desc: 'Cursos online, mentorias, e-books.' },
  { icone: <Pencil />, nome: 'Copywriting', desc: 'Copys, cartas de venda, roteiros.' },
  { icone: <Code />, nome: 'Plugins e software', desc: 'Códigos, plugins, bots, SaaS.' },
  { icone: <Palette />, nome: 'Artes e design', desc: 'Templates, packs, presets, artes.' },
  { icone: <Music />, nome: 'Áudio e música', desc: 'Beats, samples, efeitos, lojas.' },
  { icone: <Video />, nome: 'Vídeo', desc: 'Presets de edição, LUTs, templates.' },
  { icone: <Briefcase />, nome: 'Serviços freelance', desc: 'Tráfego, design, programação, consultoria.' },
  { icone: <GraduationCap />, nome: 'Material de estudo', desc: 'Resumos, apostilas, mapas mentais.' },
]

export function HomeParaQuem() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0B0F1A]">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="inline-block text-[11px] font-black uppercase tracking-widest text-brand-500 mb-3">O que vender</div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mb-4">
            Qualquer tipo de produto digital.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg">
            Se você cria algo digital, tem espaço na KIYVO.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {categorias.map((c, i) => (
            <motion.div
              key={c.nome}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-slate-50 dark:bg-[#111827] rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-800 hover:shadow-md transition"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 text-brand-600 flex items-center justify-center mb-3 [&>svg]:w-5 [&>svg]:h-5">
                {c.icone}
              </div>
              <div className="font-black text-sm md:text-base text-[#0F172A] dark:text-white">{c.nome}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{c.desc}</div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/anunciar" className="inline-flex items-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3 font-bold text-sm hover:scale-105 transition">
            Publicar meu produto <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
