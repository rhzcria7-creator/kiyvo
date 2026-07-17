'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Download,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /buyer/library — A Minha Biblioteca (Onde ficam as keys/contas)
// Dados reais do Supabase — ZERO mock
// ═══════════════════════════════════════════════════════════════

interface LibraryItem {
  id: string;
  orderNumber: string;
  productTitle: string;
  productImage: string | null;
  assetType: string;
  assetData: string | null;  // Dado decriptado (só carregado quando revelado)
  assetDescription: string | null;
  deliveredAt: string;
  deliveryStatus: string;
  orderId: string;
  isRevealed: boolean;  // Estado local — se o dado está visível
}

type AssetTypeLabel = {
  [key: string]: { label: string; icon: React.ReactNode; color: string };
};

export default function BuyerLibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadLibrary();
    }
  }, [user, authLoading, router]);

  async function loadLibrary() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders?role=buyer&status=delivered,confirmed&include=items', {
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

      const libraryItems: LibraryItem[] = (data.orders || []).flatMap(
        (order: Record<string, unknown>) =>
          ((order.order_items || []) as Record<string, unknown>[]).map(
            (item: Record<string, unknown>) => ({
              id: item.id as string,
              orderNumber: order.order_number as string || '',
              productTitle: (item.product_title_snapshot as string) || 'Produto',
              productImage: null,
              assetType: (item.delivered_asset_type as string) || 'license_key',
              assetData: null,  // Carregado apenas ao revelar
              assetDescription: null,
              deliveredAt: (item.delivered_at as string) || (order.confirmed_at as string) || (order.created_at as string),
              deliveryStatus: (item.delivery_status as string) || 'delivered',
              orderId: order.id as string,
              isRevealed: false,
            })
          )
      );

      setItems(libraryItems);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar biblioteca';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const revealAsset = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(`/api/v1/vault/deliver?orderItemId=${itemId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Erro ao revelar ativo');
      }

      const data = await response.json();

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, assetData: data.asset?.decryptedData || null, isRevealed: true }
            : item
        )
      );
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, isRevealed: false } : item
        )
      );
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(itemId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback para browsers sem clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(itemId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.productTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.assetType === filterType;
    return matchesSearch && matchesFilter;
  });

  const assetTypeLabels: AssetTypeLabel = {
    license_key: { label: 'Chave de Licença', icon: <Key className="w-4 h-4" />, color: 'text-blue-400 bg-blue-400/10' },
    account_credentials: { label: 'Conta/Credenciais', icon: <Shield className="w-4 h-4" />, color: 'text-purple-400 bg-purple-400/10' },
    download_link: { label: 'Link de Download', icon: <Download className="w-4 h-4" />, color: 'text-emerald-400 bg-emerald-400/10' },
    gift_card_code: { label: 'Gift Card', icon: <Key className="w-4 h-4" />, color: 'text-orange-400 bg-orange-400/10' },
    course_access: { label: 'Acesso a Curso', icon: <ExternalLink className="w-4 h-4" />, color: 'text-cyan-400 bg-cyan-400/10' },
    api_credentials: { label: 'API Credenciais', icon: <Key className="w-4 h-4" />, color: 'text-red-400 bg-red-400/10' },
    script_zip: { label: 'Script/ZIP', icon: <Download className="w-4 h-4" />, color: 'text-yellow-400 bg-yellow-400/10' },
    custom: { label: 'Personalizado', icon: <Key className="w-4 h-4" />, color: 'text-slate-400 bg-slate-400/10' },
  };

  if (authLoading || isLoading) {
    return <LibrarySkeleton />;
  }

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
          <p className="text-red-300/70 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 via-purple-500/10 to-transparent border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              Minha Biblioteca
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Suas chaves, contas e downloads — entrega instantânea
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Barra de Busca e Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar nas suas compras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-colors text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-purple-500 outline-none appearance-none cursor-pointer text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="license_key">Chaves</option>
              <option value="account_credentials">Contas</option>
              <option value="download_link">Downloads</option>
              <option value="gift_card_code">Gift Cards</option>
            </select>
          </div>
        </motion.div>

        {/* Lista de Itens */}
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Key className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">
              {items.length === 0 ? 'Biblioteca vazia' : 'Nenhum resultado'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {items.length === 0
                ? 'Quando você comprar produtos digitais, as chaves aparecerão aqui'
                : 'Tente outro termo de busca'}
            </p>
            {items.length === 0 && (
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors"
              >
                Explorar Produtos
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => {
                const typeInfo = assetTypeLabels[item.assetType] || assetTypeLabels.custom;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Info do Produto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color} flex items-center gap-1`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.deliveredAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold truncate">{item.productTitle}</h3>
                        <p className="text-slate-400 text-xs mt-1">Pedido: {item.orderNumber}</p>
                      </div>

                      {/* Área do Asset — O coração do Cofre */}
                      <div className="flex items-center gap-2">
                        {item.isRevealed && item.assetData ? (
                          // Estado: Revelado — mostra o dado + botões de copiar/esconder
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2"
                          >
                            <div className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 font-mono text-sm text-emerald-400 max-w-xs truncate">
                              {item.assetData}
                            </div>
                            <button
                              onClick={() => copyToClipboard(item.assetData!, item.id)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                              title="Copiar"
                            >
                              {copiedId === item.id ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setItems((prev) =>
                                prev.map((i) => i.id === item.id ? { ...i, isRevealed: false, assetData: null } : i)
                              )}
                              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                              title="Esconder"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ) : (
                          // Estado: Oculto — botão "Revelar"
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => revealAsset(item.id)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl text-white font-medium transition-all text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            Revelar
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 animate-pulse">
      <div className="bg-slate-900/30 h-32" />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="h-10 bg-slate-800/30 rounded-xl" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-slate-800/30 rounded-2xl p-5 h-24" />
        ))}
      </div>
    </div>
  );
}
