import { Product } from '@/types'

const sellers = [
  { id: 's1', name: 'PixelKing', avatar: 'https://picsum.photos/seed/sk1/80/80', sales: 2341, rating: 4.9, verified: true, memberSince: '2022' },
  { id: 's2', name: 'GameVault', avatar: 'https://picsum.photos/seed/sk2/80/80', sales: 1876, rating: 4.8, verified: true, memberSince: '2021' },
  { id: 's3', name: 'NeonTrader', avatar: 'https://picsum.photos/seed/sk3/80/80', sales: 954, rating: 4.7, verified: true, memberSince: '2023' },
  { id: 's4', name: 'CryptoGamer', avatar: 'https://picsum.photos/seed/sk4/80/80', sales: 567, rating: 4.6, verified: false, memberSince: '2024' },
  { id: 's5', name: 'DiamondHands', avatar: 'https://picsum.photos/seed/sk5/80/80', sales: 3102, rating: 5.0, verified: true, memberSince: '2020' },
]

export const mockProducts: Product[] = [
  {
    id: 'p1', title: 'Conta Valorant – Diamante 1 + 40 Skins Epicas', slug: 'conta-valorant-diamante',
    price: 89.90, originalPrice: 129.90, image: 'https://picsum.photos/seed/pv1/400/300',
    category: 'Valorant', categorySlug: 'valorant', seller: sellers[0],
    type: 'account', deliveryType: 'auto', featured: true, sales: 234, rating: 4.9, reviews: 87,
    description: 'Conta Diamante 1 com mais de 40 skins épicas e lendárias. Inclui skins como Reaver Vandal, Prime Vandal, Glitchpop e muito mais. Acesso completo com e-mail verificado.',
    tags: ['diamante', 'skins', 'vandal'], createdAt: '2026-07-10'
  },
  {
    id: 'p2', title: 'Key Steam – Elden Ring Deluxe Edition', slug: 'key-steam-elden-ring',
    price: 149.90, originalPrice: 299.90, image: 'https://picsum.photos/seed/pv2/400/300',
    category: 'Steam', categorySlug: 'steam', seller: sellers[1],
    type: 'key', deliveryType: 'auto', featured: true, sales: 567, rating: 4.8, reviews: 203,
    description: 'Chave Steam para Elden Ring Deluxe Edition. Ativação global. Entrega automática instantânea após a confirmação do pagamento.',
    tags: ['steam', 'key', 'rpg'], createdAt: '2026-07-12'
  },
  {
    id: 'p3', title: '10.000 V-Bucks Fortnite – Entrega Imediata', slug: 'vbucks-fortnite',
    price: 34.90, image: 'https://picsum.photos/seed/pv3/400/300',
    category: 'Fortnite', categorySlug: 'fortnite', seller: sellers[4],
    type: 'gold', deliveryType: 'auto', featured: true, sales: 1890, rating: 5.0, reviews: 445,
    description: '10.000 V-Bucks para Fortnite. Entrega via código na plataforma. Ativação simples e rápida.',
    tags: ['vbucks', 'fortnite', 'moedas'], createdAt: '2026-07-14'
  },
  {
    id: 'p4', title: 'Conta Minecraft Premium + Optifine + Shaders', slug: 'conta-minecraft-premium',
    price: 24.90, image: 'https://picsum.photos/seed/pv4/400/300',
    category: 'Minecraft', categorySlug: 'minecraft', seller: sellers[2],
    type: 'account', deliveryType: 'manual', featured: true, sales: 890, rating: 4.7, reviews: 156,
    description: 'Conta original Minecraft Premium Java Edition com acesso completo. Inclui tutorial de instalação de Optifine e pacote de shaders.',
    tags: ['minecraft', 'premium', 'java'], createdAt: '2026-07-08'
  },
  {
    id: 'p5', title: 'Game Pass Ultimate 1 Mês – Xbox/PC/Cloud', slug: 'gamepass-ultimate-1mes',
    price: 14.90, image: 'https://picsum.photos/seed/pv5/400/300',
    category: 'Xbox Game Pass', categorySlug: 'xbox-gamepass', seller: sellers[0],
    type: 'giftcard', deliveryType: 'auto', featured: true, sales: 3456, rating: 4.9, reviews: 678,
    description: 'Assinatura Xbox Game Pass Ultimate por 1 mês. Acesso a centenas de jogos no Xbox, PC e Cloud. Entrega automática.',
    tags: ['gamepass', 'xbox', 'ultimate'], createdAt: '2026-07-13'
  },
  {
    id: 'p6', title: 'Conta LoL – Esmeralda + 120 Skins', slug: 'conta-lol-esmeralda',
    price: 199.90, originalPrice: 279.90, image: 'https://picsum.photos/seed/pv6/400/300',
    category: 'League of Legends', categorySlug: 'lol', seller: sellers[1],
    type: 'account', deliveryType: 'manual', featured: true, sales: 123, rating: 4.8, reviews: 45,
    description: 'Conta League of Legends Esmeralda com mais de 120 skins incluindo lendárias e épicas. Todos os campeões desbloqueados.',
    tags: ['lol', 'esmeralda', 'skins'], createdAt: '2026-07-11'
  },
  {
    id: 'p7', title: '800 Robux Roblox – Código Digital', slug: 'robux-roblox-800',
    price: 29.90, image: 'https://picsum.photos/seed/pv7/400/300',
    category: 'Roblox', categorySlug: 'roblox', seller: sellers[3],
    type: 'gold', deliveryType: 'auto', featured: false, sales: 2345, rating: 4.6, reviews: 321,
    description: '800 Robux para Roblox. Código digital entregue automaticamente após pagamento confirmado.',
    tags: ['robux', 'roblox', 'moedas'], createdAt: '2026-07-09'
  },
  {
    id: 'p8', title: 'Conta Free Fire – Heroico + 50 Skins', slug: 'conta-freefire-heroico',
    price: 59.90, image: 'https://picsum.photos/seed/pv8/400/300',
    category: 'Free Fire', categorySlug: 'free-fire', seller: sellers[4],
    type: 'account', deliveryType: 'manual', featured: false, sales: 456, rating: 5.0, reviews: 89,
    description: 'Conta Free Fire rank Heroico com 50+ skins de armas, roupas e veículos. E-mail verificado incluso.',
    tags: ['freefire', 'heroico', 'skins'], createdAt: '2026-07-07'
  },
  {
    id: 'p9', title: 'Key Steam – Black Myth Wukong Standard', slug: 'key-steam-wukong',
    price: 179.90, originalPrice: 249.90, image: 'https://picsum.photos/seed/pv9/400/300',
    category: 'Steam', categorySlug: 'steam', seller: sellers[0],
    type: 'key', deliveryType: 'auto', featured: false, sales: 78, rating: 4.9, reviews: 23,
    description: 'Chave Steam para Black Myth: Wukong. Standard Edition. Ativação global. Entrega automática.',
    tags: ['steam', 'wukong', 'rpg'], createdAt: '2026-07-12'
  },
  {
    id: 'p10', title: 'Conta CS2 – 10 Anos + Medalhas Raras', slug: 'conta-cs2-veteran',
    price: 349.90, image: 'https://picsum.photos/seed/pv10/400/300',
    category: 'Counter-Strike 2', categorySlug: 'cs2', seller: sellers[2],
    type: 'account', deliveryType: 'manual', featured: false, sales: 34, rating: 4.7, reviews: 12,
    description: 'Conta Steam com CS2 e 10 anos de serviço. Inclui medalhas raras de serviço, moedas de operação e badge de 10 anos.',
    tags: ['cs2', 'veteran', 'medalhas'], createdAt: '2026-07-06'
  },
  {
    id: 'p11', title: 'Genshin Impact – 6480 Primogems', slug: 'primogems-genshin',
    price: 79.90, image: 'https://picsum.photos/seed/pv11/400/300',
    category: 'Genshin Impact', categorySlug: 'genshin', seller: sellers[3],
    type: 'gold', deliveryType: 'auto', featured: false, sales: 567, rating: 4.6, reviews: 98,
    description: '6480 Primogems para Genshin Impact. Entrega via login na conta. Processo seguro e rápido.',
    tags: ['genshin', 'primogems', 'moedas'], createdAt: '2026-07-10'
  },
  {
    id: 'p12', title: 'Clash of Clans – TH15 Max + Heróis Max', slug: 'coc-th15-max',
    price: 449.90, originalPrice: 599.90, image: 'https://picsum.photos/seed/pv12/400/300',
    category: 'Clash of Clans', categorySlug: 'clash-of-clans', seller: sellers[1],
    type: 'account', deliveryType: 'manual', featured: false, sales: 67, rating: 4.8, reviews: 19,
    description: 'Conta Clash of Clans Town Hall 15 totalmente maxada. Todos os heróis no nível máximo. Base de guerra inclusa.',
    tags: ['coc', 'th15', 'max'], createdAt: '2026-07-05'
  },
]

export const getProductById = (id: string): Product | undefined =>
  mockProducts.find(p => p.id === id)

export const getProductsByCategory = (slug: string): Product[] =>
  mockProducts.filter(p => p.categorySlug === slug)

export const getFeaturedProducts = (): Product[] =>
  mockProducts.filter(p => p.featured)

export const searchProducts = (query: string): Product[] => {
  const q = query.toLowerCase()
  return mockProducts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  )
}
