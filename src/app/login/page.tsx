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
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, Shield, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { KiyvoLogoSvg } from '@/components/brand'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'
import { toast } from 'react-hot-toast'
import { isFirebaseConfigured, signInWithGoogle, signInWithGithub, signInWithApple, sendMagicLink } from '@/lib/firebase/client'

// Ícones SVG dos providers sociais (sem lib externa)
function GoogleIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
}
function GithubIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>
}
function AppleIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.7 17.1c-.3.7-.7 1.4-1.2 2-.7.9-1.3 1.5-1.7 1.7-.7.4-1.4.6-2.2.4-.8-.2-1.5-.1-2.4.3-.9.4-1.5.6-2 .5-.5-.1-1.1-.6-1.8-1.5-.7-1-1.3-2.2-1.7-3.6-.4-1.5-.7-2.9-.7-4.2 0-1.5.3-2.7 1-3.7.5-.8 1.2-1.4 2.1-1.7.9-.4 1.8-.3 2.8.2.5.2.9.3 1.1.3.2 0 .7-.2 1.5-.5.8-.3 1.5-.4 2.1-.2 1.1.2 1.9.7 2.4 1.6-1 .7-1.5 1.7-1.5 2.9 0 1 .3 1.8 1 2.4.3.3.7.5 1.1.7-.1.3-.2.6-.3.9zM15.5 3.1c0 .9-.3 1.8-.9 2.6-.7.9-1.6 1.4-2.6 1.4 0-.9.3-1.8.9-2.6.3-.4.7-.8 1.2-1.1.5-.3 1-.4 1.4-.3z"/></svg>
}

function SocialButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 bg-white dark:bg-white/5 transition group"
      title={`Entrar com ${label}`}
    >
      {icon}
      <span className="text-xs font-black text-slate-700 dark:text-slate-200 hidden sm:inline">{label}</span>
    </motion.button>
  )
}

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
  const [demoAccepted, setDemoAccepted] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  async function finalizeFirebaseLogin(token: string, email: string) {
    // Envia token do Firebase para API criar/validar sessão LocalDB
    try {
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, email }),
      })
      if (res.ok) {
        toast.success('Login efetuado com sucesso!', { icon: '🎉' })
        router.push(next)
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao autenticar com provedor social')
      }
    } catch {
      toast.error('Erro de conexão com o servidor')
    } finally {
      setSocialLoading(null)
    }
  }

  async function handleGoogleLogin() {
    setSocialLoading('google')
    if (!isFirebaseConfigured()) {
      setSocialLoading(null)
      toast('🔑 Configure NEXT_PUBLIC_FIREBASE_API_KEY no .env.local para ativar', { duration: 5000 })
      return
    }
    const res = await signInWithGoogle()
    if (res.error || !res.user || !res.token) {
      setSocialLoading(null)
      toast.error(res.error || 'Erro no login Google')
      return
    }
    await finalizeFirebaseLogin(res.token, res.user.email || '')
  }

  async function handleGithubLogin() {
    setSocialLoading('github')
    if (!isFirebaseConfigured()) {
      setSocialLoading(null)
      toast('🔑 Configure Firebase para ativar login GitHub', { duration: 5000 })
      return
    }
    const res = await signInWithGithub()
    if (res.error || !res.user || !res.token) {
      setSocialLoading(null)
      toast.error(res.error || 'Erro no login GitHub')
      return
    }
    await finalizeFirebaseLogin(res.token, res.user.email || '')
  }

  async function handleAppleLogin() {
    setSocialLoading('apple')
    if (!isFirebaseConfigured()) {
      setSocialLoading(null)
      toast('🔑 Login Apple requer configuração no Firebase Console', { duration: 5000 })
      return
    }
    const res = await signInWithApple()
    if (res.error || !res.user || !res.token) {
      setSocialLoading(null)
      toast.error(res.error || 'Erro no login Apple')
      return
    }
    await finalizeFirebaseLogin(res.token, res.user.email || '')
  }

  const [magicSent, setMagicSent] = useState(false)
  const [magicSending, setMagicSending] = useState(false)
  async function handleMagicLink() {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Digite um e-mail válido para enviar o link')
      return
    }
    setMagicSending(true)
    const res = await sendMagicLink(email)
    setMagicSending(false)
    if (res.ok) {
      setMagicSent(true)
      toast.success('✨ Link enviado! Verifique sua caixa de entrada.')
    } else {
      toast.error(res.error || 'Erro ao enviar link')
    }
  }


  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!email || !password) { setErr('Preencha e-mail e senha'); return }
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        const msg = String(String(error))
        if (/invalid/i.test(msg) || /credentials/i.test(msg) || /incorret/i.test(msg)) setErr('E-mail ou senha incorretos')
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

  const loginDemo = async () => {
    if (!demoAccepted) {
      toast.error('Marque a caixa de ciência dos riscos do modo demo antes de prosseguir', { id: 'demo-accept' })
      return
    }
    setErr(null)
    setLoading(true)
    try {
      const { error } = await signIn('demo@kiyvo.com.br', 'demo123')
      if (error) {
        setErr('Erro ao entrar no demo: ' + String(error))
        setLoading(false)
        return
      }
      // Marca que o usuário aceitou o demo
      try { localStorage.setItem('kiyvo_demo_accepted', JSON.stringify({ acceptedAt: Date.now() })) } catch { /* noop */ }
      toast.success('Entrou como demo (com dados locais).')
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

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleMagicLink}
              disabled={magicSending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-slate-200 dark:border-white/15 hover:border-brand-400 dark:hover:border-brand-500 text-[#0F172A] dark:text-white font-black text-sm bg-transparent disabled:opacity-60 transition"
            >
              {magicSending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="text-brand-500" />}
              {magicSent ? 'Link enviado! ✅' : 'Entrar sem senha (Magic Link)'}
            </motion.button>
            {magicSent && (
              <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold -mt-2">
                Enviamos um link para <b>{email}</b>. Clique nele para entrar.
              </p>
            )}
          </form>

          {/* Social login */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <SocialButton label="Google" icon={socialLoading==='google' ? <Loader2 className="w-4 h-4 animate-spin"/> : <GoogleIcon />} onClick={handleGoogleLogin} />
            <SocialButton label="GitHub" icon={socialLoading==='github' ? <Loader2 className="w-4 h-4 animate-spin"/> : <GithubIcon />} onClick={handleGithubLogin} />
            <SocialButton label="Apple" icon={socialLoading==='apple' ? <Loader2 className="w-4 h-4 animate-spin"/> : <AppleIcon />} onClick={handleAppleLogin} />
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase font-bold text-[#94A3B8]">
            <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/>
            <span>ou e-mail/senha</span>
            <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-[#94A3B8] dark:text-white/40">
            <span className="flex items-center gap-1.5"><Lock size={12}/> 2FA disponível</span>
            <span className="flex items-center gap-1.5"><Shield size={12}/> Dados criptografados</span>
          </div>

          <p className="mt-6 text-center text-sm text-[#64748B] dark:text-white/50">
            Nao tem conta? <Link href="/cadastro" className="font-black text-[#0F172A] dark:text-white hover:text-brand-600 transition">Criar conta</Link>
          </p>

          <div className="mt-5 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <p className="font-black uppercase tracking-wider text-[11px] mb-1">Modo demonstração</p>
                <p>Compras, favoritos e dados ficam salvos APENAS neste navegador. <b>Recomendamos criar conta real</b> com login para não perder nada.</p>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <div
                onClick={(e) => { e.preventDefault(); setDemoAccepted(!demoAccepted) }}
                className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition ${demoAccepted ? 'bg-brand-600 border-brand-600' : 'border-amber-400'}`}
              >
                {demoAccepted && <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs text-amber-900 dark:text-amber-200 leading-snug">
                Li e estou ciente dos riscos: posso <b>perder compras</b> se limpar o cache, e o suporte é limitado.
              </span>
              <input type="checkbox" checked={demoAccepted} onChange={(e) => setDemoAccepted(e.target.checked)} className="sr-only" />
            </label>
            <button
              type="button"
              onClick={loginDemo}
              disabled={loading || !demoAccepted}
              className="w-full py-3 rounded-full border-2 border-amber-400 dark:border-amber-500/60 text-amber-900 dark:text-amber-200 text-sm font-black hover:bg-amber-100 dark:hover:bg-amber-900/40 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Entrando...' : 'Entrar como DEMO (sem conta)'}
            </button>
          </div>
        </div>

        <Link href="/" className="mt-6 block text-center text-xs text-[#94A3B8] dark:text-white/40 hover:text-[#0F172A] dark:text-white transition">← Voltar para a home</Link>
      </motion.div>
    </div>
  )
}
