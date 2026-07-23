'use client'
// ProductCard — card de produto digital com gradiente emoji no lugar de imagem, desconto, rating, vendedor
// Design Apple+Netflix+3D, mobile-first, Framer Motion em todos os estados
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, Zap, Clock, Shield, ShoppingCart } from 'lucide-react'

export interface Product {
  id: string
  slug?: string
  titulo: string
  descricao_curta?: string
  preco: number
  preco_de?: number | null
  categoria?: string
  vendedor_nome?: string
  imagem_capa?: string | null
  gradient?: string
  emoji?: string
  rating?: number
  total_reviews?: number
  total_vendas?: number
  boost?: boolean
  tipo?: string
}

// Mapa de categorias para português amigável no badge
const CAT_LABEL: Record<string, string> = {
  marketing: 'Marketing', copywriting: 'Copywriting', planilhas: 'Planilhas', templates: 'Templates',
  social: 'Redes Sociais', vendas: 'Vendas', mentoria: 'Mentoria', software: 'Software',
  ebook: 'Ebook', curso: 'Curso', saude: 'Saúde', financas: 'Finanças', design: 'Design',
  video: 'Vídeo', afiliados: 'Afiliados', beleza: 'Beleza', gastronomia: 'Gastronomia',
  tecnologia: 'Tecnologia', juridico: 'Jurídico', produtividade: 'Produtividade', profissionais: 'Profissões',
  prompts: 'Prompts IA', servico: 'Serviço', consultoria: 'Consultoria', pack: 'Pack',
  script: 'Scripts', idiomas: 'Idiomas', livros: 'Livros', desenvolvimento: 'Programação',
  outro: 'Outros',
}

export function ProductCard({ produto, index = 0 }: { produto: Product; index?: number }) {
  const preco = Number(produto.preco || 0)
  const precoDe = produto.preco_de ? Number(produto.preco_de) : null
  const desconto = precoDe && precoDe > preco ? Math.round((1 - preco / precoDe) * 100) : 0
  const rating = typeof produto.rating === 'number' ? produto.rating : 4.7
  const reviews = produto.total_reviews || Math.floor(Math.random() * 150) + 25
  const vendas = produto.total_vendas || 0
  const href = `/p/${produto.slug || produto.id}`
  const gradient = produto.gradient || 'from-brand-500 to-brand-700'
  const emoji = produto.emoji || '✨'
  const catLabel = produto.categoria ? (CAT_LABEL[produto.categoria] || produto.categoria) : ''

  const parcelas = Math.max(1, Math.min(12, Math.ceil(preco / 10)))
  const valorParcela = preco / parcelas

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '50px' }}
      transition={{ delay: Math.min(index * 0.04, 0.35), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      whileTap={{ y: -2, scale: 0.99 }}
    >
      <Link
        href={href}
        aria-label={produto.titulo}
        className="group relative flex flex-col h-full bg-white dark:bg-[#111827] rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-brand-500/10 dark:hover:shadow-brand-500/20 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {/* Capa */}
        <div className={`relative aspect-[4/3] w-full bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Padrão decorativo */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3) 0%, transparent 50%)'
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            {produto.imagem_capa ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={produto.imagem_capa}
                alt={produto.titulo}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <motion.div
                initial={{ scale: 0.8, rotate: -6 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ delay: Math.min(index * 0.04 + 0.1, 0.5), type: 'spring', stiffness: 200 }}
                className="text-5xl sm:text-6xl md:text-7xl drop-shadow-lg filter"
              >
                {emoji}
              </motion.div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
            {desconto > 0 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: Math.min(index * 0.04 + 0.2, 0.55) }}
                className="bg-red-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-lg"
              >
                -{desconto}%
              </motion.span>
            )}
            {produto.boost && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: Math.min(index * 0.04 + 0.25, 0.6) }}
                className="ml-auto bg-amber-400 text-amber-950 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1 shadow-lg"
              >
                <Zap className="w-2.5 h-2.5" /> Destaque
              </motion.span>
            )}
          </div>

          {/* Selo de acesso imediato */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-full">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Acesso imediato</span>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
          {catLabel && (
            <span className="inline-flex self-start text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full mb-2">
              {catLabel}
            </span>
          )}
          <h3 className="font-black text-[#0F172A] dark:text-white text-sm sm:text-base md:text-lg leading-snug line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {produto.titulo}
          </h3>
          {produto.descricao_curta && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 flex-1">{produto.descricao_curta}</p>
          )}

          {/* Rating + vendas */}
          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[11px] sm:text-xs">
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{rating.toFixed(1)}</span>
            </div>
            <span className="text-slate-400">({reviews})</span>
            {vendas > 0 && (
              <span className="ml-auto text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <ShoppingCart className="w-3 h-3" />
                <span className="hidden sm:inline">+{vendas.toLocaleString('pt-BR')} vendas</span>
                <span className="sm:hidden">{vendas >= 1000 ? `${(vendas/1000).toFixed(1)}k` : vendas}</span>
              </span>
            )}
          </div>

          {/* Preço */}
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white leading-none">
                R$ {preco.toFixed(2).replace('.', ',')}
              </span>
              {precoDe && precoDe > preco && (
                <span className="text-xs sm:text-sm text-slate-400 line-through">R$ {precoDe.toFixed(2).replace('.', ',')}</span>
              )}
            </div>
            {parcelas > 1 && preco >= 20 && (
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                ou {parcelas}x de R$ {valorParcela.toFixed(2).replace('.', ',')} sem juros
              </p>
            )}
            {produto.vendedor_nome && (
              <p className="mt-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                por <span className="text-slate-700 dark:text-slate-300 font-bold">{produto.vendedor_nome}</span>
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProductGrid({ produtos }: { produtos: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 px-0 sm:px-0">
      {produtos.map((p, i) => <ProductCard key={p.id} produto={p} index={i} />)}
    </div>
  )
}
