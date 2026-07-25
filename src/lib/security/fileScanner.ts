// ─────────────────────────────────────────────────────────────
// File Scanner v0.0.1 — Escaneamento de arquivos por MIME + magic bytes
// Bloqueia executáveis (exe, bat, sh, etc) a menos que explicitamente permitido
// ─────────────────────────────────────────────────────────────

export interface FileScanResult {
  safe: boolean
  mimeType: string
  detectedBy: 'magic_bytes' | 'extension' | 'content_analysis'
  risk: 'clean' | 'suspicious' | 'malicious' | 'unknown'
  riskScore: number // 0-100
  reason?: string
  details?: {
    magicBytesHex: string
    declaredExtension: string
    actualType: string
    isExecutable: boolean
    isScript: boolean
    isArchive: boolean
  }
}

// Magic bytes conhecidos (hex signature)
const MAGIC_BYTES: Record<string, { mime: string; name: string; risk: 'clean' | 'suspicious' | 'malicious' }> = {
  '89504E47': { mime: 'image/png', name: 'PNG Image', risk: 'clean' },
  'FFD8FF': { mime: 'image/jpeg', name: 'JPEG Image', risk: 'clean' },
  '47494638': { mime: 'image/gif', name: 'GIF Image', risk: 'clean' },
  '49492A00': { mime: 'image/tiff', name: 'TIFF Image', risk: 'clean' },
  '424D': { mime: 'image/bmp', name: 'BMP Image', risk: 'clean' },
  '52494646': { mime: 'image/webp', name: 'WEBP Image', risk: 'clean' },
  '25504446': { mime: 'application/pdf', name: 'PDF Document', risk: 'clean' },
  '504B0304': { mime: 'application/zip', name: 'ZIP Archive', risk: 'suspicious' },
  '504B0506': { mime: 'application/zip', name: 'ZIP Archive (Empty)', risk: 'suspicious' },
  '1F8B08': { mime: 'application/gzip', name: 'GZip Archive', risk: 'suspicious' },
  '52617221': { mime: 'application/vnd.rar', name: 'RAR Archive', risk: 'suspicious' },
  '377ABCAF271C': { mime: 'application/x-7z-compressed', name: '7-Zip Archive', risk: 'suspicious' },
  '4D5A': { mime: 'application/x-msdownload', name: 'Windows Executable', risk: 'malicious' },
  '7F454C46': { mime: 'application/x-executable', name: 'Linux ELF', risk: 'malicious' },
  'CAFEBABE': { mime: 'application/java-vm', name: 'Java Class', risk: 'suspicious' },
  '38425053': { mime: 'application/x-photoshop', name: 'Photoshop', risk: 'clean' },
  '00000100': { mime: 'application/x-font-ttf', name: 'TTF Font', risk: 'clean' },
  '00010000': { mime: 'application/x-font-ttf', name: 'TTF Font', risk: 'clean' },
  '4F676753': { mime: 'audio/ogg', name: 'OGG Audio', risk: 'clean' },
  '494433': { mime: 'audio/mpeg', name: 'MP3 Audio', risk: 'clean' },
  'FFF1': { mime: 'audio/aac', name: 'AAC Audio', risk: 'clean' },
  'FFF9': { mime: 'audio/aac', name: 'AAC Audio', risk: 'clean' },
  '664C6143': { mime: 'audio/x-flac', name: 'FLAC Audio', risk: 'clean' },
  '3026B275': { mime: 'video/wmv', name: 'WMV Video', risk: 'clean' },
  '1A45DFA3': { mime: 'video/x-matroska', name: 'MKV Video', risk: 'clean' },
  '000001BA': { mime: 'video/mpeg', name: 'MPEG Video', risk: 'clean' },
  '000001B3': { mime: 'video/mpeg', name: 'MPEG Video', risk: 'clean' },
  '66747970': { mime: 'video/mp4', name: 'MP4 Video', risk: 'clean' },
  '6D646174': { mime: 'video/mp4', name: 'MP4 Video (mdat)', risk: 'clean' },
}

// Extensões bloqueadas (executáveis e scripts)
const BLOCKED_EXTENSIONS: ReadonlySet<string> = new Set([
  '.exe', '.msi', '.bin', '.com', '.scr', '.cpl',
  '.bat', '.cmd', '.ps1', '.vbs', '.vbe', '.js', '.jse',
  '.wsf', '.wsh', '.wsc',
  '.sh', '.bash', '.zsh', '.ksh', '.csh',
  '.pl', '.pm', '.py', '.pyc', '.pyo', '.rb',
  '.php', '.php3', '.php4', '.php5', '.phtml',
  '.asp', '.aspx', '.cer', '.asa',
  '.swf', '.hta', '.msc', '.reg',
  '.dll', '.sys', '.drv', '.ocx', '.ax',
  '.app', '.dmg', '.pkg',
  '.jar', '.jsp', '.war',
  '.lnk', '.url', '.website',
  '.scf', '.inf',
])

// Extensões permitidas mesmo sendo executáveis (software legítimo)
const ALLOWED_EXECUTABLES: ReadonlySet<string> = new Set([
  '.exe', '.msi', '.dmg', '.pkg', '.app', '.sh', '.bin',
])

/**
 * Escaneia arquivo por segurança
 * Detecta tipo real via magic bytes e compara com extensão declarada
 */
export function scanFile(
  fileName: string,
  fileBuffer: ArrayBuffer | Buffer,
  allowExecutables: boolean = false
): FileScanResult {
  const bytes = new Uint8Array(fileBuffer)
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  const hexSignature = getMagicBytesHex(bytes)

  // 1. Detectar por magic bytes
  const magicMatch = findMagicMatch(hexSignature)

  // 2. Verificar extensão
  const isBlockedExtension = BLOCKED_EXTENSIONS.has(extension)
  const isAllowedExecutable = ALLOWED_EXECUTABLES.has(extension)

  // 3. Análise de risco
  let risk: FileScanResult['risk'] = 'clean'
  let riskScore = 0
  let reason: string | undefined

  // Executável detectado
  if (magicMatch && magicMatch.risk === 'malicious') {
    risk = 'malicious'
    riskScore = 95
    reason = `Arquivo executável detectado (${magicMatch.name})`
  }

  // Extensão bloqueada
  if (isBlockedExtension && !isAllowedExecutable) {
    risk = 'malicious'
    riskScore = Math.max(riskScore, 85)
    reason = (reason ? `${reason}; ` : '') + `Extensão bloqueada: ${extension}`
  }

  // Executável mas permitido
  if ((magicMatch?.risk === 'malicious' || isBlockedExtension) && isAllowedExecutable && allowExecutables) {
    risk = 'suspicious'
    riskScore = 30
    reason = `Arquivo executável permitido: ${extension}`
  }

  // Script detectado
  if (magicMatch?.risk === 'suspicious' && isBlockedExtension) {
    risk = 'suspicious'
    riskScore = Math.max(riskScore, 50)
    reason = (reason ? `${reason}; ` : '') + 'Script/arquivo suspeito'
  }

  // Discrepância entre extensão e magic bytes
  if (magicMatch && !isBlockedExtension) {
    const mimeMatch = magicMatch.mime.startsWith('image/') ||
      magicMatch.mime.startsWith('audio/') ||
      magicMatch.mime.startsWith('video/')
    if (!mimeMatch && isBlockedExtension) {
      risk = 'suspicious'
      riskScore = Math.max(riskScore, 40)
      reason = (reason ? `${reason}; ` : '') + `Discrepância: extensão ${extension} não corresponde ao tipo ${magicMatch.name}`
    }
  }

  // Verificar conteúdo de script em arquivos texto
  if (!magicMatch) {
    const textContent = new TextDecoder().decode(bytes.slice(0, 1024))
    if (isScriptContent(textContent)) {
      risk = 'suspicious'
      riskScore = Math.max(riskScore, 60)
      reason = (reason ? `${reason}; ` : '') + 'Conteúdo de script detectado'
    }
  }

  return {
    safe: risk === 'clean' || (risk === 'suspicious' && riskScore < 50),
    mimeType: magicMatch?.mime || 'application/octet-stream',
    detectedBy: magicMatch ? 'magic_bytes' : 'extension',
    risk,
    riskScore,
    reason,
    details: {
      magicBytesHex: hexSignature.slice(0, 16),
      declaredExtension: extension,
      actualType: magicMatch?.name || 'Unknown',
      isExecutable: isBlockedExtension,
      isScript: ['.bat', '.sh', '.ps1', '.vbs', '.js'].includes(extension),
      isArchive: ['.zip', '.rar', '.7z', '.tar', '.gz'].includes(extension),
    },
  }
}

/**
 * Converte bytes para hex string
 */
function getMagicBytesHex(bytes: Uint8Array): string {
  const len = Math.min(bytes.length, 16)
  return Array.from(bytes.slice(0, len))
    .map(b => b.toString(16).padStart(2, 'U').toUpperCase())
    .join('')
}

/**
 * Encontra magic bytes correspondente
 */
function findMagicMatch(hexSignature: string): { mime: string; name: string; risk: 'clean' | 'suspicious' | 'malicious' } | undefined {
  // Tentar match exato primeiro (mais específico)
  for (const [sig, info] of Object.entries(MAGIC_BYTES)) {
    if (hexSignature.startsWith(sig)) {
      return info
    }
  }
  return undefined
}

/**
 * Detecta conteúdo de script em texto
 */
function isScriptContent(text: string): boolean {
  const scriptPatterns = [
    /<script/i,
    /eval\s*\(/i,
    /exec(?:Command)?\s*\(/i,
    /powershell/i,
    /wscript\.shell/i,
    /shell\.application/i,
    /MSHTA/i,
    /#!\//, // Shebang
    /<?php/i,
    /System\.Reflection/i,
    /System\.Diagnostics/i,
    /Process\.Start/i,
  ]

  return scriptPatterns.some(p => p.test(text))
}

/**
 * Verifica MIME type permitido para upload
 */
export function isAllowedMimeType(mimeType: string, allowedTypes: string[] = []): boolean {
  const defaultAllowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'text/plain', 'text/csv', 'text/markdown',
    'application/zip', 'application/x-zip-compressed',
    'application/json', 'application/xml',
  ]

  const allAllowed = allowedTypes.length > 0 ? allowedTypes : defaultAllowed
  return allAllowed.includes(mimeType)
}
