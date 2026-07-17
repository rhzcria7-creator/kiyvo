'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { DollarSign, Clock, Shield, Download, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

// /vendor/finance — Área de Saque/Levantamento (Saldo disponível vs Retido por Escrow)

export default function VendorFinancePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadBalance();
  }, [user, authLoading]);

  async function loadBalance() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders?role=vendor&finance=true');
      if (res.ok) {
        const data = await res.json();
        setAvailableBalance(data.availableBalance || 0);
        setPendingBalance(data.pendingBalance || 0);
      }
    } catch { /* silencioso */ } finally { setIsLoading(false); }
  }

  async function handleWithdraw() {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > availableBalance) return;
    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/v1/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        setAvailableBalance((prev) => prev - amount);
        setWithdrawAmount('');
      }
    } catch { /* erro */ } finally { setIsWithdrawing(false); }
  }

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-emerald-600/20 via-emerald-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Finanças
          </h1>
          <p className="text-slate-400 text-sm mt-1">Saque, saldo e retenção (Escrow)</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Saldos */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-400 text-sm">Saldo Disponível</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(availableBalance)}</p>
            <p className="text-slate-500 text-xs mt-1">Dinheiro liberado do Escrow — disponível para saque</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-400 text-sm">Saldo Retido (Escrow)</span>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{formatCurrency(pendingBalance)}</p>
            <p className="text-slate-500 text-xs mt-1">Aguardando confirmação do comprador (7 dias)</p>
          </motion.div>
        </div>

        {/* Proteção Escrow */}
        <div className="bg-emerald-900/10 border border-emerald-600/20 rounded-2xl p-5 flex items-start gap-4">
          <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-emerald-400 font-semibold text-sm">Como funciona o Escrow Kiyvo</h3>
            <p className="text-slate-400 text-xs mt-1">
              Quando um comprador paga, o dinheiro fica retido em custódia. Após a entrega e confirmação (ou 7 dias), o valor é liberado para saque, descontando a taxa da plataforma.
            </p>
          </div>
        </div>

        {/* Formulário de Saque */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-400" /> Solicitar Saque
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0,00"
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-lg font-mono focus:border-blue-500 outline-none placeholder:text-slate-500"
                max={availableBalance}
                min={0}
                step={0.01}
              />
            </div>
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) > availableBalance || parseFloat(withdrawAmount) <= 0}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all"
            >
              {isWithdrawing ? 'Processando...' : 'Sacar'}
            </button>
          </div>
          {availableBalance > 0 && (
            <button onClick={() => setWithdrawAmount(availableBalance.toString())} className="mt-2 text-blue-400 text-xs hover:text-blue-300">
              Usar saldo máximo: {formatCurrency(availableBalance)}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
