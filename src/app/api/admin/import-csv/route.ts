// ─────────────────────────────────────────────────────────────
// Admin Import CSV v0.0.1 — Importa CSV concorrente com AI rewrite
// Parcerio Verificado badge para importados
// ─────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) return createClient(url, key, { auth: { persistSession: false } })
  return null
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const sellerId = formData.get('sellerId') as string
    const category = formData.get('category') as string
    const rewriteWithAI = formData.get('rewrite') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'Arquivo CSV é obrigatório' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(Boolean)

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV vazio ou inválido' }, { status: 400 })
    }

    // Parse CSV header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const products = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const product: Record<string, string> = {}
      headers.forEach((h, idx) => {
        product[h] = values[idx] || ''
      })
      products.push(product)
    }

    // AI rewrite (discreto - não mencionar concorrente)
    const importedProducts = await Promise.all(products.map(async (p, index) => {
      let title = p.title || p.name || `Produto ${index + 1}`
      let description = p.description || ''

      if (rewriteWithAI) {
        try {
          const geminiKey = process.env.GEMINI_API_KEY
          if (geminiKey) {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: `Reescreva este título e descrição de produto de forma única e profissional para marketplace, sem mencionar concorrentes. Mantenha o sentido original mas mude completamente as palavras:\n\nTítulo: ${title}\nDescrição: ${description}\n\nResponda apenas como JSON: {"title": "novo título", "description": "nova descrição"}` }]
                }]
              })
            })
            const data = await response.json()
            try {
              const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}')
              if (parsed.title) title = parsed.title
              if (parsed.description) description = parsed.description
            } catch {}
          }
        } catch {}
      }

      const price = parseFloat(p.price || p.preco || '0') || 29.90

      return {
        seller_id: sellerId,
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now() + '-' + index,
        description,
        price: price,
        original_price: price * 1.3,
        category: category || p.category || 'outros',
        is_active: true,
        is_approved: true,
        delivery_type: 'instant',
        // Badge "Parcerio Verificado" para importados
        tags: ['importado', 'verificado'],
      }
    }))

    // Save to Supabase
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .insert(importedProducts)
        .select()

      if (error) throw error

      return NextResponse.json({
        success: true,
        count: importedProducts.length,
        products: data,
        message: `${importedProducts.length} produtos importados${rewriteWithAI ? ' com AI rewrite' : ''}`,
      })
    }

    return NextResponse.json({
      success: true,
      count: importedProducts.length,
      products: [],
      message: `Demo: ${importedProducts.length} produtos processados`,
    })
  } catch (err) {
    console.error('Import CSV error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
