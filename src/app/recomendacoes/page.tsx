'use client'
// /recomendacoes — Página pública de recomendações da KIYVO.
// Clientes logados podem avaliar, anexar fotos/vídeos/arquivos,
// dar like nas recomendações, seguir, sugerir melhorias.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ThumbsUp, Heart, MessageSquare, Camera, Video, Paperclip,
  Send, Sparkles, ShieldCheck, TrendingUp, Users2, Plus, X,
  CheckCircle2, Award, ThumbsDown, UploadCloud, ArrowRight, User,
} from 'lucide-react'
import { usePlatformRecs, type RecMedia } from '@/lib/recommendations/store'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

type Cat = 'todos' | 'comprador' | 'vendedor' | 'ambos'

function compressImage(file: File, maxDim = 1400, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio); height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('canvas'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function RecomendacoesPage() {
  const { user } = useAuth()
  const { init, loaded, add, toggleLike, listAprovadas, stats } = usePlatformRecs()
  const [filtro, setFiltro] = useState<Cat>('todos')
  const [open, setOpen] = useState(false)
  const [ordenar, setOrdenar] = useState<'recentes' | 'uteis' | 'melhores'>('recentes')

  useEffect(() => { init() }, [init])

  const s = stats()
  let lista = listAprovadas().filter(r => filtro === 'todos' ? true : r.categoria === filtro)
  if (ordenar === 'melhores') lista = [...lista].sort((a, b) => b.rating - a.rating)
  else if (ordenar === 'uteis') lista = [...lista].sort((a, b) => b.likes.length - a.likes.length)
  else lista = [...lista].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-24">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFAFA] dark:from-[#0F172A] dark:to-[#0B0F1A] border-b border-slate-100 dark:border-slate-800">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-[11px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Voz dos clientes
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-[#0F172A] dark:text-white tracking-tight leading-[1.05]">
              O que a comunidade <br />
              <span className="kiyvo-gradient-text">está falando da KIYVO</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-4 max-w-2xl text-base sm:text-lg">
              Recomendações reais, com fotos, vídeos e arquivos de quem compra e vende por aqui.
              Se você usa a KIYVO, <b>sua opinião nos ajuda a melhorar todo dia</b>.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users2} valor={s.total.toLocaleString('pt-BR') + '+'} label="Avaliações" />
              <StatCard icon={Star} valor={s.media.toFixed(1)} label="Nota média" accent />
              <StatCard icon={ThumbsUp} valor={s.recomendamPct + '%'} label="Recomendam" />
              <StatCard icon={TrendingUp} valor={'NPS ' + s.nps} label="Satisfação" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3.5 font-black shadow-lg shadow-brand-500/20 text-sm">
                  <Plus className="w-4 h-4" /> Publicar minha recomendação
                </motion.button>
              ) : (
                <Link href="/login?redirect=/recomendacoes"
                  className="inline-flex items-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full px-6 py-3.5 font-black shadow-lg text-sm">
                  <User className="w-4 h-4" /> Entrar para avaliar <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <div className="inline-flex items-center gap-2 text-xs text-slate-500 px-4">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Apenas usuários verificados podem avaliar. Sem moderação de opinião — só removemos spam.
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-6">
            {([
              { id: 'todos', label: 'Todas' },
              { id: 'comprador', label: '👤 Compradores' },
              { id: 'vendedor', label: '🧑‍💼 Vendedores' },
              { id: 'ambos', label: '🤝 Ambos' },
            ] as { id: Cat; label: string }[]).map(c => (
              <button key={c.id} onClick={() => setFiltro(c.id)}
                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full transition ${filtro === c.id ? 'bg-[#0F172A] text-white dark:bg-white dark:text-black' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>
                {c.label}
              </button>
            ))}
            <div className="ml-auto flex gap-1 bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-full p-1">
              {([
                { id: 'recentes', label: 'Recentes' },
                { id: 'uteis', label: 'Mais úteis' },
                { id: 'melhores', label: 'Melhor nota' },
              ] as const).map(o => (
                <button key={o.id} onClick={() => setOrdenar(o.id)}
                  className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition ${ordenar === o.id ? 'bg-brand-500 text-white' : 'text-slate-500'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            {lista.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold">Nenhuma recomendação ainda. Seja o primeiro!</p>
              </div>
            ) : lista.map((r, i) => (
              <motion.article key={r.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="bg-white dark:bg-[#0F172A] rounded-[1.5rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center font-black text-white flex-shrink-0">
                    {r.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-[#0F172A] dark:text-white text-sm">{r.userName}</span>
                      {r.userId === 'me' && <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-white">você</span>}
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${r.recommends ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {r.recommends ? '✓ Recomenda' : '✗ Não recomenda'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{timeAgo(r.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                      ))}
                      <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-slate-400">{r.categoria}</span>
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-black text-[#0F172A] dark:text-white">{r.titulo}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{r.corpo}</p>
                {r.melhorias && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Sugestão de melhoria
                    </p>
                    <p className="text-xs text-amber-900 dark:text-amber-200">{r.melhorias}</p>
                  </div>
                )}
                {r.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.tags.map((t, i) => <span key={i} className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">#{t}</span>)}
                  </div>
                )}
                {r.media.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {r.media.map((m, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                        {m.tipo === 'foto' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.dataUrl} alt="" className="w-full h-full object-cover" />
                        ) : m.tipo === 'video' ? (
                          <video src={m.dataUrl} className="w-full h-full object-cover" controls />
                        ) : (
                          <a href={m.dataUrl} download={m.nome} className="flex flex-col items-center justify-center h-full p-2 text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            <Paperclip className="w-5 h-5 text-slate-500 mb-1" />
                            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate w-full">{m.nome}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => {
                    if (!user) { toast.error('Faça login para curtir'); return }
                    toggleLike(r.id, user.id || 'me')
                  }}
                    className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition ${r.likes.includes(user?.id || 'me') ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500'}`}>
                    <Heart className={`w-3.5 h-3.5 ${r.likes.includes(user?.id || 'me') ? 'fill-current' : ''}`} />
                    Útil ({r.likes.length})
                  </button>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 px-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Comentários em breve
                  </span>
                  {r.seguindo && <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Seguindo KIYVO</span>}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal de nova recomendação */}
      <AnimatePresence>
        {open && <NovoRecModal onClose={() => setOpen(false)} onAdd={add} user={user} />}
      </AnimatePresence>
    </>
  )
}

function StatCard({ icon: Icon, valor, label, accent }: { icon: any; valor: string; label: string; accent?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 ${accent ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800'}`}>
      <Icon className={`w-5 h-5 mb-1 ${accent ? 'text-white/80' : 'text-brand-500'}`} />
      <p className={`text-2xl font-black ${accent ? '' : 'text-[#0F172A] dark:text-white'}`}>{valor}</p>
      <p className={`text-[10px] font-black uppercase tracking-wider ${accent ? 'text-white/70' : 'text-slate-500'}`}>{label}</p>
    </motion.div>
  )
}

function NovoRecModal({ onClose, onAdd, user }: { onClose: () => void; onAdd: any; user: any }) {
  const [rating, setRating] = useState(5)
  const [recommends, setRecommends] = useState(true)
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [melhorias, setMelhorias] = useState('')
  const [categoria, setCategoria] = useState<'comprador' | 'vendedor' | 'ambos'>('comprador')
  const [tags, setTags] = useState('')
  const [media, setMedia] = useState<RecMedia[]>([])
  const [enviando, setEnviando] = useState(false)
  const fotosRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const arqRef = useRef<HTMLInputElement>(null)

  async function handleFotos(files: FileList | null) {
    if (!files) return
    const room = 8 - media.filter(m => m.tipo === 'foto').length
    for (const f of Array.from(files).slice(0, room)) {
      try {
        const d = await compressImage(f, 1400, 0.78)
        setMedia(m => [...m, { tipo: 'foto', nome: f.name, dataUrl: d, sizeKb: Math.round(f.size / 1024) }])
      } catch { /* skip */ }
    }
    toast.success('Foto(s) adicionada(s)!')
  }
  function handleVideo(files: FileList | null) {
    if (!files) return
    const f = files[0]
    if (!f) return
    if (f.size > 50 * 1024 * 1024) { toast.error('Vídeo maior que 50MB'); return }
    const r = new FileReader()
    r.onload = () => setMedia(m => [...m, { tipo: 'video', nome: f.name, dataUrl: r.result as string, sizeKb: Math.round(f.size / 1024) }])
    r.readAsDataURL(f)
  }
  function handleArq(files: FileList | null) {
    if (!files) return
    for (const f of Array.from(files).slice(0, 3)) {
      if (f.size > 10 * 1024 * 1024) { toast.error(`${f.name} > 10MB`); continue }
      const r = new FileReader()
      r.onload = () => setMedia(m => [...m, { tipo: 'arquivo', nome: f.name, dataUrl: r.result as string, sizeKb: Math.round(f.size / 1024) }])
      r.readAsDataURL(f)
    }
  }

  function enviar() {
    if (titulo.trim().length < 5) return toast.error('Título deve ter pelo menos 5 caracteres')
    if (corpo.trim().length < 20) return toast.error('Descreva sua experiência com pelo menos 20 caracteres')
    setEnviando(true)
    setTimeout(() => {
      onAdd({
        userId: user?.id || 'me',
        userName: user?.displayName || user?.email?.split('@')[0] || 'Usuário',
        rating, recommends, titulo: titulo.trim(), corpo: corpo.trim(),
        melhorias: melhorias.trim() || undefined, categoria,
        tags: tags.split(/[,;\n]/).map(t => t.trim()).filter(Boolean).slice(0, 6),
        media, seguindo: true,
      })
      toast.success('Sua recomendação foi publicada! 🙏')
      onClose()
      setEnviando(false)
    }, 400)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#0F172A] rounded-t-[2rem] sm:rounded-[2rem] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 z-10">
          <h2 className="text-lg font-black text-[#0F172A] dark:text-white">Sua opinião importa</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Nota */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Como você avalia a KIYVO?</label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => { setRating(n); if (n >= 4) setRecommends(true); else if (n <= 2) setRecommends(false) }}
                  className="p-1">
                  <Star className={`w-8 h-8 transition ${n <= rating ? 'fill-amber-400 text-amber-400 scale-110' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              ))}
              <span className="ml-3 text-lg font-black text-[#0F172A] dark:text-white">{rating}/5</span>
            </div>
          </div>
          {/* Recomenda */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setRecommends(true)}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 text-sm font-black ${recommends ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'border-slate-200 dark:border-slate-800'}`}>
              <ThumbsUp className="w-4 h-4" /> Recomendo
            </button>
            <button onClick={() => setRecommends(false)}
              className={`p-3 rounded-xl border-2 flex items-center gap-2 text-sm font-black ${!recommends ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' : 'border-slate-200 dark:border-slate-800'}`}>
              <ThumbsDown className="w-4 h-4" /> Não recomendo
            </button>
          </div>
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Você é...</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {([{ id: 'comprador', label: 'Comprador' }, { id: 'vendedor', label: 'Vendedor' }, { id: 'ambos', label: 'Ambos' }] as const).map(c => (
                <button key={c.id} onClick={() => setCategoria(c.id)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-black ${categoria === c.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}>{c.label}</button>
              ))}
            </div>
          </div>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={80} placeholder="Título da sua avaliação"
            className="w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-4 py-3 border border-transparent focus:border-brand-500 outline-none font-black text-lg" />
          <textarea value={corpo} onChange={e => setCorpo(e.target.value)} rows={4} maxLength={2000}
            placeholder="Conte sua experiência com a KIYVO. O que gostou? O que poderia melhorar? Seja honesto(a) — sua opinião ajuda milhares de pessoas."
            className="w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-4 py-3 border border-transparent focus:border-brand-500 outline-none text-sm resize-y" />
          <textarea value={melhorias} onChange={e => setMelhorias(e.target.value)} rows={2} maxLength={500}
            placeholder="💡 Alguma sugestão de melhoria? (opcional)"
            className="w-full bg-amber-50 dark:bg-amber-950/20 rounded-xl px-4 py-3 border border-amber-200 dark:border-amber-900/50 outline-none text-sm resize-y" />
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="Tags separadas por vírgula (ex: entrega rapida, suporte bom, taxas)"
            className="w-full bg-[#FAFAFA] dark:bg-[#0B0F1A] rounded-xl px-4 py-3 border border-transparent focus:border-brand-500 outline-none text-sm" />

          {/* Mídia */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Anexar mídia (opcional)</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <button type="button" onClick={() => fotosRef.current?.click()} className="flex flex-col items-center gap-1 py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-500 hover:text-brand-500 transition">
                <Camera className="w-5 h-5" /><span className="text-[10px] font-black uppercase">Fotos</span>
              </button>
              <button type="button" onClick={() => videoRef.current?.click()} className="flex flex-col items-center gap-1 py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-500 hover:text-brand-500 transition">
                <Video className="w-5 h-5" /><span className="text-[10px] font-black uppercase">Vídeo</span>
              </button>
              <button type="button" onClick={() => arqRef.current?.click()} className="flex flex-col items-center gap-1 py-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-500 hover:text-brand-500 transition">
                <Paperclip className="w-5 h-5" /><span className="text-[10px] font-black uppercase">Arquivo</span>
              </button>
            </div>
            <input ref={fotosRef} type="file" accept="image/*" multiple className="sr-only" onChange={e => handleFotos(e.target.files)} />
            <input ref={videoRef} type="file" accept="video/*" className="sr-only" onChange={e => handleVideo(e.target.files)} />
            <input ref={arqRef} type="file" multiple className="sr-only" onChange={e => handleArq(e.target.files)} />
            {media.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {media.map((m, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {m.tipo === 'foto' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.dataUrl} alt="" className="w-full h-full object-cover" />
                    ) : m.tipo === 'video' ? (
                      <div className="flex items-center justify-center h-full"><Video className="w-6 h-6 text-slate-500" /></div>
                    ) : (
                      <div className="flex items-center justify-center h-full p-1"><Paperclip className="w-5 h-5 text-slate-500" /></div>
                    )}
                    <button onClick={() => setMedia(media.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button disabled={enviando} onClick={enviar}
            className="w-full bg-[#0F172A] text-white rounded-full py-4 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
            {enviando ? <><Sparkles className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Publicar recomendação</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return Math.floor(diff / 60) + 'min'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h'
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + 'd'
  return new Date(iso).toLocaleDateString('pt-BR')
}
