// ─────────────────────────────────────────────────────────────
// Dados de categorias — usado em /categoria/[slug] quando o
// Supabase ainda não tem produtos. Garante que cada categoria
// mostra conteúdo real e diferente, nunca uma tela vazia.
// ─────────────────────────────────────────────────────────────

export interface CategoryProduct {
  id: string
  title: string
  priceBrl: number
  originalPriceBrl?: number
  emoji: string
  seller: string
  sales: number
  rating: number
  instant?: boolean
  official?: boolean
}

export interface CategoryInfo {
  name: string
  emoji: string
  hue: string
  description: string
  subcategories: { name: string; emoji: string }[]
  products: CategoryProduct[]
}

const P = (
  id: string, title: string, price: number, emoji: string,
  seller: string, sales: number, rating: number,
  original?: number, opts: { instant?: boolean; official?: boolean } = {}
): CategoryProduct => ({
  id, title, priceBrl: price, originalPriceBrl: original, emoji,
  seller, sales, rating, ...opts,
})

export const CATEGORY_DATA: Record<string, CategoryInfo> = {
  games: {
    name: 'Jogos',
    emoji: '🎮',
    hue: 'from-violet-500 to-fuchsia-500',
    description: 'Keys Steam, contas, gift cards e jogos para todas as plataformas.',
    subcategories: [
      { name: 'Steam Keys', emoji: '🎮' },
      { name: 'PlayStation', emoji: '🎯' },
      { name: 'Xbox', emoji: '🟢' },
      { name: 'Nintendo', emoji: '🔴' },
      { name: 'Contas', emoji: '👤' },
      { name: 'Moedas & Gold', emoji: '🪙' },
    ],
    products: [
      P('g1','Steam Gift Card R$50',52.9,'🎮','KIYVO Oficial',8420,4.9,59.9,{instant:true,official:true}),
      P('g2','Steam Gift Card R$100',104.9,'🎮','KIYVO Oficial',5230,4.9,115,{instant:true,official:true}),
      P('g3','Grand Theft Auto V (Premium)',49.9,'🚗','GameStoreBR',1820,4.8,99.9,{instant:true}),
      P('g4','Elden Ring — Standard',179.9,'⚔️','KIYVO Oficial',920,4.9,249.9,{instant:true,official:true}),
      P('g5','Counter-Strike 2 Prime',79.9,'🔫','CSBr',610,4.7,99.9,{instant:true}),
      P('g6','PlayStation Store R$100',109.9,'🎯','KIYVO Oficial',2130,4.8,120,{instant:true,official:true}),
      P('g7','Xbox Gift Card R$100',107.9,'🟢','KIYVO Oficial',1520,4.8,undefined,{instant:true,official:true}),
      P('g8','Valorant VP R$25',26.9,'🎯','KIYVO Oficial',3200,4.9,undefined,{official:true}),
      P('g9','Roblox 1000 Robux',49.9,'🧱','KIYVO Oficial',1820,4.7,59.9,{instant:true,official:true}),
      P('g10','Minecraft Java + Bedrock',89.9,'⛏️','BlockShop',780,4.8,129.9,{instant:true}),
      P('g11','Red Dead Redemption 2',99.9,'🤠','WestKeys',420,4.8,199.9,{instant:true}),
      P('g12','Cyberpunk 2077',79.9,'🤖','NightCity',390,4.6,199.9,{instant:true}),
    ],
  },
  software: {
    name: 'Software',
    emoji: '💻',
    hue: 'from-blue-500 to-cyan-500',
    description: 'Licenças, chaves e ativações de software para Windows, Office, design e produtividade.',
    subcategories: [
      { name: 'Windows', emoji: '🪟' },
      { name: 'Office', emoji: '📊' },
      { name: 'Antivírus', emoji: '🛡️' },
      { name: 'Design', emoji: '🎨' },
      { name: 'Produtividade', emoji: '⚡' },
      { name: 'Desenvolvimento', emoji: '⌨️' },
    ],
    products: [
      P('s1','Windows 11 Pro — Chave Vitalícia',29.9,'🪟','KIYVO Oficial',12420,4.9,199,{instant:true,official:true}),
      P('s2','Microsoft 365 Family 1 ano',199.9,'📊','KIYVO Oficial',3210,4.8,299,{instant:true,official:true}),
      P('s3','Windows 10 Pro Vitalícia',19.9,'🪟','SoftBR',5430,4.7,149,{instant:true}),
      P('s4','Adobe Creative Cloud 1 mês',99.9,'🎨','DesignHub',820,4.6,149),
      P('s5','Kaspersky Total Security 1 ano',39.9,'🛡️','SecurityBr',620,4.8,89.9,{instant:true}),
      P('s6','Discord Nitro 1 mês',14.9,'💎','KIYVO Oficial',2230,4.9,undefined,{instant:true,official:true}),
      P('s7','JetBrains All Pack 1 ano',399,'⌨️','DevTools',310,4.9,899,{instant:true}),
      P('s8','WinRAR Licença Vitalícia',9.9,'📦','KeysBR',890,4.5,29.9,{instant:true}),
    ],
  },
  streaming: {
    name: 'Streaming',
    emoji: '📺',
    hue: 'from-red-500 to-orange-500',
    description: 'Assinaturas de streaming de vídeo, música e entretenimento.',
    subcategories: [
      { name: 'Netflix', emoji: '🎬' },
      { name: 'Spotify', emoji: '🎵' },
      { name: 'Disney+', emoji: '🏰' },
      { name: 'Prime Video', emoji: '📦' },
      { name: 'HBO Max', emoji: '🔥' },
      { name: 'Música', emoji: '🎧' },
    ],
    products: [
      P('st1','Netflix Premium 1 mês (4 telas)',44.9,'🎬','KIYVO Oficial',6230,4.8,59.9,{instant:true,official:true}),
      P('st2','Spotify Premium 1 mês',19.9,'🎵','KIYVO Oficial',4120,4.9,24.9,{instant:true,official:true}),
      P('st3','Netflix Básico com anúncios',19.9,'🎬','StreamBR',1820,4.5,undefined,{instant:true}),
      P('st4','Disney+ 1 mês',29.9,'🏰','MagicAccounts',920,4.7,39.9,{instant:true}),
      P('st5','Spotify Família 1 mês',34.9,'🎵','MusicBR',1420,4.8,49.9,{instant:true}),
      P('st6','Youtube Premium 1 mês',24.9,'▶️','StreamPro',680,4.6,34.9,{instant:true}),
      P('st7','Prime Video 1 mês',14.9,'📦','AmazonBR',420,4.7,19.9,{instant:true}),
      P('st8','HBO Max 1 mês',34.9,'🔥','StreamBR',290,4.4,49.9,{instant:true}),
    ],
  },
  musica: {
    name: 'Música',
    emoji: '🎵',
    hue: 'from-emerald-500 to-teal-500',
    description: 'Contas de streaming de música, samples, plugins DAW e beats.',
    subcategories: [
      { name: 'Spotify', emoji: '🎧' },
      { name: 'Apple Music', emoji: '🍎' },
      { name: 'Plugins VST', emoji: '🎛️' },
      { name: 'Sample Packs', emoji: '🥁' },
      { name: 'Beats & Instrumentais', emoji: '🎹' },
    ],
    products: [
      P('m1','Spotify Premium Individual 1 mês',19.9,'🎧','KIYVO Oficial',4120,4.9,24.9,{instant:true,official:true}),
      P('m2','Spotify Família 6 contas 1 mês',34.9,'👨‍👩‍👧‍👦','MusicBR',1820,4.8,49.9,{instant:true}),
      P('m3','Apple Music 1 mês',14.9,'🍎','iMusic',720,4.6,21.9,{instant:true}),
      P('m4','Pack 500 Beats (Uso Livre)',39.9,'🎹','ProducerHub',410,4.8,199),
      P('m5','Serum VST Plugin',199,'🎛️','AudioDev',280,4.9,899,{instant:true}),
      P('m6','Sample Pack Trap & Drill Vol.3',19.9,'🥁','BeatsBR',620,4.7,49.9,{instant:true}),
    ],
  },
  giftcards: {
    name: 'Gift Cards',
    emoji: '🎁',
    hue: 'from-amber-500 to-yellow-500',
    description: 'Gift cards de todas as plataformas com entrega instantânea.',
    subcategories: [
      { name: 'Steam', emoji: '🎮' },
      { name: 'PlayStation', emoji: '🎯' },
      { name: 'Xbox', emoji: '🟢' },
      { name: 'Netflix/Spotify', emoji: '📺' },
      { name: 'iFood/Uber', emoji: '🍔' },
      { name: 'Google Play/App Store', emoji: '📱' },
    ],
    products: [
      P('gc1','Steam R$50',52.9,'🎮','KIYVO Oficial',8420,4.9,59.9,{instant:true,official:true}),
      P('gc2','Steam R$100',104.9,'🎮','KIYVO Oficial',5230,4.9,115,{instant:true,official:true}),
      P('gc3','PlayStation R$100',109.9,'🎯','KIYVO Oficial',2130,4.8,120,{instant:true,official:true}),
      P('gc4','Xbox R$100',107.9,'🟢','KIYVO Oficial',1520,4.8,undefined,{instant:true,official:true}),
      P('gc5','Google Play R$50',48.9,'📱','CardsBR',1920,4.7,54.9,{instant:true}),
      P('gc6','iFood R$100',89.9,'🍔','FoodBR',820,4.6,100,{instant:true}),
      P('gc7','Netflix R$50',44.9,'🎬','KIYVO Oficial',1230,4.8,59.9,{instant:true,official:true}),
      P('gc8','App Store R$50',47.9,'🍎','CardsBR',1120,4.7,50,{instant:true}),
      P('gc9','Uber R$50',44.9,'🚗','MobBR',580,4.6,50,{instant:true}),
      P('gc10','Uber Eats R$50',44.9,'🍕','FoodBR',490,4.6,50,{instant:true}),
      P('gc11','Roblox 1000 Robux',49.9,'🧱','KIYVO Oficial',1820,4.7,59.9,{instant:true,official:true}),
    ],
  },
  cursos: {
    name: 'Cursos',
    emoji: '📚',
    hue: 'from-pink-500 to-rose-500',
    description: 'Cursos digitais de programação, design, marketing, negócios e mais.',
    subcategories: [
      { name: 'Programação', emoji: '💻' },
      { name: 'Design', emoji: '🎨' },
      { name: 'Marketing', emoji: '📣' },
      { name: 'Negócios', emoji: '💼' },
      { name: 'Idiomas', emoji: '🌍' },
      { name: 'Investimentos', emoji: '📈' },
    ],
    products: [
      P('c1','Curso Completo de Python 2026',89.9,'🐍','Prof. Silva',2420,4.9,199.9),
      P('c2','React & Next.js do Zero ao Pro',99.9,'⚛️','Dev Academy',1830,4.8,299.9),
      P('c3','UI/UX Design Masterclass',129.9,'🎨','Design Lab',920,4.8,399),
      P('c4','Marketing Digital Completo',79.9,'📣','MktPro',1120,4.7,249),
      P('c5','Trader Esportivo do Zero',149.9,'📈','TradeBR',540,4.6,499),
      P('c6','Inglês em 6 Meses',69.9,'🌍','IdiomaBR',2210,4.7,199.9),
      P('c7','Photoshop do Zero ao Avançado',49.9,'📷','PhotoPro',890,4.8,149),
      P('c8','Curso Excel Completo',39.9,'📊','PlanilhasBR',720,4.7,129.9),
    ],
  },
  templates: {
    name: 'Templates',
    emoji: '🎨',
    hue: 'from-indigo-500 to-purple-500',
    description: 'Templates prontos para sites, landing pages, apresentações e redes sociais.',
    subcategories: [
      { name: 'React/Next.js', emoji: '⚛️' },
      { name: 'WordPress', emoji: '🌐' },
      { name: 'Figma/UI', emoji: '🎨' },
      { name: 'Apresentações', emoji: '📊' },
      { name: 'Canva/Social Media', emoji: '📱' },
      { name: 'Notion', emoji: '📝' },
    ],
    products: [
      P('t1','50+ Templates React/Tailwind',39.9,'⚛️','UI Pack',1420,4.9,199,{instant:true}),
      P('t2','Pack 200 Templates Canva Instagram',19.9,'📱','CanvaPro',3220,4.8,97,{instant:true}),
      P('t3','Template Landing Page SaaS (Next.js)',29.9,'🚀','LandingLab',680,4.9,149,{instant:true}),
      P('t4','Template Dashboard Admin React',49.9,'📊','DashUI',520,4.8,199,{instant:true}),
      P('t5','Notion Dashboard de Produtividade',9.9,'📝','NotionBR',2120,4.8,49,{instant:true}),
      P('t6','Kit Apresentações Premium PowerPoint',14.9,'📊','SlidePro',880,4.7,49,{instant:true}),
      P('t7','10 Temas WordPress Premium',49.9,'🌐','WPthemes',420,4.6,199,{instant:true}),
      P('t8','Template E-commerce Shopify',59.9,'🛍️','ShopPro',310,4.8,299,{instant:true}),
    ],
  },
  apis: {
    name: 'APIs',
    emoji: '🔌',
    hue: 'from-sky-500 to-blue-500',
    description: 'APIs, serviços e dados para desenvolvedores e empresas.',
    subcategories: [
      { name: 'WhatsApp/Marketing', emoji: '💬' },
      { name: 'Dados & Consultas', emoji: '🔍' },
      { name: 'IA & Machine Learning', emoji: '🤖' },
      { name: 'SMS/Email', emoji: '📧' },
      { name: 'Proxy & VPN', emoji: '🌐' },
    ],
    products: [
      P('a1','API WhatsApp — 1000 mensagens',29.9,'💬','APIdev',1220,4.7,undefined,{instant:true}),
      P('a2','Consulta CPF/CNPJ — 100 consultas',39.9,'🔍','DataBR',820,4.8,undefined,{instant:true}),
      P('a3','API OpenAI GPT 4 — Pacote R$50',47.9,'🤖','AIdotBR',2130,4.9,undefined,{instant:true}),
      P('a4','Chave API Gemini — Pacote R$30',27.9,'✨','AI Lab',620,4.7,undefined,{instant:true}),
      P('a5','Proxy Residencial Brasil 1GB',24.9,'🌐','ProxyBR',480,4.6,undefined,{instant:true}),
      P('a6','SMTP Email Transacional — 10k envios',49.9,'📧','MailBR',320,4.7,undefined,{instant:true}),
    ],
  },
  filmes: {
    name: 'Filmes & Séries',
    emoji: '🎬',
    hue: 'from-rose-500 to-red-500',
    description: 'Contas compartilhadas e premium de streaming de vídeo.',
    subcategories: [
      { name: 'Netflix', emoji: '🎬' },
      { name: 'Disney+', emoji: '🏰' },
      { name: 'Prime Video', emoji: '📦' },
      { name: 'HBO Max', emoji: '🔥' },
    ],
    products: [
      P('f1','Netflix Premium 1 mês 4 telas',44.9,'🎬','KIYVO Oficial',6230,4.8,59.9,{instant:true,official:true}),
      P('f2','Disney+ 1 mês',29.9,'🏰','MagicAccounts',920,4.7,39.9,{instant:true}),
      P('f3','Prime Video 1 mês',14.9,'📦','AmazonBR',420,4.7,19.9,{instant:true}),
      P('f4','HBO Max 1 mês',34.9,'🔥','StreamBR',290,4.4,49.9,{instant:true}),
      P('f5','Globoplay 1 mês',19.9,'📺','BrasilStreams',380,4.5,29.9,{instant:true}),
    ],
  },
  plugins: {
    name: 'Plugins',
    emoji: '🧩',
    hue: 'from-green-500 to-emerald-500',
    description: 'Plugins para WordPress, Figma, VS Code, DAWs e navegadores.',
    subcategories: [
      { name: 'WordPress', emoji: '🌐' },
      { name: 'VS Code', emoji: '💻' },
      { name: 'Figma', emoji: '🎨' },
      { name: 'VST/Áudio', emoji: '🎛️' },
    ],
    products: [
      P('pl1','Elementor Pro Vitalício',49.9,'🌐','WPdev',620,4.7,249,{instant:true}),
      P('pl2','Yoast SEO Premium',29.9,'🔍','SEOpro',480,4.8,99,{instant:true}),
      P('pl3','WooCommerce Addons Pack',39.9,'🛒','WPdev',420,4.7,199,{instant:true}),
      P('pl4','Figma Plugin Pack Completo',19.9,'🎨','FigmaPro',890,4.8,undefined,{instant:true}),
      P('pl5','Serum VST + Expansions',199,'🎛️','AudioDev',280,4.9,899,{instant:true}),
      P('pl6','VS Code Pro Pack (Temas + Extensões)',9.9,'💻','DevKit',1240,4.8,undefined,{instant:true}),
    ],
  },
  assinaturas: {
    name: 'Assinaturas',
    emoji: '👑',
    hue: 'from-yellow-500 to-amber-500',
    description: 'Planos de assinatura premium com benefícios exclusivos.',
    subcategories: [
      { name: 'KIYVO Pro', emoji: '⚡' },
      { name: 'KIYVO Plus', emoji: '👑' },
      { name: 'ChatGPT Plus', emoji: '🤖' },
      { name: 'Midjourney', emoji: '🎨' },
      { name: 'Outros SaaS', emoji: '🔑' },
    ],
    products: [
      P('as1','KIYVO Pro 1 mês',29.9,'⚡','KIYVO',1820,4.9,undefined,{instant:true,official:true}),
      P('as2','KIYVO Plus 1 mês',59.9,'👑','KIYVO',720,4.9,undefined,{instant:true,official:true}),
      P('as3','ChatGPT Plus 1 mês (convite)',49.9,'🤖','AIbr',2120,4.7,undefined,{instant:true}),
      P('as4','Midjourney 30 dias',69.9,'🎨','AI Art',540,4.8,undefined,{instant:true}),
      P('as5','Canva Pro 1 mês',14.9,'🎨','DesignBR',3210,4.7,undefined,{instant:true}),
      P('as6','Grammarly Premium 1 mês',24.9,'✍️','WritingPro',820,4.6,undefined,{instant:true}),
      P('as7','Notion AI Plus 1 mês',29.9,'📝','NotionBR',420,4.7,undefined,{instant:true}),
    ],
  },
  seguranca: {
    name: 'Segurança',
    emoji: '🔒',
    hue: 'from-slate-700 to-slate-900',
    description: 'Antivírus, VPNs, gerenciadores de senhas e soluções de segurança.',
    subcategories: [
      { name: 'Antivírus', emoji: '🛡️' },
      { name: 'VPN', emoji: '🌐' },
      { name: 'Gerenciador de Senhas', emoji: '🔑' },
      { name: '2FA & Autenticação', emoji: '📱' },
    ],
    products: [
      P('sec1','Kaspersky Total 1 ano',39.9,'🛡️','SecurityBr',620,4.8,89.9,{instant:true}),
      P('sec2','NordVPN 1 ano',79.9,'🌐','VPNbr',820,4.7,299,{instant:true}),
      P('sec3','1Password Família 1 ano',59.9,'🔑','SafePass',320,4.9,149,{instant:true}),
      P('sec4','Bitdefender 3 dispositivos',49.9,'🛡️','SecureBR',280,4.7,89.9,{instant:true}),
      P('sec5','Surfshark VPN 2 anos',99.9,'🦈','VPNbr',420,4.8,499,{instant:true}),
    ],
  },
}

// Helper: retorna dados de uma categoria, com fallback genérico
export function getCategoryData(slug: string): CategoryInfo {
  if (CATEGORY_DATA[slug]) return CATEGORY_DATA[slug]
  // Fallback genérico baseado no nome do slug
  const name = slug.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())
  return {
    name,
    emoji: '📦',
    hue: 'from-brand-500 to-violet-500',
    description: `Produtos digitais da categoria ${name}.`,
    subcategories: [
      { name: 'Populares', emoji: '🔥' },
      { name: 'Novidades', emoji: '✨' },
      { name: 'Ofertas', emoji: '💰' },
      { name: 'Verificados', emoji: '✓' },
    ],
    products: [
      P(`fb-1`,`Produto ${name} #1`,29.9,'✨','VendedorVerificado',120,4.8,59.9,{instant:true}),
      P(`fb-2`,`Produto ${name} #2`,49.9,'🎯','TopSeller',80,4.7,99,{instant:true}),
      P(`fb-3`,`Produto Premium ${name}`,79.9,'⭐','ProBrasil',60,4.9,149,{instant:true}),
      P(`fb-4`,`Kit ${name} Básico`,19.9,'📦','ExpressBR',210,4.5,39.9,{instant:true}),
      P(`fb-5`,`${name} Vitalício`,149,'👑','OfficialBR',40,4.9,299,{instant:true}),
      P(`fb-6`,`${name} Pro`,59.9,'⚡','DigitalBR',180,4.7,undefined,{instant:true}),
    ],
  }
}

export const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
