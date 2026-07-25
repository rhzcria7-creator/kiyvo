// ─────────────────────────────────────────────────────────────
// Gift Cards API v0.0.1 — Criar, validar e resgatar gift cards
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { GiftCardEngine } from '@/domain/giftcard/GiftCardEngine'

const giftCardEngine = new GiftCardEngine()

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, senderId, senderName, amount, recipientEmail, recipientName, message, code, orderId } = body

    const supabase = getSupabase()

    if (action === 'create') {
      if (!senderId || !amount || !recipientEmail) {
        return NextResponse.json({ error: 'senderId, amount, recipientEmail obrigatórios' }, { status: 400 })
      }

      const giftCard = giftCardEngine.create({
        amount,
        senderId,
        senderName: senderName || '',
        recipientEmail,
        recipientName: recipientName || '',
        message: message || '',
      })

      if (supabase) {
        await supabase.from('gift_cards').insert({
          code: giftCard.code,
          amount: giftCard.amount,
          balance: giftCard.balance,
          sender_id: senderId,
          recipient_email: recipientEmail,
          message: giftCard.message,
          expires_at: giftCard.expiresAt,
        })
      }

      // Enviar email gift card
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'KIYVO <noreply@kiyvo.com.br>',
              to: recipientEmail,
              subject: `🎁 Você ganhou um Gift Card de R$ ${amount.toFixed(2)}!`,
              html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                  <h1 style="font-size: 24px;">🎉 Gift Card KIYVO</h1>
                  <p>${senderName || 'Alguém'} te presenteou com um Gift Card de <strong>R$ ${amount.toFixed(2)}</strong>!</p>
                  ${message ? `<p>"${message}"</p>` : ''}
                  <p>Use o código: <strong style="font-size: 18px; letter-spacing: 2px;">${giftCard.code}</strong></p>
                  <a href="https://kiyvo.com.br/gift-card/redeem?code=${giftCard.code}" 
                     style="display: inline-block; padding: 12px 24px; background: #0f172a; color: white; border-radius: 999px; text-decoration: none;">
                    Resgatar Agora
                  </a>
                </div>
              `,
            }),
          })
        } catch (emailError) {
          console.error('Gift card email error:', emailError)
        }
      }

      return NextResponse.json({ success: true, giftCard: { code: giftCard.code, amount: giftCard.amount } })
    }

    if (action === 'redeem') {
      if (!code || !orderId) {
        return NextResponse.json({ error: 'code e orderId obrigatórios' }, { status: 400 })
      }

      if (supabase) {
        const { data: gc } = await supabase.from('gift_cards').select('*').eq('code', code).eq('is_active', true).single()
        if (!gc) return NextResponse.json({ error: 'Gift card inválido' }, { status: 404 })

        const { data: order } = await supabase.from('orders').select('total_amount').eq('id', orderId).single()
        if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })

        const result = giftCardEngine.redeem(
          { ...gc, amount: gc.amount, balance: gc.balance, senderId: gc.sender_id, senderName: '', recipientEmail: gc.recipient_email, recipientName: '', message: gc.message || '', status: gc.balance > 0 ? 'active' : 'exhausted', expiresAt: gc.expires_at, usedAt: null, createdAt: gc.created_at },
          orderId,
          order.total_amount
        )

        if (!result.success) {
          return NextResponse.json({ error: result.reason }, { status: 400 })
        }

        // Update gift card
        await supabase.from('gift_cards').update({
          balance: result.updatedCard!.balance,
          status: result.updatedCard!.status,
        }).eq('id', gc.id)

        // Create redemption record
        await supabase.from('gift_card_redemptions').insert({
          gift_card_id: gc.id,
          order_id: orderId,
          amount: result.redemption!.amount,
        })

        return NextResponse.json({
          success: true,
          discount: result.redemption!.amount,
          balanceRemaining: result.updatedCard!.balance,
        })
      }
    }

    if (action === 'validate') {
      if (!code) return NextResponse.json({ error: 'code obrigatório' }, { status: 400 })

      if (supabase) {
        const { data: gc } = await supabase.from('gift_cards').select('*').eq('code', code).eq('is_active', true).single()
        if (!gc) return NextResponse.json({ valid: false, reason: 'Gift card não encontrado' })

        const validation = giftCardEngine.isValid({
          ...gc, amount: gc.amount, balance: gc.balance, senderId: gc.sender_id, senderName: '', recipientEmail: gc.recipient_email, recipientName: '', message: gc.message || '', status: gc.balance > 0 ? 'active' : 'exhausted', expiresAt: gc.expires_at, usedAt: null, createdAt: gc.created_at
        })

        return NextResponse.json({
          valid: validation.valid,
          reason: validation.reason,
          balance: gc.balance,
          amount: gc.amount,
        })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Gift card error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
