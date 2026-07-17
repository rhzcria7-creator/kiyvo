'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Share2, Copy, Eye, MousePointerClick, DollarSign, TrendingUp, CheckCircle, Gift, Users } from 'lucide-react';

// /affiliate/dashboard — Links gerados, cliques rastreados, comissões ganhas

export default function AffiliateDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingCommissions, setPendingCommissions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadAffiliateData();
  }, [user, authLoading]);

  async function loadAffiliateData() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/affiliate');
      if (res.ok) {
        const data = await res.json();
        setReferralCode(data.affiliate?.referral_code || '');
        setTotalClicks(data.affiliate?.total_clicks || 0);
        setTotalConversions(data.affiliate?.total_conversions || 0);
        setTotalEarnings(Number(data.affiliate?.total_earnings) || 0);
        setPendingCommissions(data.pendingCommissions || 0);
      }
    } catch { /* silencioso */ } finally { setIsLoading(false); }
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${referralCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-cyan-600/20 via-cyan-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Share2 className="w-6 h-6 text-cyan-400" /> Painel de Afiliado
            </h1>
            <p className="text-slate-400 text-sm mt-1">Compartilhe links e ganhe comissões — o motor viral do Kiyvo</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Link de Referência */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-cyan-400" /> Seu Link de Afiliado
          </h2>
          <div className="flex gap-3">
            <div className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-cyan-400 font-mono text-sm truncate">
              {referralLink}
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={copyLink}
              className="px-5 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl text-white font-medium flex items-center gap-2 transition-colors">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </motion.button>
          </div>
          <p className="text-slate-500 text-xs mt-2">Cada compra feita através deste link gera 5% de comissão para você</p>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <MousePointerClick className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{totalClicks}</p>
            <p className="text-slate-400 text-xs">Cliques</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-white">{totalConversions}</p>
            <p className="text-slate-400 text-xs">Conversões</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <DollarSign className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalEarnings)}</p>
            <p className="text-slate-400 text-xs">Ganhos Totais</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-yellow-400">{formatCurrency(pendingCommissions)}</p>
            <p className="text-slate-400 text-xs">Pendente</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
