// /r/[code] → Página de redirecionamento (curta, client-only)
// Seta cookie de referência client-side (document.cookie) e redireciona para a home.
// Isso evita problemas de runtime (Node vs Edge) que surgem com cookies() em Route Handlers.
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { KiyvoLogoSvg } from '@/components/brand'
import { Loader2 } from 'lucide-react'

export default function ReferralRedirectPage() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const rawCode = typeof params.code === 'string' ? params.code : ''
    const code = rawCode.trim().toUpperCase()
    if (!code || code.length < 3 || code.length > 32 || !/^[A-Z0-9_-]+$/.test(code)) {
      router.replace('/?ref=invalid')
      return
    }
    try {
      fetch('/api/referral/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }).catch(() => {})
      // Salvar no localStorage (consumido pela tela de cadastro)
      localStorage.setItem('kiyvo_ref_code', code)
      localStorage.setItem('kiyvo_ref_at', String(Date.now()))
      // Cookie com SameSite=Lax para leitura server-side no futuro
      const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `kiyvo_ref=${code}; path=/; expires=${expires}; SameSite=Lax`
      setOk(true)
      setTimeout(() => router.replace(`/?ref=${code}&welcome=1`), 500)
    } catch {
      router.replace(`/?ref=${code}&welcome=1`)
    }
  }, [params, router])

  return (
    <div className="min-h-[100svh] bg-[#FAFAFA] dark:bg-[#0B0F1A] flex flex-col items-center justify-center">
      <KiyvoLogoSvg size={56} />
      <div className="mt-6 flex items-center gap-2 text-sm text-[#64748B]">
        <Loader2 size={16} className="animate-spin" />
        {ok ? 'Redirecionando...' : 'Processando indicação...'}
      </div>
    </div>
  )
}
