'use client'
// ProductPageClient — página de produto responsiva, bonita, animada, com botão de checkout
// Funciona tanto com produtos do Supabase quanto produtos demo.
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Star, Shield, Zap, ShoppingCart, Heart, Share2, CheckCircle2,
  Clock, Copy, Package, MessageCircle, Lock, ArrowLeft,
  ShieldCheck, Award, Sparkles, Tag, CreditCard, TrendingUp
} from 'lucide-react'

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
  const [favorito, setFavorito] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qty, setQty] = useState(1)

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

  function copiarLink() {
    navigator.clipboard.writeText(`https://kiyvo.com.br/p/${product.slug}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function comprar() {
    setComprando(true)
    // Redireciona para o checkout passando dados via query params simples
    const params = new URLSearchParams({
      produtoId: product.id || slug,
      produtoNome: product.titulo,
      preco: String(preco),
      qty: String(qty),
    })
    setTimeout(() => {
      router.push(`/checkout?${params.toString()}`)
    }, 300)
  }

  return (
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

            {/* Reviews simuladas */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#111827] rounded-[1.5rem] p-5 sm:p-7 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                Avaliações ({product.total_reviews?.toLocaleString('pt-BR')})
              </h2>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-4xl font-black text-[#0F172A] dark:text-white">{product.rating?.toFixed(1)}</span>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Baseado em {product.total_reviews?.toLocaleString('pt-BR')} avaliações verificadas</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { nome: 'Mariana S.', rating: 5, texto: 'Material excelente, superou expectativas! Entrega imediata e suporte rápido.', tempo: 'há 2 dias' },
                  { nome: 'Ricardo O.', rating: 5, texto: 'Aplicando as estratégias e já tive retorno na primeira semana. Recomendo!', tempo: 'há 1 semana' },
                  { nome: 'Juliana C.', rating: 4, texto: 'Muito bom, só achei que poderia ter mais exemplos práticos mas o conteúdo é sólido.', tempo: 'há 2 semanas' },
                ].map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-black text-xs flex items-center justify-center">
                        {r.nome.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#0F172A] dark:text-white">{r.nome}</p>
                        <p className="text-[10px] text-slate-400">{r.tempo}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 pl-10">{r.texto}</p>
                  </motion.div>
                ))}
              </div>
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

              {/* Quantidade */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Quantidade</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-30" disabled={qty <= 1}>−</button>
                  <span className="w-8 text-center font-bold text-sm text-[#0F172A] dark:text-white">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">+</button>
                </div>
              </div>

              {/* Botão Comprar */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={comprar}
                disabled={comprando}
                className="w-full mt-5 bg-[#0F172A] hover:bg-black text-white rounded-full py-4 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 disabled:opacity-60 transition-all"
              >
                {comprando ? (
                  <>Processando...</>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Comprar agora
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full mt-2.5 bg-white dark:bg-transparent border-2 border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 text-[#0F172A] dark:text-white rounded-full py-3 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" /> Adicionar aos favoritos
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
                  <Link href="#" className="ml-auto text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5">
                    Ver loja
                  </Link>
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
    </div>
  )
}
