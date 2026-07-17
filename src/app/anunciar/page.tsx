'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import {
  Upload, Zap, Shield, AlertTriangle, Loader2,
  CheckCircle, Package, Key, Link as LinkIcon, Code, Eye
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// /anunciar — Criar Anúncio REAL no Supabase
// Passo 1: Info do produto (título, preço, categoria, tipo entrega)
// Passo 2: Descrição + imagens
// Passo 3: Adicionar ativos ao Cofre Digital
// ═══════════════════════════════════════════════════════════════

type Step = 'info' | 'details' | 'vault' | 'success';

const deliveryTypes = [
  { value: 'auto', label: 'Auto-entrega (Recomendado)', icon: <Zap className="w-4 h-4" />, desc: 'Keys/contas são entregues automaticamente após pagamento' },
  { value: 'license_key', label: 'Chave de Licença', icon: <Key className="w-4 h-4" />, desc: 'CD-Keys, códigos de ativação' },
  { value: 'account_credentials', label: 'Conta/Credenciais', icon: <Shield className="w-4 h-4" />, desc: 'Login/senha de plataformas' },
  { value: 'download', label: 'Link de Download', icon: <Package className="w-4 h-4" />, desc: 'Arquivos para download direto' },
  { value: 'manual', label: 'Entrega Manual', icon: <Eye className="w-4 h-4" />, desc: 'Você entrega via chat (até 24h)' },
];

export default function AnunciarPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Passo 1
  const [title, setTitle] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [deliveryType, setDeliveryType] = useState('auto');

  // Passo 2
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // Passo 3 (Cofre)
  const [vaultItems, setVaultItems] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetType, setAssetType] = useState('license_key');

  // Resultado
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  const handleSubmitProduct = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          base_price: parseFloat(basePrice),
          original_price: originalPrice ? parseFloat(originalPrice) : undefined,
          category_id: categoryId || undefined,
          delivery_type: deliveryType,
          description_html: description,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          product_type: 'digital_download',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar produto');
      }

      const data = await response.json();
      setCreatedProductId(data.product.id);
      setStep('vault');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, basePrice, originalPrice, categoryId, deliveryType, description, tags]);

  const handleBulkUpload = useCallback(async () => {
    if (!createdProductId || !vaultItems.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const items = vaultItems.split('\n').map(l => l.trim()).filter(Boolean);
      const response = await fetch('/api/v1/vault/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: createdProductId,
          assetType,
          items,
          description: assetDescription || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao adicionar ao Cofre');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsSubmitting(false);
    }
  }, [createdProductId, vaultItems, assetType, assetDescription]);

  // Auth check
  if (!authLoading && !user) {
    router.push('/login');
    return null;
  }

  if (!authLoading && profile && profile.kyc_status !== 'approved' && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400 mb-2">KYC Pendente</h2>
          <p className="text-slate-400 text-sm mb-6">
            Para criar anúncios, você precisa completar a verificação de identidade.
          </p>
          <button onClick={() => router.push('/vendor/onboarding/kyc')}
            className="px-6 py-2.5 bg-blue-600 rounded-xl text-white font-medium">
            Iniciar Verificação
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Criar Anúncio</h1>
          <p className="text-slate-400 text-sm mt-1">Preencha as informações do seu produto digital</p>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mt-6 mb-8">
          {['info', 'details', 'vault'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-blue-600 text-white' :
                ['info', 'details', 'vault'].indexOf(step) > i ? 'bg-emerald-600 text-white' :
                'bg-slate-800 text-slate-400'
              }`}>{i + 1}</div>
              {i < 2 && <div className={`w-12 h-0.5 ${['info', 'details', 'vault'].indexOf(step) > i ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* PASSO 1: Info básica */}
          {step === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Título do Anúncio *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Conta Valorant Diamante + 40 Skins"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none placeholder:text-slate-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Preço (R$) *</label>
                  <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)}
                    placeholder="0,00" step="0.01" min="1"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white font-mono focus:border-blue-500 outline-none placeholder:text-slate-500" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Preço Original (opcional)</label>
                  <input type="number" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)}
                    placeholder="Para mostrar desconto" step="0.01" min="0"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white font-mono focus:border-blue-500 outline-none placeholder:text-slate-500" />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Categoria</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none">
                  <option value="">Selecione...</option>
                  <option value="jogos-contas">🎮 Jogos & Contas</option>
                  <option value="software-licencas">💿 Software & Licenças</option>
                  <option value="cursos-online">🎓 Cursos Online</option>
                  <option value="ebooks-pdfs">📚 E-books & PDFs</option>
                  <option value="design-templates">🎨 Design & Templates</option>
                  <option value="streaming-midia">🎬 Streaming & Mídia</option>
                  <option value="gift-cards">🎁 Gift Cards</option>
                  <option value="dominios-sites">🌐 Domínios & Sites</option>
                  <option value="apis-cloud">⚡ APIs & Cloud</option>
                  <option value="plugins-extensoes">🧩 Plugins & Extensões</option>
                  <option value="ia-prompts">🤖 IA & Prompts</option>
                  <option value="codigo-fonte">💻 Código Fonte</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Tipo de Entrega *</label>
                <div className="space-y-2">
                  {deliveryTypes.map(dt => (
                    <button key={dt.value} type="button" onClick={() => setDeliveryType(dt.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                        deliveryType === dt.value ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900/30 hover:border-slate-600'
                      }`}>
                      <span className={deliveryType === dt.value ? 'text-blue-400' : 'text-slate-400'}>{dt.icon}</span>
                      <div>
                        <p className={`text-sm font-medium ${deliveryType === dt.value ? 'text-blue-400' : 'text-white'}`}>{dt.label}</p>
                        <p className="text-slate-500 text-xs">{dt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => { if (title && basePrice) setStep('details'); else setError('Título e preço são obrigatórios'); }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2">
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* PASSO 2: Descrição */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Descrição do Produto</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente o que está anunciando. Quanto mais detalhes, mais confiança o comprador terá."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white min-h-[200px] resize-y focus:border-blue-500 outline-none placeholder:text-slate-500 text-sm" />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tags (separadas por vírgula)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                  placeholder="valorant, skins, diamante, conta"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none placeholder:text-slate-500" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('info')}
                  className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium transition-colors">
                  Voltar
                </button>
                <button onClick={handleSubmitProduct} disabled={isSubmitting || !title || !basePrice}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isSubmitting ? 'Criando...' : 'Criar Anúncio'}
                </button>
              </div>
            </motion.div>
          )}

          {/* PASSO 3: Cofre Digital */}
          {step === 'vault' && (
            <motion.div key="vault" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-5">
              <div className="bg-amber-900/10 border border-amber-600/20 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 text-sm font-semibold">Anúncio criado como Rascunho!</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Adicione ativos ao Cofre Digital para que o produto possa ser entregue automaticamente. Sem ativos no Cofre, o produto ficará como "Esgotado".
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Tipo de Ativo</label>
                <select value={assetType} onChange={e => setAssetType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none">
                  <option value="license_key">🔑 Chave de Licença</option>
                  <option value="account_credentials">👤 Conta/Credenciais</option>
                  <option value="download_link">🔗 Link de Download</option>
                  <option value="gift_card_code">🎁 Gift Card Code</option>
                  <option value="script_zip">📦 Script/ZIP</option>
                  <option value="api_credentials">⚡ API Credenciais</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Descrição (opcional)</label>
                <input type="text" value={assetDescription} onChange={e => setAssetDescription(e.target.value)}
                  placeholder="Ex: Steam Key - Region BR"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:border-blue-500 outline-none placeholder:text-slate-500" />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">
                  Ativos (1 por linha) — {vaultItems.split('\n').filter(l => l.trim()).length} itens
                </label>
                <textarea value={vaultItems} onChange={e => setVaultItems(e.target.value)}
                  placeholder={`XXXXX-XXXXX-XXXXX-XXXXX\nYYYYY-YYYYY-YYYYY-YYYYY\nemail1@gmail.com:senha123`}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white font-mono text-sm min-h-[200px] resize-y focus:border-blue-500 outline-none placeholder:text-slate-500" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('success')}
                  className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium transition-colors">
                  Pular (adicionar depois)
                </button>
                <button onClick={handleBulkUpload}
                  disabled={isSubmitting || !vaultItems.trim()}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  {isSubmitting ? 'Encriptando...' : `Adicionar ${vaultItems.split('\n').filter(l => l.trim()).length} ao Cofre`}
                </button>
              </div>
            </motion.div>
          )}

          {/* SUCESSO */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-3">Anúncio Criado! 🎉</h2>
              <p className="text-slate-400 mb-6">
                Seu anúncio foi criado como rascunho. Adicione mais ativos ao Cofre Digital quando quiser e publique quando estiver pronto.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => router.push('/vendor/products')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors">
                  Meus Produtos
                </button>
                <button onClick={() => {
                  setStep('info');
                  setTitle('');
                  setBasePrice('');
                  setOriginalPrice('');
                  setCategoryId('');
                  setDescription('');
                  setTags('');
                  setVaultItems('');
                  setCreatedProductId(null);
                }}
                  className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium transition-colors">
                  Criar Outro
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
