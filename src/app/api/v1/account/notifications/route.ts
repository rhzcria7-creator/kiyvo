// ─────────────────────────────────────────────────────────────
// Account Notifications API v0.0.1 — Preferências de notificação
// Canais, categorias, silenciar, programação
// ─────────────────────────────────────────────────────────────

import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return errorResponse('userId obrigatório')

  const supabase = await trySupabase()
  if (!supabase) return successResponse({
    email: true, push: true, inApp: true, sms: false,
    marketing: true, orderUpdates: true, security: true,
    silentHours: { start: '22:00', end: '08:00' },
  })

  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!prefs) {
    const defaults = {
      user_id: userId,
      email_notifications: true, push_notifications: true, in_app_notifications: true, sms_notifications: false,
      marketing_emails: false, order_updates: true, security_alerts: true,
      silent_hours_start: '22:00', silent_hours_end: '08:00',
    }
    await supabase.from('notification_preferences').insert(defaults)
    return successResponse(defaults)
  }

  return successResponse({
    email: prefs.email_notifications, push: prefs.push_notifications,
    inApp: prefs.in_app_notifications, sms: prefs.sms_notifications,
    marketing: prefs.marketing_emails, orderUpdates: prefs.order_updates,
    security: prefs.security_alerts,
    silentHours: { start: prefs.silent_hours_start, end: prefs.silent_hours_end },
  })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { userId, ...preferences } = body
  if (!userId) return errorResponse('userId obrigatório')

  const supabase = await trySupabase()
  if (!supabase) return successResponse({ saved: true, preferences })

  const updateData: Record<string, any> = {}
  if (preferences.email !== undefined) updateData.email_notifications = preferences.email
  if (preferences.push !== undefined) updateData.push_notifications = preferences.push
  if (preferences.inApp !== undefined) updateData.in_app_notifications = preferences.inApp
  if (preferences.sms !== undefined) updateData.sms_notifications = preferences.sms
  if (preferences.marketing !== undefined) updateData.marketing_emails = preferences.marketing
  if (preferences.orderUpdates !== undefined) updateData.order_updates = preferences.orderUpdates
  if (preferences.security !== undefined) updateData.security_alerts = preferences.security
  if (preferences.silentHours?.start) updateData.silent_hours_start = preferences.silentHours.start
  if (preferences.silentHours?.end) updateData.silent_hours_end = preferences.silentHours.end

  const { error } = await supabase.from('notification_preferences').upsert({
    user_id: userId, ...updateData, updated_at: new Date().toISOString(),
  })
  if (error) return errorResponse(error.message)
  return successResponse({ saved: true })
}
