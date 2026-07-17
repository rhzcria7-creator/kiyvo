import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

// ═══════════════════════════════════════════════════════════════
// POST /api/v1/kyc/upload
// Upload de documentos KYC para Supabase Storage (bucket privado)
// O vendor NÃO pode ler após upload — apenas admin
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Admin client não configurado" }, { status: 500 });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string | null;

    if (!file || !documentType) {
      return NextResponse.json({ error: 'Arquivo e tipo de documento são obrigatórios' }, { status: 400 });
    }

    // Validar tipo de documento
    const validTypes = ['cpf_cnpj', 'id_front', 'id_back', 'selfie_with_doc', 'proof_of_address', 'business_registration'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json({ error: 'Tipo de documento inválido' }, { status: 400 });
    }

    // Validar arquivo
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Arquivo excede o limite de 10MB' }, { status: 400 });
    }

    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado. Use JPG, PNG, WebP ou PDF.' }, { status: 400 });
    }

    // Gerar path único no Storage: vendor-docs/{userId}/{docType}_{timestamp}.{ext}
    const ext = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const filePath = `${user.id}/${documentType}_${timestamp}.${ext}`;

    // Upload para bucket privado
    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await admin.storage
      .from('vendor-docs')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Erro no upload: ${uploadError.message}` }, { status: 500 });
    }

    // Calcular hash do arquivo para integridade
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Registrar no banco
    const { error: dbError } = await admin
      .from('kyc_documents')
      .insert({
        user_id: user.id,
        document_type: documentType,
        file_path: filePath,
        file_hash: fileHash,
        file_size_bytes: file.size,
        mime_type: file.type,
        status: 'pending',
      });

    if (dbError) {
      // Tentar limpar o arquivo do storage
      await admin.storage.from('vendor-docs').remove([filePath]);
      return NextResponse.json({ error: `Erro ao registrar documento: ${dbError.message}` }, { status: 500 });
    }

    // Log de segurança
    await admin.from('security_events').insert({
      user_id: user.id,
      event_type: 'kyc_submitted',
      severity: 'info',
      metadata: { documentType, fileSize: file.size, fileHash },
    });

    return NextResponse.json({
      success: true,
      filePath,
      documentType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
