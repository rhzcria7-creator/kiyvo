import { NextRequest } from 'next/server'
import { successResponse, errorResponse, trySupabase } from '@/lib/supabase/api-helper'
import { campaignEngine } from '@/domain/campaign/CampaignEngine'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url); const userId = searchParams.get('userId')
  const supabase = await trySupabase()
  if (!supabase) return successResponse([])
  let query = supabase.from('campaigns').select('*, campaigns_analytics(*)')
  if (userId) query = query.eq('created_by', userId)
  const { data } = await query.order('created_at', { ascending: false }).limit(20)
  return successResponse(data || [])
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, subject, message, channel, segment, scheduledAt, createdBy, totalUsers } = body
  if (!name || !subject || !message || !createdBy) return errorResponse('name, subject, message e createdBy obrigatórios')
  const supabase = await trySupabase()
  const campaign = campaignEngine.create({ name, subject, message, channel: channel || 'email', segment: segment || 'all', scheduledAt, createdBy, totalUsers: totalUsers || 1000 })
  if (supabase) {
    const { data, error } = await supabase.from('campaigns').insert({
      name, subject, message, channel: campaign.channel, segment: campaign.segment,
      scheduled_at: campaign.scheduledAt, status: campaign.status,
      total_recipients: campaign.totalRecipients, created_by: createdBy,
    }).select().single()
    if (error) return errorResponse(error.message)
    return successResponse(data)
  }
  return successResponse(campaign)
}
