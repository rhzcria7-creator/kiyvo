// ─────────────────────────────────────────────────────────────
// Chat Conversations API v0.0.1 — Realtime conversations/messages
// Supabase realtime subscriptions + histórico
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient()
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const conversationId = searchParams.get('conversationId')
  const limit = parseInt(searchParams.get('limit') || '50')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  if (supabase) {
    try {
      // If conversationId, get messages
      if (conversationId) {
        const { data: messages, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) throw error

        // Mark as read
        await supabase
          .from('chat_conversations')
          .update({ unread_count: 0 })
          .eq('id', conversationId)
          .eq('buyer_id', userId)

        return NextResponse.json({
          messages: (messages || []).reverse(),
        })
      }

      // List conversations
      const { data: conversations, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      return NextResponse.json({ conversations: conversations || [] })
    } catch (err) {
      console.error('Chat error:', err)
    }
  }

  return NextResponse.json({ conversations: [], messages: [] })
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()
  const body = await request.json()
  const { conversationId, senderId, receiverId, message, type } = body

  if (supabase) {
    // Create conversation if new
    let convId = conversationId

    if (!convId) {
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(buyer_id.eq.${senderId},seller_id.eq.${receiverId}),and(buyer_id.eq.${receiverId},seller_id.eq.${senderId})`)
        .maybeSingle()

      if (existing) {
        convId = existing.id
      } else {
        const { data: newConv } = await supabase
          .from('chat_conversations')
          .insert({
            buyer_id: senderId,
            seller_id: receiverId,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single()
        convId = newConv?.id
      }
    }

    // Send message
    const { data: msg, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: convId,
        sender_id: senderId,
        receiver_id: receiverId,
        message,
        type: type || 'text',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update conversation
    await supabase
      .from('chat_conversations')
      .update({
        last_message: message,
        last_message_at: new Date().toISOString(),
        last_sender_id: senderId,
      })
      .eq('id', convId)

    return NextResponse.json({ success: true, message: msg, conversationId: convId })
  }

  return NextResponse.json({ success: true, message: { id: 'demo', message } })
}
