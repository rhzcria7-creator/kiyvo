// Página legada — mantida apenas para redirecionamento permanente para /tutorial/kd-points
// Conteúdo do programa de recompensas foi movido para /tutorial/kd-points (rebrand KD Points)
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LegacyPDPointsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tutorial/kd-points')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center" aria-live="polite">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-brand-500 mx-auto mb-3 animate-spin" />
        <p className="text-sm text-surface-500">Redirecionando para KD Points...</p>
      </div>
    </div>
  )
}
