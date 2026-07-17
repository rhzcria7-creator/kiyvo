'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Package,
  Library,
  CreditCard,
  AlertTriangle,
  Settings,
  Star,
  TrendingUp,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react';

// ───────────────────────────────────────────────────────────────
// /buyer/dashboard — Painel do Comprador
// Dados reais do Supabase, ZERO mock
// ───────────────────────────────────────────────────────────────

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  disputeCount: number;
  libraryCount: number;
  favoriteCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  createdAt: string;
  productTitle: string;
}

export default function BuyerDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadDashboard();
    }
  }, [user, authLoading, router]);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders?role=buyer&limit=5', {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setRecentOrders(
        (data.orders || []).map((o: Record<string, unknown>) => ({
          id: o.id as string,
          orderNumber: o.order_number as string || `PD-${o.id?.toString().slice(0, 6)}`,
          status: o.status as string,
          subtotal: Number(o.subtotal) || 0,
          createdAt: o.created_at as string,
          productTitle: ((o.order_items as Record<string, unknown>[])?.[0]?.product_title_snapshot as string) || 'Produto',
        }))
      );

      setStats({
        totalOrders: data.total || data.orders?.length || 0,
        totalSpent: data.totalSpent || 0,
        pendingOrders: data.pending || 0,
        disputeCount: data.disputes || 0,
        libraryCount: data.libraryCount || 0,
        favoriteCount: data.favoriteCount || 0,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  // Estado de carregamento
  if (authLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">Erro ao carregar</h2>
          <p className="text-red-300/70 text-sm mb-6">{error}</p>
          <button
            onClick={loadDashboard}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
          >
            Tentar novamente
          </button>
        </motion.div>
      </div>
    );
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending_payment: { label: 'Aguardando Pagamento', color: 'text-yellow-400 bg-yellow-400/10' },
    paid: { label: 'Pago', color: 'text-blue-400 bg-blue-400/10' },
    processing: { label: 'Processando', color: 'text-purple-400 bg-purple-400/10' },
    delivered: { label: 'Entregue', color: 'text-emerald-400 bg-emerald-400/10' },
    confirmed: { label: 'Confirmado', color: 'text-green-400 bg-green-400/10' },
    disputed: { label: 'Em Disputa', color: 'text-red-400 bg-red-400/10' },
    refunded: { label: 'Reembolsado', color: 'text-orange-400 bg-orange-400/10' },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header do Comprador */}
      <div className="bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Olá, {profile?.full_name?.split(' ')[0] || 'Comprador'} 👋
              </h1>
              <p className="text-slate-400 text-sm">
                Seu painel de compras — tudo num só lugar
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cards de Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Compras"
            value={stats?.totalOrders || 0}
            color="blue"
          />
          <StatCard
            icon={<CreditCard className="w-5 h-5" />}
            label="Total Gasto"
            value={`R$ ${(stats?.totalSpent || 0).toFixed(2)}`}
            color="emerald"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pendentes"
            value={stats?.pendingOrders || 0}
            color="yellow"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Disputas"
            value={stats?.disputeCount || 0}
            color="red"
          />
          <StatCard
            icon={<Library className="w-5 h-5" />}
            label="Biblioteca"
            value={stats?.libraryCount || 0}
            color="purple"
          />
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Favoritos"
            value={stats?.favoriteCount || 0}
            color="orange"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pedidos Recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-400" />
                Pedidos Recentes
              </h2>
              <button
                onClick={() => router.push('/buyer/orders')}
                className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                Ver todos <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Nenhum pedido ainda</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
                >
                  Explorar Produtos
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const statusInfo = statusLabels[order.status] || { label: order.status, color: 'text-slate-400 bg-slate-400/10' };
                  return (
                    <motion.button
                      key={order.id}
                      whileHover={{ x: 4 }}
                      onClick={() => router.push(`/buyer/orders/${order.id}`)}
                      className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium text-sm">{order.productTitle}</p>
                        <p className="text-slate-400 text-xs mt-1">{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-white font-semibold text-sm">
                          R$ {order.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Ações Rápidas
            </h2>

            <QuickAction
              icon={<Library className="w-5 h-5" />}
              label="Minha Biblioteca"
              description="Keys, contas e downloads"
              href="/buyer/library"
              color="purple"
            />
            <QuickAction
              icon={<Shield className="w-5 h-5" />}
              label="Proteção ao Comprador"
              description="Disputas e reembolsos"
              href="/buyer/disputes"
              color="emerald"
            />
            <QuickAction
              icon={<Star className="w-5 h-5" />}
              label="Favoritos"
              description="Produtos salvos"
              href="/buyer/favorites"
              color="yellow"
            />
            <QuickAction
              icon={<Settings className="w-5 h-5" />}
              label="Configurações"
              description="2FA, senha e conta"
              href="/buyer/settings"
              color="slate"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Sub-componentes
// ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'blue' | 'emerald' | 'yellow' | 'red' | 'purple' | 'orange';
}) {
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-600/5 border-blue-600/20 text-blue-400',
    emerald: 'from-emerald-600/20 to-emerald-600/5 border-emerald-600/20 text-emerald-400',
    yellow: 'from-yellow-600/20 to-yellow-600/5 border-yellow-600/20 text-yellow-400',
    red: 'from-red-600/20 to-red-600/5 border-red-600/20 text-red-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-600/20 text-purple-400',
    orange: 'from-orange-600/20 to-orange-600/5 border-orange-600/20 text-orange-400',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function QuickAction({ icon, label, description, href, color }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  color: string;
}) {
  const router = useRouter();
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(href)}
      className="w-full flex items-center gap-4 p-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 rounded-xl transition-colors text-left"
    >
      <div className={`text-${color}-400`}>{icon}</div>
      <div className="flex-1">
        <p className="text-white font-medium text-sm">{label}</p>
        <p className="text-slate-400 text-xs">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600" />
    </motion.button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="bg-slate-900/30 h-32" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded-xl p-4 h-24" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-800/30 rounded-2xl p-6 h-80" />
          <div className="bg-slate-800/30 rounded-2xl p-6 h-80" />
        </div>
      </div>
    </div>
  );
}
