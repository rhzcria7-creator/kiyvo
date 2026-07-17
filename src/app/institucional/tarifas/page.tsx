'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingDown, Award, Star, Shield, Zap, ChevronRight, ArrowUpRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /institucional/tarifas — Taxas Transparentes
// Diferencial competitivo — menores taxas do mercado
// ═══════════════════════════════════════════════════════════════

const tiers = [
  { level: 'Bronze', emoji: '🥉', sales: '0-9', rate: 10, color: 'from-amber-800/30 to-amber-900/10 border-amber-700/20', textColor: 'text-amber-400', nextRate: 8, nextLevel: 'Prata' },
  { level: 'Prata', emoji: '🥈', sales: '10-49', rate: 8, color: 'from-slate-500/30 to-slate-600/10 border-slate-500/20', textColor: 'text-slate-300', nextRate: 6, nextLevel: 'Ouro' },
  { level: 'Ouro', emoji: '🥇', sales: '50-199', rate: 6, color: 'from-yellow-500/30 to-yellow-600/10 border-yellow-500/20', textColor: 'text-yellow-400', nextRate: 5, nextLevel: 'Diamante' },
  { level: 'Diamante', emoji: '💎', sales: '200-999', rate: 5, color: 'from-cyan-400/30 to-cyan-500/10 border-cyan-400/20', textColor: 'text-cyan-400', nextRate: 3, nextLevel: 'Platina' },
  { level: 'Platina', emoji: '👑', sales: '1000+', rate: 3, color: 'from-purple-400/30 to-purple-500/10 border-purple-400/20', textColor: 'text-purple-400', nextRate: 3, nextLevel: 'Máximo!' },
];

const competitors = [
  { name: 'Kiyvo', rate: '3-10%', escrow: true, autoDelivery: true, kyc: true, digitalVault: true },
  { name: 'Mercado Livre', rate: '11-16%', escrow: false, autoDelivery: false, kyc: false, digitalVault: false },
  { name: 'GGMax', rate: '12-15%', escrow: false, autoDelivery: true, kyc: false, digitalVault: false },
  { name: 'DFG', rate: '10-13%', escrow: false, autoDelivery: true, kyc: false, digitalVault: false },
];

export default function TarifasPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-blue-600/10 to-transparent" />
        <div className="max-w-5xl mx-auto px-4 py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              <TrendingDown className="w-4 h-4" /> As menores taxas do mercado
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Taxas Transparentes</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Quanto mais você vende, menor a taxa. Comece com 10% e chegue a apenas 3% — sem surpresas, sem taxas escondidas.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16 space-y-16">
        {/* Níveis */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Níveis de Vendedor</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {tiers.map((tier, i) => (
              <motion.div key={tier.level} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-b ${tier.color} border rounded-2xl p-6 text-center`}>
                <span className="text-4xl block mb-2">{tier.emoji}</span>
                <h3 className={`text-lg font-bold ${tier.textColor}`}>{tier.level}</h3>
                <p className="text-slate-400 text-xs mt-1">{tier.sales} vendas</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{tier.rate}%</span>
                  <p className="text-slate-500 text-xs mt-1">de comissão</p>
                </div>
                {tier.level !== 'Platina' && (
                  <p className="text-slate-500 text-xs mt-3">
                    Próximo: {tier.nextLevel} → <span className="text-emerald-400 font-medium">{tier.nextRate}%</span>
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Comparativo */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Kiyvo vs Concorrência</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="p-4 text-left text-slate-400 text-sm">Plataforma</th>
                  <th className="p-4 text-center text-slate-400 text-sm">Taxa</th>
                  <th className="p-4 text-center text-slate-400 text-sm">Escrow</th>
                  <th className="p-4 text-center text-slate-400 text-sm">Auto-entrega</th>
                  <th className="p-4 text-center text-slate-400 text-sm">KYC</th>
                  <th className="p-4 text-center text-slate-400 text-sm">Cofre Digital</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, i) => (
                  <tr key={comp.name} className={`border-b border-slate-800/50 ${comp.name === 'Kiyvo' ? 'bg-blue-600/10' : ''}`}>
                    <td className="p-4 text-white font-semibold text-sm">
                      {comp.name === 'Kiyvo' && <span className="text-blue-400">⭐ </span>}
                      {comp.name}
                    </td>
                    <td className={`p-4 text-center font-bold text-sm ${comp.name === 'Kiyvo' ? 'text-emerald-400' : 'text-white'}`}>{comp.rate}</td>
                    <td className="p-4 text-center">{comp.escrow ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="p-4 text-center">{comp.autoDelivery ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="p-4 text-center">{comp.kyc ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="p-4 text-center">{comp.digitalVault ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculadora rápida */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Simule seus ganhos</h2>
          <p className="text-slate-400 mb-6">Use nossa calculadora em tempo real</p>
          <Link href="/fees/calculator" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors">
            <Zap className="w-4 h-4" /> Abrir Calculadora
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
