'use client'

// ─────────────────────────────────────────────────────────────
// UploadZone v0.0.1 — Zona de upload drag-and-drop com preview
// Upload de imagens, documentos, arquivos digitais
// Validação MIME, tamanho, preview, progresso
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, X, Image as ImageIcon, FileText, Check, AlertCircle, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export interface UploadedFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  url?: string
  error?: string
}

interface UploadZoneProps {
  accept?: string
  maxSize?: number // MB
  maxFiles?: number
  multiple?: boolean
  bucket?: string
  onUploadComplete?: (files: UploadedFile[]) => void
  className?: string
}

const ALLOWED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif'

export default function UploadZone({
  accept = ALLOWED_IMAGES,
  maxSize = 5,
  maxFiles = 5,
  multiple = true,
  bucket = 'product-images',
  onUploadComplete,
  className,
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = accept.split(',')
    const fileType = file.type || file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.some(t => t.trim() === fileType || t.trim() === `.${fileType}`) && accept !== '*') {
      return `Tipo ${file.type || file.name.split('.').pop()} não permitido`
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`
    }
    return null
  }, [accept, maxSize])

  const processFiles = useCallback(async (newFiles: FileList | File[]) => {
    const pending: UploadedFile[] = []
    const fileArray = Array.from(newFiles).slice(0, maxFiles - files.length)

    for (const file of fileArray) {
      const error = validateFile(file)
      pending.push({
        id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
      })
    }

    setFiles(prev => [...prev, ...pending])
  }, [files.length, maxFiles, validateFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }, [processFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files)
  }, [processFiles])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const uploadFiles = useCallback(async () => {
    const toUpload = files.filter(f => f.status === 'pending')
    if (toUpload.length === 0) return

    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' as const } : f))

    const uploaded: UploadedFile[] = []

    for (const file of toUpload) {
      const formData = new FormData()
      formData.append('file', file.file)
      formData.append('bucket', bucket)

      try {
        const res = await fetch('/api/v1/upload/image', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()

        if (data.success && data.data?.url) {
          const done: UploadedFile = { ...file, status: 'done', url: data.data.url, progress: 100 }
          setFiles(prev => prev.map(f => f.id === file.id ? done : f))
          uploaded.push(done)
        } else {
          const err: UploadedFile = { ...file, status: 'error', error: data.error || 'Upload falhou' }
          setFiles(prev => prev.map(f => f.id === file.id ? err : f))
        }
      } catch {
        const err: UploadedFile = { ...file, status: 'error', error: 'Erro de conexão' }
        setFiles(prev => prev.map(f => f.id === file.id ? err : f))
      }
    }

    onUploadComplete?.(uploaded)
  }, [files, bucket, onUploadComplete])

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
        <Upload className="w-8 h-8 mx-auto mb-3 text-zinc-400" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          {accept === ALLOWED_IMAGES ? 'PNG, JPG, WebP até 5MB' : `Até ${maxSize}MB`} • Máx {maxFiles} arquivos
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {files.map(file => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800"
              >
                {file.preview ? (
                  <img src={file.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{file.file.name}</p>
                  <p className="text-xs text-zinc-400">{(file.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="shrink-0">
                  {file.status === 'done' && <Check className="w-5 h-5 text-emerald-500" />}
                  {file.status === 'error' && (
                    <div className="relative group">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-red-500 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {file.error}
                      </span>
                    </div>
                  )}
                  {file.status === 'uploading' && <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />}
                  <button onClick={() => removeFile(file.id)} className="ml-2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700">
                    <X className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Upload Button */}
            {files.some(f => f.status === 'pending') && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={uploadFiles}
                className="w-full py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium"
              >
                Enviar {files.filter(f => f.status === 'pending').length} arquivo(s)
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
