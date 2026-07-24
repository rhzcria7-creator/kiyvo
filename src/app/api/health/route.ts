// GET /api/health — health check público (usado pelo Vercel e monitoramento)
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'kiyvo',
    version: '10.0.0',
    timestamp: new Date().toISOString(),
    agents: 180,
  }, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
