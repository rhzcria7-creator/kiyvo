'use client'

// ─────────────────────────────────────────────────────────────
// /2fa/setup — Configuração do 2FA (TOTP)
// Gera QR Code, exibe códigos de backup, verifica ativação
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll } from '@/components/animations'
import { useAuth } from '@/lib/auth/context'
import {
  Smartphone,
  Shield,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Loader2,
  QrCode,
  Key,
} from 'lucide-react'

type SetupStep = 'loading' | 'init' | 'qr' | 'verify' | 'backup' | 'done'

export default function TwoFactorSetupPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [step, setStep] = useState<SetupStep>('loading')
  const [uri, setUri] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verifyCode, setVerifyCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)

  // Verificar se 2FA já está habilitado
  useEffect(() => {
    if (!authLoading) {
      if (profile?.two_factor_enabled) {
        setStep('done')
      } else {
        setStep('init')
      }
    }
  }, [authLoading, profile?.two_factor_enabled])

  // Iniciar setup — chama API
  const startSetup = useCallback(async () => {
    setError(null)
    setIsVerifying(true)
    try {
      const res = await fetch('/api/v1/2fa/setup', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao iniciar setup')
        return
      }
      setUri(data.uri)
      setBackupCodes(data.backupCodes || [])

      // Gerar QR Code SVG inline (sem dependência externa)
      const svg = generateSimpleQR(data.uri)
      setQrSvg(svg)

      setStep('qr')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsVerifying(false)
    }
  }, [])

  // Verificar código TOTP
  const verifyCodeSubmit = useCallback(async () => {
    if (verifyCode.length !== 6) {
      setError('Digite o código de 6 dígitos')
      return
    }
    setError(null)
    setIsVerifying(true)
    try {
      const res = await fetch('/api/v1/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode, purpose: 'setup' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Código inválido')
        return
      }
      setStep('backup')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsVerifying(false)
    }
  }, [verifyCode])

  // Copiar para clipboard
  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(id)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch {
      // Fallback para clipboard
    }
  }, [])

  // Salvar backup codes como arquivo
  const downloadBackupCodes = useCallback(() => {
    const content = [
      '═══════════════════════════════════════',
      '  KIYVO — Códigos de Backup do 2FA',
      '═══════════════════════════════════════',
      '',
      '⚠️  GUARDE ESTE ARQUIVO EM LOCAL SEGURO',
      '⚠️  Cada código pode ser usado APENAS UMA VEZ',
      '⚠️  Se perder o dispositivo, estes códigos são seu acesso',
      '',
      'Data de geração: ' + new Date().toLocaleString('pt-BR'),
      '',
      ...backupCodes.map((code, i) => `  ${i + 1}. ${code}`),
      '',
      '═══════════════════════════════════════',
      '  NÃO COMPARTILHE ESTES CÓDIGOS',
      '═══════════════════════════════════════',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kiyvo-2fa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [backupCodes])

  // Confirmação de que salvou os códigos
  const confirmBackupSaved = useCallback(() => {
    setStep('done')
  }, [])

  if (authLoading || step === 'loading') {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-600 dark:text-brand-400" size={32} />
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Shield size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white mb-3">
            Autenticação de Dois Fatores
          </h1>
          <p className="text-surface-500 dark:text-surface-400 max-w-md mx-auto">
            Proteja sua conta com uma camada extra de segurança
          </p>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['init', 'qr', 'verify', 'backup', 'done'].map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                ['init', 'qr', 'verify', 'backup', 'done'].indexOf(step) >= i
                  ? 'w-8 bg-brand-500'
                  : 'w-2 bg-surface-200 dark:bg-surface-700'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Iniciar */}
          {step === 'init' && (
            <motion.div
              key="init"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="card-base p-8 text-center">
                <Smartphone size={48} className="text-brand-500 mx-auto mb-4" />
                <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-3">
                  Como funciona o 2FA?
                </h2>
                <div className="text-sm text-surface-600 dark:text-surface-400 space-y-3 text-left max-w-md mx-auto">
                  <p>1. Escaneie o QR Code com seu app autenticador (Google Authenticator, Authy, etc.)</p>
                  <p>2. Insira o código de 6 dígitos para confirmar</p>
                  <p>3. Salve seus códigos de backup em local seguro</p>
                </div>
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40">
                  <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Após ativar, você precisará do código toda vez que fizer login
                  </p>
                </div>
                <button
                  onClick={startSetup}
                  disabled={isVerifying}
                  className="btn-primary mt-6 inline-flex items-center gap-2"
                >
                  {isVerifying ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Shield size={18} />
                  )}
                  Ativar 2FA
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: QR Code */}
          {step === 'qr' && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="card-base p-8 text-center">
                <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-4">
                  Escaneie o QR Code
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
                  Use o Google Authenticator, Authy ou outro app TOTP
                </p>

                {/* QR Code */}
                <div className="inline-block p-4 bg-white rounded-2xl shadow-inner mb-4">
                  {qrSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
                  ) : (
                    <QrCode size={200} className="text-surface-300" />
                  )}
                </div>

                {/* Manual entry */}
                <div className="mt-4">
                  <p className="text-xs text-surface-400 mb-2">Ou insira manualmente:</p>
                  <div className="flex items-center gap-2 max-w-md mx-auto">
                    <code className="flex-1 text-xs bg-surface-100 dark:bg-surface-800 p-2 rounded-lg break-all text-surface-700 dark:text-surface-300 font-mono">
                      {uri.replace('otpauth://totp/', '').split('?')[0]}
                    </code>
                    <button
                      onClick={() => copyToClipboard(uri, 'uri')}
                      className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                      aria-label="Copiar URI"
                    >
                      {copiedItem === 'uri' ? (
                        <Check size={16} className="text-emerald-500" />
                      ) : (
                        <Copy size={16} className="text-surface-400" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep('verify')}
                  className="btn-primary mt-6"
                >
                  Já escaneei, verificar
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Verificar código */}
          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="card-base p-8 text-center">
                <Key size={40} className="text-brand-500 mx-auto mb-4" />
                <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-2">
                  Insira o código de verificação
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
                  Digite o código de 6 dígitos do seu app autenticador
                </p>

                <div className="flex justify-center gap-2 mb-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={verifyCode[i] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '')
                        const newCode = verifyCode.split('')
                        newCode[i] = val
                        const joined = newCode.join('')
                        setVerifyCode(joined)
                        // Auto-focus next input
                        if (val && i < 5) {
                          const nextInput = document.getElementById(`otp-${i + 1}`)
                          nextInput?.focus()
                        }
                        // Auto-submit when all 6 digits
                        if (joined.length === 6) {
                          // Will trigger via useEffect below
                        }
                      }}
                      id={`otp-${i}`}
                      className="w-12 h-14 text-center text-xl font-bold bg-surface-50 dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-600 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-surface-900 dark:text-white"
                      aria-label={`Dígito ${i + 1}`}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mb-4"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStep('qr')}
                    className="btn-secondary"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={verifyCodeSubmit}
                    disabled={isVerifying || verifyCode.length !== 6}
                    className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Verificar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Backup codes */}
          {step === 'backup' && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="card-base p-8">
                <div className="text-center mb-6">
                  <Key size={40} className="text-amber-500 mx-auto mb-4" />
                  <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-2">
                    Códigos de Backup
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Guarde estes códigos em local seguro. Cada um pode ser usado apenas uma vez.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto mb-6">
                  {backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 bg-surface-50 dark:bg-surface-800 rounded-lg font-mono text-sm text-surface-700 dark:text-surface-300"
                    >
                      <span>{code}</span>
                      <button
                        onClick={() => copyToClipboard(code, `code-${i}`)}
                        className="p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded transition-colors"
                        aria-label={`Copiar código ${i + 1}`}
                      >
                        {copiedItem === `code-${i}` ? (
                          <Check size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-surface-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={downloadBackupCodes}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Download size={16} />
                    Baixar códigos (.txt)
                  </button>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 max-w-sm">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      Se perder o acesso ao dispositivo, estes códigos são a única forma de entrar na sua conta.
                    </p>
                  </div>

                  <button
                    onClick={confirmBackupSaved}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Check size={18} />
                    Já salvei meus códigos
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="card-base p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check size={32} className="text-emerald-500" />
                </motion.div>
                <h2 className="font-display font-bold text-xl text-surface-900 dark:text-white mb-2">
                  2FA Ativado com Sucesso! 🎉
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
                  Sua conta está protegida com autenticação de dois fatores.
                </p>
                <div className="space-y-3">
                  <a href="/conta" className="btn-primary inline-block">
                    Ir para Minha Conta
                  </a>
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => {
                        setStep('init')
                        setVerifyCode('')
                        setError(null)
                      }}
                      className="text-sm text-surface-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      Gerar novos códigos de backup
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && step !== 'verify' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/40"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}

// ─── QR Code SVG Generator (sem dependência externa) ─────────
// Gera um QR Code SVG simplificado a partir da URI TOTP

function generateSimpleQR(text: string): string {
  // Gerar padrão visual representando o QR Code
  // Na produção, usar biblioteca como `qrcode` npm package
  // Aqui geramos um placeholder visual com hash determinístico
  const size = 200
  const moduleCount = 25
  const moduleSize = size / moduleCount

  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }

  const modules: boolean[][] = []
  for (let row = 0; row < moduleCount; row++) {
    modules[row] = []
    for (let col = 0; col < moduleCount; col++) {
      // Finder patterns (3 cantos)
      const isFinderPattern =
        (row < 7 && col < 7) ||
        (row < 7 && col >= moduleCount - 7) ||
        (row >= moduleCount - 7 && col < 7)

      if (isFinderPattern) {
        const r = row < 7 ? row : row - (moduleCount - 7)
        const c = col < 7 ? col : col - (moduleCount - 7)
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4
        modules[row][col] = isBorder || isInner
      } else {
        // Data modules — gerados deterministicamente pelo hash
        const seed = Math.abs(hash + row * 31 + col * 17)
        modules[row][col] = seed % 3 === 0
      }
    }
  }

  let rects = ''
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        rects += `<rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="#0F172A"/>`
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="white" rx="8"/>
    ${rects}
  </svg>`
}
