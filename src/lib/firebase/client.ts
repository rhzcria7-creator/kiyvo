'use client'
// Firebase Auth client — login social (Google/GitHub/Email).
// Credenciais reais do projeto "kiyvo-66d75" — funciona mesmo sem .env.local.
// Comentários em PT-BR.
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, type Auth, type User as FirebaseUser, OAuthProvider } from 'firebase/auth'

// Credenciais REAIS do Firebase do projeto kiyvo-66d75 (fallback padrão).
// Em produção usa estas; para override local, use NEXT_PUBLIC_FIREBASE_* no .env.local.
const FIREBASE_CONFIG_FALLBACK = {
  apiKey: 'AIzaSyAjE9-hudrvbc8ORijo2EiT1wLMa2Zs3lM',
  authDomain: 'kiyvo-66d75.firebaseapp.com',
  projectId: 'kiyvo-66d75',
  storageBucket: 'kiyvo-66d75.firebasestorage.app',
  messagingSenderId: '295832431053',
  appId: '1:295832431053:web:9533b01713ff962839fc84',
  measurementId: 'G-HQHTBFQ5Y5',
}

const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FIREBASE_CONFIG_FALLBACK.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FIREBASE_CONFIG_FALLBACK.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FIREBASE_CONFIG_FALLBACK.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FIREBASE_CONFIG_FALLBACK.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_CONFIG_FALLBACK.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FIREBASE_CONFIG_FALLBACK.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || FIREBASE_CONFIG_FALLBACK.measurementId,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null

export function isFirebaseConfigured(): boolean {
  return !!(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.authDomain && FIREBASE_CONFIG.projectId)
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null
  if (!isFirebaseConfigured()) return null
  if (auth) return auth
  if (getApps().length === 0) {
    try { app = initializeApp(FIREBASE_CONFIG) } catch { return null }
  } else {
    app = getApps()[0]
  }
  try { auth = getAuth(app || undefined) } catch { auth = null }
  return auth
}

export async function signInWithGoogle(): Promise<{ user: FirebaseUser | null; token?: string; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { user: null, error: 'Firebase não configurado' }
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const res = await signInWithPopup(a, provider)
    const token = await res.user.getIdToken()
    return { user: res.user, token }
  } catch (e: any) {
    if (e?.code === 'auth/popup-closed-by-user') return { user: null, error: 'Login cancelado' }
    if (e?.code === 'auth/popup-blocked') return { user: null, error: 'Pop-up bloqueado. Permita pop-ups para fazer login.' }
    return { user: null, error: e?.message || 'Erro no login Google' }
  }
}

export async function signInWithGithub(): Promise<{ user: FirebaseUser | null; token?: string; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { user: null, error: 'Firebase não configurado' }
  try {
    const provider = new GithubAuthProvider()
    provider.addScope('read:user')
    provider.addScope('user:email')
    const res = await signInWithPopup(a, provider)
    const token = await res.user.getIdToken()
    return { user: res.user, token }
  } catch (e: any) {
    if (e?.code === 'auth/popup-closed-by-user') return { user: null, error: 'Login cancelado' }
    if (e?.code === 'auth/account-exists-with-different-credential') return { user: null, error: 'Esta conta já está vinculada a outro método de login' }
    return { user: null, error: e?.message || 'Erro no login GitHub' }
  }
}

export async function signInWithApple(): Promise<{ user: FirebaseUser | null; token?: string; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { user: null, error: 'Firebase não configurado' }
  try {
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')
    const { signInWithPopup: popup } = await import('firebase/auth')
    const res = await popup(a, provider)
    const token = await res.user.getIdToken()
    return { user: res.user, token }
  } catch (e: any) {
    if (e?.code === 'auth/popup-closed-by-user') return { user: null, error: 'Login cancelado' }
    return { user: null, error: e?.message || 'Erro no login Apple' }
  }
}

export async function signInWithFirebaseEmail(email: string, password: string): Promise<{ user: FirebaseUser | null; token?: string; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { user: null, error: 'Firebase não configurado' }
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    const res = await signInWithEmailAndPassword(a, email, password)
    const token = await res.user.getIdToken()
    return { user: res.user, token }
  } catch (e: any) {
    let msg = 'Erro no login'
    if (e?.code === 'auth/user-not-found') msg = 'E-mail não cadastrado'
    if (e?.code === 'auth/wrong-password') msg = 'Senha incorreta'
    if (e?.code === 'auth/invalid-email') msg = 'E-mail inválido'
    if (e?.code === 'auth/invalid-credential') msg = 'E-mail ou senha incorretos'
    if (e?.code === 'auth/too-many-requests') msg = 'Muitas tentativas. Aguarde alguns minutos.'
    return { user: null, error: msg }
  }
}

export async function signUpWithFirebaseEmail(email: string, password: string, name?: string): Promise<{ user: FirebaseUser | null; token?: string; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { user: null, error: 'Firebase não configurado' }
  try {
    const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import('firebase/auth')
    const res = await createUserWithEmailAndPassword(a, email, password)
    if (name) await updateProfile(res.user, { displayName: name })
    try { await sendEmailVerification(res.user) } catch {}
    const token = await res.user.getIdToken()
    return { user: res.user, token }
  } catch (e: any) {
    let msg = 'Erro no cadastro'
    if (e?.code === 'auth/email-already-in-use') msg = 'Este e-mail já está cadastrado'
    if (e?.code === 'auth/weak-password') msg = 'Senha muito fraca (mínimo 6 caracteres)'
    if (e?.code === 'auth/invalid-email') msg = 'E-mail inválido'
    if (e?.code === 'auth/operation-not-allowed') msg = 'Cadastro por e-mail desabilitado no momento'
    return { user: null, error: msg }
  }
}

export async function sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { ok: false, error: 'Firebase não configurado' }
  try {
    const { sendPasswordResetEmail } = await import('firebase/auth')
    await sendPasswordResetEmail(a, email)
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Erro ao enviar e-mail de recuperação' }
  }
}

/**
 * sendMagicLink — envia um link de login mágico por e-mail (sem senha).
 * Usa sendSignInLinkToEmail do Firebase. O usuário clica no link e volta logado.
 * url: URL de redirecionamento após o clique (deve estar na lista de domínios autorizados do Firebase)
 */
export async function sendMagicLink(
  email: string,
  redirectUrl?: string,
): Promise<{ ok: boolean; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { ok: false, error: 'Firebase não configurado' }
  try {
    const { sendSignInLinkToEmail } = await import('firebase/auth')
    const url = redirectUrl || (typeof window !== 'undefined'
      ? `${window.location.origin}/auth/magic-link`
      : 'https://kiyvo.com.br/auth/magic-link')
    const actionCodeSettings = {
      url,
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(a, email, actionCodeSettings)
    // Salva email para completar login depois
    try { window.localStorage.setItem('kiyvo_magic_email', email) } catch {}
    return { ok: true }
  } catch (e: any) {
    let msg = 'Erro ao enviar link mágico'
    if (e?.code === 'auth/invalid-email') msg = 'E-mail inválido'
    if (e?.code === 'auth/user-not-found') msg = 'E-mail não cadastrado'
    return { ok: false, error: msg }
  }
}

/**
 * completeMagicLink — verifica se a URL atual é um link de login mágico e completa o login.
 * Retorna o usuário se for link válido.
 */
export async function completeMagicLink(url: string): Promise<{ user: FirebaseUser | null; email?: string; token?: string; error?: string }> {
  const a = getFirebaseAuth()
  if (!a) return { user: null, error: 'Firebase não configurado' }
  try {
    const { isSignInWithEmailLink, signInWithEmailLink } = await import('firebase/auth')
    if (!isSignInWithEmailLink(a, url)) return { user: null }
    let email = ''
    try { email = window.localStorage.getItem('kiyvo_magic_email') || '' } catch {}
    if (!email) {
      email = window.prompt('Confirme seu e-mail para completar o login:') || ''
    }
    if (!email) return { user: null, error: 'E-mail não confirmado' }
    const res = await signInWithEmailLink(a, email, url)
    const token = await res.user.getIdToken()
    try { window.localStorage.removeItem('kiyvo_magic_email') } catch {}
    return { user: res.user, email, token }
  } catch (e: any) {
    return { user: null, error: e?.message || 'Link inválido ou expirado' }
  }
}

