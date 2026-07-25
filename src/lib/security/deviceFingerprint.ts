// ─────────────────────────────────────────────────────────────
// Device Fingerprint v0.0.1 — Identificação única do dispositivo
// Canvas + WebGL + Fonts + Timezone + AudioContext → hash SHA-256
// ─────────────────────────────────────────────────────────────

export interface DeviceFingerprintData {
  canvas: string | null
  webgl: string | null
  fonts: string[]
  timezone: string
  language: string
  platform: string
  userAgent: string
  screenResolution: string
  colorDepth: number
  audioContext: string | null
  touchSupport: boolean
  hardwareConcurrency: number
  deviceMemory: number | null
}

export interface DeviceFingerprintResult {
  hash: string
  data: DeviceFingerprintData
  confidence: number // 0-1
}

/**
 * Coleta fingerprint do dispositivo no cliente
 * Roda apenas no browser, nunca SSR
 */
export function collectDeviceFingerprint(): DeviceFingerprintResult | null {
  if (typeof window === 'undefined') return null

  const data: DeviceFingerprintData = {
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    fonts: getFontList(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    colorDepth: window.screen.colorDepth,
    audioContext: getAudioFingerprint(),
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 2,
    deviceMemory: (navigator as any).deviceMemory || null,
  }

  return {
    hash: simpleHash(JSON.stringify(data)),
    data,
    confidence: calculateConfidence(data),
  }
}

function getCanvasFingerprint(): string | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Texto com fontes específicas para gerar padrão único
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(100, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.font = '11pt Arial'
    ctx.fillText('KIYVO℠', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.font = '18pt Georgia'
    ctx.fillText('fp', 4, 45)

    return canvas.toDataURL()
  } catch {
    return null
  }
}

function getWebGLFingerprint(): string | null {
  try {
    const canvas = document.createElement('canvas')
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return null

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return null

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return `${vendor}|${renderer}`
  } catch {
    return null
  }
}

function getFontList(): string[] {
  const fonts = [
    'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria',
    'Cambria Math', 'Comic Sans MS', 'Consolas', 'Courier New',
    'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
    'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Segoe UI Light',
    'Segoe UI Semibold', 'Segoe UI Symbol', 'Tahoma', 'Times New Roman',
    'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings',
  ]

  const available: string[] = []
  const testString = 'mmmmmmmmmmlli'
  const testSize = '72px'
  const baseWidths = new Map<string, number>()

  const baseDiv = document.createElement('div')
  for (const font of fonts) {
    baseDiv.style.fontFamily = font
    baseDiv.style.fontSize = testSize
    baseDiv.style.position = 'absolute'
    baseDiv.style.left = '-9999px'
    baseDiv.style.visibility = 'hidden'
    baseDiv.textContent = testString
    document.body.appendChild(baseDiv)
    baseWidths.set(font, baseDiv.offsetWidth)
    document.body.removeChild(baseDiv)
  }

  // Comparar larguras para detectar fontes disponíveis
  const monospaceFont = 'monospace'
  for (const font of fonts) {
    const testDiv = document.createElement('div')
    testDiv.style.fontFamily = `"${font}", ${monospaceFont}`
    testDiv.style.fontSize = testSize
    testDiv.style.position = 'absolute'
    testDiv.style.left = '-9999px'
    testDiv.style.visibility = 'hidden'
    testDiv.textContent = testString
    document.body.appendChild(testDiv)
    const width = testDiv.offsetWidth
    document.body.removeChild(testDiv)

    const baseWidth = baseWidths.get(monospaceFont) || 0
    if (width !== baseWidth) {
      available.push(font)
    }
  }

  return available
}

function getAudioFingerprint(): string | null {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const analyser = audioCtx.createAnalyser()
    const gainNode = audioCtx.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(10000, audioCtx.currentTime)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    oscillator.connect(analyser)
    analyser.connect(gainNode)
    const data = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(data)
    const hash = data.slice(0, 10).join('|')
    oscillator.disconnect()
    return hash
  } catch {
    return null
  }
}

function calculateConfidence(data: DeviceFingerprintData): number {
  let score = 0
  if (data.canvas) score += 0.25
  if (data.webgl) score += 0.25
  if (data.fonts.length > 0) score += 0.15
  if (data.timezone) score += 0.10
  if (data.audioContext) score += 0.15
  if (data.screenResolution) score += 0.10
  return Math.min(1, score)
}

/**
 * Hash simples não-criptográfico para fingerprint
 * Rápido o suficiente para identificar dispositivo
 */
function simpleHash(str: string): string {
  let hash1 = 5381
  let hash2 = 52711
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash1 = ((hash1 << 5) + hash1) + char
    hash2 = ((hash2 << 5) + hash2) + char
  }
  return `${(hash1 >>> 0).toString(36)}${(hash2 >>> 0).toString(36)}`
}

/**
 * Gera cookie de fingerprint (server-side via headers)
 */
export function fingerprintFromHeaders(headers: Record<string, string | string[] | undefined>): Partial<DeviceFingerprintData> {
  return {
    userAgent: (headers['user-agent'] as string) || '',
    language: (headers['accept-language'] as string) || '',
    platform: (headers['sec-ch-ua-platform'] as string) || '',
  }
}
