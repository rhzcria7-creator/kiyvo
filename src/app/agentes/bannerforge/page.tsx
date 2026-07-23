'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, RefreshCw, Image as ImageIcon, Palette, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Estilo = 'hero' | 'quadrado' | 'story' | 'logo' | 'card' | 'anuncio'

const ESTILOS: { id: Estilo; nome: string; dim: string; emoji: string }[] = [
  { id: 'hero', nome: 'Hero (1200×630)', dim: '1200×630', emoji: '🏠' },
  { id: 'quadrado', nome: 'Quadrado (1080×1080)', dim: '1080×1080', emoji: '🟦' },
  { id: 'story', nome: 'Story (1080×1920)', dim: '1080×1920', emoji: '📱' },
  { id: 'logo', nome: 'Logo (512×512)', dim: '512×512', emoji: '🔠' },
  { id: 'card', nome: 'Card produto (320×400)', dim: '320×400', emoji: '🎴' },
  { id: 'anuncio', nome: 'Anúncio (320×50)', dim: '320×50', emoji: '📢' },
]

const CATEGORIAS = ['jogos', 'streaming', 'software', 'cursos', 'giftcards', 'marketing', 'musica', 'outro']

export default function BannerForgePage() {
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [categoria, setCategoria] = useState<string>('jogos')
  const [estilo, setEstilo] = useState<Estilo>('hero')
  const [variante, setVariante] = useState(0)
  const [loading, setLoading] = useState(false)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function gerar(novaVariante = false) {
    if (!titulo.trim()) { setErro('Digite um título'); return }
    setLoading(true)
    setErro(null)
    try {
      const v = novaVariante ? variante + 1 : 0
      setVariante(v)
      const url = `/api/agents/bannerforge?cacheBust=${Date.now()}`
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, subtitulo: subtitulo || undefined, categoria, estilo, variante: v }),
      })
      if (resp.status === 429) {
        const data = await resp.json()
        setErro(`Limite diário atingido (${data.limite}/dia). Faça upgrade para gerar mais.`)
        setLoading(false)
        return
      }
      if (!resp.ok) throw new Error('Erro')
      const blob = await resp.blob()
      if (bannerUrl) URL.revokeObjectURL(bannerUrl)
      setBannerUrl(URL.createObjectURL(blob))
    } catch {
      setErro('Erro ao gerar banner. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <Link href="/agentes" className="text-sm font-bold text-[#64748B] hover:text-[#2563EB] mb-3 inline-flex items-center gap-1">
            ← Voltar para agentes
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
              <ImageIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A] dark:text-white leading-none">
                BannerForge
              </h1>
              <p className="text-sm font-bold text-[#64748B] mt-1">Gere banners e logos PNG em 1 clique</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-7 shadow-sm border border-black/5 dark:border-white/5 space-y-6">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Título principal *</label>
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Netflix Premium 4K"
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-4 text-lg font-bold text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
                  maxLength={80}
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Subtítulo (opcional)</label>
                <input
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ex: Entrega instantânea, garantia KIYVO"
                  className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-black/20 px-5 py-3.5 text-base text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB]"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIAS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategoria(c)}
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                        categoria === c
                          ? 'bg-[#2563EB] text-white shadow-lg scale-105'
                          : 'bg-slate-100 dark:bg-white/5 text-[#64748B] hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-2 block flex items-center gap-2">
                  <Palette size={14} /> Formato
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ESTILOS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEstilo(e.id)}
                      className={`p-3 rounded-2xl text-left transition-all border-2 ${
                        estilo === e.id
                          ? 'border-[#2563EB] bg-[#2563EB]/5'
                          : 'border-transparent bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{e.emoji}</div>
                      <div className="text-xs font-black text-[#0F172A] dark:text-white">{e.nome}</div>
                      <div className="text-[10px] text-[#64748B]">{e.dim}</div>
                    </button>
                  ))}
                </div>
              </div>

              {erro && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-3 text-sm font-semibold text-red-700 dark:text-red-400">
                  {erro}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => gerar(false)}
                  disabled={loading}
                  className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-full bg-[#0F172A] text-white font-black px-6 py-4 text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {loading ? 'Gerando...' : bannerUrl ? 'Gerar nova versão' : 'Gerar banner PNG'}
                </button>
                {bannerUrl && (
                  <>
                    <button
                      onClick={() => gerar(true)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-white/10 text-[#0F172A] dark:text-white font-black px-5 py-4 text-sm hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      <RefreshCw size={16} /> Variante
                    </button>
                <a
                  href={bannerUrl}
                  download={`kiyvo-banner-${Date.now()}.svg`}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500 text-white font-black px-5 py-4 text-sm hover:bg-emerald-600 transition-colors"
                >
                  <Download size={16} /> Baixar SVG
                </a>
                  </>
                )}
              </div>

              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 p-3 text-xs text-amber-800 dark:text-amber-300">
                💡 <strong>Dica:</strong> gere várias variantes, escolha a que mais converte e use nas redes + na página do produto. Planos Plus+ geram mais banners por dia.
              </div>
            </div>

            <Link href="/planos" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#2563EB] hover:gap-3 transition-all">
              Ver planos para mais limite <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-white dark:bg-[#0F172A] rounded-[2rem] p-5 shadow-sm border border-black/5 dark:border-white/5 sticky top-24">
              <div className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-3 flex items-center justify-between">
                <span>Preview (SVG)</span>
                {bannerUrl && <span className="text-emerald-600 font-bold">PRONTO ✓</span>}
              </div>
              <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/30 flex items-center justify-center min-h-[300px] relative">
                <AnimatePresence mode="wait">
                  {loading && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center text-[#64748B]">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <p className="text-sm font-bold">Gerando seu banner...</p>
                    </motion.div>
                  )}
                  {!loading && bannerUrl && (
                    <motion.img
                      key="img"
                      src={bannerUrl}
                      alt="Banner gerado"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-auto rounded-xl"
                    />
                  )}
                  {!loading && !bannerUrl && (
                    <div className="text-center p-8 text-[#94A3B8]">
                      <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-bold">Preencha os campos e clique em Gerar</p>
                      <p className="text-xs mt-1">O banner aparece aqui em SVG (basta baixar)</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
