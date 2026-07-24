'use client'
// Página /auth/magic-link — callback que completa login via Magic Link.
// Firebase detecta o link na URL, faz sign-in automaticamente e redireciona.
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { completeMagicLink } from '@/lib/firebase/client'
import { KiyvoLogoSvg } from '@/components/brand'
import { toast } from 'react-hot-toast'

export default function MagicLinkPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [msg, setMsg] = useState('Completando login...')

  useEffect(() => {
    async function run() {
      try {
        const res = await completeMagicLink(window.location.href)
        if (!res.user) {
          setStatus('error')
          setMsg(res.error || 'Link inválido ou expirado. Peça um novo link.')
          return
        }
        if (res.token) {
          const apiRes = await fetch('/api/auth/firebase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token: res.token, email: res.email }),
          })
          if (!apiRes.ok) {
            setStatus('error')
            setMsg('Erro ao criar sessão. Tente novamente.')
            return
          }
        }
        setStatus('success')
        setMsg('Login efetuado com sucesso!')
        toast.success('Bem-vindo! ✨')
        setTimeout(() => { router.push('/?welcome=1'); router.refresh() }, 1200)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setStatus('error')
        setMsg(message)
      }
    }
    run()
  }, [router])

  return (
    <div className="min-h-[100svh] bg-[#FAFAFA] dark:bg-[#0B0F1A] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md bg-white dark:bg-white/5 rounded-[2rem] p-8 lg:p-10 border border-black/5 dark:border-white/10 shadow-xl text-center"
      >
        <div className="flex flex-col items-center mb-6">
          <Link href="/"><KiyvoLogoSvg size={48} /></Link>
        </div>

        {status === 'loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Entrando...</h1>
            <p className="text-sm text-slate-500">{msg}</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Tudo certo! 🎉</h1>
            <p className="text-sm text-slate-500 mb-4">{msg}</p>
            <p className="text-xs text-slate-400">Redirecionando para a página inicial...</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">Não foi possível entrar</h1>
            <p className="text-sm text-slate-500 mb-5">{msg}</p>
            <div className="flex flex-col gap-2">
              <Link href="/login" className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-white text-white dark:text-black rounded-full py-3 font-black text-sm">
                Tentar novamente <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/" className="text-xs text-slate-400 hover:text-slate-700 underline">Voltar para o início</Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
