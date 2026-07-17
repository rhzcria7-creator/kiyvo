'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, MessageCircle, Scale, Loader2 } from 'lucide-react';

// /admin/disputes — Mediação de conflitos entre comprador/vendedor

interface DisputeCase {
  id: string;
  orderId: string;
  orderNumber: string;
  buyerName: string;
  vendorName: string;
  reason: string;
  status: string;
  createdAt: string;
  amount: number;
}

export default function AdminDisputesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [disputes, setDisputes] = useState<DisputeCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && profile && profile.role !== 'admin') { router.push('/'); return; }
    if (user) loadDisputes();
  }, [user, profile, authLoading]);

  async function loadDisputes() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/disputes');
      if (res.ok) { const data = await res.json(); setDisputes(data.disputes || []); }
    } catch { /* silencioso */ } finally { setIsLoading(false); }
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    open: { label: 'Aberta', color: 'text-red-400 bg-red-400/10' },
    under_review: { label: 'Em Análise', color: 'text-yellow-400 bg-yellow-400/10' },
    resolved_buyer: { label: 'Comprador', color: 'text-blue-400 bg-blue-400/10' },
    resolved_vendor: { label: 'Vendedor', color: 'text-purple-400 bg-purple-400/10' },
    closed: { label: 'Encerrada', color: 'text-slate-400 bg-slate-400/10' },
  };

  if (authLoading || isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center"><Scale className="w-5 h-5 text-white" /></div>
              Mediação de Disputas
            </h1>
            <p className="text-slate-400 text-sm mt-1">{disputes.length} disputa(s) ativa(s)</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {disputes.length === 0 ? (
          <div className="text-center py-16"><CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" /><p className="text-slate-400">Nenhuma disputa ativa</p></div>
        ) : (
          <div className="space-y-3">
            {disputes.map((d, i) => {
              const s = statusConfig[d.status] || statusConfig.open;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                        <span className="text-slate-500 text-xs">R$ {d.amount.toFixed(2)}</span>
                      </div>
                      <p className="text-white font-medium text-sm">{d.reason}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Comprador: {d.buyerName} ↔ Vendedor: {d.vendorName} • {d.orderNumber}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">{new Date(d.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-3 py-1.5 bg-blue-600/20 text-blue-400 text-xs rounded-lg hover:bg-blue-600/30">Analisar</button>
                      <button className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 text-xs rounded-lg hover:bg-emerald-600/30">Comprador</button>
                      <button className="px-3 py-1.5 bg-purple-600/20 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30">Vendedor</button>
                    </div>
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
