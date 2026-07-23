// ─────────────────────────────────────────────────────────────
// KIYVO Official Catalog
// Catálogo da CONTA OFICIAL da KIYVO — produtos de parceiros
// (GGMax / G2A / Kinguin / fornecedores nacionais) listados
// diretamente pela loja "KIYVO Oficial" (verified_official).
// Funcionamento tipo DROPSHIPPING DESFAÇADO:
//   - O produto aparece como "vendido por KIYVO Oficial"
//   - Ao pagar, o motor de fulfillment chama o supplier
//     automaticamente e entrega a chave em segundos.
//   - Margem da plataforma = diferença entre preço supplier × venda.
// Por enquanto os suppliers estão configurados via MOCK de
// adapters mas o contrato (SupplierAdapter) aceita troca fácil
// por integrações reais via API quando credenciais existirem.
// ─────────────────────────────────────────────────────────────

export interface CatalogProduct {
  sku: string                       // id único no catálogo oficial
  supplier: 'ggmax' | 'kinguin' | 'g2a' | 'nuuvem' | 'nacional'
  category: string
  title: string
  shortDescription: string
  /** preço BRL (pode ser atualizado via job) */
  priceBrl: number
  /** preço original para desconto visual */
  originalPriceBrl?: number
  imageUrl?: string
  tags: string[]
  /** tempo de entrega estimado */
  deliveryEta: string
  /** entrega instantânea? */
  instant: boolean
  /** região da chave */
  region: 'BR' | 'LATAM' | 'GLOBAL' | 'EU' | 'US'
  /** plataforma */
  platform: 'Steam' | 'Epic' | 'Origin' | 'Ubisoft' | 'Xbox' | 'PlayStation' | 'Netflix' | 'Spotify' | 'Outro'
}

// ─── CATÁLOGO INICIAL (GGMax-style: gift cards, games, software) ─
// Será expandido via jobs/sync posteriormente.
export const OFFICIAL_CATALOG: CatalogProduct[] = [
  // ── Gift Cards ──────────────────────────────────────
  {
    sku: 'GC-STEAM-50',
    supplier: 'nacional',
    category: 'giftcards',
    title: 'Gift Card Steam R$ 50',
    shortDescription: 'Crédito pré-pago para carteira Steam. Resgate imediato.',
    priceBrl: 52.90,
    originalPriceBrl: 59.90,
    tags: ['steam', 'gift card', 'crédito'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'Steam',
  },
  {
    sku: 'GC-STEAM-100',
    supplier: 'nacional',
    category: 'giftcards',
    title: 'Gift Card Steam R$ 100',
    shortDescription: 'Crédito pré-pago Steam R$100 — entrega automática.',
    priceBrl: 104.90,
    originalPriceBrl: 115.00,
    tags: ['steam', 'gift card'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'Steam',
  },
  {
    sku: 'GC-PSN-100',
    supplier: 'ggmax',
    category: 'giftcards',
    title: 'PlayStation Store R$ 100',
    shortDescription: 'Crédito PSN Brasil — conta BR necessária.',
    priceBrl: 109.90,
    originalPriceBrl: 120.00,
    tags: ['playstation', 'psn', 'gift card'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'PlayStation',
  },
  {
    sku: 'GC-XBOX-100',
    supplier: 'ggmax',
    category: 'giftcards',
    title: 'Xbox Gift Card R$ 100',
    shortDescription: 'Crédito Xbox Store BR.',
    priceBrl: 107.90,
    tags: ['xbox', 'gift card'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'Xbox',
  },
  {
    sku: 'GC-NETFLIX-1M',
    supplier: 'nacional',
    category: 'streaming',
    title: 'Netflix Premium 1 Mês',
    shortDescription: 'Acesso Premium (4 telas, 4K/UHD).',
    priceBrl: 44.90,
    originalPriceBrl: 59.90,
    tags: ['netflix', 'streaming', 'premium'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'Netflix',
  },
  {
    sku: 'GC-SPOTIFY-1M',
    supplier: 'nacional',
    category: 'streaming',
    title: 'Spotify Premium 1 Mês',
    shortDescription: 'Premium Individual — sem anúncios.',
    priceBrl: 19.90,
    originalPriceBrl: 24.90,
    tags: ['spotify', 'música'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'Spotify',
  },
  {
    sku: 'GC-DISCORD-1M',
    supplier: 'ggmax',
    category: 'assinaturas',
    title: 'Discord Nitro 1 Mês',
    shortDescription: 'Nitro Basic — boosts, emojis animados.',
    priceBrl: 14.90,
    tags: ['discord', 'nitro'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'GLOBAL',
    platform: 'Outro',
  },
  // ── Jogos (Steam Keys) ──────────────────────────────
  {
    sku: 'GAME-CS2-PRIME',
    supplier: 'ggmax',
    category: 'games',
    title: 'Counter-Strike 2 — Prime Status',
    shortDescription: 'Prime Status Upgrade para CS2 — conta global.',
    priceBrl: 79.90,
    originalPriceBrl: 99.90,
    tags: ['cs2', 'fps', 'prime'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'GLOBAL',
    platform: 'Steam',
  },
  {
    sku: 'GAME-GTAV',
    supplier: 'nuuvem',
    category: 'games',
    title: 'Grand Theft Auto V (Premium Edition)',
    shortDescription: 'GTA V + Online + Criminal Enterprise Starter Pack.',
    priceBrl: 49.90,
    originalPriceBrl: 99.90,
    tags: ['gta', 'rockstar', 'ação'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'Steam',
  },
  {
    sku: 'GAME-ELDEN-RING',
    supplier: 'ggmax',
    category: 'games',
    title: 'Elden Ring — Standard Edition',
    shortDescription: 'Jogo do ano 2022 — Steam Key Global.',
    priceBrl: 179.90,
    originalPriceBrl: 249.90,
    tags: ['elden ring', 'fromsoftware', 'souls'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'GLOBAL',
    platform: 'Steam',
  },
  {
    sku: 'GAME-VALORANT-25',
    supplier: 'nacional',
    category: 'moedas-gold',
    title: 'Valorant — R$ 25 em VP',
    shortDescription: 'Valorant Points entregues via login seguro.',
    priceBrl: 26.90,
    tags: ['valorant', 'vp', 'riot'],
    deliveryEta: 'Até 30 minutos',
    instant: false,
    region: 'BR',
    platform: 'Outro',
  },
  {
    sku: 'GAME-ROBUX-1K',
    supplier: 'ggmax',
    category: 'moedas-gold',
    title: 'Roblox — 1000 Robux',
    shortDescription: '1.000 Robux — código global.',
    priceBrl: 49.90,
    originalPriceBrl: 59.90,
    tags: ['roblox', 'robux'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'GLOBAL',
    platform: 'Outro',
  },
  // ── Software ────────────────────────────────────────
  {
    sku: 'SW-OFFICE-365',
    supplier: 'nacional',
    category: 'software',
    title: 'Microsoft 365 Family (1 ano)',
    shortDescription: 'Até 6 usuários — Word, Excel, PowerPoint, 1TB OneDrive.',
    priceBrl: 199.90,
    originalPriceBrl: 299.00,
    tags: ['microsoft', 'office', 'produtividade'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'BR',
    platform: 'Outro',
  },
  {
    sku: 'SW-WIN-11-PRO',
    supplier: 'kinguin',
    category: 'software',
    title: 'Windows 11 Pro — Chave Vitalícia',
    shortDescription: 'Chave de ativação genuína — 1 dispositivo.',
    priceBrl: 29.90,
    originalPriceBrl: 199.00,
    tags: ['windows', 'so', 'ativação'],
    deliveryEta: 'Instantâneo',
    instant: true,
    region: 'GLOBAL',
    platform: 'Outro',
  },
]

// ─── SUPPLIER ADAPTERS ─────────────────────────────────────

export interface FulfillmentResult {
  ok: boolean
  key?: string
  error?: string
  meta?: Record<string, unknown>
}

/**
 * Interface para fornecedores reais.
 * Quando as credenciais existirem, basta implementar fetch() real.
 * Por enquanto gera uma chave pseudo-aleatória que simula entrega
 * instantânea (modo demonstração/desenvolvimento).
 */
export interface SupplierAdapter {
  name: string
  fulfillSku(sku: CatalogProduct, buyerInfo: { email: string; orderId: string }): Promise<FulfillmentResult>
}

function mockKey(prefix: string): string {
  const seg = () => Math.random().toString(36).toUpperCase().slice(2, 7)
  return `${prefix}-${seg()}-${seg()}-${seg()}`
}

const ggmaxAdapter: SupplierAdapter = {
  name: 'ggmax',
  async fulfillSku(sku) {
    // Simulação — em produção: HTTP POST para ggmax api com API key
    await new Promise(r => setTimeout(r, 400))
    if (sku.platform === 'Steam') return { ok: true, key: mockKey('STEAM') }
    if (sku.platform === 'PlayStation') return { ok: true, key: mockKey('PSN-BR') }
    if (sku.platform === 'Xbox') return { ok: true, key: mockKey('XBOX-BR') }
    if (sku.platform === 'Spotify') return { ok: true, key: mockKey('SPOTIFY') }
    if (sku.platform === 'Netflix') return { ok: true, key: mockKey('NFLX') }
    return { ok: true, key: mockKey('KEY') }
  },
}

const kinguinAdapter: SupplierAdapter = {
  name: 'kinguin',
  async fulfillSku() {
    await new Promise(r => setTimeout(r, 500))
    return { ok: true, key: mockKey('KG') }
  },
}

const g2aAdapter: SupplierAdapter = {
  name: 'g2a',
  async fulfillSku() {
    await new Promise(r => setTimeout(r, 350))
    return { ok: true, key: mockKey('G2A') }
  },
}

const nuuvemAdapter: SupplierAdapter = {
  name: 'nuuvem',
  async fulfillSku() {
    await new Promise(r => setTimeout(r, 300))
    return { ok: true, key: mockKey('NUUVEM') }
  },
}

const nacionalAdapter: SupplierAdapter = {
  name: 'nacional',
  async fulfillSku(sku) {
    await new Promise(r => setTimeout(r, 250))
    if (sku.sku.startsWith('GC-')) {
      // Gift card — código mais curto
      const seg = () => Math.random().toString(36).toUpperCase().slice(2, 6)
      return { ok: true, key: `${seg()}-${seg()}-${seg()}-${seg()}` }
    }
    return { ok: true, key: mockKey('KIYVO') }
  },
}

const suppliers: Record<string, SupplierAdapter> = {
  ggmax: ggmaxAdapter,
  kinguin: kinguinAdapter,
  g2a: g2aAdapter,
  nuuvem: nuuvemAdapter,
  nacional: nacionalAdapter,
}

export async function fulfillOfficialSku(
  skuId: string,
  buyerInfo: { email: string; orderId: string }
): Promise<FulfillmentResult> {
  const product = OFFICIAL_CATALOG.find(p => p.sku === skuId)
  if (!product) return { ok: false, error: 'SKU não encontrado no catálogo oficial' }
  const adapter = suppliers[product.supplier]
  if (!adapter) return { ok: false, error: `Fornecedor ${product.supplier} não configurado` }
  return adapter.fulfillSku(product, buyerInfo)
}

export function getOfficialProduct(sku: string): CatalogProduct | undefined {
  return OFFICIAL_CATALOG.find(p => p.sku === sku)
}

export function listOfficialByCategory(category?: string): CatalogProduct[] {
  if (!category) return OFFICIAL_CATALOG
  return OFFICIAL_CATALOG.filter(p => p.category === category)
}

export const OFFICIAL_VENDOR = {
  storeName: 'KIYVO Oficial',
  slug: 'kiyvo-oficial',
  verified: true,
  badge: 'oficial',
  description: 'Loja oficial da KIYVO — produtos 100% garantidos com entrega instantânea.',
}
