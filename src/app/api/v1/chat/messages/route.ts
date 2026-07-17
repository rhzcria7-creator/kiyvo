// ─────────────────────────────────────────────────────────────
// API v1 Chat Messages — Envio e listagem de mensagens
// Dados reais do Supabase, zero mock
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'

function getAdmin() {
  const client = createAdminClient()
  if (!client) throw new Error('Admin client não configurado')
  return client
}

/**
 * GET /api/v1/chat/messages?conversation_id=xxx&limit=50
 * Busca mensagens de uma conversa
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const admin = getAdmin()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    if (!conversationId) {
      return NextResponse.json({ error: 'conversation_id é obrigatório' }, { status: 400 })
    }

    // Verificar que o usuário participa da conversa
    const { data: conversation, error: convError } = await admin
      .from('chat_conversations')
      .select('id, buyer_id, vendor_id')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    const conv = conversation as Record<string, unknown>
    if (conv.buyer_id !== user.id && conv.vendor_id !== user.id) {
      // Verificar se é admin
      const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Buscar mensagens
    const { data: messages, error } = await admin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Marcar mensagens não lidas como lidas
    await admin
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({ messages: messages || [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * POST /api/v1/chat/messages — Enviar mensagem
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const admin = getAdmin()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimit(ip, 30, 60000)
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const { conversation_id, content, message_type } = body

    if (!conversation_id || !content) {
      return NextResponse.json({ error: 'conversation_id e content são obrigatórios' }, { status: 400 })
    }

    if (String(content).length > 2000) {
      return NextResponse.json({ error: 'Mensagem muito longa (máximo 2000 caracteres)' }, { status: 400 })
    }

    // Verificar participação na conversa
    const { data: conversation } = await admin
      .from('chat_conversations')
      .select('id, buyer_id, vendor_id, order_id')
      .eq('id', conversation_id)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 })
    }

    const conv = conversation as Record<string, unknown>
    if (conv.buyer_id !== user.id && conv.vendor_id !== user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const sanitizedContent = sanitizeInput(String(content))

    // Criar mensagem
    const { data: message, error } = await admin
      .from('chat_messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content: sanitizedContent,
        message_type: message_type || 'text',
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Atualizar última mensagem na conversa
    await admin
      .from('chat_conversations')
      .update({
        last_message: sanitizedContent.substring(0, 100),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation_id)

    // Criar notificação para o destinatário
    const recipientId = conv.buyer_id === user.id ? conv.vendor_id : conv.buyer_id
    await admin.from('notifications').insert({
      user_id: recipientId as string,
      type: 'chat',
      title: 'Nova mensagem 📨',
      message: sanitizedContent.substring(0, 50),
      link: `/chat?conversation=${conversation_id}`,
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
