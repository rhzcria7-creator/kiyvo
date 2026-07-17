import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function getAdmin() {
  const client = createAdminClient();
  if (!client) throw new Error("Admin client não configurado");
  return client;
}

// ═══════════════════════════════════════════════════════════════
// GET /api/v1/admin/kyc — Listar pendências de KYC (admin only)
// POST /api/v1/admin/kyc — Aprovar/rejeitar KYC (admin only)
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito — admin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Buscar utilizadores com KYC pendente
    const { data: users, error } = await admin
      .from('profiles')
      .select('id, full_name, kyc_status, kyc_submitted_at, kyc_documents(*)')
      .eq('kyc_status', status === 'pending' ? 'docs_uploaded' : status)
      .order('kyc_submitted_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar pendências' }, { status: 500 });
    }

    // Buscar emails via auth (admin only)
    const usersWithEmail = (users || []).map((u: Record<string, unknown>) => ({
      userId: u.id,
      fullName: u.full_name,
      kycStatus: u.kyc_status,
      submittedAt: u.kyc_submitted_at,
      documents: u.kyc_documents || [],
      email: '***@***.***',  // Email protegido — expor apenas no backoffice
    }));

    return NextResponse.json({ users: usersWithEmail });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = getAdmin();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, rejectionReason } = body as { userId: string; action: 'approve' | 'reject'; rejectionReason?: string };

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId e action são obrigatórios' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const updates: Record<string, unknown> = {
      kyc_status: newStatus,
    };

    if (action === 'approve') {
      updates.kyc_approved_at = new Date().toISOString();
      updates.verification_status = 'identity_verified';
    }

    if (action === 'reject') {
      updates.kyc_rejection_reason = rejectionReason || 'Documento não aprovado';
    }

    // Atualizar profile
    const { error: profileError } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (profileError) {
      return NextResponse.json({ error: 'Erro ao atualizar KYC' }, { status: 500 });
    }

    // Atualizar documentos
    if (action === 'approve') {
      await admin
        .from('kyc_documents')
        .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('status', 'pending');
    } else {
      await admin
        .from('kyc_documents')
        .update({ status: 'rejected', reviewed_by: user.id, reviewed_at: new Date().toISOString(), rejection_reason: rejectionReason })
        .eq('user_id', userId)
        .eq('status', 'pending');
    }

    // Notificar o utilizador
    await admin.from('notifications').insert({
      user_id: userId,
      type: 'system',
      title: action === 'approve' ? '✅ KYC Aprovado!' : '❌ KYC Rejeitado',
      message: action === 'approve'
        ? 'Sua verificação de identidade foi aprovada. Você já pode vender no Kiyvo!'
        : `Sua verificação foi rejeitada. Motivo: ${rejectionReason || 'Documento não aprovado'}. Você pode reenviar.`,
      link: action === 'approve' ? '/vendor/dashboard' : '/vendor/onboarding/kyc',
    });

    // Log de auditoria
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: action === 'approve' ? 'kyc_approved' : 'kyc_rejected',
      resource: 'profiles',
      severity: action === 'approve' ? 'info' : 'warning',
      metadata: { targetUserId: userId, rejectionReason },
    });

    return NextResponse.json({ success: true, userId, action });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
