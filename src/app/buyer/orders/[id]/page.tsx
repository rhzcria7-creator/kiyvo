'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Package, Clock, Shield, CheckCircle, AlertTriangle,
  Copy, Eye, ExternalLink, MessageCircle, ChevronRight, ArrowLeft, Key
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /buyer/orders/[id] — Detalhes do pedido + chat + disputa
// ═══════════════════════════════════════════════════════════════

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  platformFee: number;
  vendorNet: number;
  paymentMethod: string;
  createdAt: string;
  paidAt: string | null;
  deliveredAt: string | null;
  escrowReleaseScheduledAt: string | null;
  items: {
    id: string;
    productTitle: string;
    unitPrice: number;
    quantity: number;
    deliveryStatus: string;
    assetType: string | null;
    assetData: string | null;
  }[];
  vendor: { storeName: string; slug: string };
}

export default function OrderDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (orderId) loadOrder();
  }, [user, authLoading, orderId]);

  async function loadOrder() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?id=${orderId}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) throw new Error('Pedido não encontrado');
      const data = await res.json();
      const o = data.order || data;
      const rawVendor = (o.vendors || {}) as Record<string, unknown>;
      setOrder({
        id: o.id, orderNumber: o.order_number || '', status: o.status || 'pending_payment',
        subtotal: Number(o.subtotal) || 0, platformFee: Number(o.platform_fee) || 0,
        vendorNet: Number(o.vendor_net) || 0, paymentMethod: o.payment_method || '',
        createdAt: o.created_at, paidAt: o.paid_at, deliveredAt: o.delivered_at,
        escrowReleaseScheduledAt: o.escrow_release_scheduled_at,
        items: (o.order_items || []).map((item: Record<string, unknown>) => ({
          id: item.id as string, productTitle: (item.product_title_snapshot as string) || 'Produto',
          unitPrice: Number(item.unit_price) || 0, quantity: Number(item.quantity) || 1,
          deliveryStatus: (item.delivery_status as string) || 'pending',
          assetType: (item.delivered_asset_type as string) || null, assetData: null,
        })),
        vendor: { storeName: (rawVendor.store_name as string) || 'Vendedor', slug: (rawVendor.slug as string) || '' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro');
    } finally { setIsLoading(false); }
  }

  const revealAsset = async (itemId: string) => {
    try {
      const res = await fetch(`/api/v1/vault/deliver?orderItemId=${itemId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(prev => prev ? {
          ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, assetData: data.asset?.decryptedData || null } : i)
        } : prev);
        setRevealedItems(prev => new Set(prev).add(itemId));
      }
    } catch { /* silencioso */ }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusSteps = [
    { key: 'pending_payment', label: 'Pagamento', icon: <Clock className="w-4 h-4" /> },
    { key: 'paid', label: 'Processando', icon: <Package className="w-4 h-4" /> },
    { key: 'delivered', label: 'Entregue', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'confirmed', label: 'Confirmado', icon: <Shield className="w-4 h-4" /> },
  ];

  if (isLoading) return <div className="min-h-screen bg-slate-950 animate-pulse"><div className="max-w-3xl mx-auto px-4 py-8 space-y-6"><div className="h-10 bg-slate-800/30 rounded-xl w-1/2" /><div className="h-40 bg-slate-800/30 rounded-2xl" /><div className="h-32 bg-slate-800/30 rounded-2xl" /></div></div>;
  if (error || !order) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-center"><AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" /><p className="text-red-400">{error}</p><button onClick={() => router.push('/buyer/orders')} className="mt-4 text-blue-400 text-sm">Voltar</button></div></div>;

  const currentStepIdx = statusSteps.findIndex(s => s.key === order.status) || 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.push('/buyer/orders')} className="text-slate-400 text-sm flex items-center gap-1 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Meus Pedidos
          </button>
          <h1 className="text-2xl font-bold text-white">Pedido {order.orderNumber}</h1>
          <p className="text-slate-400 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </motion.div>

        {/* Progress bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex flex-col items-center ${i <= currentStepIdx ? 'text-blue-400' : 'text-slate-600'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i <= currentStepIdx ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                    {i < currentStepIdx ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : step.icon}
                  </div>
                  <span className="text-xs mt-2">{step.label}</span>
                </div>
                {i < statusSteps.length - 1 && <div className={`w-12 sm:w-24 h-0.5 mx-1 ${i < currentStepIdx ? 'bg-blue-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Escrow Info */}
        {(order.status === 'delivered' || order.status === 'paid') && (
          <div className="bg-emerald-900/10 border border-emerald-600/20 rounded-xl p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-400 text-sm font-semibold">Dinheiro em Escrow</p>
              <p className="text-slate-400 text-xs mt-1">O pagamento está retido. {order.escrowReleaseScheduledAt
                ? `Liberação automática em ${new Date(order.escrowReleaseScheduledAt).toLocaleDateString('pt-BR')}`
                : 'Confirme o recebimento ou abra disputa em até 7 dias.'}</p>
            </div>
          </div>
        )}

        {/* Itens do pedido */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Itens</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{item.productTitle}</p>
                  <p className="text-slate-400 text-sm">R$ {item.unitPrice.toFixed(2)} × {item.quantity}</p>
                </div>
                <div className="ml-4">
                  {revealedItems.has(item.id) && item.assetData ? (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg font-mono text-sm text-emerald-400 max-w-xs truncate">
                        {item.assetData}
                      </div>
                      <button onClick={() => copyToClipboard(item.assetData!, item.id)} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                        {copiedId === item.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (order.status === 'delivered' || order.status === 'confirmed') ? (
                    <button onClick={() => revealAsset(item.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-sm font-medium">
                      <Eye className="w-4 h-4" /> Revelar
                    </button>
                  ) : (
                    <span className="text-slate-500 text-sm">Aguardando entrega</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resumo financeiro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Resumo</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="text-white">R$ {order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Taxa da plataforma</span><span className="text-slate-400">R$ {order.platformFee.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-2"><span className="text-white">Total</span><span className="text-white">R$ {order.subtotal.toFixed(2)}</span></div>
          </div>
        </motion.div>

        {/* Ações */}
        <div className="flex gap-3">
          {order.status === 'delivered' && (
            <button onClick={() => router.push(`/buyer/disputes?order=${order.id}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 border border-red-600/30 hover:bg-red-600/30 rounded-xl text-red-400 font-medium transition-colors">
              <AlertTriangle className="w-4 h-4" /> Abrir Disputa
            </button>
          )}
          <button onClick={() => router.push(`/buyer/library`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-white font-medium transition-colors">
            <Key className="w-4 h-4" /> Biblioteca
          </button>
        </div>
      </div>
    </div>
  );
}
