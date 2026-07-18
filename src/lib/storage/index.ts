// ─────────────────────────────────────────────────────────────
// KIYVO — Supabase Storage Helper
// Upload seguro de imagens, documentos e arquivos digitais
// Buckets: product-images (public), digital-files (private), vendor-docs (private)
// ─────────────────────────────────────────────────────────────

import { createClient, createAdminClient } from '@/lib/supabase/server'

// ─── CONFIGURAÇÃO ────────────────────────────────────────────

const BUCKETS = {
  productImages: 'product-images',
  digitalFiles: 'digital-files',
  vendorDocs: 'vendor-docs',
  avatars: 'avatars',
  blogImages: 'blog-images',
} as const

type BucketName = typeof BUCKETS[keyof typeof BUCKETS]

// ─── ALLOWED MIME TYPES ──────────────────────────────────────

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.rar-compressed',
  'text/plain',
]

const ALLOWED_DIGITAL_TYPES = [
  ...ALLOWED_DOCUMENT_TYPES,
  'application/x-msdownload',  // .exe
  'application/octet-stream',  // generic binary
]

const MAX_IMAGE_SIZE = 5 * 1024 * 1024   // 5MB
const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_DIGITAL_SIZE = 500 * 1024 * 1024  // 500MB

// ─── TYPES ───────────────────────────────────────────────────

interface UploadResult {
  path: string
  fullPath: string
  publicUrl: string | null
  error: string | null
}

interface FileInfo {
  name: string
  size: number
  type: string
  bucket: BucketName
}

// ─── VALIDAÇÃO DE ARQUIVO ────────────────────────────────────

function validateFile(
  file: File,
  allowedTypes: string[],
  maxSize: number
): { valid: boolean; error: string | null } {
  if (!file) return { valid: false, error: 'Arquivo não fornecido' }
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipo não permitido: ${file.type}. Aceitos: ${allowedTypes.join(', ')}` }
  }
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024)
    return { valid: false, error: `Arquivo muito grande. Máximo: ${maxMB}MB` }
  }
  if (file.size === 0) {
    return { valid: false, error: 'Arquivo vazio' }
  }
  return { valid: true, error: null }
}

// ─── UPLOAD DE IMAGEM DE PRODUTO ─────────────────────────────

/**
 * Upload de imagem para produto
 * Bucket: product-images (public)
 * Formatos: JPEG, PNG, WebP, GIF
 * Tamanho máximo: 5MB
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  index: number
): Promise<UploadResult> {
  // Validar
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
  if (!validation.valid) {
    return { path: '', fullPath: '', publicUrl: null, error: validation.error }
  }

  const admin = createAdminClient()
  if (!admin) return { path: '', fullPath: '', publicUrl: null, error: 'Storage não configurado' }

  // Gerar nome seguro
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = `${productId}/${Date.now()}_${index}.${ext}`

  try {
    const { data, error } = await admin.storage
      .from(BUCKETS.productImages)
      .upload(safeName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return { path: '', fullPath: '', publicUrl: null, error: error.message }
    }

    // Obter URL pública
    const { data: urlData } = admin.storage
      .from(BUCKETS.productImages)
      .getPublicUrl(data.path)

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl: urlData.publicUrl,
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no upload'
    return { path: '', fullPath: '', publicUrl: null, error: message }
  }
}

// ─── UPLOAD DE ARQUIVO DIGITAL ───────────────────────────────

/**
 * Upload de arquivo digital (produto que será vendido)
 * Bucket: digital-files (private)
 * Acesso apenas via signed URL após compra
 */
export async function uploadDigitalFile(
  file: File,
  productId: string
): Promise<UploadResult> {
  const validation = validateFile(file, ALLOWED_DIGITAL_TYPES, MAX_DIGITAL_SIZE)
  if (!validation.valid) {
    return { path: '', fullPath: '', publicUrl: null, error: validation.error }
  }

  const admin = createAdminClient()
  if (!admin) return { path: '', fullPath: '', publicUrl: null, error: 'Storage não configurado' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const safeName = `${productId}/${Date.now()}.${ext}`

  try {
    const { data, error } = await admin.storage
      .from(BUCKETS.digitalFiles)
      .upload(safeName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return { path: '', fullPath: '', publicUrl: null, error: error.message }
    }

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl: null, // Arquivos digitais NÃO têm URL pública
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no upload'
    return { path: '', fullPath: '', publicUrl: null, error: message }
  }
}

// ─── UPLOAD DE DOCUMENTO DO VENDOR ───────────────────────────

/**
 * Upload de documento de verificação do vendedor (KYC)
 * Bucket: vendor-docs (private)
 */
export async function uploadVendorDoc(
  file: File,
  vendorId: string,
  docType: string
): Promise<UploadResult> {
  const allowedDocTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
  const validation = validateFile(file, allowedDocTypes, MAX_DOCUMENT_SIZE)
  if (!validation.valid) {
    return { path: '', fullPath: '', publicUrl: null, error: validation.error }
  }

  const admin = createAdminClient()
  if (!admin) return { path: '', fullPath: '', publicUrl: null, error: 'Storage não configurado' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
  const safeName = `${vendorId}/${docType}_${Date.now()}.${ext}`

  try {
    const { data, error } = await admin.storage
      .from(BUCKETS.vendorDocs)
      .upload(safeName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return { path: '', fullPath: '', publicUrl: null, error: error.message }
    }

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl: null,
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no upload'
    return { path: '', fullPath: '', publicUrl: null, error: message }
  }
}

// ─── UPLOAD DE AVATAR ────────────────────────────────────────

/**
 * Upload de avatar do usuário
 * Bucket: avatars (public)
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
  if (!validation.valid) {
    return { path: '', fullPath: '', publicUrl: null, error: validation.error }
  }

  const admin = createAdminClient()
  if (!admin) return { path: '', fullPath: '', publicUrl: null, error: 'Storage não configurado' }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = `${userId}/avatar_${Date.now()}.${ext}`

  try {
    const { data, error } = await admin.storage
      .from(BUCKETS.avatars)
      .upload(safeName, file, {
        contentType: file.type,
        upsert: true, // Permitir sobrescrever avatar anterior
      })

    if (error) {
      return { path: '', fullPath: '', publicUrl: null, error: error.message }
    }

    const { data: urlData } = admin.storage
      .from(BUCKETS.avatars)
      .getPublicUrl(data.path)

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl: urlData.publicUrl,
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro no upload'
    return { path: '', fullPath: '', publicUrl: null, error: message }
  }
}

// ─── SIGNED URL (para arquivos privados) ─────────────────────

/**
 * Gera signed URL para arquivo digital (após compra confirmada)
 * Expiração: 24 horas
 */
export async function getSignedUrl(
  bucket: BucketName,
  filePath: string,
  expiresIn: number = 86400
): Promise<{ url: string | null; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) return { url: null, error: 'Storage não configurado' }

  try {
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) return { url: null, error: error.message }
    return { url: data.signedUrl, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar URL'
    return { url: null, error: message }
  }
}

/**
 * Gera múltiplas signed URLs (download em lote)
 */
export async function getSignedUrls(
  bucket: BucketName,
  filePaths: string[],
  expiresIn: number = 86400
): Promise<{ urls: Array<{ path: string; url: string | null }>; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) return { urls: [], error: 'Storage não configurado' }

  try {
    const { data, error } = await admin.storage
      .from(bucket)
      .createSignedUrls(filePaths, expiresIn)

    if (error) return { urls: [], error: error.message }

    const urls = filePaths.map((path) => {
      const match = data?.find((item) => item.path === path)
      return { path, url: match?.signedUrl || null }
    })

    return { urls, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar URLs'
    return { urls: [], error: message }
  }
}

// ─── DELETE ──────────────────────────────────────────────────

/**
 * Remove arquivo do storage
 */
export async function deleteFile(
  bucket: BucketName,
  filePath: string
): Promise<{ success: boolean; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) return { success: false, error: 'Storage não configurado' }

  try {
    const { error } = await admin.storage
      .from(bucket)
      .remove([filePath])

    if (error) return { success: false, error: error.message }
    return { success: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao deletar'
    return { success: false, error: message }
  }
}

/**
 * Lista arquivos em um diretório do bucket
 */
export async function listFiles(
  bucket: BucketName,
  folder: string,
  limit: number = 100
): Promise<{ files: FileInfo[]; error: string | null }> {
  const admin = createAdminClient()
  if (!admin) return { files: [], error: 'Storage não configurado' }

  try {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(folder, { limit, sortBy: { column: 'created_at', order: 'desc' } })

    if (error) return { files: [], error: error.message }

    const files: FileInfo[] = (data || []).map((item) => ({
      name: item.name,
      size: item.metadata?.size || 0,
      type: item.metadata?.mimetype || 'unknown',
      bucket,
    }))

    return { files, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao listar'
    return { files: [], error: message }
  }
}
