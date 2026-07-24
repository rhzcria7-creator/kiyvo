'use client'

// Criar categoria — página simples e bonita no tema unificado.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Plus, Loader2, FolderPlus } from 'lucide-react'
import { KiyvoLogoSvg } from '@/components/brand'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'
import { toast } from 'react-hot-toast'

const HUES = [
  { id: 'blue', label: 'Azul', class: 'from-blue-500 to-cyan-500' },
  { id: 'violet', label: 'Roxo', class: 'from-violet-500 to-fuchsia-500' },
  { id: 'emerald', label: 'Verde', class: 'from-emerald-500 to-teal-500' },
  { id: 'rose', label: 'Rosa', class: 'from-pink-500 to-rose-500' },
  { id: 'amber', label: 'Amarelo', class: 'from-amber-500 to-yellow-500' },
  { id: 'red', label: 'Vermelho', class: 'from-red-500 to-orange-500' },
]

const EMOJIS = ['🎮','💻','📺','🎵','🎁','📚','🎨','🔌','🎬','🧩','👑','🔒','🤖','📱','🚀','⚡','💰','🎯','🏆','✨']

export default function CriarCategoriaPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('✨')
  const [hue, setHue] = useState(HUES[0].class)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim().length < 2) { toast.error('Nome muito curto'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/v1/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, icon, hue }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Erro'); setLoading(false); return }
      toast.success('Categoria criada!')
      router.push(`/categoria/${data.category.slug}`)
    } catch {
      toast.error('Erro de conexão')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#FAFAFA] dark:bg-[#0B0F1A] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-100/60 dark:bg-brand-900/30 blur-3xl"/>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-violet-100/40 dark:bg-violet-900/20 blur-3xl"/>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.5}} className="relative w-full max-w-lg">
        <Link href="/categorias" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#64748B] dark:text-white/60 hover:text-brand-600 mb-6">
          <ArrowLeft size={14}/> Voltar para categorias
        </Link>

        <div className="flex flex-col items-center mb-6">
          <Link href="/"><KiyvoLogoSvg size={40}/></Link>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 lg:p-10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.2)] dark:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] border border-black/5 dark:border-white/10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/20 text-[11px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-300 mb-3">
              <FolderPlus size={12}/> Nova categoria
            </div>
            <WordPullUp as="h1" words="Crie sua categoria." className="font-display font-black text-3xl lg:text-4xl leading-[1] tracking-tight"/>
            <p className="text-[#64748B] dark:text-white/60 text-sm mt-2">
              Qualquer usuário pode criar uma nova categoria. A comunidade aprova e ela fica pública.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/60 mb-2">Nome da categoria</label>
              <input
                type="text" value={name} onChange={e=>setName(e.target.value)} maxLength={40}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#FAFAFA] dark:bg-white/5 border border-black/5 dark:border-white/10 focus:border-brand-600 focus:bg-white dark:focus:bg-white/10 outline-none transition text-sm font-medium"
                placeholder="Ex: Cursos de IA"
                autoFocus
              />
              <p className="text-[10px] text-[#94A3B8] mt-1">{name.length}/40</p>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/60 mb-2">Descrição (opcional)</label>
              <textarea
                value={description} onChange={e=>setDescription(e.target.value)} maxLength={120}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAFAFA] dark:bg-white/5 border border-black/5 dark:border-white/10 focus:border-brand-600 focus:bg-white dark:focus:bg-white/10 outline-none transition text-sm font-medium resize-none"
                placeholder="Sobre o que é essa categoria?"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/60 mb-2">Ícone</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button type="button" key={e} onClick={()=>setIcon(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition ${
                      icon===e ? 'bg-brand-600 scale-110' : 'bg-[#FAFAFA] dark:bg-white/5 hover:bg-brand-50 border border-black/5 dark:border-white/10'
                    }`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/60 mb-2">Cor</label>
              <div className="flex flex-wrap gap-2">
                {HUES.map(h => (
                  <button type="button" key={h.id} onClick={()=>setHue(h.class)}
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${h.class} ${hue===h.class ? 'ring-2 ring-offset-2 ring-brand-600 scale-110' : ''} transition`}
                    aria-label={h.label}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-2xl bg-[#FAFAFA] dark:bg-white/5 border border-black/5 dark:border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${hue} flex items-center justify-center text-2xl`}>
                  {icon}
                </div>
                <div>
                  <p className="font-display font-black text-lg leading-tight">{name || 'Nome da categoria'}</p>
                  <p className="text-xs text-[#64748B] dark:text-white/50">0 produtos</p>
                </div>
              </div>
            </div>

            <ShimmerButton
              type="submit" size="lg" className="w-full justify-center"
              disabled={loading}
              icon={loading ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18}/>}
            >
              {loading ? 'Criando...' : 'Criar categoria'}
            </ShimmerButton>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
