'use client'
// /login — página de login premium do marketplace KIYVO
// Design de Luxo: Minimalista, tons terrosos (#FAF7F2 / sand / sienna) e azul profundo, cantos generosos arredondados, animações sofisticadas
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

// Provedores sociais premium
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-earth-100 dark:border-white/10 hover:border-earth-300 dark:hover:border-white/20 bg-[#FAF7F2] dark:bg-white/5 transition"
      title={`Entrar com ${label}`}
    >
      {icon}
      <span className="text-xs font-black text-earth-800 dark:text-slate-200 hidden sm:inline">{label}</span>
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
        const msg = String(error)
        if (/invalid/i.test(msg) || /credentials/i.test(msg) || /incorret/i.test(msg)) setErr('E-mail ou senha incorretos')
        else if (/verify/i.test(msg) || /confirm/i.test(msg)) setErr('Conta não verificada — confira seu e-mail')
        else setErr('Erro ao entrar. Tente novamente.')
        setLoading(false)
        return
      }
      toast.success('Bem-vindo de volta!')
      router.push(next)
    } catch {
      setErr('Erro de conexão')
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
      try { localStorage.setItem('kiyvo_demo_accepted', JSON.stringify({ acceptedAt: Date.now() })) } catch { /* noop */ }
      toast.success('Entrou como demo (com dados locais).')
      router.push(next)
    } catch {
      setErr('Erro de conexão')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#FAF7F2] dark:bg-[#070A13] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Elementos decorativos */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-earth-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-100/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:'linear-gradient(#3D291B 1px, transparent 1px), linear-gradient(90deg, #3D291B 1px, transparent 1px)', backgroundSize:'48px 48px'}}/>
      </div>

      <motion.div initial={{opacity:0, y:15}} animate={{opacity:1,y:0}} transition={{duration:.5}} className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Link href="/"><KiyvoLogoSvg size={44} /></Link>
        </div>

        <div className="bg-white dark:bg-[#0E1321] rounded-[2.5rem] p-8 sm:p-10 shadow-[0_30px_70px_-20px_rgba(61,41,27,0.08)] border border-earth-100 dark:border-white/5">
          <WordPullUp as="h1" words="Acesse sua Conta." className="font-display font-black text-2xl sm:text-3xl leading-[1.1] tracking-tight mb-2 text-earth-950 dark:text-white" />
          <p className="text-earth-500 dark:text-white/40 text-xs sm:text-sm mb-6">Entre para explorar produtos extraordinários.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-earth-400 dark:text-white/40 mb-2">Seu E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300 dark:text-white/30"/>
                <input
                  type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] dark:bg-[#070A13] border border-transparent dark:border-white/10 focus:border-earth-300 rounded-xl outline-none transition text-sm font-bold text-earth-950 dark:text-white"
                  placeholder="seuemail@exemplo.com" autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-earth-400 dark:text-white/40">Sua Senha</label>
                <Link href="/auth/forgot" className="text-[10px] font-black uppercase tracking-wider text-earth-500 hover:underline">Esqueci a senha</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300 dark:text-white/30"/>
                <input
                  type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-[#FAF7F2] dark:bg-[#070A13] border border-transparent dark:border-white/10 focus:border-earth-300 rounded-xl outline-none transition text-sm font-bold text-earth-950 dark:text-white"
                  placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-300 hover:text-earth-700 transition">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            {err && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold flex items-start gap-1.5">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <span>{err}</span>
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-[#070A13] dark:bg-white text-white dark:text-[#070A13] rounded-full py-3.5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Entrar com Segurança <ArrowRight size={14} /></>}
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleMagicLink}
              disabled={magicSending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-earth-200 dark:border-white/10 text-earth-800 dark:text-white font-black text-[11px] uppercase tracking-wider bg-transparent disabled:opacity-60 transition"
            >
              {magicSending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-earth-500" />}
              {magicSent ? 'Link enviado com sucesso! ✅' : 'Entrar sem senha'}
            </motion.button>
            {magicSent && (
              <p className="text-center text-[10px] text-emerald-600 font-bold -mt-2">
                Enviamos um link de login para <b>{email}</b>.
              </p>
            )}
          </form>

          {/* Social login */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <SocialButton label="Google" icon={<GoogleIcon />} onClick={handleGoogleLogin} />
            <SocialButton label="GitHub" icon={<GithubIcon />} onClick={handleGithubLogin} />
            <SocialButton label="Apple" icon={<AppleIcon />} onClick={handleAppleLogin} />
          </div>

          <div className="my-5 flex items-center gap-3 text-[10px] uppercase font-black tracking-widest text-earth-300">
            <div className="flex-1 h-px bg-earth-100 dark:bg-white/10"/>
            <span>Proteção Ativa</span>
            <div className="flex-1 h-px bg-earth-100 dark:bg-white/10"/>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] uppercase font-black tracking-wider text-earth-400">
            <span className="flex items-center gap-1"><Lock size={12}/> 2FA Ativo</span>
            <span className="flex items-center gap-1"><Shield size={12}/> LGPD</span>
          </div>

          <p className="mt-6 text-center text-xs text-earth-500 font-medium">
            Não tem uma conta? <Link href="/cadastro" className="font-black text-earth-900 dark:text-white hover:underline">Cadastrar-se grátis</Link>
          </p>

          {/* Modo Demo */}
          <div className="mt-6 rounded-2xl border-2 border-dashed border-earth-200 dark:border-white/10 bg-[#FAF7F2]/50 dark:bg-white/5 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-earth-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-earth-700 dark:text-[#F3ECE0]/50 leading-relaxed font-semibold">
                <p className="font-black uppercase tracking-wider text-[10px] mb-0.5 text-earth-900 dark:text-white">Modo Demonstração</p>
                <p>Navegue localmente sem precisar de confirmação de e-mail.</p>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={demoAccepted} onChange={(e) => setDemoAccepted(e.target.checked)} className="mt-1 w-4.5 h-4.5 accent-earth-600 rounded" />
              <span className="text-[11px] text-earth-600 dark:text-[#F3ECE0]/50 leading-snug font-bold">
                Aceito salvar meus dados apenas neste navegador.
              </span>
            </label>
            <button
              type="button"
              onClick={loginDemo}
              disabled={loading || !demoAccepted}
              className="w-full py-2.5 rounded-full border border-earth-300 dark:border-white/10 text-earth-800 dark:text-[#FAF7F2] text-xs font-black uppercase tracking-wider hover:bg-earth-100 transition disabled:opacity-50"
            >
              Entrar como Demonstração
            </button>
          </div>
        </div>

        <Link href="/" className="mt-6 block text-center text-xs text-earth-400 hover:text-earth-700 transition">← Voltar para a Home</Link>
      </motion.div>
    </div>
  )
}
