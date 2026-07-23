export const runtime = 'nodejs'
import { gerarFatura } from '@/lib/agents/invoicegen'
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => ({}))
    return Response.json(gerarFatura({
      numero: b.numero || ('K' + Date.now().toString().slice(-8)),
      emissor: b.emissor || { nome: 'KIYVO', cnpj: '00.000.000/0001-00' },
      cliente: b.cliente || { nome: b.clienteNome || 'Cliente' },
      itens: b.itens || [{ descricao: b.produto || 'Produto digital', preco: Number(b.preco||97), qtd: 1 }],
      desconto: b.desconto ? Number(b.desconto) : 0,
      formaPagamento: b.pagamento || 'PIX',
    }))
  } catch { return Response.json({ error: 'Erro interno' }, { status: 500 }) }
}
