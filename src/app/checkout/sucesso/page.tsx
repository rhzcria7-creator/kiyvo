'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle, Package, Key, Eye, Copy, Shield,
  Clock, Star, Loader2, AlertTriangle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /checkout/sucesso — Pós-compra REAL
// Busca dados do pedido via session_id e entrega assets
// ═══════════════════════════════════════════════════════════════

interface OrderInfo {
  orderNumber: string;
  status: string;
  subtotal: number;
  productTitle: string;
  deliveryType: string;
  assetType: string | null;
  assetData: string | null;
  deliveredAt: string | null;
  escrowReleaseDate: string | null;
  pdPoints: number;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadOrderFromSession(sessionId);
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  async function loadOrderFromSession(sid: string) {
    setIsLoading(true);
    try {
      // Buscar pedido pelo stripe_checkout_session_id
      const res = await fetch(`/api/orders?session_id=${sid}`);
      if (res.ok) {
        const data = await res.json();
        const o = data.order || data;

        setOrder({
          orderNumber: o.order_number || '',
          status: o.status || 'paid',
          subtotal: Number(o.subtotal) || 0,
          productTitle: (o.order_items?.[0]?.product_title_snapshot as string) || 'Produto Digital',
          deliveryType: o.delivery_type || 'auto',
          assetType: null,
          assetData: null,
          deliveredAt: o.delivered_at,
          escrowReleaseDate: o.escrow_release_scheduled_at,
          pdPoints: Math.floor((Number(o.subtotal) || 0) * 2),  // 2 KD Points per R$1
        });

        // Se já está delivered, tentar revelar asset
        if (o.status === 'delivered' || o.status === 'confirmed') {
          const orderItemId = o.order_items?.[0]?.id;
          if (orderItemId) {
            try {
              const assetRes = await fetch(`/api/v1/vault/deliver?orderItemId=${orderItemId}`);
              if (assetRes.ok) {
                const assetData = await assetRes.json();
                setOrder(prev => prev ? {
                  ...prev,
                  assetType: assetData.asset?.assetType || null,
                  assetData: assetData.asset?.decryptedData || null,
                } : prev);
              }
            } catch {
              // Asset pode não estar disponível ainda
            }
          }
        }
      }
    } catch {
      setError('Não foi possível carregar os detalhes do pedido');
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-white mb-2">Processando seu pedido...</h2>
          <p className="text-slate-400 text-sm">Verificando pagamento e preparando entrega</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pedido em processamento</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <Link href="/buyer/orders" className="px-6 py-3 bg-blue-600 rounded-xl text-white font-medium">
            Ver Meus Pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-lg mx-auto px-4 py-16">
        {/* Confetti placeholder */}
        <div className="text-center">
          {/* Ícone de sucesso */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle size={80} className="text-emerald-400 mx-auto mb-6" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="text-3xl font-bold text-white">Pagamento Confirmado! 🎉</h1>
            <p className="text-slate-400 mt-2">Seu pedido foi processado com sucesso.</p>
          </motion.div>

          {/* Detalhes do pedido */}
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mt-8 text-left">
              <h3 className="text-slate-400 text-xs font-semibold uppercase mb-4">Detalhes do pedido</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pedido</span>
                  <span className="text-white font-mono font-semibold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Produto</span>
                  <span className="text-white font-semibold">{order.productTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Valor</span>
                  <span className="text-white font-semibold">R$ {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-400 font-semibold">✓ Pago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entrega</span>
                  <span className="text-blue-400 font-semibold">
                    {order.deliveryType === 'auto' ? '⚡ Automática' : '📋 Manual (até 24h)'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Asset revelado (se auto-entrega) */}
          {order?.assetData && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
              className="bg-emerald-900/20 border border-emerald-600/30 rounded-2xl p-6 mt-4 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-5 h-5 text-emerald-400" />
                <h3 className="text-emerald-400 font-semibold">Seu Produto Digital</h3>
              </div>

              {revealed ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-800 border border-emerald-600/30 rounded-lg">
                    <p className="font-mono text-emerald-400 text-sm break-all">{order.assetData}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(order.assetData!)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-medium text-sm transition-colors"
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado!' : 'Copiar para Área de Transferência'}
                  </button>
                  <p className="text-slate-500 text-xs text-center">
                    Guarde este código em local seguro. Você também pode acessá-lo na sua Biblioteca.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-semibold transition-colors"
                >
                  <Eye className="w-4 h-4" /> Revelar Produto
                </button>
              )}
            </motion.div>
          )}

          {/* Escrow info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            className="bg-blue-900/10 border border-blue-600/20 rounded-xl p-4 mt-4 flex items-start gap-3 text-left">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 text-sm font-semibold">Proteção Kiyvo (Escrow)</p>
              <p className="text-slate-400 text-xs mt-1">
                Seu dinheiro está retido em custódia. Após confirmar o recebimento ou em 7 dias, o valor será liberado ao vendedor.
                Se houver problema, abra uma disputa em até 7 dias.
              </p>
            </div>
          </motion.div>

          {/* KD Points */}
          {order && order.pdPoints > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
              className="bg-amber-900/10 border border-amber-600/20 rounded-xl p-4 mt-3 flex items-center gap-3">
              <Star className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <p className="text-amber-400 text-sm font-semibold">+{order.pdPoints} KD Points</p>
                <p className="text-slate-500 text-xs">Ganhe pontos a cada compra e troque por descontos!</p>
              </div>
            </motion.div>
          )}

          {/* Ações */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/buyer/library">
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white font-medium transition-colors w-full sm:w-auto justify-center">
                <Key className="w-4 h-4" /> Minha Biblioteca
              </button>
            </Link>
            <Link href="/buyer/orders">
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-white font-medium transition-colors w-full sm:w-auto justify-center">
                <Package className="w-4 h-4" /> Meus Pedidos
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSucessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
