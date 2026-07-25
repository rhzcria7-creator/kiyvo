// v0.0.1 — Impressão de dispositivo com minimização: hash, nunca dados brutos persistentes.

export interface DeviceFingerprintInput {
  screen: string
  timezone: string
  language: string
  platform: string
  hardwareConcurrency: number
  canvas: string
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(hash)).map((item) => item.toString(16).padStart(2, '0')).join('')
}

function canvasSignature(): string {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return 'canvas-unavailable'
  context.textBaseline = 'top'
  context.font = '14px Arial'
  context.fillText('KIYVO device integrity', 2, 2)
  return canvas.toDataURL().slice(-128)
}

export async function collectDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return ''
  const navigatorWithUaData = navigator as Navigator & { userAgentData?: { platform?: string } }
  const input: DeviceFingerprintInput = {
    screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigatorWithUaData.userAgentData?.platform || navigator.platform || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    canvas: canvasSignature(),
  }
  return sha256(JSON.stringify(input))
}
