'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { Shield, CheckCircle, XCircle, Eye, Clock, FileText, User, AlertTriangle, Loader2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /admin/kyc-review — Backoffice para aprovar documentos KYC
// Apenas contas com role 'admin'
// ═══════════════════════════════════════════════════════════════

interface KYCPending {
  userId: string;
  fullName: string | null;
  email: string;
  kycStatus: string;
  submittedAt: string | null;
  documents: {
    id: string;
    documentType: string;
    filePath: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminKYCReviewPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<KYCPending[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && profile && profile.role !== 'admin') { router.push('/'); return; }
    if (user) loadPending();
  }, [user, profile, authLoading]);

  async function loadPending() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/admin/kyc?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.users || []);
      }
    } catch { /* silencioso */ } finally { setIsLoading(false); }
  }

  async function handleAction(userId: string, action: 'approve' | 'reject') {
    setProcessingId(userId);
    try {
      const res = await fetch('/api/v1/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) {
        setPendingUsers(prev => prev.filter(u => u.userId !== userId));
      }
    } catch { /* silencioso */ } finally { setProcessingId(null); }
  }

  const docTypeLabels: Record<string, string> = {
    cpf_cnpj: 'CPF/CNPJ', id_front: 'Frente do Doc', id_back: 'Verso do Doc',
    selfie_with_doc: 'Selfie + Doc', proof_of_address: 'Comp. Residência',
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-red-600/20 via-red-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              KYC Review — Admin
            </h1>
            <p className="text-slate-400 text-sm mt-1">{pendingUsers.length} verificação(ões) pendente(s)</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {pendingUsers.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <p className="text-slate-400">Nenhuma verificação pendente!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((u, i) => (
              <motion.div key={u.userId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-600/20 flex items-center justify-center text-yellow-400">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{u.fullName || 'Sem nome'}</p>
                      <p className="text-slate-400 text-sm">{u.email}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        <Clock className="w-3 h-3 inline" /> Submetido: {u.submittedAt ? new Date(u.submittedAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(u.userId, 'approve')}
                      disabled={processingId === u.userId}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors">
                      {processingId === u.userId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Aprovar
                    </button>
                    <button onClick={() => handleAction(u.userId, 'reject')}
                      disabled={processingId === u.userId}
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors">
                      <XCircle className="w-3 h-3" /> Rejeitar
                    </button>
                  </div>
                </div>

                {/* Documentos */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {u.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 text-xs">{docTypeLabels[doc.documentType] || doc.documentType}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        doc.status === 'approved' ? 'text-emerald-400 bg-emerald-400/10' :
                        doc.status === 'rejected' ? 'text-red-400 bg-red-400/10' :
                        'text-yellow-400 bg-yellow-400/10'
                      }`}>{doc.status === 'pending' ? 'Pendente' : doc.status}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
