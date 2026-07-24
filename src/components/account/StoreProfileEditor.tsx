'use client'
// StoreProfileEditor — edita foto, banner, bio e tags da loja do vendedor.
// Envia para PATCH /api/seller/profile (LocalDB) e atualiza o perfil em memória.
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Image as ImageIcon, Tag, Save, Loader2, X, Store as StoreIcon, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'react-hot-toast'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}

export function StoreProfileEditor() {
  const { profile, refreshProfile } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [bio, setBio] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!profile) return
    setAvatarUrl(profile.avatar_url ?? null)
    setBannerUrl(profile.banner_url ?? null)
    setBio(profile.bio ?? '')
    setTags(Array.isArray(profile.tags) ? profile.tags : [])
  }, [profile])

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 2MB)')
      return
    }
    try {
      setAvatarUrl(await readFileAsDataUrl(f))
    } catch {
      toast.error('Não foi possível carregar a imagem')
    }
  }

  async function onPickBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 4 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 4MB)')
      return
    }
    try {
      setBannerUrl(await readFileAsDataUrl(f))
    } catch {
      toast.error('Não foi possível carregar a imagem')
    }
  }

  function addTag() {
    const t = tagDraft.trim().replace(/^#/, '').toLowerCase()
    if (!t) return
    if (tags.length >= 12) {
      toast.error('Máximo de 12 tags')
      return
    }
    if (!tags.includes(t)) setTags((prev) => [...prev, t])
    setTagDraft('')
  }

  function onTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  async function salvar() {
    setSaving(true)
    try {
      const res = await fetch('/api/seller/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ avatar_url: avatarUrl, banner_url: bannerUrl, bio, tags }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Erro ao salvar')
        return
      }
      toast.success('Perfil da loja atualizado! 🎉')
      await refreshProfile()
    } catch {
      toast.error('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
          <StoreIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg text-surface-900 dark:text-white">Perfil da Loja</h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">Foto, banner, bio e tags que aparecem na sua loja pública.</p>
        </div>
      </div>

      {/* Banner + Avatar */}
      <div className="relative rounded-2xl overflow-hidden border border-surface-100 dark:border-surface-800">
        <div className="h-28 sm:h-32 bg-gradient-to-br from-brand-500 via-violet-600 to-fuchsia-600 relative">
          {bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt="Banner da loja" className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={() => bannerRef.current?.click()}
            className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 text-xs font-bold bg-black/40 hover:bg-black/60 text-white rounded-full px-3 py-1.5 backdrop-blur transition"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Banner
          </button>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={onPickBanner} />
        </div>
        <div className="px-4 pb-4 flex items-end gap-3 -mt-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white dark:bg-surface-800 border-4 border-white dark:border-surface-900 shadow-lg overflow-hidden flex items-center justify-center text-2xl font-black text-brand-600">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Foto do perfil" className="w-full h-full object-cover" />
              ) : (
                <span>{(profile?.username || '?').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-lg transition"
              aria-label="Trocar foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          </div>
          <div className="pb-1">
            <p className="font-display font-bold text-surface-900 dark:text-white">@{profile?.username || 'usuario'}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Loja pública em /loja/{profile?.username || 'usuario'}
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-4">
        <label className="block text-[11px] font-black uppercase tracking-widest text-surface-500 dark:text-surface-400 mb-2">Bio da loja</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Conte o que você vende e por que comprar com você..."
          className="w-full px-4 py-3 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:border-brand-500 outline-none transition text-sm resize-none"
        />
        <p className="text-right text-[10px] text-surface-400 mt-1">{bio.length}/500</p>
      </div>

      {/* Tags */}
      <div className="mt-3">
        <label className="block text-[11px] font-black uppercase tracking-widest text-surface-500 dark:text-surface-400 mb-2">Tags (máx 12)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-xs font-bold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 rounded-full px-3 py-1">
              <Tag className="w-3 h-3" /> {t}
              <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={onTagKey}
          placeholder="digite e pressione Enter (ex: cursos, marketing)"
          className="w-full px-4 py-3 rounded-2xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:border-brand-500 outline-none transition text-sm"
        />
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={salvar}
          disabled={saving}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar perfil
        </button>
      </div>
    </motion.div>
  )
}
