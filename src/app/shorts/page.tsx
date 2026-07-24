'use client'
// KIYVO Shorts — rede social integrada (estilo Instagram/TikTok)
// COM upload real de fotos, vídeos e arquivos. Comentários funcionais. Like/repost/save/seguir.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, MessageCircle, Repeat2, Bookmark, Share2, Plus,
  Verified, ArrowLeft, Home, Search, Bell, User as UserIcon,
  Send, Image as ImageIcon, Type, X, Sparkles, TrendingUp,
  Video as VideoIcon, Paperclip, Camera, UploadCloud, ArrowRight,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useShorts, MY_USER_ID, type Short } from '@/lib/shorts/store'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'react-hot-toast'

type MediaType = 'texto' | 'foto' | 'video' | 'arquivo'

interface UploadedMedia {
  tipo: MediaType
  nome: string
  dataUrl: string
  sizeKb?: number
}

function compressImage(file: File, maxDim = 1400, quality = 0.8): Promise<string> {
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

export default function ShortsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { loaded, shorts, create, like, comment, follow, unfollow, isFollowing, repost, save, saved, init } = useShorts()
  const [composing, setComposing] = useState(false)
  const [newText, setNewText] = useState('')
  const [newMediaType, setNewMediaType] = useState<MediaType>('texto')
  const [newMedia, setNewMedia] = useState<UploadedMedia | null>(null)
  const [activeComments, setActiveComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [tabAtiva, setTabAtiva] = useState(0)
  const fotoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const arqRef = useRef<HTMLInputElement>(null)

  useEffect(() => { init() }, [init])

  const allFeed = useShorts(s => s.shorts)
  const trending = useShorts(s => s.trending())

  const feed = (() => {
    if (tabAtiva === 1) return trending
    if (tabAtiva === 2) return allFeed.filter(s => useShorts.getState().isFollowing(s.userId) || s.userId === MY_USER_ID)
    if (tabAtiva === 3) return allFeed.filter(s => s.tags.some(t => ['venda', 'oferta', 'blackfriday', 'promocao', 'desconto', 'cupom'].includes(t.toLowerCase())))
    if (tabAtiva === 4) return allFeed.filter(s => s.tags.some(t => ['ia', 'gpt', 'prompts', 'ai', 'nvidia'].includes(t.toLowerCase())))
    if (tabAtiva === 5) return allFeed.filter(s => s.tags.some(t => ['curso', 'cursos', 'aula', 'estudar'].includes(t.toLowerCase())))
    return useShorts.getState().feedForUser(MY_USER_ID)
  })()

  if (!loaded) return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0B0F1A]"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  async function handleFoto(files: FileList | null) {
    if (!files || !files[0]) return
    try {
      const f = files[0]
      const d = await compressImage(f, 1400, 0.8)
      setNewMedia({ tipo: 'foto', nome: f.name, dataUrl: d, sizeKb: Math.round(f.size / 1024) })
      toast.success('Foto carregada!')
    } catch { toast.error('Erro ao carregar foto') }
  }
  function handleVideo(files: FileList | null) {
    if (!files || !files[0]) return
    const f = files[0]
    if (f.size > 60 * 1024 * 1024) { toast.error('Vídeo deve ter no máximo 60MB'); return }
    const r = new FileReader()
    r.onload = () => {
      setNewMedia({ tipo: 'video', nome: f.name, dataUrl: r.result as string, sizeKb: Math.round(f.size / 1024) })
      toast.success('Vídeo carregado!')
    }
    r.readAsDataURL(f)
  }
  function handleArq(files: FileList | null) {
    if (!files || !files[0]) return
    const f = files[0]
    if (f.size > 15 * 1024 * 1024) { toast.error('Arquivo deve ter no máximo 15MB'); return }
    const r = new FileReader()
    r.onload = () => {
      setNewMedia({ tipo: 'arquivo', nome: f.name, dataUrl: r.result as string, sizeKb: Math.round(f.size / 1024) })
      toast.success('Arquivo carregado!')
    }
    r.readAsDataURL(f)
  }

  function postar() {
    if (!user) { toast.error('Faça login para postar'); router.push('/login?redirect=/shorts'); return }
    if (newMediaType === 'texto' && newText.trim().length < 3) { toast.error('Escreva algo (mín. 3 caracteres)'); return }
    if (newMediaType !== 'texto' && !newMedia) { toast.error('Selecione uma mídia'); return }
    const hashtags = newText.match(/#[\wÀ-ÿ]+/g)?.map(t => t.slice(1)) || []
    const type: Short['type'] = newMediaType === 'foto' ? 'foto' : newMediaType === 'video' ? 'video' : newMediaType === 'arquivo' ? 'arquivo' : 'texto'
    create({
      userId: MY_USER_ID,
      userName: user.email?.split('@')[0] || 'Você',
      userHandle: '@' + (user.email?.split('@')[0] || 'voce').toLowerCase().replace(/[^a-z0-9]/g, ''),
      avatarEmoji: '👤',
      type,
      conteudo: newMedia?.dataUrl,
      texto: newText.trim() || (newMedia ? `📎 ${newMedia.nome}` : ''),
      tags: hashtags,
    })
    setNewText('')
    setNewMedia(null)
    setNewMediaType('texto')
    setComposing(false)
    toast.success('Post publicado! 🚀')
  }

  function toggleLike(s: Short) { like(s.id, MY_USER_ID) }
  function addComment(s: Short) {
    if (!commentText.trim()) return
    if (!user) { toast.error('Faça login pra comentar'); return }
    comment(s.id, MY_USER_ID, user.email?.split('@')[0] || 'Você', commentText.trim())
    setCommentText('')
  }
  function toggleFollow(uid: string) {
    if (!user) { toast.error('Faça login pra seguir'); return }
    if (isFollowing(uid)) { unfollow(uid); toast.success('Deixou de seguir') }
    else { follow(uid); toast.success('Seguindo!') }
  }
  function doRepost(s: Short) {
    if (!user) { toast.error('Faça login pra repostar'); return }
    repost(s.id, MY_USER_ID, user.email?.split('@')[0] || 'Você', '@voce', '👤')
    toast.success('Repostado! 🔄')
  }
  function doSave(sid: string) {
    if (!user) { toast.error('Faça login pra salvar'); return }
    save(sid); toast.success(saved.includes(sid) ? 'Removido dos salvos' : 'Salvo!')
  }
  function doShare(s: Short) {
    if (navigator.share) {
      navigator.share({ title: 'KIYVO Shorts', text: s.texto, url: 'https://kiyvo.com.br/shorts' }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(`https://kiyvo.com.br/shorts`)
      toast.success('Link copiado!')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F1A]">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {/* Cabeçalho */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 via-fuchsia-500 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0F172A] dark:text-white leading-none">KIYVO Shorts</h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">A rede social do marketplace</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setComposing(true)}
            className="bg-[#0F172A] dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            <Plus className="w-4 h-4" /> Postar
          </motion.button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar">
          {['Para você', 'Em alta', 'Seguindo', 'Vendas', 'IA', 'Cursos'].map((t, i) => (
            <button key={t} onClick={() => setTabAtiva(i)}
              className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider whitespace-nowrap transition ${tabAtiva === i ? 'bg-[#0F172A] text-white dark:bg-white dark:text-black' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Lista de posts */}
        <div className="space-y-4">
          {feed.length === 0 && (
            <div className="text-center py-16">
              <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="font-black text-slate-500 mb-1">Nenhum post no seu feed</p>
              <p className="text-sm text-slate-400">Siga lojas ou publique seu primeiro short.</p>
            </div>
          )}
          {feed.map((s, i) => {
            const liked = s.likes.includes(MY_USER_ID)
            const isSaved = saved.includes(s.id)
            return (
              <motion.article
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i*0.07, 0.5) }}
                className="bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden"
              >
                {/* Header do post */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-xl shadow">
                    {s.avatarEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-black text-[#0F172A] dark:text-white text-sm truncate">{s.userName}</p>
                      {s.verified && <Verified className="w-4 h-4 text-brand-500 fill-brand-500 flex-shrink-0" />}
                      {s.repostOf && <span className="text-[10px] text-slate-400 font-bold">🔄 repost</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{s.userHandle} • {timeAgo(s.createdAt)}</p>
                  </div>
                  {s.userId !== MY_USER_ID && s.userId.startsWith('s-') && (
                    <button onClick={() => toggleFollow(s.userId)}
                      className={`text-xs font-black px-3 py-1.5 rounded-full transition ${isFollowing(s.userId) ? 'bg-slate-100 dark:bg-slate-800 text-slate-600' : 'bg-brand-600 text-white'}`}>
                      {isFollowing(s.userId) ? 'Seguindo' : 'Seguir'}
                    </button>
                  )}
                </div>

                {/* Conteúdo */}
                {s.type === 'foto' && s.conteudo && (
                  <div className="px-4 pb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.conteudo} alt="" className="w-full rounded-2xl object-cover max-h-[500px]" />
                  </div>
                )}
                {s.type === 'video' && s.conteudo && (
                  <div className="px-4 pb-3">
                    <video src={s.conteudo} controls className="w-full rounded-2xl max-h-[500px]" />
                  </div>
                )}
                {s.type === 'arquivo' && s.conteudo && (
                  <div className="px-4 pb-3">
                    <a href={s.conteudo} download
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition">
                      <Paperclip className="w-5 h-5 text-brand-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#0F172A] dark:text-white truncate">📎 {s.texto.includes('📎') ? s.texto.replace('📎 ', '') : 'Arquivo'}</p>
                        <p className="text-[10px] text-slate-500">Clique para baixar</p>
                      </div>
                    </a>
                  </div>
                )}
                <div className="px-4 pb-3">
                  <p className="text-[15px] text-[#0F172A] dark:text-white leading-relaxed whitespace-pre-wrap">{linkify(s.texto)}</p>
                  {s.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.tags.map(t => <span key={t} className="text-xs text-brand-600 dark:text-brand-400 font-black">#{t}</span>)}
                    </div>
                  )}
                </div>

                {/* Barra ações */}
                <div className="flex items-center gap-1 px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                  <ActionBtn active={liked} onClick={() => toggleLike(s)} icon={<Heart className={liked ? 'fill-red-500 text-red-500' : ''} />} label={formatCount(s.likes.length)} color="text-red-500" />
                  <ActionBtn active={activeComments === s.id} onClick={() => setActiveComments(activeComments === s.id ? null : s.id)} icon={<MessageCircle />} label={formatCount(s.comments.length)} />
                  <ActionBtn onClick={() => doRepost(s)} icon={<Repeat2 />} label={formatCount(s.reposts.length)} />
                  <ActionBtn active={isSaved} onClick={() => doSave(s.id)} icon={<Bookmark className={isSaved ? 'fill-amber-500 text-amber-500' : ''} />} label="" />
                  <div className="flex-1" />
                  <button onClick={() => doShare(s)}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Comentários */}
                <AnimatePresence>
                  {activeComments === s.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-black/20">
                      <div className="max-h-60 overflow-y-auto p-4 space-y-3">
                        {s.comments.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Nenhum comentário ainda. Seja o primeiro!</p>}
                        {s.comments.map(c => (
                          <div key={c.id} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-sm flex-shrink-0">👤</div>
                            <div>
                              <p className="text-xs font-black text-[#0F172A] dark:text-white">{c.userName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">{c.body}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(c.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 flex gap-2 border-t border-slate-200 dark:border-slate-800">
                        <input value={commentText} onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addComment(s) }}
                          placeholder="Comentar..." className="flex-1 bg-white dark:bg-slate-900 rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-brand-500" />
                        <button onClick={() => addComment(s)} className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center disabled:opacity-40" disabled={!commentText.trim()}>
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      </main>

      {/* Modal de postar */}
      <AnimatePresence>
        {composing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/70 backdrop-blur flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => { setComposing(false); setNewMedia(null); setNewMediaType('texto') }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white dark:bg-[#0F172A] rounded-t-[2rem] sm:rounded-[2rem] p-5 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-[#0F172A] dark:text-white">Novo Short</h2>
                <button onClick={() => { setComposing(false); setNewMedia(null); setNewMediaType('texto') }} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!user ? (
                <div className="text-center py-8">
                  <UserIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-bold text-slate-600 mb-4">Faça login para postar</p>
                  <button onClick={() => router.push('/login?redirect=/shorts')}
                    className="inline-flex items-center gap-2 bg-[#0F172A] text-white rounded-full px-6 py-3 font-black text-sm">
                    Entrar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Tipos de mídia */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <MediaTypeBtn icon={<Type className="w-4 h-4" />} label="Texto" active={newMediaType === 'texto'} onClick={() => { setNewMediaType('texto'); setNewMedia(null) }} />
                    <MediaTypeBtn icon={<Camera className="w-4 h-4" />} label="Foto" active={newMediaType === 'foto'} onClick={() => fotoRef.current?.click()} />
                    <MediaTypeBtn icon={<VideoIcon className="w-4 h-4" />} label="Vídeo" active={newMediaType === 'video'} onClick={() => videoRef.current?.click()} />
                    <MediaTypeBtn icon={<Paperclip className="w-4 h-4" />} label="Arquivo" active={newMediaType === 'arquivo'} onClick={() => arqRef.current?.click()} />
                  </div>
                  <input ref={fotoRef} type="file" accept="image/*" className="sr-only" onChange={e => { setNewMediaType('foto'); handleFoto(e.target.files); e.target.value = '' }} />
                  <input ref={videoRef} type="file" accept="video/*" className="sr-only" onChange={e => { setNewMediaType('video'); handleVideo(e.target.files); e.target.value = '' }} />
                  <input ref={arqRef} type="file" className="sr-only" onChange={e => { setNewMediaType('arquivo'); handleArq(e.target.files); e.target.value = '' }} />

                  {/* Preview da mídia */}
                  {newMedia && (
                    <div className="relative mb-3 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                      {newMedia.tipo === 'foto' && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={newMedia.dataUrl} alt="" className="w-full max-h-72 object-contain" />
                      )}
                      {newMedia.tipo === 'video' && <video src={newMedia.dataUrl} controls className="w-full max-h-72" />}
                      {newMedia.tipo === 'arquivo' && (
                        <div className="flex items-center gap-3 p-4">
                          <Paperclip className="w-8 h-8 text-brand-500" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{newMedia.nome}</p>
                            <p className="text-xs text-slate-500">{newMedia.sizeKb}KB</p>
                          </div>
                        </div>
                      )}
                      <button onClick={() => { setNewMedia(null); setNewMediaType('texto') }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Área de upload (se tiver escolhido tipo mas não tiver mídia) */}
                  {newMediaType !== 'texto' && !newMedia && (
                    <button onClick={() => {
                      if (newMediaType === 'foto') fotoRef.current?.click()
                      else if (newMediaType === 'video') videoRef.current?.click()
                      else arqRef.current?.click()
                    }}
                      className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition mb-3">
                      <UploadCloud className="w-8 h-8 text-brand-500" />
                      <p className="text-xs font-black text-brand-700 dark:text-brand-300">Clique para enviar</p>
                    </button>
                  )}

                  <textarea value={newText} onChange={e => setNewText(e.target.value)} maxLength={500}
                    placeholder="Escreva uma legenda... Use #hashtags para alcançar mais pessoas. Ex: Novo curso disponível! #marketing #cursos"
                    className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-sm outline-none border-2 border-transparent focus:border-brand-500 resize-none" />
                  <div className="flex justify-between items-center mt-2 mb-4">
                    <span className="text-xs text-slate-400">{newText.length}/500</span>
                    <span className="text-xs text-slate-400">Dica: uma boa legenda aumenta o engajamento</span>
                  </div>
                  <button onClick={postar}
                    disabled={(newMediaType === 'texto' && newText.trim().length < 3) || (newMediaType !== 'texto' && !newMedia)}
                    className="w-full bg-gradient-to-r from-brand-600 via-fuchsia-500 to-amber-500 text-white font-black py-3.5 rounded-full text-sm uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg">
                    <Sparkles className="w-4 h-4" /> Publicar Short
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 z-40 safe-bottom">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
          {[
            { icon: Home, label: 'Início', href: '/' },
            { icon: Search, label: 'Buscar', href: '/buscar' },
            { icon: Plus, label: 'Postar', special: true, onClick: () => setComposing(true) },
            { icon: Bell, label: 'Alertas' },
            { icon: UserIcon, label: 'Perfil', href: '/conta' },
          ].map((item, i) => (
            <button key={i} onClick={item.onClick || (() => item.href && router.push(item.href))}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.special ? '-mt-5' : ''}`}>
              {item.special ? (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-brand-500/40 text-white">
                  <item.icon className="w-6 h-6" />
                </div>
              ) : <item.icon className="w-5 h-5 text-slate-500" />}
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <Footer />
    </div>
  )
}

function ActionBtn({ active, onClick, icon, label, color }: { active?: boolean; onClick?: () => void; icon: React.ReactNode; label: string; color?: string }) {
  return (
    <motion.button whileTap={{ scale: 0.9 }} onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-2 rounded-full transition ${active ? color || 'text-brand-600' : 'text-slate-500 dark:text-slate-400'}`}>
      {icon}
      {label && <span className="text-xs font-bold">{label}</span>}
    </motion.button>
  )
}

function MediaTypeBtn({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
      {icon}{label}
    </button>
  )
}

function formatCount(n: number) {
  if (n >= 1000) return (n/1000).toFixed(1).replace('.0','') + 'k'
  return String(n)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff/1000), m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24)
  if (s < 60) return `${s}s`
  if (m < 60) return `${m}min`
  if (h < 24) return `${h}h`
  return `${d}d`
}

function linkify(text: string) {
  const parts = text.split(/(#[^\s]+|https?:\/\/[^\s]+)/g)
  return parts.map((p, i) => {
    if (p.startsWith('#')) return <span key={i}><br className="hidden" /><span className="text-brand-600 dark:text-brand-400 font-black cursor-pointer hover:underline">{p}</span></span>
    if (p.startsWith('http')) return <a key={i} href={p} target="_blank" rel="noopener" className="text-brand-600 underline">{p}</a>
    return <span key={i}>{p}</span>
  })
}
