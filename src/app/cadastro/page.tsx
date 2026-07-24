'use client'

/**
 * /cadastro — página de cadastro.
 * Melhorias:
 *  - Validação client-side de e-mail (anti-temp-mail)
 *  - Feedback em tempo real do e-mail
 *  - Detecção e exibição de bônus de indicação (5% OFF via link de afiliado)
 *  - Força de senha com critérios explícitos
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Eye, EyeOff, Loader2, Mail, Lock, User, ArrowRight, CheckCircle2,
  AlertTriangle, Gift, ShieldCheck, X,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { KiyvoLogoSvg } from '@/components/brand'
import ShimmerButton from '@/components/ui/ShimmerButton'
import WordPullUp from '@/components/ui/WordPullUp'
import { checkEmailClientSide } from '@/lib/security/clientAntiFraud'
import { toast } from 'react-hot-toast'
import { isFirebaseConfigured, signInWithGoogle, signInWithGithub, signInWithApple } from '@/lib/firebase/client'

// Ícones sociais (iguais ao login)
function GoogleIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
}
function GithubIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>
}
function AppleIcon() {
  return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M18.7 17.1c-.3.7-.7 1.4-1.2 2-.7.9-1.3 1.5-1.7 1.7-.7.4-1.4.6-2.2.4-.8-.2-1.5-.1-2.4.3-.9.4-1.5.6-2 .5-.5-.1-1.1-.6-1.8-1.5-.7-1-1.3-2.2-1.7-3.6-.4-1.5-.7-2.9-.7-4.2 0-1.5.3-2.7 1-3.7.5-.8 1.2-1.4 2.1-1.7.9-.4 1.8-.3 2.8.2.5.2.9.3 1.1.3.2 0 .7-.2 1.5-.5.8-.3 1.5-.4 2.1-.2 1.1.2 1.9.7 2.4 1.6-1 .7-1.5 1.7-1.5 2.9 0 1 .3 1.8 1 2.4.3.3.7.5 1.1.7-.1.3-.2.6-.3.9zM15.5 3.1c0 .9-.3 1.8-.9 2.6-.7.9-1.6 1.4-2.6 1.4 0-.9.3-1.8.9-2.6.3-.4.7-.8 1.2-1.1.5-.3 1-.4 1.4-.3z"/></svg>
}
function SocialButton({ label, icon, onClick, loading }: { label: string; icon: React.ReactNode; onClick: () => void; loading?: boolean }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 bg-white dark:bg-white/5 transition disabled:opacity-60"
      title={`Cadastrar com ${label}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      <span className="text-xs font-black text-slate-700 dark:text-slate-200 hidden sm:inline">{label}</span>
    </motion.button>
  )
}

function pwdScore(p: string): { score: number; label: string; color: string; checks: { ok: boolean; label: string }[] } {
  const checks = [
    { ok: p.length >= 8, label: 'Mínimo 8 caracteres' },
    { ok: /[A-Z]/.test(p), label: 'Uma letra maiúscula' },
    { ok: /[a-z]/.test(p), label: 'Uma letra minúscula' },
    { ok: /[0-9]/.test(p), label: 'Um número' },
    { ok: /[^A-Za-z0-9]/.test(p), label: 'Um símbolo' },
  ]
  const s = checks.filter((c) => c.ok).length
  const label = s <= 2 ? 'Fraca' : s <= 3 ? 'Média' : s <= 4 ? 'Boa' : 'Forte'
  const color = s <= 2 ? 'bg-red-500' : s <= 3 ? 'bg-amber-500' : s <= 4 ? 'bg-sky-500' : 'bg-emerald-500'
  return { score: s, label, color, checks }
}

export default function CadastroPage() {
  const router = useRouter()
  const search = useSearchParams()
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  const pwd = pwdScore(password)
  const emailCheck = emailTouched && email.length > 3 ? checkEmailClientSide(email) : null
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
        toast.success('Cadastro por rede social efetuado! 🎉', { icon: '🎉' })
        router.push('/?welcome=1')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Erro ao autenticar')
      }
    } catch {
      toast.error('Erro de conexão')
    } finally { setSocialLoading(null) }
  }
  async function handleGoogle() { setSocialLoading('google'); if (!isFirebaseConfigured()) { setSocialLoading(null); toast.error('Firebase não configurado'); return; } const r = await signInWithGoogle(); if (r.error||!r.user||!r.token){ setSocialLoading(null); toast.error(r.error||'Erro'); return; } await finalizeFirebaseLogin(r.token, r.user.email||'') }
  async function handleGithub() { setSocialLoading('github'); if (!isFirebaseConfigured()) { setSocialLoading(null); toast.error('Firebase não configurado'); return; } const r = await signInWithGithub(); if (r.error||!r.user||!r.token){ setSocialLoading(null); toast.error(r.error||'Erro'); return; } await finalizeFirebaseLogin(r.token, r.user.email||'') }
  async function handleApple()  { setSocialLoading('apple');  if (!isFirebaseConfigured()) { setSocialLoading(null); toast.error('Login Apple requer configuração'); return; } const r = await signInWithApple();  if (r.error||!r.user||!r.token){ setSocialLoading(null); toast.error(r.error||'Erro'); return; } await finalizeFirebaseLogin(r.token, r.user.email||'') }

  // Detecta código de afiliado na URL ou localStorage
  useEffect(() => {
    const urlRef = search.get('ref')
    if (urlRef && urlRef.length <= 32) {
      const code = urlRef.toUpperCase()
      setReferralCode(code)
      localStorage.setItem('kiyvo_ref_code', code)
      localStorage.setItem('kiyvo_ref_at', String(Date.now()))
      return
    }
    const stored = localStorage.getItem('kiyvo_ref_code')
    if (stored && stored.length <= 32) setReferralCode(stored)
  }, [search])

  const dismissReferral = () => setReferralCode(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)

    if (!name.trim() || name.trim().length < 2) { setErr('Digite seu nome completo'); return }
    const ec = checkEmailClientSide(email)
    if (!ec.allowed) { setErr(ec.reason || 'E-mail inválido'); return }
    if (pwd.score < 3) { setErr('Use uma senha mais forte (mínimo 8 caracteres, com letras e números)'); return }
    if (!agree) { setErr('Aceite os termos para continuar'); return }

    setLoading(true)
    try {
      const { error } = await signUp(email, password, {
        full_name: name,
        referral_code: referralCode,
      })
      if (error) {
        const msg = String(error)
        if (/already|exist/i.test(msg)) setErr('Já existe uma conta com este e-mail')
        else if (/tempor|disposable|fake/i.test(msg)) setErr('E-mails temporários não são permitidos. Use Gmail, Outlook, iCloud, Yahoo ou seu e-mail real.')
        else setErr(typeof error === 'string' ? error : 'Erro ao criar conta. Tente novamente.')
        setLoading(false)
        return
      }
      // Marca que o referral foi usado
      if (referralCode) localStorage.setItem('kiyvo_ref_used', '1')
      toast.success('Conta criada! Verifique seu e-mail para confirmar.')
      router.push('/login?from=cadastro')
    } catch {
      setErr('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#FAFAFA] dark:bg-[#0B0F1A] flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-100/60 blur-3xl"/>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-100/40 blur-3xl"/>
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize:'48px 48px'}}/>
      </div>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/"><KiyvoLogoSvg size={48}/></Link>
        </div>

        {/* Banner de indicação */}
        {referralCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white p-4 relative overflow-hidden"
          >
            <button onClick={dismissReferral} className="absolute top-2 right-2 text-white/70 hover:text-white" aria-label="Fechar">
              <X size={14} />
            </button>
            <div className="flex items-center gap-2">
              <Gift size={18} className="text-amber-200 shrink-0" />
              <div>
                <p className="font-black text-sm">Você ganhou 5% OFF na primeira compra!</p>
                <p className="text-xs text-white/80">Cupom de indicação <span className="font-mono font-bold bg-white/20 px-1 rounded">{referralCode}</span> aplicado automaticamente.</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-white dark:bg-white/5 rounded-[2rem] p-8 lg:p-10 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.15)] border border-black/5 dark:border-white/10">
          <WordPullUp as="h1" words="Crie sua conta." className="font-display font-black text-3xl lg:text-4xl leading-[1] tracking-tight mb-2"/>
          <p className="text-[#64748B] dark:text-white/50 text-sm mb-6">Grátis, sem mensalidade. Leva 30 segundos.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-2">Nome completo</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40"/>
                <input
                  type="text" value={name} onChange={e=>setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10 focus:border-brand-600 focus:bg-white dark:bg-white/5 outline-none transition text-sm font-medium"
                  placeholder="Seu nome completo" autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-2">E-mail</label>
              <div className="relative">
                <Mail size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 transition ${emailCheck ? (emailCheck.allowed ? 'text-emerald-500' : 'text-red-500') : 'text-[#94A3B8] dark:text-white/40'}`}/>
                <input
                  type="email" value={email}
                  onChange={e=>{setEmail(e.target.value); setEmailTouched(true)}}
                  onBlur={()=>setEmailTouched(true)}
                  className={`w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border transition text-sm font-medium outline-none
                    ${emailCheck && !emailCheck.allowed
                      ? 'border-red-300 dark:border-red-500/40 focus:border-red-500 bg-red-50/30'
                      : emailCheck && emailCheck.allowed
                        ? 'border-emerald-300 dark:border-emerald-500/40 focus:border-emerald-500 bg-emerald-50/20'
                        : 'border-black/5 dark:border-white/10 focus:border-brand-600 focus:bg-white dark:focus:bg-white/5'
                    }`}
                  placeholder="voce@gmail.com" autoComplete="email"
                />
                {emailCheck && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {emailCheck.allowed
                      ? <CheckCircle2 size={16} className="text-emerald-500"/>
                      : <AlertTriangle size={16} className="text-red-500"/>}
                  </div>
                )}
              </div>
              {emailCheck && !emailCheck.allowed && (
                <motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12}/> {emailCheck.reason}
                </motion.p>
              )}
              {emailCheck && emailCheck.allowed && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={12}/> E-mail válido
                </p>
              )}
              <p className="mt-1 text-[10px] text-[#94A3B8] dark:text-white/40 flex items-center gap-1">
                <AlertTriangle size={10}/> Apenas e-mails reais (Gmail, Outlook, iCloud, Yahoo, Proton, etc.). E-mails temporários são bloqueados.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-[#64748B] dark:text-white/50 mb-2">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40"/>
                <input
                  type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10 focus:border-brand-600 focus:bg-white dark:bg-white/5 outline-none transition text-sm font-medium"
                  placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                />
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40 hover:text-[#0F172A] dark:text-white">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                      {Array.from({length:5}).map((_,i)=>(
                        <div key={i} className={`flex-1 rounded-full transition ${i<pwd.score?pwd.color:'bg-black/5 dark:bg-white/5'}`}/>
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${pwd.score<=2?'text-red-500':pwd.score<=3?'text-amber-500':pwd.score<=4?'text-sky-500':'text-emerald-500'}`}>{pwd.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {pwd.checks.map((c) => (
                      <div key={c.label} className={`text-[10px] flex items-center gap-1 ${c.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#94A3B8] dark:text-white/40'}`}>
                        {c.ok ? <CheckCircle2 size={10}/> : <X size={10}/>} {c.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
              <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="mt-0.5 w-4 h-4 accent-brand-600 rounded"/>
              <span className="text-xs text-[#64748B] dark:text-white/50">
                Li e concordo com os <Link href="/termos" className="underline text-[#0F172A] dark:text-white font-semibold">Termos</Link> e a <Link href="/privacidade" className="underline text-[#0F172A] dark:text-white font-semibold">Política de Privacidade</Link>.
                Confirmo que sou maior de 18 anos.
              </span>
            </label>

            {err && (
              <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0"/>
                <span>{err}</span>
              </motion.div>
            )}

            <ShimmerButton type="submit" size="lg" className="w-full justify-center" disabled={loading} icon={loading ? <Loader2 size={18} className="animate-spin"/> : <ArrowRight size={18}/>}>
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </ShimmerButton>
          </form>

          {/* Social cadastro */}
          <div className="mt-5">
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase text-[#94A3B8] dark:text-white/40 mb-3">
              <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/>
              Cadastro rápido com
              <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SocialButton label="Google" icon={<GoogleIcon />} onClick={handleGoogle} loading={socialLoading==='google'} />
              <SocialButton label="GitHub" icon={<GithubIcon />} onClick={handleGithub} loading={socialLoading==='github'} />
              <SocialButton label="Apple"  icon={<AppleIcon />}  onClick={handleApple}  loading={socialLoading==='apple'} />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 text-[11px] font-bold text-[#94A3B8] dark:text-white/40">
            <ShieldCheck size={12}/> Proteção ao comprador em todas as compras • Seus dados são criptografados
          </div>

          <div className="my-6 flex items-center gap-3 text-[11px] uppercase font-bold text-[#94A3B8] dark:text-white/40">
            <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/> benefícios <div className="flex-1 h-px bg-black/5 dark:bg-white/10"/>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-[#64748B] dark:text-white/50">
            <div className="flex items-center gap-1.5 p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10">
              <CheckCircle2 size={14} className="text-emerald-500"/> Sem mensalidade
            </div>
            <div className="flex items-center gap-1.5 p-3 rounded-xl bg-[#FAFAFA] dark:bg-[#0B0F1A] border border-black/5 dark:border-white/10">
              <CheckCircle2 size={14} className="text-emerald-500"/> 15% em KD Points
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[#64748B] dark:text-white/50">
            Já tem conta? <Link href="/login" className="font-black text-[#0F172A] dark:text-white hover:text-brand-600 transition">Entrar</Link>
          </p>
        </div>

        <Link href="/" className="mt-6 block text-center text-xs text-[#94A3B8] dark:text-white/40 hover:text-[#0F172A] dark:text-white transition">← Voltar para a home</Link>
      </motion.div>
    </div>
  )
}
