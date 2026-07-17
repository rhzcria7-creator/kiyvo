import { NextResponse } from 'next/server'

// GET /api/notifications
export async function GET() {
  const notifications = [
    { id: '1', type: 'order', title: 'Novo pedido!', message: 'Você recebeu um pedido de Windows 11 Pro', is_read: false, created_at: '2 min atrás' },
    { id: '2', type: 'review', title: 'Nova avaliação', message: 'SoftVault avaliou sua entrega com 5 estrelas', is_read: false, created_at: '15 min atrás' },
    { id: '3', type: 'system', title: 'Verificação aprovada', message: 'Sua verificação de identidade foi aprovada', is_read: true, created_at: '1h atrás' },
    { id: '4', type: 'promotion', title: 'Cupom disponível!', message: 'Use DIGITAL20 para 20% de desconto', is_read: true, created_at: '3h atrás' },
    { id: '5', type: 'withdrawal', title: 'Saque processado', message: 'Seu saque de R$ 450,00 foi processado com sucesso', is_read: true, created_at: '1 dia atrás' },
  ]

  return NextResponse.json({ data: notifications, unread: notifications.filter(n => !n.is_read).length })
}

// PUT /api/notifications — Mark as read
export async function PUT(request: Request) {
  const body = await request.json()
  return NextResponse.json({ success: true, id: body.id })
}
