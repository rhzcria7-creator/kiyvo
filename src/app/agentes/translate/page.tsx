'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import ShimmerButton from '@/components/ui/ShimmerButton'

const TITLES: Record<string,string> = {
  replymaster: 'ReplyMaster — respostas de atendimento',
  seoboost: 'SEOBoost — meta tags automáticas',
  seoscore: 'SEOScore — auditoria SEO 0-100',
  translate: 'KIYVO Translate — PT↔EN↔ES',
  promogen: 'PromoGen — gerador de promoções',
}
const DESCS: Record<string,string> = {
  replymaster: 'Cole a mensagem do cliente e receba resposta pronta com tom + sentimento + prioridade.',
  seoboost: 'Gera meta title, description, OG, Twitter, slug, JSON-LD e palavras-chave.',
  seoscore: 'Auditoria completa do anúncio: título, descrição, imagens, bullets, emojis.',
  translate: 'Traduza títulos e descrições para inglês ou espanhol.',
  promogen: 'Cria campanhas de desconto com variantes e cupom exclusivo.',
}
export default function Page() {
  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0B0F1A] min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/agentes" className="inline-flex text-xs font-black uppercase tracking-widest text-[#64748B] mb-6">← Agentes</Link>
        <motion.h1 initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="text-4xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white">{TITLES['translate']}</motion.h1>
        <p className="mt-4 text-[#64748B]">{DESCS['translate']}</p>
        <div className="mt-10 bg-white dark:bg-white/5 rounded-[2rem] p-8 border border-black/5 dark:border-white/10">
          <p className="text-sm text-[#64748B]">API pronta e integrada ao Copiloto do /anunciar. Interface completa em breve.</p>
          <div className="mt-6"><Link href="/vender"><ShimmerButton icon={<Sparkles size={14}/>}>Usar no Copiloto</ShimmerButton></Link></div>
        </div>
      </div>
    </div>
  )
}
