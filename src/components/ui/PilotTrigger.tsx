'use client'
// ─────────────────────────────────────────────────────────────
// PILOT TRIGGER (INVISÍVEL)
// - Não existe NENHUM link, botão ou rota anunciando o piloto
// - Formas de ativar (secretas):
//   1) Digitar KONAMI CODE: ↑↑↓↓←→←→BA (setas + B + A)
//   2) URL com #__pilot (apagado após usar)
//   3) Segurar Ctrl+Shift+P por 3s em qualquer página
// - Admin comum não sabe, usuário não sabe.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function PilotTrigger() {
  const router = useRouter()
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    // Trigger por hash (vários hashes secretos, nenhum anunciado)
    const SECRET_HASHES = ['#__pilot', '#__m', '#mtrx', '#matrix', '#admin_kiyv']
    if (SECRET_HASHES.includes(window.location.hash)) {
      window.location.hash = ''
      router.push('/mtrx/console')
      return
    }

    // Konami code
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    let seqIdx = 0
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (k === seq[seqIdx]) {
        seqIdx++
        if (seqIdx === seq.length) {
          router.push('/mtrx/console')
          seqIdx = 0
        }
      } else {
        seqIdx = (k === seq[0] ? 1 : 0)
      }
    }
    window.addEventListener('keydown', onKey)

    // Ctrl+Shift+P por 3s
    let pressStart = 0
    let iv: ReturnType<typeof setInterval> | null = null
    const down = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        pressStart = Date.now()
        iv = setInterval(() => {
          if (Date.now() - pressStart >= 3000) {
            if (iv) clearInterval(iv)
            router.push('/mtrx/console')
          }
        }, 200)
      }
    }
    const up = () => { if (iv) clearInterval(iv); pressStart = 0 }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    // Triple-click no canto inferior direito (área de 50x50)
    let clicks = 0, clickTimer: ReturnType<typeof setTimeout> | null = null
    const onClick = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window
      if (e.clientX > w - 60 && e.clientY > h - 60) {
        clicks++
        if (clickTimer) clearTimeout(clickTimer)
        clickTimer = setTimeout(() => { clicks = 0 }, 1500)
        if (clicks >= 5) {
          clicks = 0
          router.push('/mtrx/console')
        }
      }
    }
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('click', onClick)
      if (iv) clearInterval(iv)
    }
  }, [router])

  // NUNCA renderiza nada — componente fantasma
  return null
}
