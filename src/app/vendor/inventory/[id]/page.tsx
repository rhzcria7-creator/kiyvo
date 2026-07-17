'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Upload,
  FileText,
  Key,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Loader2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /vendor/inventory/[id] — Gestão do Cofre Digital
// Onde o vendedor insere chaves/contas em massa (bulk upload TXT)
// ═══════════════════════════════════════════════════════════════

interface InventoryItem {
  id: string;
  assetType: string;
  assetDescription: string | null;
  status: string;
  createdAt: string;
  soldAt: string | null;
  expiresAt: string | null;
}

type AssetType = 'license_key' | 'account_credentials' | 'download_link' | 'script_zip' | 'course_access' | 'api_credentials' | 'gift_card_code' | 'custom';

export default function VendorInventoryPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [productId, setProductId] = useState<string>('');
  const [productTitle, setProductTitle] = useState<string>('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<AssetType>('license_key');
  const [uploadText, setUploadText] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    // Pegar productId da URL
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    if (id && id !== '[id]') {
      setProductId(id);
      loadInventory(id);
    }
  }, [user, authLoading, router]);

  async function loadInventory(prodId: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/vault?productId=${prodId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Erro ao carregar inventário');

      const data = await response.json();
      setProductTitle(data.productTitle || 'Produto');
      setItems(
        (data.items || []).map((item: Record<string, unknown>) => ({
          id: item.id as string,
          assetType: (item.asset_type as string) || 'license_key',
          assetDescription: (item.asset_description as string) || null,
          status: (item.status as string) || 'available',
          createdAt: (item.created_at as string) || '',
          soldAt: (item.sold_at as string) || null,
          expiresAt: (item.expires_at as string) || null,
        }))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const handleBulkUpload = useCallback(async () => {
    if (!uploadText.trim() || !productId) return;

    setIsUploading(true);
    setUploadResult(null);
    try {
      const lines = uploadText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const response = await fetch('/api/v1/vault/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          assetType: uploadType,
          items: lines,
          description: uploadDescription || undefined,
        }),
      });

      if (!response.ok) throw new Error('Erro no upload');

      const data = await response.json();
      setUploadResult(data.result || { success: 0, failed: 0, errors: [] });

      // Recarregar inventário
      await loadInventory(productId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro no upload';
      setUploadResult({ success: 0, failed: 1, errors: [message] });
    } finally {
      setIsUploading(false);
    }
  }, [uploadText, uploadType, uploadDescription, productId]);

  const statusLabels: Record<string, { label: string; color: string }> = {
    available: { label: 'Disponível', color: 'text-emerald-400 bg-emerald-400/10' },
    reserved: { label: 'Reservado', color: 'text-yellow-400 bg-yellow-400/10' },
    sold: { label: 'Vendido', color: 'text-blue-400 bg-blue-400/10' },
    revoked: { label: 'Revogado', color: 'text-red-400 bg-red-400/10' },
    expired: { label: 'Expirado', color: 'text-slate-400 bg-slate-400/10' },
  };

  const assetTypeLabels: Record<string, string> = {
    license_key: 'Chave',
    account_credentials: 'Conta',
    download_link: 'Download',
    script_zip: 'Script/ZIP',
    course_access: 'Curso',
    api_credentials: 'API',
    gift_card_code: 'Gift Card',
    custom: 'Outro',
  };

  // Verificar KYC
  if (!authLoading && profile && profile.role !== 'vendor' && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">Acesso restrito</h2>
          <p className="text-slate-400 mb-4">Apenas vendedores verificados podem gerenciar o Cofre</p>
          <button onClick={() => router.push('/vendor/onboarding')} className="px-4 py-2 bg-blue-600 rounded-lg text-white">
            Tornar-se Vendedor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Cofre Digital
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {productTitle} — Gerencie seus ativos com segurança
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 rounded-xl text-white font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Adicionar Ativos
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.entries(statusLabels).map(([key, info]) => {
            const count = items.filter((i) => i.status === key).length;
            return (
              <div key={key} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{count}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
              </div>
            );
          })}
        </div>

        {/* Lista de Ativos */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-slate-800/30 rounded-xl p-4 h-16 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Cofre vazio</h3>
            <p className="text-slate-500 text-sm mb-6">
              Adicione chaves, contas ou links para que as vendas possam ser entregues automaticamente
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-medium transition-colors"
            >
              Adicionar Primeiro Ativo
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => {
              const statusInfo = statusLabels[item.status] || statusLabels.available;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {assetTypeLabels[item.assetType] || item.assetType}
                        {item.assetDescription && (
                          <span className="text-slate-400 ml-2">— {item.assetDescription}</span>
                        )}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        {item.soldAt && ` • Vendido: ${new Date(item.soldAt).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Adicionar Ativos ao Cofre</h2>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tipo de Asset */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-1 block">Tipo de Ativo</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as AssetType)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                >
                  <option value="license_key">🔑 Chave de Licença</option>
                  <option value="account_credentials">👤 Conta/Credenciais</option>
                  <option value="download_link">🔗 Link de Download</option>
                  <option value="gift_card_code">🎁 Gift Card Code</option>
                  <option value="script_zip">📦 Script/ZIP</option>
                  <option value="course_access">🎓 Acesso a Curso</option>
                  <option value="api_credentials">⚡ API Credenciais</option>
                  <option value="custom">📋 Personalizado</option>
                </select>
              </div>

              {/* Descrição */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-1 block">Descrição (opcional)</label>
                <input
                  type="text"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Ex: Steam Key - Region BR"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Bulk Upload via Textarea */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-1 block">
                  Ativos (1 por linha) — {uploadText.split('\n').filter((l) => l.trim()).length} itens
                </label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder={
                    uploadType === 'license_key'
                      ? 'XXXXX-XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY-YYYYY'
                      : uploadType === 'account_credentials'
                      ? 'email1@gmail.com:senha123\nemail2@gmail.com:senha456'
                      : 'https://download-link-1.com\nhttps://download-link-2.com'
                  }
                  className="w-full h-40 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono focus:border-amber-500 outline-none placeholder:text-slate-500 resize-none"
                />
              </div>

              {/* Resultado do Upload */}
              {uploadResult && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  uploadResult.failed > 0 ? 'bg-yellow-900/20 border border-yellow-600/20' : 'bg-emerald-900/20 border border-emerald-600/20'
                }`}>
                  <p className="text-emerald-400">✅ {uploadResult.success} ativo{uploadResult.success !== 1 ? 's' : ''} adicionado{uploadResult.success !== 1 ? 's' : ''}</p>
                  {uploadResult.failed > 0 && (
                    <p className="text-red-400 mt-1">❌ {uploadResult.failed} falha{uploadResult.failed !== 1 ? 's' : ''}</p>
                  )}
                  {uploadResult.errors.map((e, i) => (
                    <p key={i} className="text-yellow-400 text-xs mt-1">{e}</p>
                  ))}
                </div>
              )}

              {/* Upload de Arquivo TXT */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 mb-2 block">Ou carregue um arquivo TXT</label>
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-amber-500/50 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-400 text-sm">Clique para selecionar .txt</span>
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const content = ev.target?.result as string;
                          setUploadText(content);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Botão de Upload */}
              <button
                onClick={handleBulkUpload}
                disabled={isUploading || !uploadText.trim()}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Encriptando e guardando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Adicionar ao Cofre ({uploadText.split('\n').filter((l) => l.trim()).length} itens)
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
