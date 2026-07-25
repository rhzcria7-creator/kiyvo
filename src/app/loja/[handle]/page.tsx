'use client'
// /loja/[handle] — Página da loja do vendedor (perfil + produtos)
// Busca dados reais do vendedor (LocalDB) ou loja de catálogo via /api/seller/[handle].
// Mobile-first, Framer Motion, design KIYVO. Comentários em PT-BR.
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck, Star, Package, Users2, Award, Heart, MessageSquare, Tag, Store as StoreIcon, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { STORES } from '@/lib/catalog/stores'
import { DEMO_PRODUCTS } from '@/lib/catalog/demoProducts'
import { GG_PRODUCTS } from '@/lib/catalog/ggmaxProducts'
import { MEGA_PRODUCTS } from '@/lib/catalog/megaCatalog'
import { ProductCard, type Product } from '@/components/ProductCard'
import { vendorBannerDataUri, vendorAvatarDataUri } from '@/lib/svgArt'
import { toast } from 'react-hot-toast'

interface SellerDTO {
  handle: string
  name: string
  username: string
  avatar_url: string | null
  banner_url: string | null
  bio: string | null
  tags: string[]
  plan: string
  rating: number
  total_sales: number
  total_purchases: number
  is_verified: boolean
  joined: string
  followers: number
  logo?: string
  color?: string
  city?: string
}

interface ProductDTO {
  id: string
  slug: string
  titulo: string
  preco: number
  preco_de?: number | null
  descricao_curta?: string
  categoria?: string
  vendedor_nome?: string
  vendor_id?: string
  vendor_handle?: string
  imagem_capa?: string | null
  emoji?: string
  rating?: number
  total_reviews?: number
  total_vendas?: number
  verificado?: boolean
  gradient?: string
}

const ALL: Array<Record<string, unknown>> = [
  ...(DEMO_PRODUCTS as unknown as Array<Record<string, unknown>>).map((p) => ({ ...p, store_id: p.vendor_id })),
  ...(GG_PRODUCTS as unknown as Array<Record<string, unknown>>).map((p) => ({ ...p, store_id: p.vendor_id })),
  ...(MEGA_PRODUCTS as unknown as Array<Record<string, unknown>>),
]

const PLAN_LABEL: Record<string, string> = {
  free: 'Free', plus: 'Plus', pro: 'Pro', vendor_pro: 'Vendor PRO', basico: 'Básico', business: 'Business', enterprise: 'Enterprise', silver: 'Silver', gold: 'Gold', diamond: 'Diamond',
}

export default function LojaPage() {
  const params = useParams<{ handle: string }>()
  const router = useRouter()
  const handle = (params?.handle || '').replace(/^@/, '')
  const [loading, setLoading] = useState(true)
  const [seller, setSeller] = useState<SellerDTO | null>(null)
  const [produtos, setProdutos] = useState<ProductDTO[]>([])
  const [seguindo, setSeguindo] = useState(false)

  // Resolve via API (vendedor real) com fallback para STORES de catálogo.
  useEffect(() => {
    if (!handle) return
    let cancel = false
    setLoading(true)
    fetch(`/api/seller/${encodeURIComponent(handle)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancel) return
        if (data && data.found) {
          setSeller(data.seller as SellerDTO)
          setProdutos((data.products as ProductDTO[]) || [])
        } else {
          // Fallback client-side para lojas de catálogo
          const store = STORES.find((s) => s.handle.replace('@', '').toLowerCase() === handle.toLowerCase())
          if (store) {
            setSeller({
              handle: store.handle.replace('@', ''),
              name: store.name,
              username: store.handle,
              avatar_url: null,
              banner_url: null,
              bio: store.bio,
              tags: [store.category],
              plan: store.plan,
              rating: store.rating,
              total_sales: store.sales,
              total_purchases: 0,
              is_verified: store.verified,
              joined: store.since,
              followers: store.followers,
              logo: store.logo,
              color: store.color,
              city: store.city,
            })
            setProdutos(
              ALL.filter((p) => p.store_id === store.id || p.vendedor_nome === store.name || p.vendor_id === store.id).map(
                (p) => ({ ...(p as unknown as ProductDTO), vendor_handle: store.handle.replace('@', '') }),
              ),
            )
          } else {
            setSeller(null)
          }
        }
      })
      .catch(() => !cancel && setSeller(null))
      .finally(() => !cancel && setLoading(false))
    return () => {
      cancel = true
    }
  }, [handle])

  useEffect(() => {
    if (!seller) return
    try {
      const seg = JSON.parse(localStorage.getItem('kiyvo_store_follows') || '[]') as string[]
      setSeguindo(seg.includes(seller.handle))
    } catch {
      setSeguindo(false)
    }
  }, [seller])

  function toggleSeguir() {
    if (!seller) return
    try {
      const raw = localStorage.getItem('kiyvo_store_follows') || '[]'
      const seg = JSON.parse(raw) as string[]
      let next: string[]
      if (seg.includes(seller.handle)) {
        next = seg.filter((x) => x !== seller.handle)
        toast.success('Deixou de seguir')
      } else {
        next = [...seg, seller.handle]
        toast.success(`Seguindo ${seller.name}!`)
      }
      localStorage.setItem('kiyvo_store_follows', JSON.stringify(next))
      setSeguindo(next.includes(seller.handle))
    } catch {
      /* noop */
    }
  }

  const bannerGradient = seller?.color
    ? `bg-gradient-to-br ${seller.color}`
    : 'bg-gradient-to-br from-brand-500 via-violet-600 to-fuchsia-600'
  const joinedYear = seller?.joined ? new Date(seller.joined).getFullYear() : ''

  const stats = useMemo(
    () => [
      { icon: Package, label: 'Vendas', value: (seller?.total_sales ?? 0).toLocaleString('pt-BR') },
      { icon: Star, label: 'Avaliação', value: (seller?.rating ?? 0).toFixed(1) },
      { icon: Users2, label: 'Seguidores', value: (seller?.followers ?? 0).toLocaleString('pt-BR') },
      { icon: Award, label: 'Plano', value: PLAN_LABEL[seller?.plan || 'free'] || 'Free' },
    ],
    [seller],
  )

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-24">
          <div className="h-40 sm:h-56 bg-surface-200 dark:bg-surface-800 animate-pulse" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12">
            <div className="w-24 h-24 rounded-[1.5rem] bg-surface-300 dark:bg-surface-700 animate-pulse" />
            <div className="mt-4 h-6 w-48 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
            <div className="mt-2 h-4 w-72 bg-surface-200 dark:bg-surface-800 rounded animate-pulse" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!seller) {
    return (
      <>
        <Header />
        <main className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <p className="font-black text-2xl">Loja não encontrada</p>
            <Link href="/lojas" className="text-brand-600 font-bold mt-4 inline-block">← Voltar para lojas</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F1A] pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-slate-500 font-bold text-sm mt-6 hover:text-brand-600"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>

        {/* Banner da loja */}
        <section className={`relative ${bannerGradient} mt-4 overflow-hidden`}>
          {seller.banner_url ? (
            <div className="h-40 sm:h-56 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={seller.banner_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <>
              {/* Banner SVG gerado quando o vendedor não enviou um banner real */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vendorBannerDataUri({ name: seller.name, seed: seller.handle })}
                alt=""
                className="h-40 sm:h-56 w-full object-cover"
              />
              <div className="absolute inset-0 opacity-25 pointer-events-none">
                <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white blur-3xl" />
                <div className="absolute bottom-0 left-10 w-40 h-40 rounded-full bg-white/40 blur-2xl" />
              </div>
            </>
          )}
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-white" style={{ minHeight: seller.banner_url ? undefined : 120 }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar / foto */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl overflow-hidden -mt-16 sm:mt-0">
                {seller.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={seller.avatar_url} alt={seller.name} className="w-full h-full object-cover" />
                ) : seller.logo ? (
                  <span>{seller.logo}</span>
                ) : (
                  // Avatar SVG gerado (iniciais + gradiente) quando não há foto real.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={vendorAvatarDataUri({ name: seller.name, seed: seller.handle })}
                    alt={seller.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-4xl font-black drop-shadow-sm">{seller.name}</h1>
                  {seller.is_verified && <ShieldCheck className="w-6 h-6 text-white fill-emerald-400" />}
                  {seller.plan === 'vendor_pro' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400 text-amber-950">
                      <Award className="w-3 h-3" /> Vendor PRO
                    </span>
                  )}
                </div>
                <p className="text-white/90 font-semibold text-sm flex items-center gap-1.5 flex-wrap">
                  @{seller.username}
                  {seller.city && <span>• 📍 {seller.city}</span>}
                  {joinedYear && <span>• Desde {joinedYear}</span>}
                </p>
                {seller.bio && <p className="text-white/85 mt-2 max-w-2xl leading-relaxed">{seller.bio}</p>}

                {/* Tags */}
                {seller.tags && seller.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {seller.tags.slice(0, 8).map((t) => (
                      <Link
                        key={t}
                        href={`/buscar?q=${encodeURIComponent(t)}`}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-white/15 hover:bg-white/30 backdrop-blur rounded-full px-3 py-1 transition"
                      >
                        <Tag className="w-3 h-3" /> {t}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={toggleSeguir}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-black text-sm shadow-lg transition ${
                    seguindo ? 'bg-white/20 text-white border-2 border-white/40' : 'bg-white text-slate-900 hover:scale-105'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${seguindo ? 'fill-current' : ''}`} /> {seguindo ? 'Seguindo' : 'Seguir'}
                </button>
                <Link
                  href={`/chat?to=${encodeURIComponent('@' + seller.username)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-black text-sm bg-black/30 text-white border-2 border-white/20 backdrop-blur hover:bg-black/40 transition"
                >
                  <MessageSquare className="w-4 h-4" /> Contatar
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Estatísticas */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white leading-none truncate">{s.value}</p>
                  <p className="text-[11px] text-slate-500 font-semibold">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Produtos da loja */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-2xl font-black text-[#0F172A] dark:text-white">
              Produtos de {seller.name}
              <span className="ml-2 text-sm font-bold text-slate-400">({produtos.length})</span>
            </h2>
            <Link href="/lojas" className="text-sm text-brand-600 dark:text-brand-400 font-semibold hidden sm:inline">
              Ver todas as lojas
            </Link>
          </div>

          {produtos.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-[2rem] border border-slate-100 dark:border-slate-800">
              <StoreIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-500">Esta loja ainda não publicou produtos.</p>
              <Link href="/vender" className="btn-primary text-sm mt-4 inline-block">
                <Sparkles className="w-4 h-4" /> Abrir minha loja
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {produtos.slice(0, 36).map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <ProductCard produto={p as Product} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
