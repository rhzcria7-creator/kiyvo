'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { Button } from '@/components/ui/Button'
import { BookOpen, Download, Key, Code, GraduationCap, FileText, Layout, Package, Search, Filter, ExternalLink, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

/** Tipo de filtro da biblioteca */
type LibraryFilter = 'all' | 'software' | 'course' | 'ebook' | 'template' | 'asset' | 'license' | 'service' | 'api'

/** Item mock da biblioteca — em produção virá do Supabase */
interface LibraryItem {
  id: string
  orderId: string
  productTitle: string
  productType: string
  category: string
  sellerName: string
  purchasedAt: string
  price: number
  deliveryType: string
  status: 'delivered' | 'confirmed' | 'expired'
  hasDownload: boolean
  hasLicense: boolean
  version: string | null
  downloadCount: number
  maxDownloads: number
  expiresAt: string | null
}

const mockLibrary: LibraryItem[] = [
  { id: 'l1', orderId: 'PD-2607-100001', productTitle: 'Windows 11 Pro — Licença Vitalícia', productType: 'software', category: 'Software & Licenças', sellerName: 'SoftVault', purchasedAt: '17/07/2026', price: 49.90, deliveryType: 'license_key', status: 'confirmed', hasDownload: false, hasLicense: true, version: null, downloadCount: 0, maxDownloads: 0, expiresAt: null },
  { id: 'l2', orderId: 'PD-2607-100002', productTitle: 'Curso Completo Programação Full Stack — 120h', productType: 'course', category: 'Cursos Online', sellerName: 'EduPro', purchasedAt: '15/07/2026', price: 34.90, deliveryType: 'course_access', status: 'delivered', hasDownload: false, hasLicense: false, version: null, downloadCount: 0, maxDownloads: 0, expiresAt: null },
  { id: 'l3', orderId: 'PD-2607-100003', productTitle: 'Pack 500+ Templates Canva — Instagram & TikTok', productType: 'template', category: 'Design & Templates', sellerName: 'DesignLab', purchasedAt: '14/07/2026', price: 19.90, deliveryType: 'download', status: 'confirmed', hasDownload: true, hasLicense: false, version: '2.1', downloadCount: 2, maxDownloads: 5, expiresAt: '13/08/2026' },
  { id: 'l4', orderId: 'PD-2607-100004', productTitle: 'E-book: Marketing Digital 360° — 3ª Edição', productType: 'ebook', category: 'E-books & PDFs', sellerName: 'DigitalMax', purchasedAt: '12/07/2026', price: 14.90, deliveryType: 'download', status: 'confirmed', hasDownload: true, hasLicense: false, version: '3.0', downloadCount: 1, maxDownloads: 5, expiresAt: '11/08/2026' },
  { id: 'l5', orderId: 'PD-2607-100005', productTitle: 'Plugin WordPress — SEO Pro Pack v3.0', productType: 'software', category: 'Plugins & Extensões', sellerName: 'DesignLab', purchasedAt: '10/07/2026', price: 39.90, deliveryType: 'download', status: 'delivered', hasDownload: true, hasLicense: true, version: '3.0.2', downloadCount: 3, maxDownloads: 5, expiresAt: '09/08/2026' },
  { id: 'l6', orderId: 'PD-2607-100006', productTitle: 'Asset Pack 3D — Low Poly Nature', productType: 'asset', category: '3D & Modelos', sellerName: 'PixelKing', purchasedAt: '08/07/2026', price: 24.90, deliveryType: 'download', status: 'confirmed', hasDownload: true, hasLicense: false, version: '1.5', downloadCount: 1, maxDownloads: 5, expiresAt: '07/08/2026' },
]

const filterOptions: { id: LibraryFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Todos', icon: <BookOpen size={14} /> },
  { id: 'software', label: 'Software', icon: <Code size={14} /> },
  { id: 'course', label: 'Cursos', icon: <GraduationCap size={14} /> },
  { id: 'ebook', label: 'E-books', icon: <FileText size={14} /> },
  { id: 'template', label: 'Templates', icon: <Layout size={14} /> },
  { id: 'asset', label: 'Assets', icon: <Package size={14} /> },
  { id: 'license', label: 'Licenças', icon: <Key size={14} /> },
]

export default function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = mockLibrary.filter((item) => {
    if (activeFilter !== 'all' && item.productType !== activeFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return item.productTitle.toLowerCase().includes(q) || item.sellerName.toLowerCase().includes(q)
    }
    return true
  })

  const handleDownload = (item: LibraryItem) => {
    if (item.downloadCount >= item.maxDownloads) {
      toast.error('Limite de downloads atingido')
      return
    }
    toast.success(`Download iniciado: ${item.productTitle}`)
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl lg:text-3xl text-surface-900 dark:text-white flex items-center gap-3">
            <BookOpen size={28} className="text-brand-600 dark:text-brand-400" />
            Minha Biblioteca
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
            Todos os seus produtos digitais em um só lugar
          </p>
        </motion.div>

        {/* Search & Filters */}
        <FadeInOnScroll className="mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar na biblioteca..."
                className="input-base pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold font-display whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeFilter === filter.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-brand-50 dark:hover:bg-brand-950/50'
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </FadeInOnScroll>

        {/* Items */}
        <div className="mt-6 space-y-3">
          <AnimatePresence>
            {filteredItems.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <BookOpen size={40} className="text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                <p className="text-surface-500 dark:text-surface-400">Nenhum item encontrado</p>
                <Link href="/categorias" className="mt-4 inline-block">
                  <Button variant="secondary" size="sm">Explorar Produtos</Button>
                </Link>
              </motion.div>
            ) : (
              filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-base p-4 sm:p-5 hover:shadow-card-hover dark:hover:shadow-dark-glow transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center shrink-0">
                      {item.productType === 'software' && <Code size={20} className="text-brand-600 dark:text-brand-400" />}
                      {item.productType === 'course' && <GraduationCap size={20} className="text-brand-600 dark:text-brand-400" />}
                      {item.productType === 'ebook' && <FileText size={20} className="text-brand-600 dark:text-brand-400" />}
                      {item.productType === 'template' && <Layout size={20} className="text-brand-600 dark:text-brand-400" />}
                      {item.productType === 'asset' && <Package size={20} className="text-brand-600 dark:text-brand-400" />}
                      {item.productType === 'license' && <Key size={20} className="text-brand-600 dark:text-brand-400" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm text-surface-900 dark:text-white line-clamp-1">
                        {item.productTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-surface-400">{item.sellerName}</span>
                        <span className="text-xs text-surface-300">•</span>
                        <span className="text-xs text-surface-400">{item.purchasedAt}</span>
                        {item.version && (
                          <>
                            <span className="text-xs text-surface-300">•</span>
                            <span className="text-xs text-surface-400">v{item.version}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          item.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                          item.status === 'delivered' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' :
                          'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                        }`}>
                          {item.status === 'confirmed' ? '✓ Confirmado' : item.status === 'delivered' ? 'Entregue' : 'Expirado'}
                        </span>
                        {item.hasDownload && (
                          <span className="text-xs text-surface-400 flex items-center gap-1">
                            <Download size={10} /> {item.downloadCount}/{item.maxDownloads} downloads
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {item.hasDownload && (
                        <Button
                          size="sm"
                          variant={item.downloadCount >= item.maxDownloads ? 'ghost' : 'primary'}
                          icon={<Download size={14} />}
                          onClick={() => handleDownload(item)}
                          disabled={item.downloadCount >= item.maxDownloads}
                        >
                          Download
                        </Button>
                      )}
                      {item.hasLicense && (
                        <Button size="sm" variant="secondary" icon={<Key size={14} />}>
                          Ver Chave
                        </Button>
                      )}
                      {!item.hasDownload && !item.hasLicense && (
                        <Button size="sm" variant="secondary" icon={<ExternalLink size={14} />}>
                          Acessar
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
