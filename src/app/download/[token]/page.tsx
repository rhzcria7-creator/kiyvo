'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { Button } from '@/components/ui/Button'
import { Download, Shield, Clock, AlertTriangle, CheckCircle, Loader2, FileText, Key } from 'lucide-react'
import toast from 'react-hot-toast'

/** Página de download seguro — /download/[token]
 * O token é validado pela API antes de liberar o download
 * Proteções: expiração, limite de downloads, verificação de identidade
 */

interface DownloadInfo {
  valid: boolean
  productName: string
  sellerName: string
  fileType: string
  fileSize: string
  remainingDownloads: number
  expiresAt: string
  downloadUrl: string | null
  error?: string
}

export default function DownloadPage() {
  const params = useParams()
  const token = params.token as string
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [info, setInfo] = useState<DownloadInfo | null>(null)

  useEffect(() => {
    // Em produção, chamar API para validar token
    // GET /api/v1/download/validate?token=xxx
    const validateToken = async () => {
      try {
        // Mock de validação — em produção, chamar API real
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (token && token.startsWith('dt_')) {
          setInfo({
            valid: true,
            productName: 'Pack 500+ Templates Canva',
            sellerName: 'DesignLab',
            fileType: 'ZIP',
            fileSize: '245 MB',
            remainingDownloads: 3,
            expiresAt: '2026-08-13',
            downloadUrl: '#',
          })
        } else {
          setInfo({
            valid: false,
            productName: '',
            sellerName: '',
            fileType: '',
            fileSize: '',
            remainingDownloads: 0,
            expiresAt: '',
            downloadUrl: null,
            error: 'Token inválido ou expirado',
          })
        }
      } catch {
        setInfo({
          valid: false,
          productName: '',
          sellerName: '',
          fileType: '',
          fileSize: '',
          remainingDownloads: 0,
          expiresAt: '',
          downloadUrl: null,
          error: 'Erro ao validar token',
        })
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [token])

  const handleDownload = async () => {
    if (!info?.downloadUrl) return
    setDownloading(true)

    try {
      // Em produção, chamar API que registra o download e retorna URL assinada
      // POST /api/v1/download/consume?token=xxx
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success('Download iniciado! Verifique sua pasta de downloads.')
      
      // Atualizar contagem
      if (info) {
        setInfo({
          ...info,
          remainingDownloads: Math.max(0, info.remainingDownloads - 1),
        })
      }
    } catch {
      toast.error('Erro ao iniciar download')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-brand-600 dark:text-brand-400 mx-auto mb-4" />
          <p className="text-surface-500 dark:text-surface-400">Verificando link de download...</p>
        </div>
      </div>
    )
  }

  if (!info?.valid) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h1 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">Link Inválido</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-2">
              {info?.error || 'Este link de download expirou ou já foi utilizado.'}
            </p>
            <p className="text-xs text-surface-400 mt-4">
              Se você comprou este produto, acesse sua <a href="/library" className="text-brand-600 dark:text-brand-400 underline">biblioteca</a> para gerar um novo link.
            </p>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-base p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText size={28} className="text-brand-600 dark:text-brand-400" />
          </div>

          {/* Product Info */}
          <h1 className="font-display font-extrabold text-xl text-surface-900 dark:text-white">
            {info.productName}
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            por {info.sellerName}
          </p>

          {/* Details */}
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
              <p className="text-xs text-surface-400">Tipo</p>
              <p className="font-display font-bold text-sm text-surface-900 dark:text-white">{info.fileType}</p>
            </div>
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
              <p className="text-xs text-surface-400">Tamanho</p>
              <p className="font-display font-bold text-sm text-surface-900 dark:text-white">{info.fileSize}</p>
            </div>
            <div className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
              <p className="text-xs text-surface-400">Downloads</p>
              <p className="font-display font-bold text-sm text-surface-900 dark:text-white">{info.remainingDownloads} restantes</p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-left">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">Download Seguro</p>
                <ul className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400 space-y-0.5">
                  <li className="flex items-center gap-1"><CheckCircle size={8} /> Link exclusivo para você</li>
                  <li className="flex items-center gap-1"><CheckCircle size={8} /> Expira em {new Date(info.expiresAt).toLocaleDateString('pt-BR')}</li>
                  <li className="flex items-center gap-1"><CheckCircle size={8} /> Máximo {info.remainingDownloads} downloads</li>
                  <li className="flex items-center gap-1"><CheckCircle size={8} /> Protegido contra compartilhamento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button
            className="w-full mt-6"
            size="lg"
            icon={downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            onClick={handleDownload}
            disabled={downloading || info.remainingDownloads <= 0}
          >
            {downloading ? 'Preparando download...' : 'Baixar Agora'}
          </Button>

          <p className="text-[10px] text-surface-400 mt-3">
            Ao clicar em baixar, você concorda com os termos de uso da licença adquirida.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  )
}
