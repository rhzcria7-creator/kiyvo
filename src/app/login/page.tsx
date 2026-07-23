'use client'

/**
 * /login — pagina de login.
 * Design: Apple/Linear style, fundo #FAFAFA limpo, card com sombra suave,
 * cantos arredondados generosos, tipografia preta grande.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { KiyvoLogoSvg } from '@/components/brand'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/'
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!email || !password) { setErr('Preencha e-mail e senha'); return }
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        const msg = String(String(error))
        if (/invalid/i.test(msg) || /credentials/i.test(msg)) setErr('E-mail ou senha incorretos')
        else if (/verify/i.test(msg) || /confirm/i.test(msg)) setErr('Conta nao verificada — confira seu e-mail')
        else setErr('Erro ao entrar. Tente novamente.')
        setLoading(false)
        return
      }
      toast.success('Bem-vindo de volta!')
      router.push(next)
    } catch {
      setErr('Erro de conexao')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#FAFAFA] dark:bg-[#0B0F1A] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-violet-100/40 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize:'48px 48px'}}/>
      </div>

      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/"><KiyvoLogoSvg size={48} /></Link>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 lg:p-10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.15)] border border-black/5 dark:border-white/10">
          <WordPullUp as="h1" words="Bem-vindo de volta." className="font-display font-black text-3xl lg:text-4xl leading-[1] tracking-tight mb-2" />
          <p className="text-[#64748B] dark:text-white/50 text-sm mb-8">Entre para continuar comprando e vendendo.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-2">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40"/>
                <input
                  type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10 focus:border-brand-600 focus:bg-white dark:bg-white/5 outline-none transition text-sm font-medium"
                  placeholder="voce@exemplo.com" autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50">Senha</label>
                <Link href="/auth/forgot" className="text-[11px] font-bold text-brand-600 hover:underline">Esqueci a senha</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40"/>
                <input
                  type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10 focus:border-brand-600 focus:bg-white dark:bg-white/5 outline-none transition text-sm font-medium"
                  placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40 hover:text-[#0F172A] dark:text-white transition">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {err && (
              <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-start gap-2">
                <span>{err}</span>
              </motion.div>
            )}

            <ShimmerButton type="submit" size="lg" className="w-full justify-center" disabled={loading} icon={loading ? <Loader2 size={18} className="animate-spin"/> : <ArrowRight size={18}/>}>
              {loading ? 'Entrando...' : 'Entrar'}
            </ShimmerButton>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase font-bold text-[#94A3B8]">
            <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/>
            <span>segurança</span>
            <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-[#94A3B8] dark:text-white/40">
            <span className="flex items-center gap-1.5"><Lock size={12}/> 2FA disponível</span>
            <span className="flex items-center gap-1.5"><Shield size={12}/> Dados criptografados</span>
          </div>

          <p className="mt-6 text-center text-sm text-[#64748B] dark:text-white/50">
            Nao tem conta? <Link href="/cadastro" className="font-black text-[#0F172A] dark:text-white hover:text-brand-600 transition">Criar conta</Link>
          </p>
        </div>

        <Link href="/" className="mt-6 block text-center text-xs text-[#94A3B8] dark:text-white/40 hover:text-[#0F172A] dark:text-white transition">← Voltar para a home</Link>
      </motion.div>
    </div>
  )
}
