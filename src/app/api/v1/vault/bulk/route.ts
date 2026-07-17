import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { vaultEngine } from '@/domain/vault/VaultEngine';

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/vault/bulk
// Bulk upload de ativos para o Cofre Digital
// Encripta dados com AES-256-GCM antes de guardar
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, assetType, items, description } = body as {
      productId: string;
      assetType: string;
      items: string[];
      description?: string;
    };

    // Validação rigorosa
    if (!productId || !assetType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'productId, assetType e items[] são obrigatórios' },
        { status: 400 }
      );
    }

    // Limite de 500 itens por bulk upload
    if (items.length > 500) {
      return NextResponse.json(
        { error: 'Máximo de 500 itens por upload' },
        { status: 400 }
      );
    }

    // Validar assetType
    const validTypes = ['license_key', 'account_credentials', 'download_link', 'script_zip', 'course_access', 'api_credentials', 'gift_card_code', 'custom'];
    if (!validTypes.includes(assetType)) {
      return NextResponse.json({ error: `assetType inválido. Válidos: ${validTypes.join(', ')}` }, { status: 400 });
    }

    // Sanitizar items (remover vazios e duplicados)
    const uniqueItems = Array.from(new Set(items.map((i: string) => i.trim()).filter((i: string) => i.length > 0)));
    const cleanItems = uniqueItems;

    if (cleanItems.length === 0) {
      return NextResponse.json({ error: 'Nenhum item válido encontrado' }, { status: 400 });
    }

    // Verificar KYC do vendor
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Admin client não configurado" }, { status: 500 });
    const { data: profile } = await admin
      .from('profiles')
      .select('kyc_status, role')
      .eq('id', user.id)
      .single();

    if (profile?.kyc_status !== 'approved' && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'KYC não aprovado — complete a verificação para vender' },
        { status: 403 }
      );
    }

    // Executar bulk upload via VaultEngine
    const result = await vaultEngine.bulkUpload(
      productId,
      assetType as 'license_key' | 'account_credentials' | 'download_link' | 'script_zip' | 'course_access' | 'api_credentials' | 'gift_card_code' | 'custom',
      cleanItems,
      user.id,
      description
    );

    // Log de segurança
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'vault_bulk_upload',
      resource: 'digital_inventory',
      severity: 'info',
      metadata: {
        productId,
        assetType,
        itemCount: cleanItems.length,
        success: result.success,
        failed: result.failed,
      },
    });

    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
