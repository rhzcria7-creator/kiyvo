'use client'
// ProductPageClient — página de produto responsiva, bonita, animada, com botão de checkout
// Funciona tanto com produtos do Supabase quanto produtos demo.
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Star, Shield, Zap, ShoppingCart, Heart, Share2, CheckCircle2,
  Clock, Copy, Package, MessageCircle, Lock, ArrowLeft,
  ShieldCheck, Award, Sparkles, Tag, CreditCard, TrendingUp, Ticket, Percent, X
} from 'lucide-react'
import { useFavorites } from '@/lib/favorites/store'
import { useCart } from '@/lib/cart/store'
import { useProtectedAction } from '@/lib/auth/useProtectedAction'
import { useReviews } from '@/lib/reviews/store'
import { useAuth } from '@/lib/auth/context'
import { useKYC } from '@/lib/kyc/store'
import { useRecent } from '@/lib/recent/store'
import { useNotif } from '@/lib/notifications/store'
import { useKD } from '@/lib/kd/store'
import { toast } from 'react-hot-toast'
import { ProductCard } from '@/components/ProductCard'
import { SimpleConfetti } from '@/components/ui/SimpleConfetti'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'
import { STORES } from '@/lib/catalog/stores'
import { ImagePlus, X as XIcon, ThumbsUp, Camera, ExternalLink } from 'lucide-react'

interface ProductDetail {
  id?: string
  titulo: string
  title?: string
  slug?: string
  descricao?: string
  descricao_curta?: string
  description?: string
  preco: number
  preco_de?: number | null
  basePrice?: number
  originalPrice?: number | null
  categoria?: string
  category?: string
  vendedor_nome?: string
  vendor?: { store_name?: string; nome?: string }
  imagem_capa?: string | null
  imageUrl?: string | null
  gradient?: string
  emoji?: string
  rating?: number
  total_reviews?: number
  reviewCount?: number
  total_vendas?: number
  salesCount?: number
  boost?: boolean
  isFeatured?: boolean
  tipo?: string
}

const CATEGORIES_BONITAS: Record<string, string> = {
  marketing: 'Marketing', copywriting: 'Copywriting', planilhas: 'Planilhas', templates: 'Templates',
  social: 'Redes Sociais', vendas: 'Vendas', mentoria: 'Mentoria', software: 'Software',
  ebook: 'Ebook', curso: 'Curso', saude: 'Saúde', financas: 'Finanças', design: 'Design',
  video: 'Vídeo', afiliados: 'Afiliados', beleza: 'Beleza', gastronomia: 'Gastronomia',
  tecnologia: 'Tecnologia', juridico: 'Jurídico', produtividade: 'Produtividade', profissionais: 'Profissões',
  prompts: 'Prompts IA', servico: 'Serviço', consultoria: 'Consultoria', pack: 'Pack',
  script: 'Scripts', idiomas: 'Idiomas', livros: 'Livros', desenvolvimento: 'Programação',
}

// Emojis padrão por categoria se não vier
const EMOJI_PADRAO: Record<string, string> = {
  marketing: '📈', copywriting: '✍️', planilhas: '📊', templates: '🎨',
  social: '📱', vendas: '💰', mentoria: '🎯', software: '⚙️',
  ebook: '📖', curso: '📚', saude: '💪', financas: '💹', design: '🎨',
  video: '🎥', afiliados: '🤝', beleza: '💄', gastronomia: '🍳',
  tecnologia: '💻', juridico: '⚖️', produtividade: '⏰', profissionais: '🧑‍⚕️',
  prompts: '🤖', servico: '🛎️', consultoria: '🧭', pack: '📦', script: '📝',
  idiomas: '🌍', livros: '📚', desenvolvimento: '🧑‍💻',
}

const GRADIENTES = [
  'from-rose-500 to-pink-600', 'from-orange-500 to-red-600', 'from-amber-400 to-orange-600',
  'from-lime-400 to-green-600', 'from-emerald-500 to-teal-700', 'from-teal-400 to-cyan-600',
  'from-sky-400 to-blue-600', 'from-blue-500 to-indigo-700', 'from-indigo-500 to-violet-700',
  'from-violet-500 to-purple-700', 'from-purple-500 to-fuchsia-700', 'from-fuchsia-500 to-pink-700',
  'from-pink-500 to-rose-700', 'from-slate-500 to-slate-800', 'from-brand-500 to-brand-700',
]
function pickGrad(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return GRADIENTES[Math.abs(h) % GRADIENTES.length]
}

export function ProductPageClient({ slug, initialProduct }: { slug: string; initialProduct: Record<string, unknown> | null; initialReviews?: Array<Record<string, unknown>> }) {
  const router = useRouter()
  const [comprando, setComprando] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qty, setQty] = useState(1)
  const { isFav, toggle: toggleFav } = useFavorites()
  const { add: addToCart } = useCart()
  const { guard, Modal: AuthModal } = useProtectedAction()

  const product = useMemo<ProductDetail>(() => {
    const raw = (initialProduct || {}) as Partial<ProductDetail> & Record<string, unknown>
    return {
      id: (raw.id as string) || slug,
      titulo: (raw.titulo as string) || (raw.title as string) || 'Produto',
      slug: (raw.slug as string) || slug,
      descricao: (raw.descricao as string) || (raw.description as string) || '',
      descricao_curta: (raw.descricao_curta as string) || ((raw.description as string) || '').substring(0, 160),
      preco: Number(raw.preco ?? raw.basePrice ?? 0),
      preco_de: raw.preco_de != null ? Number(raw.preco_de) : (raw.originalPrice ? Number(raw.originalPrice) : null),
      categoria: (raw.categoria as string) || (raw.category as string) || 'outro',
      vendedor_nome: (raw.vendedor_nome as string) || (raw.vendor as any)?.store_name || 'Vendedor KIYVO',
      imagem_capa: (raw.imagem_capa as string | null) ?? (raw.imageUrl as string | null) ?? null,
      gradient: (raw.gradient as string) || pickGrad(slug),
      emoji: (raw.emoji as string) || EMOJI_PADRAO[(raw.categoria as string) || ''] || '✨',
      rating: Number(raw.rating ?? 4.8),
      total_reviews: Number(raw.total_reviews ?? raw.reviewCount ?? 127),
      total_vendas: Number(raw.total_vendas ?? raw.salesCount ?? 0),
      boost: Boolean(raw.boost ?? raw.isFeatured),
      tipo: (raw.tipo as string) || 'digital',
    }
  }, [initialProduct, slug])

  const preco = product.preco
  const precoDe = product.preco_de && product.preco_de > preco ? product.preco_de : null
  const desconto = precoDe ? Math.round((1 - preco / precoDe) * 100) : 0
  const parcelas = Math.max(1, Math.min(12, Math.ceil(preco / 9.9)))
  const parcelaValor = preco / parcelas
  const catLabel = CATEGORIES_BONITAS[product.categoria || ''] || (product.categoria || 'Outros')

  const garantiaDias = 7

  // Reviews com mídia real
  const { user } = useAuth()
  const { init: initReviews, listForProduct, add: addReview, toggleLike, init: _ir, loaded: reviewsLoaded } = useReviews()
  const { init: initKYC } = useKYC()
  const { init: initRecent, add: addRecent } = useRecent()
  useEffect(() => { initReviews(); initKYC(); initRecent() }, [initReviews, initKYC, initRecent])
  // Marca produto como visto (para "recentemente vistos")
  useEffect(() => {
    addRecent({
      id: product.id || slug,
      slug: product.slug || slug,
      titulo: product.titulo,
      preco: product.preco,
      preco_de: product.preco_de,
      emoji: product.emoji,
      gradient: product.gradient,
      categoria: product.categoria,
      vendedor_nome: product.vendedor_nome,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [reviewFotos, setReviewFotos] = useState<string[]>([])
  const [enviandoReview, setEnviandoReview] = useState(false)
  const reviews = listForProduct(product.id || slug)
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : (product.rating || 4.8)
  const totalReviews = reviews.length > 0 ? reviews.length : (product.total_reviews || 127)

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const readers = files.slice(0, 4 - reviewFotos.length).map((f) => new Promise<string>((res) => {
      if (f.size > 5 * 1024 * 1024) { toast.error('Foto muito grande (máx 5MB)'); res(''); return }
      const reader = new FileReader()
      reader.onload = () => res(String(reader.result || ''))
      reader.readAsDataURL(f)
    }))
    const urls = (await Promise.all(readers)).filter(Boolean)
    setReviewFotos(prev => [...prev, ...urls].slice(0, 4))
    e.target.value = ''
  }

  function removerFoto(idx: number) {
    setReviewFotos(prev => prev.filter((_, i) => i !== idx))
  }

  function enviarReview() {
    if (!user) { toast.error('Faça login para avaliar'); return }
    if (reviewTitle.trim().length < 3) { toast.error('Digite um título'); return }
    if (reviewBody.trim().length < 5) { toast.error('Escreva um comentário'); return }
    setEnviandoReview(true)
    try {
      addReview({
        productId: product.id || slug,
        userId: user.id,
        userName: user.email.split('@')[0] || 'Usuário',
        rating: reviewRating,
        title: reviewTitle.trim(),
        body: reviewBody.trim(),
        media: { fotos: reviewFotos, arquivos: [] },
        verified: true,
        recommends: reviewRating >= 4,
      })
      // Recompensa: +25 KD Points por avaliação (com foto +50)
      const bonusKD = reviewFotos.length > 0 ? 50 : 25
      ganharKD(bonusKD, `Avaliação em: ${product.titulo.slice(0, 30)}`)
      pushNotif({ tipo: 'kd', titulo: `+${bonusKD} KD Points`, mensagem: 'Obrigado por avaliar! Você ganhou pontos.', link: '/recompensas', icone: '⭐' })
      toast.success(`Avaliação publicada! +${bonusKD} KD 🎉`, { icon: '⭐' })
      setReviewTitle(''); setReviewBody(''); setReviewFotos([]); setReviewRating(5); setShowReviewForm(false)
    } finally { setEnviandoReview(false) }
  }

  function copiarLink() {
    navigator.clipboard.writeText(`https://kiyvo.com.br/p/${product.slug}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const { push: pushNotif } = useNotif()
  const { init: initKD, ganhar: ganharKD } = useKD()
  useEffect(() => { initKD() }, [initKD])
  const [confettiKey, setConfettiKey] = useState(0)

  // Produtos relacionados (mesma categoria, excluindo o atual) — usando any[] pra evitar conflitos de tipo
  const produtosRelacionados = useMemo(() => {
    const all: any[] = [...(DEMO_PRODUCTS as any[]), ...(GG_PRODUCTS as any[]), ...(MEGA_PRODUCTS as any[])]
    return all
      .filter((p: any) => p.id !== (product.id || slug) && (p.categoria === product.categoria || p.slug !== product.slug))
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, product.categoria, slug])

  function comprarAgora() {
    guard('checkout', {
      onSuccess: () => {
        setComprando(true)
        setConfettiKey(k => k + 1)
        pushNotif({ tipo: 'compra', titulo: 'Indo para o checkout', mensagem: `Você está comprando: ${product.titulo}`, link: '/checkout', icone: '🛒' })
        const params = new URLSearchParams({
          produtoId: product.id || slug,
          produtoSlug: product.slug || slug,
          produtoNome: product.titulo,
          preco: String(preco),
          qty: String(qty),
          emoji: product.emoji || '✨',
          gradient: product.gradient || 'from-brand-500 to-brand-700',
          categoria: product.categoria || 'digital',
          vendedor: product.vendedor_nome || 'Vendedor KIYVO',
        })
        setTimeout(() => {
          router.push(`/checkout?${params.toString()}`)
        }, 450)
      },
    })
  }

  function adicionarCarrinho() {
    guard('cart', {
      onSuccess: () => {
        addToCart({
          id: product.id || slug,
          titulo: product.titulo,
          preco,
          preco_de: precoDe,
          gradient: product.gradient,
          emoji: product.emoji,
          slug: product.slug,
          categoria: product.categoria,
          vendedor_nome: product.vendedor_nome,
          qty,
        })
        toast.success(`Adicionado ao carrinho! (${qty}x)`, {
          icon: '🛒',
          duration: 2000,
        })
      },
    })
  }

  return (
    <>
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Navegação */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Coluna da esquerda: galeria */}
          <div className="lg:col-span-3 space-y-4">
            {/* Capa grande com gradiente */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`relative aspect-[4/3] sm:aspect-[16/10] rounded-[2rem] overflow-hidden bg-gradient-to-br ${product.gradient}`}
            >
              {/* Efeitos decorativos */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.7), transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.5), transparent 50%)'
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                {product.imagem_capa ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imagem_capa} alt={product.titulo} className="w-full h-full object-cover" />
                ) : (
                  <motion.span
                    initial={{ scale: 0.7, rotate: -4 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 180, delay: 0.2 }}
                    className="text-[6rem] sm:text-[8rem] md:text-[10rem] drop-shadow-2xl"
                  >
                    {product.emoji}
                  </motion.span>
                )}
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                {desconto > 0 && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-red-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-xl"
                  >
                    -{desconto}%
                  </motion.span>
                )}
                {product.boost && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="ml-auto bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xl"
                  >
                    <Zap className="w-3.5 h-3.5" /> Destaque
                  </motion.span>
                )}
              </div>

              {/* Selo inferior */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Compra 100% segura
              </div>
            </motion.div>

            {/* Descrição */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 sm:p-7 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" /> Sobre este produto
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {product.descricao || product.descricao_curta || 'Produto digital com entrega automática. Ao comprar, você recebe acesso imediato após confirmação do pagamento. Qualquer dúvida, nosso suporte está disponível 7 dias por semana.'}
              </p>

              {/* O que você recebe */}
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Package, texto: 'Entrega automática após compra' },
                  { icon: Clock, texto: 'Acesso vitalício (exceto mentorias)' },
                  { icon: ShieldCheck, texto: `Garantia de ${garantiaDias} dias` },
                  { icon: MessageCircle, texto: 'Suporte direto com o vendedor' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                  >
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{item.texto}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

                        {/* Reviews reais com upload de fotos */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 sm:p-7 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mb-4 flex items-center gap-2 flex-wrap">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                Avaliações ({totalReviews.toLocaleString('pt-BR')})
                {user && (
                  <button onClick={() => setShowReviewForm(v => !v)}
                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md shadow-brand-500/20 transition">
                    <Star className="w-3.5 h-3.5" /> {showReviewForm ? 'Fechar' : 'Avaliar'}
                  </button>
                )}
              </h2>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-4xl font-black text-[#0F172A] dark:text-white">{avgRating.toFixed(1)}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Baseado em {totalReviews.toLocaleString('pt-BR')} avaliações</p>
                </div>
              </div>

              <AnimatePresence>
                {showReviewForm && user && (
                  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
                    className="overflow-hidden mb-5">
                    <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900 rounded-2xl p-4 space-y-3">
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Sua nota</label>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} type="button" onClick={() => setReviewRating(s)} className="p-1 transition hover:scale-110">
                              <Star className={`w-7 h-7 ${s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Título</label>
                        <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} maxLength={60}
                          placeholder="Ex: Excelente material!"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500" />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5">Sua avaliação</label>
                        <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)} maxLength={500} rows={3}
                          placeholder="Conte sua experiência com este produto..."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500 resize-none" />
                      </div>
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 block mb-1.5 flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Fotos (até 4)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {reviewFotos.map((url, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button onClick={() => removerFoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                                <XIcon className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {reviewFotos.length < 4 && (
                            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:border-brand-500 hover:text-brand-500 cursor-pointer transition">
                              <ImagePlus className="w-5 h-5" />
                              <span className="text-[9px] font-black uppercase mt-0.5">Add</span>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFotoUpload} />
                            </label>
                          )}
                        </div>
                      </div>
                      <button onClick={enviarReview} disabled={enviandoReview}
                        className="w-full bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white rounded-full py-3 font-black text-sm disabled:opacity-50 shadow-lg shadow-brand-500/20">
                        {enviandoReview ? 'Publicando...' : 'Publicar avaliação'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {reviews.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">Ainda não há avaliações. Seja o primeiro!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 10).map((r, i) => (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-black text-xs flex items-center justify-center">
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center gap-1.5 flex-wrap">
                            {r.userName}
                            {r.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                            {r.recommends && <span className="text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">Recomenda</span>}
                          </p>
                          <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                          ))}
                        </div>
                      </div>
                      {r.title && <p className="font-black text-sm text-[#0F172A] dark:text-white pl-10 mb-1">{r.title}</p>}
                      <p className="text-sm text-slate-600 dark:text-slate-400 pl-10 leading-relaxed">{r.body}</p>
                      {r.media.fotos.length > 0 && (
                        <div className="flex gap-2 pl-10 mt-2 flex-wrap">
                          {r.media.fotos.map((f, j) => (
                            <a key={j} href={f} target="_blank" rel="noopener noreferrer">
                              <img src={f} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 hover:scale-105 transition" />
                            </a>
                          ))}
                        </div>
                      )}
                      {user && (
                        <div className="pl-10 mt-2">
                          <button onClick={() => toggleLike(r.id, user.id)}
                            className={`inline-flex items-center gap-1 text-xs font-bold transition ${r.likes.includes(user.id) ? 'text-brand-600' : 'text-slate-400 hover:text-brand-500'}`}>
                            <ThumbsUp className={`w-3.5 h-3.5 ${r.likes.includes(user.id) ? 'fill-current' : ''}`} />
                            {r.likes.length > 0 ? `Útil (${r.likes.length})` : 'Útil'}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Coluna da direita: compra */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="lg:sticky lg:top-24 bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-7 shadow-xl shadow-brand-500/5"
            >
              {/* Categoria */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full">
                  {catLabel}
                </span>
                {(product.total_vendas ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    <TrendingUp className="w-3 h-3" /> +{(product.total_vendas ?? 0).toLocaleString('pt-BR')} vendas
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white leading-tight">
                {product.titulo}
              </h1>

              {/* Subtítulo */}
              {product.descricao_curta && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{product.descricao_curta}</p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#0F172A] dark:text-white">{product.rating?.toFixed(1)}</span>
                <span className="text-xs text-slate-500">({product.total_reviews?.toLocaleString('pt-BR')} avaliações)</span>
              </div>

              {/* Preço */}
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                {precoDe && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-through">
                    De R$ {precoDe.toFixed(2).replace('.', ',')}
                  </p>
                )}
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 self-end mb-1">Por apenas</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-white">R$ {preco.toFixed(2).replace('.', ',')}</span>
                  {desconto > 0 && (
                    <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{desconto}% OFF</span>
                  )}
                </div>
                {parcelas > 1 && preco >= 20 && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    ou <strong className="text-emerald-600 dark:text-emerald-400">{parcelas}x de R$ {parcelaValor.toFixed(2).replace('.', ',')}</strong> sem juros no cartão
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  À vista no PIX: <strong>R$ {(preco * 0.95).toFixed(2).replace('.', ',')}</strong> (5% de desconto)
                </p>
              </div>

              {/* Cupom automático de boas-vindas */}
              <CupomAutomatico preco={preco} productId={product.id || slug} vendedor={product.vendedor_nome} />

              {/* Quantidade */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Quantidade</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-30" disabled={qty <= 1}>−</button>
                  <span className="w-8 text-center font-bold text-sm text-[#0F172A] dark:text-white">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">+</button>
                </div>
              </div>

              {/* CTAs: Adicionar ao carrinho + Comprar agora */}
              <div className="mt-5 flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={adicionarCarrinho}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-full py-4 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-all pulse-glow"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Adicionar ao carrinho
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={comprarAgora}
                  disabled={comprando}
                  className="w-full bg-transparent border-2 border-slate-200 dark:border-white/20 hover:border-[#0F172A] dark:hover:border-white text-[#0F172A] dark:text-white rounded-full py-3 font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {comprando ? 'Processando...' : 'Comprar agora (1 clique)'}
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  toggleFav({
                    id: product.id || slug,
                    titulo: product.titulo,
                    preco: preco,
                    preco_de: precoDe,
                    gradient: product.gradient,
                    emoji: product.emoji,
                    slug: product.slug,
                    categoria: product.categoria,
                    vendedor_nome: product.vendedor_nome,
                  })
                  toast.success(isFav(product.id || slug) ? 'Removido dos favoritos' : '❤️ Adicionado aos favoritos!')
                }}
                className={`w-full mt-2.5 border-2 rounded-full py-3 font-bold text-sm flex items-center justify-center gap-2 transition ${
                  isFav(product.id || slug)
                    ? 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400'
                    : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 text-[#0F172A] dark:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav(product.id || slug) ? 'fill-red-500' : ''}`} />
                {isFav(product.id || slug) ? 'Nos favoritos' : 'Adicionar aos favoritos'}
              </motion.button>

              {/* Compartilhar */}
              <button onClick={copiarLink} className="w-full mt-3 text-xs font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400 flex items-center justify-center gap-1.5">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="copiado" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Link copiado!
                    </motion.span>
                  ) : (
                    <motion.span key="compartilhar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5" /> Compartilhar este produto
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Selos */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
                {[
                  { icon: Lock, texto: 'Pagamento seguro' },
                  { icon: ShieldCheck, texto: 'Privacidade LGPD' },
                  { icon: Award, texto: 'Vendedor verificado' },
                ].map((selo, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-1 p-2">
                    <selo.icon className="w-5 h-5 text-brand-500" />
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight">{selo.texto}</p>
                  </div>
                ))}
              </div>

              {/* Vendedor */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Vendido por</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-black flex items-center justify-center">
                    {(product.vendedor_nome || 'V').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0F172A] dark:text-white">{product.vendedor_nome}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Verificado
                    </div>
                  </div>
                  {(() => {
                    const store = STORES.find(s => s.name === product.vendedor_nome)
                    const handle = store ? store.handle.replace('@', '') : null
                    if (!handle) return <div className="ml-auto" />
                    return (
                      <Link href={`/loja/${handle}`} className="ml-auto text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 bg-brand-50 dark:bg-brand-950/30 px-3 py-1.5 rounded-full transition hover:bg-brand-100 dark:hover:bg-brand-900/40">
                        <ExternalLink className="w-3 h-3" /> Ver loja
                      </Link>
                    )
                  })()}
                </div>
              </div>

              {/* Formas de pagamento */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Formas de pagamento
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['PIX', 'Crédito', 'Débito', 'Boleto'].map(met => (
                    <span key={met} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full">{met}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Barra flutuante MOBILE de compra (sempre visível no final da tela) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border-t border-black/10 dark:border-white/10 px-4 py-3 flex items-center gap-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => {
              toggleFav({
                id: product.id || slug,
                titulo: product.titulo,
                preco: preco,
                preco_de: precoDe,
                gradient: product.gradient,
                emoji: product.emoji,
                slug: product.slug,
                categoria: product.categoria,
                vendedor_nome: product.vendedor_nome,
              })
              toast.success(isFav(product.id || slug) ? 'Removido dos favoritos' : '❤️ Adicionado aos favoritos!')
            }}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 active:scale-95 transition-colors ${
              isFav(product.id || slug)
                ? 'border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 text-red-500'
                : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
            }`}
            aria-label="Favoritar"
          >
            <Heart className={`w-5 h-5 ${isFav(product.id || slug) ? 'fill-red-500' : ''}`} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              À vista no PIX
            </p>
            <p className="text-lg font-black text-[#0F172A] dark:text-white leading-none">
              R$ {(preco * 0.95).toFixed(2).replace('.', ',')}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-through">
              R$ {(precoDe || (preco * 1.3)).toFixed(2).replace('.', ',')}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={adicionarCarrinho}
            className="bg-brand-600 text-white rounded-full px-5 py-3.5 font-black text-sm flex items-center gap-2 shadow-lg shadow-brand-500/30"
          >
            <ShoppingCart className="w-4 h-4" /> Add
          </motion.button>
        </div>
      </div>
      {/* Espaço para não cobrir conteúdo com a barra mobile */}
      <div className="lg:hidden h-24" />

      {/* Produtos relacionados */}
      {produtosRelacionados.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 border-t border-slate-200/70 dark:border-slate-800">
          <motion.div initial={{ opacity:0,y:10 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
            className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">Você também pode gostar</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] dark:text-white">Produtos relacionados</h2>
            </div>
            <Link href="/buscar" className="text-xs font-black text-brand-600 dark:text-brand-400 hover:underline">Ver mais →</Link>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {produtosRelacionados.map((p, i) => (
              <motion.div key={String(p.id || i)}
                initial={{ opacity:0,y:20 }} whileInView={{ opacity:1,y:0 }} viewport={{ once:true }}
                transition={{ delay: i*0.06, type:'spring', stiffness:200,damping:20 }}>
                <ProductCard produto={p} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
    <SimpleConfetti trigger={confettiKey} pieces={80} duration={1800} />
    {AuthModal}
    </>
  )
}

// Componente de cupom automático (gera cupom instantâneo para o comprador)
function CupomAutomatico({ preco, productId, vendedor }: { preco: number; productId?: string; vendedor?: string }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(true)
  // Cupom entre 5% e 15% baseado no preço (maior preço -> maior desconto mas com teto de 15%)
  const pct = useMemo(() => {
    if (preco >= 200) return 15
    if (preco >= 97) return 12
    if (preco >= 47) return 10
    if (preco >= 19) return 7
    return 5
  }, [preco])
  const code = useMemo(() => {
    const base = (vendedor || 'KIYVO').replace(/[^a-zA-Z]/g, '').slice(0,4).toUpperCase() || 'KIYVO'
    const rand = Math.random().toString(36).slice(2,6).toUpperCase()
    return `${base}${pct}${rand}`
  }, [pct, vendedor])
  const valorEconomia = (preco * pct / 100).toFixed(2).replace('.', ',')

  function copiar() {
    try {
      navigator.clipboard?.writeText(code)
      setCopied(true)
      toast.success('Cupom copiado! Aplique no checkout.')
      setTimeout(() => setCopied(false), 3000)
    } catch { toast.error('Copie manualmente: ' + code) }
  }

  if (!open) return null

  return (
    <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
      className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
      <button onClick={() => setOpen(false)} className="absolute top-2 right-2 text-white/70 hover:text-white">
        <X className="w-4 h-4" />
      </button>
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Ticket className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Cupom exclusivo para você
          </p>
          <p className="text-sm font-black">
            <span className="text-2xl">{pct}% OFF</span> <span className="font-normal text-white/90 text-xs">· economize R${valorEconomia}</span>
          </p>
          <button onClick={copiar} className="mt-2 inline-flex items-center gap-2 bg-white text-violet-700 rounded-full px-3 py-1.5 text-xs font-black hover:bg-white/90 transition">
            {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado!</> : <><Percent className="w-3.5 h-3.5" />{code} <Copy className="w-3 h-3" /> Copiar</>}
          </button>
          <p className="text-[10px] text-white/80 mt-1.5">Aplique no checkout · válido só para esta sessão</p>
        </div>
      </div>
    </motion.div>
  )
}


