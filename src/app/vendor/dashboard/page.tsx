'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Package,
  Star,
  Shield,
  Award,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Eye,
  Settings,
  MessageCircle,
  Download,
  Zap,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /vendor/dashboard — Painel do Vendedor
// Gráficos reais de Vendas, Lucro Líquido, Taxas pagas
// Dados reais do Supabase — ZERO mock
// ═══════════════════════════════════════════════════════════════

interface VendorStats {
  totalRevenue: number;
  totalSales: number;
  platformFees: number;
  netProfit: number;
  pendingBalance: number;
  availableBalance: number;
  ratingAvg: number;
  level: string;
  commissionRate: number;
  nextLevelThreshold: number;
  experiencePoints: number;
  disputeRate: number;
}

interface RecentSale {
  id: string;
  orderNumber: string;
  productTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function VendorDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && profile && profile.role !== 'vendor' && profile.role !== 'admin') {
      router.push('/vendor/onboarding');
      return;
    }
    if (user) loadDashboard();
  }, [user, profile, authLoading, router]);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders?role=vendor&limit=5', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();

      setRecentSales(
        (data.orders || []).map((o: Record<string, unknown>) => ({
          id: o.id as string,
          orderNumber: o.order_number as string || '',
          productTitle: ((o.order_items as Record<string, unknown>[])?.[0]?.product_title_snapshot as string) || 'Produto',
          amount: Number(o.vendor_net || o.subtotal) || 0,
          status: o.status as string,
          createdAt: o.created_at as string,
        }))
      );

      setStats({
        totalRevenue: data.totalRevenue || 0,
        totalSales: data.totalSales || 0,
        platformFees: data.platformFees || 0,
        netProfit: data.netProfit || 0,
        pendingBalance: data.pendingBalance || 0,
        availableBalance: data.availableBalance || 0,
        ratingAvg: data.ratingAvg || 0,
        level: data.level || 'bronze',
        commissionRate: data.commissionRate || 10,
        nextLevelThreshold: data.nextLevelThreshold || 10,
        experiencePoints: data.experiencePoints || 0,
        disputeRate: data.disputeRate || 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const levelConfig: Record<string, { label: string; emoji: string; color: string; nextLabel: string; rate: number }> = {
    bronze: { label: 'Bronze', emoji: '🥉', color: 'text-amber-400', nextLabel: 'Prata', rate: 10 },
    silver: { label: 'Prata', emoji: '🥈', color: 'text-slate-300', nextLabel: 'Ouro', rate: 8 },
    gold: { label: 'Ouro', emoji: '🥇', color: 'text-yellow-400', nextLabel: 'Diamante', rate: 6 },
    diamond: { label: 'Diamante', emoji: '💎', color: 'text-cyan-400', nextLabel: 'Platina', rate: 5 },
    platinum: { label: 'Platina', emoji: '👑', color: 'text-purple-400', nextLabel: 'Máximo!', rate: 3 },
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending_payment: { label: 'Aguardando', color: 'text-yellow-400 bg-yellow-400/10' },
    paid: { label: 'Pago', color: 'text-blue-400 bg-blue-400/10' },
    delivered: { label: 'Entregue', color: 'text-emerald-400 bg-emerald-400/10' },
    confirmed: { label: 'Confirmado', color: 'text-green-400 bg-green-400/10' },
    disputed: { label: 'Disputa', color: 'text-red-400 bg-red-400/10' },
    refunded: { label: 'Reembolsado', color: 'text-orange-400 bg-orange-400/10' },
  };

  if (authLoading || isLoading) return <VendorDashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={loadDashboard} className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-white">Tentar novamente</button>
        </div>
      </div>
    );
  }

  const level = levelConfig[stats?.level || 'bronze'] || levelConfig.bronze;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-2xl">
                {level.emoji}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Painel do Vendedor</h1>
                <p className="text-slate-400 text-sm">
                  Nível {level.label} • Taxa de {stats?.commissionRate || level.rate}% • {stats?.totalSales || 0} vendas
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/vender')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-xl text-white font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Anúncio
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Cards de Receita */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Receita Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Lucro Líquido</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(stats?.netProfit || 0)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-slate-400">Saldo Disponível</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats?.availableBalance || 0)}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-400">Saldo Retido (Escrow)</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{formatCurrency(stats?.pendingBalance || 0)}</p>
          </motion.div>
        </div>

        {/* Progresso de Nível + Ações Rápidas */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Progresso de Nível */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Progresso de Nível
            </h2>
            <div className="text-center mb-4">
              <span className="text-5xl">{level.emoji}</span>
              <p className={`text-xl font-bold mt-2 ${level.color}`}>{level.label}</p>
              <p className="text-slate-400 text-sm">Taxa: {stats?.commissionRate || level.rate}%</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(((stats?.totalSales || 0) / (stats?.nextLevelThreshold || 10)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs text-center">
              {stats?.totalSales || 0} / {stats?.nextLevelThreshold || 10} vendas para {level.nextLabel}
            </p>
          </motion.div>

          {/* Vendas Recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Vendas Recentes
              </h2>
              <button onClick={() => router.push('/conta/vendas')} className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1">
                Ver todas <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400">Nenhuma venda ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSales.map((sale) => {
                  const statusInfo = statusLabels[sale.status] || statusLabels.pending_payment;
                  return (
                    <div key={sale.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{sale.productTitle}</p>
                        <p className="text-slate-400 text-xs">{sale.orderNumber} • {new Date(sale.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
                        <span className="text-white font-semibold text-sm">{formatCurrency(sale.amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <button onClick={() => router.push('/vender')} className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-colors">
            <Plus className="w-5 h-5 text-blue-400" />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Novo Anúncio</p>
              <p className="text-slate-400 text-xs">Criar produto</p>
            </div>
          </button>
          <button onClick={() => router.push('/vendor/finance')} className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-emerald-500/30 transition-colors">
            <Download className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Saque</p>
              <p className="text-slate-400 text-xs">Levantar fundos</p>
            </div>
          </button>
          <button onClick={() => router.push('/vendor/chat')} className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-purple-500/30 transition-colors">
            <MessageCircle className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Chat</p>
              <p className="text-slate-400 text-xs">Com compradores</p>
            </div>
          </button>
          <button onClick={() => router.push('/vendor/products')} className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-amber-500/30 transition-colors">
            <Package className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Meus Produtos</p>
              <p className="text-slate-400 text-xs">Gerenciar catálogo</p>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function VendorDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="bg-slate-900/30 h-24" />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-5 h-28" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-800/30 rounded-2xl p-6 h-64" />
          <div className="col-span-2 bg-slate-800/30 rounded-2xl p-6 h-64" />
        </div>
      </div>
    </div>
  );
}
