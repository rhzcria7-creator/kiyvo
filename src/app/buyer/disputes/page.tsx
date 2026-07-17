'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Shield,
  AlertTriangle,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  FileText,
  Upload,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /buyer/disputes — Central de Disputas
// ═══════════════════════════════════════════════════════════════

interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  reason: string;
  status: string;
  createdAt: string;
  resolution: string | null;
  productTitle: string;
}

export default function BuyerDisputesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) loadDisputes();
  }, [user, authLoading, router]);

  async function loadDisputes() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders?role=buyer&status=disputed', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      setDisputes(
        (data.orders || []).map((o: Record<string, unknown>) => ({
          id: o.dispute_id || o.id,
          orderId: o.id,
          orderNumber: o.order_number || '',
          reason: o.dispute_reason || 'Problema com o produto',
          status: o.dispute_status || 'open',
          createdAt: o.disputed_at || o.created_at,
          resolution: o.dispute_resolution || null,
          productTitle: ((o.order_items as Record<string, unknown>[])?.[0]?.product_title_snapshot as string) || 'Produto',
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    open: { label: 'Aberta', color: 'text-red-400 bg-red-400/10', icon: <AlertTriangle className="w-4 h-4" /> },
    under_review: { label: 'Em Análise', color: 'text-yellow-400 bg-yellow-400/10', icon: <Clock className="w-4 h-4" /> },
    resolved_buyer: { label: 'Resolvida (Comprador)', color: 'text-emerald-400 bg-emerald-400/10', icon: <CheckCircle className="w-4 h-4" /> },
    resolved_vendor: { label: 'Resolvida (Vendedor)', color: 'text-blue-400 bg-blue-400/10', icon: <XCircle className="w-4 h-4" /> },
    closed: { label: 'Encerrada', color: 'text-slate-400 bg-slate-400/10', icon: <XCircle className="w-4 h-4" /> },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-red-600/20 via-red-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              Central de Disputas
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Proteção ao comprador — 7 dias para abrir disputa após a entrega
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Banner de Proteção */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-900/10 border border-emerald-600/20 rounded-2xl p-5 mb-6 flex items-start gap-4"
        >
          <Shield className="w-8 h-8 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-emerald-400 font-semibold">Proteção Kiyvo</h3>
            <p className="text-slate-400 text-sm mt-1">
              Seu dinheiro fica retido em Escrow por 7 dias após a entrega. Se a chave não funcionar ou o produto não corresponder à descrição, abra uma disputa e devolvemos seu dinheiro.
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400">Nenhuma disputa</h3>
            <p className="text-slate-500 text-sm">Suas compras estão todas em dia!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {disputes.map((dispute, index) => {
              const status = statusConfig[dispute.status] || statusConfig.open;
              return (
                <motion.div
                  key={dispute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium">{dispute.productTitle}</h3>
                      <p className="text-slate-400 text-sm mt-1">{dispute.reason}</p>
                      <p className="text-slate-500 text-xs mt-2">
                        Pedido: {dispute.orderNumber} • {new Date(dispute.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      {dispute.resolution && (
                        <p className="text-slate-300 text-sm mt-2 bg-slate-800/50 p-3 rounded-lg">
                          Resolução: {dispute.resolution}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
