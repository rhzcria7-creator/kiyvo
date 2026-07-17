// ─────────────────────────────────────────────────────────────
// KIYVO — Tutorial: Segurança e Anti-Fraude
// Guia completo de proteção para compradores e vendedores
// ─────────────────────────────────────────────────────────────

'use client'

import { motion } from 'framer-motion'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, ScaleInOnScroll } from '@/components/animations'
import { Shield, Lock, Eye, Fingerprint, AlertTriangle, CheckCircle, Ban, KeyRound, Smartphone, Server, FileCheck, Scan } from 'lucide-react'
import Link from 'next/link'

const securityLayers = [
  { icon: Lock, title: 'Criptografia AES-256-GCM', desc: 'Todos os arquivos digitais são criptografados com o mesmo padrão de bancos militares. Impossível acessar sem autorização.' },
  { icon: Shield, title: 'Escrow Protegido', desc: 'Dinheiro fica retido até o comprador confirmar recebimento. Zero risco de golpe para ambos os lados.' },
  { icon: Fingerprint, title: 'Device Fingerprint', desc: 'Cada dispositivo é identificado unicamente. Impede múltiplas contas e acessos suspeitos.' },
  { icon: Scan, title: 'Detecção de Fraude em Tempo Real', desc: 'IA analisa padrões de compra: velocidade, valor, localização, histórico. Transações suspeitas são bloqueadas.' },
  { icon: KeyRound, title: 'Autenticação 2FA', desc: 'Camada extra de segurança com TOTP. Mesmo que roubem sua senha, não acessam sua conta.' },
  { icon: Server, title: 'Infraestrutura PCI DSS Level 1', desc: 'Pagamentos processados pelo Stripe — certificação máxima de segurança do setor financeiro.' },
  { icon: FileCheck, title: 'KYC Verificação de Identidade', desc: 'Vendedores verificam CPF, documento e selfie. Reduz fraudes e aumenta confiança.' },
  { icon: Eye, title: 'Monitoramento 24/7', desc: 'Sistema monitora anomalias em tempo real: logins suspeitos, retiradas incomuns, padrões de abuso.' },
]

const scamTypes = [
  { type: 'Phishing', desc: 'E-mails falsos pedindo dados', defense: 'Kiyvo NUNCA pede dados por e-mail. Sempre acesse pelo site oficial.' },
  { type: 'Vendedor falso', desc: 'Anúncio de produto que não existe', defense: 'Escrow garante: se não receber, dinheiro de volta 100%.' },
  { type: 'Conta clonada', desc: 'Acesso não autorizado à conta', defense: '2FA + fingerprint impedem acesso de dispositivos desconhecidos.' },
  { type: 'Chargeback falso', desc: 'Comprador pede reembolso após receber', defense: 'Log de entrega criptografado prova que o produto foi acessado.' },
  { type: 'Cópia de produto', desc: 'Comprador redistribui o arquivo', defense: 'Marca d\'água digital + tokens com expiração rastreiam compartilhamento.' },
  { type: 'Retirada fraudulenta', desc: 'Alguém saca seu saldo', defense: 'KYC obrigatório + 2FA + cooldown de 24h para saques novos.' },
]

export default function TutorialSegurancaPage() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
          >
            <Shield size={36} className="text-white" />
          </motion.div>
          <h1 className="font-display font-extrabold text-4xl lg:text-5xl text-surface-900 dark:text-white mb-4">
            Segurança Nível Bancário
          </h1>
          <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
            8 camadas de proteção anti-fraude — seu dinheiro e seus dados protegidos como em um banco
          </p>
        </motion.div>

        {/* 8 Camadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {securityLayers.map((layer, i) => (
            <ScaleInOnScroll key={layer.title}>
              <div className="card-base p-5 hover:shadow-card-hover dark:hover:shadow-dark-glow transition-all h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center shrink-0">
                    <layer.icon size={20} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white">{layer.title}</h3>
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 leading-relaxed">{layer.desc}</p>
                  </div>
                </div>
              </div>
            </ScaleInOnScroll>
          ))}
        </div>

        {/* Tipos de golpe */}
        <FadeInOnScroll className="mb-16">
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white mb-6 flex items-center gap-3">
            <Ban size={24} className="text-red-500" />
            Tipos de Golpe e Como o Kiyvo Protege
          </h2>
          <div className="space-y-3">
            {scamTypes.map((scam, i) => (
              <motion.div
                key={scam.type}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-base p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <AlertTriangle size={18} className="text-red-500" />
                    <span className="font-display font-bold text-sm text-red-600 dark:text-red-400">{scam.type}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-surface-400">{scam.desc}</p>
                  </div>
                  <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl flex-1">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">{scam.defense}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </FadeInOnScroll>

        {/* Recomendações */}
        <FadeInOnScroll className="mb-12">
          <div className="card-base p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
            <h2 className="font-display font-extrabold text-2xl mb-4 flex items-center gap-3">
              <Smartphone size={24} />
              Recomendações para sua Segurança
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Ative 2FA imediatamente após criar sua conta',
                'Use senha forte e diferente de outros sites',
                'Nunca compartilhe códigos de verificação',
                'Sempre verifique o URL antes de fazer login',
                'Mantenha seu e-mail e telefone atualizados',
                'Revise atividade da conta regularmente',
                'Denuncie qualquer atividade suspeita',
                'Não clique em links de e-mails não verificados',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-brand-200 shrink-0 mt-0.5" />
                  <p className="text-sm text-brand-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        <FadeInOnScroll className="text-center">
          <Link href="/cadastro" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            <Shield size={20} /> Criar Conta Segura
          </Link>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
