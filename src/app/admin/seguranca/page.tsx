'use client'

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Users, Lock, Globe, Activity, CheckCircle, XCircle } from 'lucide-react'
import { PageTransition } from '@/components/shared/PageTransition'
import { FadeInOnScroll, NumberTicker, StaggerContainer, StaggerItem } from '@/components/ui/AdvancedAnimations'

const threatLog = [
  { id: '1', type: 'brute_force', ip: '192.168.1.***', country: '🇧🇷', action: 'Bloqueado', time: '2 min', severity: 'high' },
  { id: '2', type: 'sql_injection', ip: '10.0.0.***', country: '🇺🇸', action: 'Bloqueado', time: '15 min', severity: 'high' },
  { id: '3', type: 'xss_attempt', ip: '172.16.0.***', country: '🇨🇳', action: 'Bloqueado', time: '30 min', severity: 'medium' },
  { id: '4', type: 'rate_limit', ip: '192.168.2.***', country: '🇧🇷', action: 'Throttled', time: '1h', severity: 'low' },
  { id: '5', type: 'suspicious_login', ip: '10.1.1.***', country: '🇷🇺', action: '2FA Required', time: '2h', severity: 'medium' },
  { id: '6', type: 'fraud_attempt', ip: '172.16.1.***', country: '🇳🇬', action: 'Bloqueado', time: '3h', severity: 'high' },
]

const severityColors: Record<string, string> = { high: 'bg-red-50 text-red-700', medium: 'bg-amber-50 text-amber-700', low: 'bg-blue-50 text-blue-700' }

export default function AdminSegurancaPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-extrabold text-2xl text-surface-900 flex items-center gap-2"><Shield size={24} className="text-brand-600" /> Painel de Segurança</h1>
          <p className="text-surface-500 text-sm mt-1">Monitoramento de ameaças em tempo real</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Ameaças bloqueadas hoje', value: 147, icon: Shield, color: 'bg-red-50 text-red-600' },
            { label: 'IPs bloqueados', value: 34, icon: Globe, color: 'bg-amber-50 text-amber-600' },
            { label: 'Contas protegidas', value: 12547, icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Uptime de segurança', value: 99, suffix: '%', icon: Lock, color: 'bg-emerald-50 text-emerald-600' },
          ].map((stat, i) => (
            <FadeInOnScroll key={stat.label} delay={i * 0.05}>
              <div className="card-base p-5">
                <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-2`}><stat.icon size={16} /></div>
                <p className="font-display font-extrabold text-2xl text-surface-900"><NumberTicker value={stat.value} />{stat.suffix || ''}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            </FadeInOnScroll>
          ))}
        </div>

        {/* Security Status */}
        <FadeInOnScroll className="mt-8">
          <div className="card-base p-6">
            <h2 className="font-display font-bold text-lg text-surface-900 mb-4">Status dos Sistemas de Segurança</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Anti-DDoS', active: true },
                { name: 'WAF', active: true },
                { name: 'Rate Limiting', active: true },
                { name: 'Fraud Detection', active: true },
                { name: 'XSS Protection', active: true },
                { name: 'SQL Injection Shield', active: true },
                { name: 'CSRF Protection', active: true },
                { name: '2FA Enforcement', active: false },
              ].map((sys) => (
                <div key={sys.name} className={`p-3 rounded-xl flex items-center gap-2 ${sys.active ? 'bg-emerald-50' : 'bg-surface-50'}`}>
                  {sys.active ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-surface-400" />}
                  <span className={`text-sm font-medium ${sys.active ? 'text-emerald-700' : 'text-surface-500'}`}>{sys.name}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeInOnScroll>

        {/* Threat Log */}
        <FadeInOnScroll className="mt-8">
          <h2 className="font-display font-bold text-lg text-surface-900 mb-4 flex items-center gap-2"><Activity size={20} className="text-red-500" /> Log de Ameaças Recentes</h2>
          <div className="card-base overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">IP</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Origem</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Ação</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Severidade</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-surface-500 uppercase">Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {threatLog.map((threat, i) => (
                  <motion.tr key={threat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-surface-50/50">
                    <td className="px-5 py-3 text-sm font-medium text-surface-900 font-mono">{threat.type.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-sm text-surface-600 font-mono">{threat.ip}</td>
                    <td className="px-5 py-3 text-sm">{threat.country}</td>
                    <td className="px-5 py-3"><span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{threat.action}</span></td>
                    <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${severityColors[threat.severity]}`}>{threat.severity}</span></td>
                    <td className="px-5 py-3 text-sm text-surface-500 text-right">{threat.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeInOnScroll>
      </div>
    </PageTransition>
  )
}
