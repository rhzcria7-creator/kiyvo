// Helper genérico para rotas POST dos agentes
import { NextRequest, NextResponse } from 'next/server'
export function criarRotaAgente<T>(
  fn: (input: T) => any,
  validar: (body: any) => { ok: boolean; erro?: string; input?: T },
) {
  return async function POST(req: NextRequest) {
    try {
      const body = await req.json().catch(() => ({}))
      const v = validar(body)
      if (!v.ok) return NextResponse.json({ error: v.erro || 'Dados inválidos' }, { status: 400 })
      const out = fn(v.input as T)
      return NextResponse.json(out)
    } catch (e: any) {
      return NextResponse.json({ error: 'Erro interno', detalhe: e?.message }, { status: 500 })
    }
  }
}
