'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Settings,
  Shield,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Trash2,
  User,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /buyer/settings — Configurações do Comprador
// 2FA, senha, exclusão de conta
// ═══════════════════════════════════════════════════════════════

export default function BuyerSettingsPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (profile) {
      setFullName(profile.full_name || '');
      setTwoFactorEnabled((profile as unknown as Record<string, unknown>).two_factor_enabled as boolean || false);
    }
  }, [user, profile, authLoading, router]);

  async function handleSaveName() {
    if (!user || !fullName.trim()) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // Erro silencioso — botão volta ao normal
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-slate-600/20 via-slate-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              Configurações
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Perfil
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Nome Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Email</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 cursor-not-allowed"
                />
                {profile?.verification_status === 'verified' && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Verificado
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleSaveName}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
            >
              {saveSuccess ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saveSuccess ? 'Salvo!' : isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </motion.div>

        {/* Segurança */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            Segurança
          </h2>
          <div className="space-y-4">
            {/* Alterar Senha */}
            <button
              onClick={() => router.push('/auth/reset')}
              className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Alterar Senha</p>
                  <p className="text-slate-400 text-xs">Última alteração: desconhecida</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/10 text-yellow-400">Recomendado</span>
            </button>

            {/* 2FA */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-white text-sm font-medium">Autenticação em 2 Fatores (2FA)</p>
                  <p className="text-slate-400 text-xs">Camada extra de segurança para sua conta</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    twoFactorEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Zona de Perigo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-900/10 border border-red-600/20 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zona de Perigo
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            A exclusão de conta é irreversível. Todos os seus dados, histórico de compras e biblioteca serão perdidos permanentemente.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-xl text-red-400 font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Conta
          </button>
        </motion.div>
      </div>
    </div>
  );
}
