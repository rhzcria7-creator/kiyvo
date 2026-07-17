// ═══════════════════════════════════════════════════════════════
// KIYVO — VaultEngine v6.0 (O Cofre Digital)
// Motor de encriptação, reserva e entrega de ativos digitais
// NENHUM dado mock. Tudo via Supabase + encriptação AES-256-GCM
// ═══════════════════════════════════════════════════════════════

import { createAdminClient } from '@/lib/supabase/server';

// Helper para obter admin client com tipagem correta
function getAdmin(): NonNullable<ReturnType<typeof createAdminClient>> {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}


// ───────────────────────────────────────────────────────────────
// Tipos do Vault
// ───────────────────────────────────────────────────────────────

type AssetType = 'license_key' | 'account_credentials' | 'download_link' | 'script_zip' | 'course_access' | 'api_credentials' | 'gift_card_code' | 'custom';

type AssetStatus = 'available' | 'reserved' | 'sold' | 'revoked' | 'expired';

interface VaultAsset {
  id: string;
  productId: string;
  variantId: string | null;
  assetType: AssetType;
  assetDataEncrypted: string;
  assetDataIv: string | null;
  assetDataTag: string | null;
  assetDescription: string | null;
  status: AssetStatus;
  soldToOrderId: string | null;
  soldToOrderItemId: string | null;
  soldAt: string | null;
  reservedAt: string | null;
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DeliveredAsset {
  assetType: AssetType;
  decryptedData: string;
  description: string | null;
}

interface VaultUploadInput {
  productId: string;
  variantId?: string;
  assetType: AssetType;
  assetData: string;  // Dado em texto puro — será encriptado antes de guardar
  description?: string;
  expiresAt?: string;
}

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
}

interface VaultStats {
  totalAssets: number;
  available: number;
  reserved: number;
  sold: number;
  revoked: number;
  expired: number;
}

// ───────────────────────────────────────────────────────────────
// Encriptação AES-256-GCM (Web Crypto API — browser + Node 18+)
// ═══════════════════════════════════════════════════════════════

const VAULT_ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || 'kiyvo-vault-key-change-in-production-32bytes!';

/**
 * Deriva uma chave AES-256-GCM a partir do secret do ambiente
 * Usa PBKDF2 com salt fixo (em produção, usar salt aleatório por asset)
 */
async function deriveKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(VAULT_ENCRYPTION_KEY),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('kiyvo-v6-salt-stable'),  // Salt estável para consistência
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encripta um texto plano com AES-256-GCM
 * Retorna: { encrypted (base64), iv (base64), tag (base64) }
 */
async function encryptAssetData(plaintext: string): Promise<{
  encrypted: string;
  iv: string;
  tag: string;
}> {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  // AES-GCM: os últimos 16 bytes são o authentication tag
  const encryptedBuffer = new Uint8Array(ciphertext);
  const tagBuffer = encryptedBuffer.slice(-16);
  const dataBuffer = encryptedBuffer.slice(0, -16);

  return {
    encrypted: Buffer.from(dataBuffer).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
    tag: Buffer.from(tagBuffer).toString('base64'),
  };
}

/**
 * Decripta um ativo com AES-256-GCM
 * Retorna o texto plano original
 */
async function decryptAssetData(
  encryptedBase64: string,
  ivBase64: string,
  tagBase64: string
): Promise<string> {
  const key = await deriveKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const dataBuffer = Buffer.from(encryptedBase64, 'base64');
  const tagBuffer = Buffer.from(tagBase64, 'base64');

  // Reconstruir ciphertext + tag para o Web Crypto API
  const combined = new Uint8Array(dataBuffer.length + tagBuffer.length);
  combined.set(dataBuffer);
  combined.set(tagBuffer, dataBuffer.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    combined
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// ───────────────────────────────────────────────────────────────
// VAULT ENGINE — Classe principal
// ═══════════════════════════════════════════════════════════════

class VaultEngine {
  /**
   * Adiciona um ativo ao Cofre Digital
   * Encripta os dados antes de guardar no banco
   */
  async addAsset(input: VaultUploadInput, vendorUserId: string): Promise<{ success: boolean; assetId?: string; error?: string }> {
    try {
      const supabase = getAdmin();
      

      // Verificar que o vendor é dono do produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, vendor_id, vendors!inner(user_id)')
        .eq('id', input.productId)
        .single();

      if (productError || !product) {
        return { success: false, error: 'Produto não encontrado' };
      }

      const vendorData = product.vendors as unknown as { user_id: string };
      if (vendorData.user_id !== vendorUserId) {
        return { success: false, error: 'Acesso negado — não é o dono do produto' };
      }

      // Encriptar o dado sensível
      const encrypted = await encryptAssetData(input.assetData);

      // Inserir no cofre
      const { data, error } = await supabase
        .from('digital_inventory')
        .insert({
          product_id: input.productId,
          variant_id: input.variantId || null,
          asset_type: input.assetType,
          asset_data_encrypted: encrypted.encrypted,
          asset_data_iv: encrypted.iv,
          asset_data_tag: encrypted.tag,
          asset_description: input.description || null,
          status: 'available',
          created_by: vendorUserId,
          expires_at: input.expiresAt || null,
        })
        .select('id')
        .single();

      if (error) {
        return { success: false, error: `Erro ao guardar ativo: ${error.message}` };
      }

      // Atualizar stock_quantity do produto
      await supabase.rpc('increment_product_stock', { p_product_id: input.productId });

      return { success: true, assetId: data.id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: `VaultEngine.addAsset: ${message}` };
    }
  }

  /**
   * Upload em massa — bulk insert de ativos via array
   * Ideal para upload de TXT com múltiplas keys
   */
  async bulkUpload(
    productId: string,
    assetType: AssetType,
    items: string[],  // Array de dados em texto puro
    vendorUserId: string,
    description?: string
  ): Promise<BulkUploadResult> {
    const result: BulkUploadResult = { success: 0, failed: 0, errors: [] };

    try {
      const supabase = getAdmin();
      

      // Verificar posse do produto
      const { data: product } = await supabase
        .from('products')
        .select('id, vendors!inner(user_id)')
        .eq('id', productId)
        .single();

      if (!product) {
        result.errors.push('Produto não encontrado');
        result.failed = items.length;
        return result;
      }

      const vendorData = product.vendors as unknown as { user_id: string };
      if (vendorData.user_id !== vendorUserId) {
        result.errors.push('Acesso negado');
        result.failed = items.length;
        return result;
      }

      // Encriptar e preparar batch
      const insertBatch = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i].trim();
        if (!item) continue;

        try {
          const encrypted = await encryptAssetData(item);
          insertBatch.push({
            product_id: productId,
            asset_type: assetType,
            asset_data_encrypted: encrypted.encrypted,
            asset_data_iv: encrypted.iv,
            asset_data_tag: encrypted.tag,
            asset_description: description || null,
            status: 'available' as const,
            created_by: vendorUserId,
          });
        } catch {
          result.errors.push(`Linha ${i + 1}: falha na encriptação`);
          result.failed++;
        }
      }

      if (insertBatch.length === 0) {
        return result;
      }

      // Inserir em batches de 100 para não estourar limites
      const BATCH_SIZE = 100;
      for (let i = 0; i < insertBatch.length; i += BATCH_SIZE) {
        const batch = insertBatch.slice(i, i + BATCH_SIZE);
        const { error } = await supabase
          .from('digital_inventory')
          .insert(batch);

        if (error) {
          result.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
          result.failed += batch.length;
        } else {
          result.success += batch.length;
        }
      }

      // Atualizar stock
      await supabase
        .from('products')
        .update({ stock_quantity: insertBatch.length })
        .eq('id', productId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      result.errors.push(message);
      result.failed = items.length - result.success;
    }

    return result;
  }

  /**
   * Reserva um ativo do Cofre para um checkout
   * Usa a função RPC atômica (FOR UPDATE SKIP LOCKED)
   * Chamado QUANDO o checkout é criado (antes do pagamento)
   */
  async reserveAsset(
    productId: string,
    variantId: string | null,
    orderId: string,
    orderItemId: string
  ): Promise<{ success: boolean; assetId?: string; error?: string }> {
    try {
      const supabase = getAdmin();
      

      const { data, error } = await supabase.rpc('reserve_inventory_asset', {
        p_product_id: productId,
        p_variant_id: variantId,
        p_order_id: orderId,
        p_order_item_id: orderItemId,
      });

      if (error) {
        return { success: false, error: `Erro ao reservar ativo: ${error.message}` };
      }

      if (!data) {
        return { success: false, error: 'Sem estoque disponível — ativo não encontrado' };
      }

      return { success: true, assetId: data as string };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: `VaultEngine.reserveAsset: ${message}` };
    }
  }

  /**
   * Entrega o ativo ao comprador (APÓS pagamento confirmado)
   * Decripta os dados e retorna para o frontend
   * Apenas via API route com service_role — NUNCA client-side
   */
  async deliverAsset(orderItemId: string, buyerId: string): Promise<{ success: boolean; asset?: DeliveredAsset; error?: string }> {
    try {
      const supabase = getAdmin();
      

      // Usar função RPC que marca como sold e retorna dados
      const { data, error } = await supabase.rpc('mark_asset_sold', {
        p_order_item_id: orderItemId,
      });

      if (error) {
        return { success: false, error: `Erro ao marcar ativo como vendido: ${error.message}` };
      }

      if (!data || data.length === 0) {
        return { success: false, error: 'Ativo não encontrado para esta ordem' };
      }

      const assetRow = data[0];

      // Decriptar os dados sensíveis
      const decryptedData = await decryptAssetData(
        assetRow.asset_data_encrypted,
        assetRow.asset_data_iv,
        assetRow.asset_data_tag
      );

      // Registrar evento na escrow_timeline
      await supabase.from('escrow_timeline').insert({
        order_id: (await supabase.from('digital_inventory').select('sold_to_order_id').eq('sold_to_order_item_id', orderItemId).single()).data?.sold_to_order_id,
        event_type: 'asset_delivered',
        actor_id: buyerId,
        metadata: { asset_type: assetRow.asset_type },
      });

      return {
        success: true,
        asset: {
          assetType: assetRow.asset_type as AssetType,
          decryptedData,
          description: assetRow.asset_description,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: `VaultEngine.deliverAsset: ${message}` };
    }
  }

  /**
   * Revoga um ativo (chargeback / disputa vencida pelo comprador)
   * Marca como revoked, NÃO apaga (auditoria)
   */
  async revokeAsset(orderItemId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getAdmin();
      

      const { error } = await supabase
        .from('digital_inventory')
        .update({ status: 'revoked' })
        .eq('sold_to_order_item_id', orderItemId);

      if (error) {
        return { success: false, error: `Erro ao revogar ativo: ${error.message}` };
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: `VaultEngine.revokeAsset: ${message}` };
    }
  }

  /**
   * Obtém estatísticas do cofre para um produto
   * Visão do vendor (quantos assets disponíveis, reservados, etc.)
   */
  async getProductVaultStats(productId: string, vendorUserId: string): Promise<{ success: boolean; stats?: VaultStats; error?: string }> {
    try {
      const supabase = getAdmin();
      

      // Verificar posse
      const { data: product } = await supabase
        .from('products')
        .select('id, vendors!inner(user_id)')
        .eq('id', productId)
        .single();

      if (!product) {
        return { success: false, error: 'Produto não encontrado' };
      }

      const vendorData = product.vendors as unknown as { user_id: string };
      if (vendorData.user_id !== vendorUserId) {
        return { success: false, error: 'Acesso negado' };
      }

      const { data, error } = await supabase
        .from('digital_inventory')
        .select('status')
        .eq('product_id', productId);

      if (error) {
        return { success: false, error: error.message };
      }

      const stats: VaultStats = {
        totalAssets: data.length,
        available: data.filter((d: { status: string }) => d.status === 'available').length,
        reserved: data.filter((d: { status: string }) => d.status === 'reserved').length,
        sold: data.filter((d: { status: string }) => d.status === 'sold').length,
        revoked: data.filter((d: { status: string }) => d.status === 'revoked').length,
        expired: data.filter((d: { status: string }) => d.status === 'expired').length,
      };

      return { success: true, stats };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: `VaultEngine.getProductVaultStats: ${message}` };
    }
  }

  /**
   * Libera assets reservados que não foram pagos (checkout expirado)
   * Chamado por Edge Function / cron
   */
  async releaseExpiredReservations(olderThanMinutes: number = 30): Promise<{ released: number }> {
    try {
      const supabase = getAdmin();
      
      const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('digital_inventory')
        .update({
          status: 'available',
          sold_to_order_id: null,
          sold_to_order_item_id: null,
          reserved_at: null,
        })
        .eq('status', 'reserved')
        .lt('reserved_at', cutoff)
        .select('id');

      if (error) {
        return { released: 0 };
      }

      return { released: data?.length || 0 };
    } catch {
      return { released: 0 };
    }
  }

  /**
   * Verifica se um produto tem estoque no cofre
   * Usado antes de permitir checkout
   */
  async checkStock(productId: string): Promise<{ inStock: boolean; available: number }> {
    try {
      const supabase = getAdmin();
      

      const { count, error } = await supabase
        .from('digital_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .eq('status', 'available');

      if (error) {
        return { inStock: false, available: 0 };
      }

      return { inStock: (count || 0) > 0, available: count || 0 };
    } catch {
      return { inStock: false, available: 0 };
    }
  }
}

// Singleton exportado
export const vaultEngine = new VaultEngine();
export { VaultEngine };
export type {
  VaultAsset,
  DeliveredAsset,
  VaultUploadInput,
  BulkUploadResult,
  VaultStats,
  AssetType,
  AssetStatus,
};
