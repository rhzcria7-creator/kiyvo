'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Package, ChevronRight, Clock, Shield, AlertTriangle } from 'lucide-react';

// /buyer/orders — Lista de pedidos do comprador

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  createdAt: string;
  productTitle: string;
}

export default function BuyerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) loadOrders();
  }, [user, authLoading]);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders?role=buyer');
      if (res.ok) {
        const data = await res.json();
        setOrders((data.orders || []).map((o: Record<string, unknown>) => ({
          id: o.id as string,
          orderNumber: (o.order_number as string) || '',
          status: (o.status as string) || 'pending_payment',
          subtotal: Number(o.subtotal) || 0,
          createdAt: (o.created_at as string) || '',
          productTitle: ((o.order_items as Record<string, unknown>[])?.[0]?.product_title_snapshot as string) || 'Produto',
        })));
      }
    } catch { /* erro silencioso */ } finally { setIsLoading(false); }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending_payment: { label: 'Aguardando Pagamento', color: 'text-yellow-400 bg-yellow-400/10' },
    paid: { label: 'Pago', color: 'text-blue-400 bg-blue-400/10' },
    delivered: { label: 'Entregue', color: 'text-emerald-400 bg-emerald-400/10' },
    confirmed: { label: 'Confirmado', color: 'text-green-400 bg-green-400/10' },
    disputed: { label: 'Disputa', color: 'text-red-400 bg-red-400/10' },
    refunded: { label: 'Reembolsado', color: 'text-orange-400 bg-orange-400/10' },
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-400" /> Meus Pedidos
          </h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-slate-800/30 rounded-xl p-5 h-20 animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16"><Package className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Nenhum pedido encontrado</p></div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const s = statusLabels[order.status] || statusLabels.pending_payment;
              return (
                <motion.button key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => router.push(`/buyer/orders/${order.id}`)}
                  className="w-full flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors text-left">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{order.productTitle}</p>
                    <p className="text-slate-400 text-xs mt-1">{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>
                    <span className="text-white font-semibold text-sm">R$ {order.subtotal.toFixed(2)}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
