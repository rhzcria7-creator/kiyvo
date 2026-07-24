'use client'
// ─────────────────────────────────────────────────────────────
// KIYVO Anti-Cloning & Domain Protection
// Protege contra cópia do site, hotlink, iframe embedding e scraping básico.
// Nada impede engenharia reversa completa, mas eleva a barreira.
// ─────────────────────────────────────────────────────────────

const ALLOWED_HOSTS = [
  'kiyvo.com.br',
  'www.kiyvo.com.br',
  'kiyvo.vercel.app',
  'kiyvo-git-',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
]

export function isDomainAllowed(): boolean {
  if (typeof window === 'undefined') return true
  const host = window.location.hostname
  if (!host) return true
  return ALLOWED_HOSTS.some(h => host === h || host.endsWith(`.${h}`) || host.includes(h))
}

export function preventIframeEmbedding() {
  if (typeof window === 'undefined') return
  try {
    if (window.top !== window.self && window.top) {
      window.top.location.href = window.location.href
    }
  } catch {
    // Cross-origin: força quebra
    try {
      if (window.self !== window.top) {
        // eslint-disable-next-line no-console
        console.log('%c⛔ KIYVO — Não permitido embed', 'color:#2563EB;font-size:24px;font-weight:900')
      }
    } catch { /* */ }
  }
}

// Desabilita menu de contexto em imagens (anti-download)
export function disableImageContextMenu() {
  if (typeof window === 'undefined') return
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG' && (target as HTMLImageElement).src.includes('kiyvo')) {
      e.preventDefault()
    }
  }, { passive: true })
}

// DevTools detection (não bloqueia, só telemetria — obstruir devtools é má UX)
export function detectDevTools(cb?: (open: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  let open = false
  const threshold = 160
  const check = () => {
    const widthDiff = window.outerWidth - window.innerWidth > threshold
    const heightDiff = window.outerHeight - window.innerHeight > threshold
    const nowOpen = widthDiff || heightDiff
    if (nowOpen !== open) {
      open = nowOpen
      cb?.(nowOpen)
    }
  }
  const interval = setInterval(check, 1500)
  return () => clearInterval(interval)
}

// Assinatura de marca invisível (watermark em canvas)
export function getWatermark(): string {
  return 'KIYVO-BR-v10.6-' + btoa(String(Date.now())).slice(0, 10)
}

// Protege contra seleção de texto em cards de produtos (opcional)
export function setupAntiCopy() {
  if (typeof window === 'undefined') return
  // NÃO bloqueamos seleção/copy (UX), só registramos telemetria
  document.addEventListener('copy', () => {
    try {
      // Adiciona citação automática ao copiar
      const sel = window.getSelection()
      if (sel && sel.toString().length > 50) {
        const extra = `\n\n— Fonte: Kiyvo (https://kiyvo.com.br${window.location.pathname})`
        // Apenas analytics (não modificamos o clipboard sem permissão)
        // eslint-disable-next-line no-console
        console.debug('conteudo copiado', window.location.pathname)
      }
    } catch { /* noop */ }
  }, { passive: true })
}

// Console warning bonito (estilo Netflix/FB)
export function printConsoleWarning() {
  if (typeof window === 'undefined') return
  try {
    const styles = [
      'background: linear-gradient(90deg,#2563EB,#7C3AED)',
      'color: #fff',
      'font-size: 16px',
      'font-weight: 900',
      'padding: 12px 20px',
      'border-radius: 8px',
      'text-transform: uppercase',
      'letter-spacing: 1px',
    ].join(';')
    // eslint-disable-next-line no-console
    console.log('%cKIYVO  ⚠️', styles)
    // eslint-disable-next-line no-console
    console.log('%cAtenção! Se alguém te pediu para colar algo aqui, é GOLPE.', 'color:#ef4444;font-size:14px;font-weight:700')
    // eslint-disable-next-line no-console
    console.log('%cEsta área é para desenvolvedores. Colocar código aqui pode comprometer sua conta.', 'color:#64748b;font-size:12px')
  } catch { /* noop */ }
}

export function initSecurity() {
  if (typeof window === 'undefined') return
  preventIframeEmbedding()
  disableImageContextMenu()
  setupAntiCopy()
  printConsoleWarning()
}
