// ─────────────────────────────────────────────────────────────
// KYC API v0.0.1 — Submissão e verificação de KYC
// Upload selfie + documento, revisão admin
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const selfieFile = formData.get('selfie') as File
    const docFile = formData.get('document') as File
    const docType = formData.get('documentType') as string
    const cpf = formData.get('cpf') as string
    const fullName = formData.get('fullName') as string
    const birthDate = formData.get('birthDate') as string

    if (!userId || !cpf || !fullName) {
      return NextResponse.json({ error: 'userId, cpf e fullName são obrigatórios' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 501 })
    }

    // Upload files to Supabase Storage
    let selfieUrl = ''
    let docUrl = ''

    if (selfieFile) {
      const selfieBytes = await selfieFile.arrayBuffer()
      const selfiePath = `kyc/${userId}/selfie_${Date.now()}.${selfieFile.name.split('.').pop()}`
      const { error: selfieError } = await supabase.storage
        .from('vendor-docs')
        .upload(selfiePath, selfieBytes, { contentType: selfieFile.type })

      if (!selfieError) {
        const { data: selfieData } = supabase.storage.from('vendor-docs').getPublicUrl(selfiePath)
        selfieUrl = selfieData.publicUrl
      }
    }

    if (docFile) {
      const docBytes = await docFile.arrayBuffer()
      const docPath = `kyc/${userId}/doc_${Date.now()}.${docFile.name.split('.').pop()}`
      const { error: docError } = await supabase.storage
        .from('vendor-docs')
        .upload(docPath, docBytes, { contentType: docFile.type })

      if (!docError) {
        const { data: docData } = supabase.storage.from('vendor-docs').getPublicUrl(docPath)
        docUrl = docData.publicUrl
      }
    }

    // Save KYC submission
    const { data: kyc, error } = await supabase
      .from('kyc_submissions')
      .insert({
        user_id: userId,
        selfie_url: selfieUrl,
        document_url: docUrl,
        document_type: docType || 'cnh',
        cpf: cpf.replace(/\D/g, ''),
        full_name: fullName,
        birth_date: birthDate,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    // Update profile
    await supabase.from('profiles').update({
      kyc_status: 'submitted',
      kyc_selfie_url: selfieUrl,
      kyc_doc_url: docUrl,
    }).eq('user_id', userId)

    return NextResponse.json({ success: true, kyc })
  } catch (err) {
    console.error('KYC error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { kycId, status, rejectionReason, adminId } = body

    if (!kycId || !status) {
      return NextResponse.json({ error: 'kycId e status obrigatórios' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase não configurado' }, { status: 501 })
    }

    const updateData: any = {
      status,
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    }

    if (status === 'rejected') {
      updateData.rejection_reason = rejectionReason || 'Documentos não aprovados'
    }

    const { data: kyc, error } = await supabase
      .from('kyc_submissions')
      .update(updateData)
      .eq('id', kycId)
      .select()
      .single()

    if (error) throw error

    // Update profile KYC status
    if (kyc) {
      await supabase.from('profiles').update({
        kyc_status: status === 'approved' ? 'approved' : 'rejected',
      }).eq('user_id', kyc.user_id)
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: status === 'approved' ? 'user.kyc_approved' : 'user.kyc_rejected',
      actor_id: adminId || 'system',
      actor_role: adminId ? 'admin' : 'system',
      target: kycId,
      target_type: 'kyc',
      description: `KYC ${status}: ${rejectionReason || 'Aprovado'}`,
    })

    return NextResponse.json({ success: true, kyc })
  } catch (err) {
    console.error('KYC review error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
