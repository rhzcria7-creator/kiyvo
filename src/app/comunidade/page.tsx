'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Heart, Eye, Clock, TrendingUp, Pin, ArrowRight, Send } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, MorphingBlob, TiltCard } from '@/components/ui/AdvancedAnimations'
import { AnimatedUsers, AnimatedMegaphone } from '@/components/svgs/AnimatedSVGs2'
import { PulseRing } from '@/components/ui/AdvancedAnimations'

const categories = [
  { id: 'all', label: 'Todos', count: 847 },
  { id: 'discussao', label: '💬 Discussão', count: 324 },
  { id: 'dicas', label: '💡 Dicas', count: 256 },
  { id: 'vendas', label: '💰 Vendas', count: 189 },
  { id: 'suporte', label: '🛟 Suporte', count: 78 },
]

const posts = [
  { id: '1', title: 'Como aumentei minhas vendas em 300% em 3 meses', author: 'PixelKing', avatar: 'https://picsum.photos/seed/c1/40/40', category: 'vendas', likes: 234, comments: 56, views: 1890, time: '2h', pinned: true },
  { id: '2', title: 'Guia: Melhores práticas para criar anúncios que vendem', author: 'SoftVault', avatar: 'https://picsum.photos/seed/c2/40/40', category: 'dicas', likes: 189, comments: 42, views: 2345, time: '4h', pinned: true },
  { id: '3', title: 'Qual o melhor plano para começar a vender?', author: 'EduPro', avatar: 'https://picsum.photos/seed/c3/40/40', category: 'discussao', likes: 67, comments: 34, views: 567, time: '6h', pinned: false },
  { id: '4', title: 'Nova categoria: APIs e Serviços Cloud — o que acham?', author: 'CloudNinja', avatar: 'https://picsum.photos/seed/c4/40/40', category: 'discussao', likes: 45, comments: 23, views: 345, time: '8h', pinned: false },
  { id: '5', title: '5 templates Canva que mais vendem em 2026', author: 'DesignLab', avatar: 'https://picsum.photos/seed/c5/40/40', category: 'dicas', likes: 156, comments: 28, views: 1234, time: '12h', pinned: false },
  { id: '6', title: 'Problema com entrega automática — alguém mais?', author: 'DigitalMax', avatar: 'https://picsum.photos/seed/c6/40/40', category: 'suporte', likes: 12, comments: 8, views: 123, time: '1 dia', pinned: false },
  { id: '7', title: 'Como configurar verificação de identidade', author: 'EduPro', avatar: 'https://picsum.photos/seed/c7/40/40', category: 'dicas', likes: 89, comments: 15, views: 789, time: '1 dia', pinned: false },
  { id: '8', title: 'Estratégias de precificação para cursos online', author: 'SoftVault', avatar: 'https://picsum.photos/seed/c8/40/40', category: 'vendas', likes: 112, comments: 31, views: 934, time: '2 dias', pinned: false },
]

export default function ComunidadePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = posts.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const pinned = filtered.filter(p => p.pinned)
  const regular = filtered.filter(p => !p.pinned)

  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        {/* Header */}
        <FadeInOnScroll className="text-center mb-10">
          <AnimatedUsers className="w-16 h-16 mx-auto mb-3" />
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900">Comunidade Playdex</h1>
          <p className="text-surface-500 mt-2 max-w-md mx-auto">Conecte-se, aprenda e compartilhe com outros vendedores e compradores</p>
        </FadeInOnScroll>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Membros', value: '12.5K', icon: '👥' },
            { label: 'Tópicos', value: '847', icon: '💬' },
            { label: 'Online agora', value: '234', icon: <PulseRing /> },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-base p-4 text-center">
              <div className="text-2xl mb-1 flex justify-center">{typeof stat.icon === 'string' ? stat.icon : stat.icon}</div>
              <p className="font-display font-extrabold text-xl text-surface-900">{stat.value}</p>
              <p className="text-xs text-surface-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar na comunidade..."
            className="input-base flex-1"
          />
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id ? 'bg-brand-600 text-white' : 'bg-surface-50 text-surface-600 hover:bg-surface-100 border border-surface-200'
                }`}
              >
                {cat.label} <span className="text-xs opacity-60">({cat.count})</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* New post button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full card-base p-4 mb-6 flex items-center gap-3 hover:border-brand-300 transition-colors cursor-text"
        >
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center"><Send size={16} className="text-brand-600" /></div>
          <span className="text-surface-400 text-sm">Comece uma discussão...</span>
        </motion.button>

        {/* Pinned Posts */}
        {pinned.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-surface-400 uppercase mb-3 flex items-center gap-1"><Pin size={12} /> Fixados</p>
            <div className="space-y-3">
              {pinned.map((post, i) => (
                <StaggerItem key={post.id}>
                  <TiltCard>
                    <div className="card-base p-5 border-l-4 border-brand-500">
                      <div className="flex items-start gap-4">
                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Pin size={12} className="text-brand-500" />
                            <span className="text-xs font-semibold text-brand-600">{post.author}</span>
                            <span className="text-xs text-surface-400">• {post.time}</span>
                          </div>
                          <h3 className="font-display font-bold text-surface-900 line-clamp-2">{post.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                            <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
                            <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments}</span>
                            <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <StaggerContainer className="space-y-3">
          {regular.map((post) => (
            <StaggerItem key={post.id}>
              <motion.div whileHover={{ x: 4 }} className="card-base p-4 hover:shadow-card-hover transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-surface-900">{post.author}</span>
                      <span className="text-xs px-2 py-0.5 bg-surface-100 rounded-full text-surface-500">{categories.find(c => c.id === post.category)?.label}</span>
                      <span className="text-xs text-surface-400">• {post.time}</span>
                    </div>
                    <h3 className="font-display font-bold text-surface-800 line-clamp-1">{post.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                      <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments}</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  )
}
