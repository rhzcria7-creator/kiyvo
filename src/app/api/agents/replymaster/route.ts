export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, sanitizeInput } from '@/lib/security'
import { trackUsage, checkLimit } from '@/lib/agents/storage'
import { AGENT_LIMITS } from '@/lib/agents/plans'
import { generateReply, type ReplyTone, type ReplyChannel } from '@/lib/agents/replymaster'

const LIMITS = { free: 5, plus: 30, pro: 100, vendor_pro: 500, staff: 9999 }

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rl = rateLimit(ip, 30, 60000)
    if (!rl.allowed) return NextResponse.json({ error: 'Muitas requisições' }, { status: 429 })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || `anon_${ip.replace(/\./g, '_')}`
    const plano = user ? (await supabase.from('profiles').select('plano,role').eq('id', user.id).single()).data?.plano as string || 'free' : 'free'
    const limitKey = (plano in LIMITS ? plano : 'free') as keyof typeof LIMITS
    if (!checkLimit(userId, 'replymaster', AGENT_LIMITS.replymaster[limitKey] ?? LIMITS.free))
      return NextResponse.json({ error: 'Limite diário atingido' }, { status: 429 })

    const body = await req.json().catch(() => ({}))
    const msg = typeof body.mensagem === 'string' ? sanitizeInput(body.mensagem).slice(0, 1000) : ''
    if (!msg || msg.length < 5) return NextResponse.json({ error: 'Mensagem muito curta' }, { status: 400 })

    const tom: ReplyTone = ['educado','urgente','carismatico','formal','desculpa','reembolso'].includes(body.tom) ? body.tom : 'educado'
    const canal: ReplyChannel = ['whatsapp','email','chat','instagram'].includes(body.canal) ? body.canal : 'chat'

    const r = generateReply({
      mensagemCliente: msg,
      contexto: typeof body.contexto === 'string' ? sanitizeInput(body.contexto).slice(0, 500) : '',
      tom, canal,
      nomeCliente: typeof body.nomeCliente === 'string' ? sanitizeInput(body.nomeCliente).slice(0, 60) : undefined,
      nomeAtendente: typeof body.nomeAtendente === 'string' ? sanitizeInput(body.nomeAtendente).slice(0, 60) : 'Equipe KIYVO',
    })

    trackUsage(userId, 'replymaster')
    return NextResponse.json({ ok: true, result: r })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
