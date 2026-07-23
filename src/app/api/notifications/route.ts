// API: Notificações (lista + mark as read)
// Implementação em memória + localStorage (em produção usa Supabase realtime)
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'

export type NotifTipo = 'compra' | 'venda' | 'afiliado' | 'cupom' | 'sistema' | 'review' | 'freela' | 'kd'

export interface Notification {
  id: string
  tipo: NotifTipo
  titulo: string
  mensagem: string
  link?: string
  criadaEm: string
  lida: boolean
  icone: string
}

export async function GET() {
  try {
    // Em produção: SELECT * FROM notifications WHERE user_id = auth.uid() ORDER BY criadaEm DESC LIMIT 50
    // Por enquanto retorna notificações de exemplo
    const demo: Notification[] = [
      { id: 'n1', tipo: 'sistema', titulo: '🎉 KIYVO atualizou!', mensagem: '23 agentes IA disponíveis, novo sistema de conquistas e bug fixes.', criadaEm: new Date().toISOString(), lida: false, icone: 'sparkles' },
      { id: 'n2', tipo: 'cupom', titulo: 'Cupom BOASVINDAS disponível', mensagem: '10% OFF válido no primeiro pedido.', link: '/cupons', criadaEm: new Date(Date.now() - 3600000).toISOString(), lida: false, icone: 'tag' },
      { id: 'n3', tipo: 'kd', titulo: 'KD Points bônus', mensagem: 'Complete seu cadastro e ganhe +100 KD Points.', criadaEm: new Date(Date.now() - 86400000).toISOString(), lida: true, icone: 'coins' },
    ]
    return NextResponse.json({ notificacoes: demo, total: demo.length, naoLidas: demo.filter(n => !n.lida).length })
  } catch {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    if (body.acao === 'marcar_lida' && body.id) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
