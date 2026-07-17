'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Fingerprint, AlertTriangle, CheckCircle, Server, Globe, Key, Smartphone } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, StaggerContainer, StaggerItem, GlowCard, NumberTicker, MorphingBlob, RevealText } from '@/components/ui/AdvancedAnimations'
import { AnimatedShield } from '@/components/svgs/AnimatedSVGs'

const securityFeatures = [
  { icon: Lock, title: 'Criptografia TLS/SSL', desc: 'Todas as comunicações são criptografadas com TLS 1.3. Seus dados nunca viajam em texto plano.', color: 'brand' },
  { icon: Shield, title: 'Stripe PCI DSS', desc: 'Pagamentos processados via Stripe, certificado PCI DSS Level 1 — o mais alto padrão de segurança para pagamentos.', color: 'purple' },
  { icon: Fingerprint, title: 'Device Fingerprinting', desc: 'Identificamos dispositivos suspeitos com fingerprinting avançado para prevenir fraudes e acessos não autorizados.', color: 'emerald' },
  { icon: Eye, title: 'Detecção de Fraude em Tempo Real', desc: 'Algoritmos de IA analisam cada transação em tempo real, bloqueando atividades suspeitas antes que causem danos.', color: 'amber' },
  { icon: AlertTriangle, title: 'Rate Limiting', desc: 'Proteção contra ataques de força bruta e DDoS. Limitamos requisições por IP para garantir a estabilidade.', color: 'brand' },
  { icon: Key, title: 'Autenticação 2FA', desc: 'Camada extra de segurança com verificação em duas etapas para proteger sua conta contra invasões.', color: 'purple' },
  { icon: Server, title: 'Headers de Segurança', desc: 'CSP, X-Frame-Options, HSTS e outros headers protegem contra XSS, clickjacking e MITM.', color: 'emerald' },
  { icon: Smartphone, title: 'Verificação de Identidade', desc: 'KYC completo com CPF, selfie facial e comprovante de residência para vendedores verificados.', color: 'amber' },
]

const stats = [
  { label: 'Fraudes bloqueadas', value: 12847, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%' },
  { label: 'Response time', value: 45, suffix: 'ms' },
]

export default function SegurancaPage() {
  return (
    <PageTransition>
      <MorphingBlob className="fixed" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16 relative">
        <FadeInOnScroll className="text-center mb-12">
          <AnimatedShield className="w-20 h-20 mx-auto mb-4" />
          <h1 className="font-display font-extrabold text-3xl lg:text-4xl text-surface-900 dark:text-white">
            <RevealText text="Segurança de Nível Bancário" />
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-3 max-w-lg mx-auto">
            Sua segurança é nossa prioridade. Protegemos seus dados e transações com tecnologia de ponta.
          </p>
        </FadeInOnScroll>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-12">
          {stats.map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.1} className="text-center">
              <p className="font-display font-extrabold text-3xl text-brand-600 dark:text-brand-400">
                <NumberTicker value={stat.value} />{stat.suffix}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">{stat.label}</p>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Security Features */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {securityFeatures.map((feat) => (
            <StaggerItem key={feat.title}>
              <GlowCard color={feat.color as 'brand' | 'purple' | 'emerald' | 'amber'} className="p-6 h-full">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center shrink-0">
                    <feat.icon size={22} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{feat.title}</h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </GlowCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Purchase Protection */}
        <FadeInOnScroll className="mb-16">
          <div className="p-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl text-white">
            <h2 className="font-display font-extrabold text-2xl mb-4">Proteção de Compra Kiyvo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {[
                { title: 'Dinheiro Seguro', desc: 'Seu pagamento fica retido pela Kiyvo e só é liberado após você confirmar o recebimento do produto.' },
                { title: 'Reembolso Garantido', desc: 'Se o produto não for entregue ou não corresponder à descrição, você recebe 100% do valor de volta.' },
                { title: 'Mediação Justa', desc: 'Em caso de disputa, nossa equipe analisa as evidências de ambos os lados e toma uma decisão justa.' },
              ].map((item) => (
                <div key={item.title} className="bg-white dark:bg-surface-900/10 backdrop-blur rounded-2xl p-5">
                  <CheckCircle size={24} className="text-brand-200 mb-2" />
                  <h3 className="font-display font-bold text-lg">{item.title}</h3>
                  <p className="text-brand-100 text-sm mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Anti-Hacker Section */}
        <FadeInOnScroll>
          <h2 className="font-display font-extrabold text-2xl text-surface-900 dark:text-white text-center mb-8">Proteção Anti-Hacker</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: 'Anti-DDoS', status: 'Ativo' },
              { icon: Lock, label: 'WAF', status: 'Ativo' },
              { icon: Eye, label: 'Intrusion Detection', status: 'Ativo' },
              { icon: Globe, label: 'CDN Protegido', status: 'Ativo' },
            ].map((item) => (
              <motion.div key={item.label} whileHover={{ scale: 1.03 }} className="card-base p-4 text-center">
                <item.icon size={24} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-surface-900 dark:text-white">{item.label}</p>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">✓ {item.status}</span>
              </motion.div>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
