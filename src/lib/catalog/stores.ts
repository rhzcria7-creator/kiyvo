// 60 Lojas KIYVO — vendedores fictícios mas verossímeis (marketplace BR)
export interface Store {
  id: string
  name: string
  handle: string
  logo: string        // emoji p/ loja
  color: string       // gradient
  verified: boolean
  rating: number
  sales: number
  followers: number
  category: string
  bio: string
  plan: 'free' | 'plus' | 'pro' | 'vendor_pro'
  since: string       // ano
  city: string
}

export const STORES: Store[] = [
  { id: 's-digitalflow', name: 'DigitalFlow', handle: '@digitalflow', logo: '⚡', color: 'from-blue-500 to-indigo-600', verified: true, rating: 4.9, sales: 12847, followers: 8920, category: 'Marketing', bio: 'Automação e marketing digital para vender mais.', plan: 'pro', since: '2022', city: 'São Paulo/SP' },
  { id: 's-copykings', name: 'CopyKings', handle: '@copykings', logo: '✍️', color: 'from-purple-500 to-pink-600', verified: true, rating: 4.8, sales: 9234, followers: 6134, category: 'Copywriting', bio: 'Copys que vendem 24h por dia.', plan: 'vendor_pro', since: '2021', city: 'Rio de Janeiro/RJ' },
  { id: 's-templatehub', name: 'TemplateHub BR', handle: '@templatehub', logo: '🎨', color: 'from-pink-500 to-rose-600', verified: true, rating: 4.9, sales: 21340, followers: 15430, category: 'Design', bio: 'Premium templates Canva, Figma, Notion.', plan: 'pro', since: '2023', city: 'Belo Horizonte/MG' },
  { id: 's-cursostop', name: 'CursosTop', handle: '@cursostop', logo: '🎓', color: 'from-amber-500 to-orange-600', verified: true, rating: 4.7, sales: 34890, followers: 28900, category: 'Curso', bio: 'Os melhores cursos digitais selecionados.', plan: 'vendor_pro', since: '2020', city: 'Curitiba/PR' },
  { id: 's-excelmaster', name: 'ExcelMaster', handle: '@excelmaster', logo: '📊', color: 'from-emerald-500 to-green-700', verified: true, rating: 4.9, sales: 8456, followers: 7102, category: 'Planilhas', bio: 'Planilhas profissionais prontas pra usar.', plan: 'plus', since: '2022', city: 'Porto Alegre/RS' },
  { id: 's-softpro', name: 'SoftPro Brasil', handle: '@softprobr', logo: '💻', color: 'from-sky-500 to-cyan-600', verified: true, rating: 4.8, sales: 6789, followers: 4210, category: 'Software', bio: 'Licenças e software originais com garantia.', plan: 'pro', since: '2023', city: 'Florianópolis/SC' },
  { id: 's-midiasmart', name: 'MídiaSmart', handle: '@midiasmart', logo: '📱', color: 'from-violet-500 to-purple-700', verified: false, rating: 4.6, sales: 3210, followers: 2100, category: 'Social', bio: 'Posts e artes prontas para redes sociais.', plan: 'plus', since: '2023', city: 'Salvador/BA' },
  { id: 's-gamestorebr', name: 'GameStore BR', handle: '@gamestorebr', logo: '🎮', color: 'from-red-500 to-rose-700', verified: true, rating: 4.9, sales: 15670, followers: 11200, category: 'Games', bio: 'Gift cards, contas e keys Steam/PS/Xbox.', plan: 'pro', since: '2022', city: 'Fortaleza/CE' },
  { id: 's-fitpro', name: 'FitPro Brasil', handle: '@fitprobr', logo: '💪', color: 'from-lime-500 to-green-600', verified: true, rating: 4.8, sales: 7820, followers: 5430, category: 'Saúde', bio: 'Planilhas, treinos e guias de fitness.', plan: 'plus', since: '2023', city: 'Goiânia/GO' },
  { id: 's-financaspro', name: 'FinançasPró', handle: '@financaspro', logo: '💹', color: 'from-teal-500 to-emerald-600', verified: true, rating: 4.9, sales: 11200, followers: 9870, category: 'Finanças', bio: 'Planilhas e cursos pra organizar seu dinheiro.', plan: 'pro', since: '2021', city: 'Campinas/SP' },
  { id: 's-belezaelite', name: 'Beleza Elite', handle: '@belezaelite', logo: '💄', color: 'from-pink-400 to-fuchsia-600', verified: false, rating: 4.5, sales: 2340, followers: 1890, category: 'Beleza', bio: 'Presets Lightroom e guias de beleza.', plan: 'free', since: '2024', city: 'Recife/PE' },
  { id: 's-chefmaster', name: 'ChefMaster', handle: '@chefmaster', logo: '🍳', color: 'from-orange-500 to-red-600', verified: true, rating: 4.7, sales: 5670, followers: 3890, category: 'Gastronomia', bio: 'Receitas e cardápios profissionais.', plan: 'plus', since: '2022', city: 'Brasília/DF' },
  { id: 's-promptpro', name: 'PromptPRO', handle: '@promptpro', logo: '🤖', color: 'from-indigo-500 to-violet-700', verified: true, rating: 4.9, sales: 19450, followers: 17200, category: 'Prompts', bio: 'Prompts IA profissionais para tudo.', plan: 'vendor_pro', since: '2023', city: 'Joinville/SC' },
  { id: 's-videokit', name: 'VideoKit', handle: '@videokit', logo: '🎥', color: 'from-rose-500 to-red-600', verified: true, rating: 4.8, sales: 4530, followers: 3210, category: 'Vídeo', bio: 'Presets, LUTs e templates de vídeo.', plan: 'plus', since: '2023', city: 'Manaus/AM' },
  { id: 's-juridicofacil', name: 'Jurídico Fácil', handle: '@juridicofacil', logo: '⚖️', color: 'from-slate-600 to-slate-800', verified: true, rating: 4.9, sales: 3210, followers: 2780, category: 'Jurídico', bio: 'Contratos e modelos jurídicos prontos.', plan: 'pro', since: '2022', city: 'Vitória/ES' },
  { id: 's-produtividadex', name: 'ProdutividadeX', handle: '@produtividadex', logo: '⏰', color: 'from-cyan-500 to-blue-600', verified: true, rating: 4.8, sales: 8900, followers: 6540, category: 'Produtividade', bio: 'Sistemas e templates de produtividade.', plan: 'pro', since: '2023', city: 'Natal/RN' },
  { id: 's-ecommercestack', name: 'EcommerceStack', handle: '@ecommercestack', logo: '🛒', color: 'from-yellow-500 to-orange-500', verified: true, rating: 4.9, sales: 6780, followers: 5210, category: 'Marketing', bio: 'Tudo pra sua loja virtual bombar.', plan: 'vendor_pro', since: '2021', city: 'São Paulo/SP' },
  { id: 's-packbrasil', name: 'PackBrasil', handle: '@packbrasil', logo: '📦', color: 'from-emerald-500 to-teal-700', verified: true, rating: 4.7, sales: 12300, followers: 8760, category: 'Pack', bio: 'Packs e bundles com desconto.', plan: 'plus', since: '2022', city: 'Sorocaba/SP' },
  { id: 's-streamingbr', name: 'StreamingBR', handle: '@streamingbr', logo: '🎬', color: 'from-red-600 to-pink-600', verified: false, rating: 4.4, sales: 28900, followers: 18900, category: 'Streaming', bio: 'Assinaturas premium compartilhadas.', plan: 'free', since: '2024', city: 'Rio de Janeiro/RJ' },
  { id: 's-photopreset', name: 'PhotoPreset', handle: '@photopreset', logo: '📸', color: 'from-fuchsia-500 to-pink-700', verified: true, rating: 4.8, sales: 5600, followers: 4100, category: 'Foto', bio: 'Presets profissionais para fotos.', plan: 'plus', since: '2023', city: 'Bal. Camboriú/SC' },
  { id: 's-musicabeat', name: 'MusicBeat', handle: '@musicabeat', logo: '🎵', color: 'from-violet-600 to-indigo-700', verified: false, rating: 4.6, sales: 2340, followers: 1920, category: 'Música', bio: 'Beats, samples e sound packs.', plan: 'free', since: '2024', city: 'Olinda/PE' },
  { id: 's-stockninja', name: 'StockNinja', handle: '@stockninja', logo: '📈', color: 'from-green-500 to-emerald-700', verified: true, rating: 4.7, sales: 1890, followers: 1540, category: 'Finanças', bio: 'Planilhas pra investidores.', plan: 'plus', since: '2023', city: 'Ribeirão Preto/SP' },
  { id: 's-academicopro', name: 'AcadêmicoPRO', handle: '@academicopro', logo: '📚', color: 'from-blue-600 to-indigo-800', verified: true, rating: 4.8, sales: 7650, followers: 5890, category: 'Educação', bio: 'Templates TCC, monografia, resumos.', plan: 'plus', since: '2022', city: 'Viçosa/MG' },
  { id: 's-kidscode', name: 'KidsCode', handle: '@kidscode', logo: '🧒', color: 'from-sky-400 to-cyan-500', verified: false, rating: 4.7, sales: 1230, followers: 890, category: 'Educação', bio: 'Cursos de programação para crianças.', plan: 'free', since: '2024', city: 'Uberlândia/MG' },
  { id: 's-agenciafly', name: 'Agência Fly', handle: '@agenciafly', logo: '🚀', color: 'from-orange-500 to-pink-600', verified: true, rating: 4.9, sales: 4320, followers: 3210, category: 'Agência', bio: 'Estratégias completas de marketing.', plan: 'vendor_pro', since: '2020', city: 'São Paulo/SP' },
  { id: 's-notionbr', name: 'Notion Brasil', handle: '@notionbr', logo: '📝', color: 'from-gray-700 to-gray-900', verified: true, rating: 4.9, sales: 15400, followers: 12300, category: 'Produtividade', bio: 'Templates Notion em PT-BR.', plan: 'pro', since: '2022', city: 'Porto Alegre/RS' },
  { id: 's-ebookstore', name: 'E-bookStore', handle: '@ebookstore', logo: '📖', color: 'from-amber-600 to-orange-700', verified: true, rating: 4.7, sales: 9870, followers: 7210, category: 'Ebook', bio: 'Milhares de e-books selecionados.', plan: 'plus', since: '2023', city: 'Recife/PE' },
  { id: 's-podcastmaster', name: 'PodcastMaster', handle: '@podcastmaster', logo: '🎙️', color: 'from-purple-700 to-fuchsia-600', verified: false, rating: 4.5, sales: 890, followers: 650, category: 'Podcast', bio: 'Kits e templates para podcasters.', plan: 'free', since: '2024', city: 'São Luís/MA' },
  { id: 's-dropshipx', name: 'DropshipX', handle: '@dropshipx', logo: '🚢', color: 'from-teal-600 to-cyan-700', verified: true, rating: 4.8, sales: 3420, followers: 2780, category: 'Ecommerce', bio: 'Fornecedores e scripts dropshipping.', plan: 'pro', since: '2023', city: 'Santos/SP' },
  { id: 's-cvprof', name: 'CVProfissional', handle: '@cvprof', logo: '📄', color: 'from-blue-500 to-sky-700', verified: false, rating: 4.6, sales: 2100, followers: 1450, category: 'Carreira', bio: 'Currículos, LinkedIn e cartas.', plan: 'free', since: '2024', city: 'João Pessoa/PB' },
  { id: 's-meditacaomind', name: 'Meditação Mind', handle: '@meditacaomind', logo: '🧘', color: 'from-emerald-400 to-teal-600', verified: false, rating: 4.8, sales: 980, followers: 760, category: 'Bem-estar', bio: 'Áudios e guias de meditação.', plan: 'free', since: '2024', city: 'Teresina/PI' },
  { id: 's-culinariasaudavel', name: 'Culinária Saudável', handle: '@culinariasaud', logo: '🥗', color: 'from-lime-400 to-green-600', verified: true, rating: 4.7, sales: 1890, followers: 1320, category: 'Gastronomia', bio: 'Receitas saudáveis e low carb.', plan: 'plus', since: '2023', city: 'Aracaju/SE' },
  { id: 's-smmbeast', name: 'SMMBeast', handle: '@smmbeast', logo: '📲', color: 'from-pink-500 to-violet-600', verified: true, rating: 4.9, sales: 6780, followers: 5430, category: 'Social', bio: 'Gestão de redes sociais turbo.', plan: 'pro', since: '2022', city: 'Campo Grande/MS' },
  { id: 's-dataviz', name: 'DataViz Pro', handle: '@datavizpro', logo: '📊', color: 'from-indigo-500 to-blue-700', verified: true, rating: 4.8, sales: 1230, followers: 890, category: 'Planilhas', bio: 'Dashboards Power BI e Looker.', plan: 'plus', since: '2023', city: 'São José dos Campos/SP' },
  { id: 's-liguapro', name: 'LínguaPRO', handle: '@linguapro', logo: '🌎', color: 'from-sky-500 to-indigo-600', verified: true, rating: 4.7, sales: 4560, followers: 3210, category: 'Idiomas', bio: 'Cursos e materiais de idiomas.', plan: 'plus', since: '2023', city: 'Londrina/PR' },
  { id: 's-pixelperfect', name: 'Pixel Perfect', handle: '@pixelperfect', logo: '🖼️', color: 'from-fuchsia-500 to-pink-700', verified: true, rating: 4.9, sales: 2890, followers: 2100, category: 'Design', bio: 'Artes e templates PSD/Figma.', plan: 'pro', since: '2022', city: 'Caxias do Sul/RS' },
  { id: 's-ai-lab', name: 'AI Lab', handle: '@ailab', logo: '🧠', color: 'from-violet-500 to-purple-700', verified: true, rating: 4.8, sales: 8900, followers: 7430, category: 'IA', bio: 'Ferramentas e agentes de IA.', plan: 'vendor_pro', since: '2023', city: 'São Paulo/SP' },
  { id: 's-gamestart', name: 'GameStart', handle: '@gamestart', logo: '🕹️', color: 'from-red-500 to-orange-600', verified: false, rating: 4.6, sales: 2340, followers: 1780, category: 'Games', bio: 'Jogos indie e keys baratas.', plan: 'free', since: '2024', city: 'Maceió/AL' },
  { id: 's-consultorlgpd', name: 'Consultor LGPD', handle: '@lgpdpro', logo: '🔒', color: 'from-slate-700 to-slate-900', verified: true, rating: 4.9, sales: 890, followers: 620, category: 'Jurídico', bio: 'Documentos LGPD prontos.', plan: 'plus', since: '2023', city: 'Brasília/DF' },
  { id: 's-printables', name: 'Printables BR', handle: '@printables', logo: '🖨️', color: 'from-cyan-500 to-blue-600', verified: false, rating: 4.5, sales: 1670, followers: 1120, category: 'Design', bio: 'Artes e 3D printables.', plan: 'free', since: '2024', city: 'Blumenau/SC' },
  { id: 's-treinohiit', name: 'Treino HIIT', handle: '@treinohiit', logo: '🔥', color: 'from-red-500 to-orange-700', verified: false, rating: 4.7, sales: 2100, followers: 1560, category: 'Saúde', bio: 'Treinos HIIT pra casa.', plan: 'free', since: '2024', city: 'Cuiabá/MT' },
  { id: 's-investidoriniciante', name: 'Investidor Iniciante', handle: '@investidorini', logo: '💰', color: 'from-green-600 to-emerald-800', verified: true, rating: 4.8, sales: 5430, followers: 4120, category: 'Finanças', bio: 'Comece a investir hoje.', plan: 'plus', since: '2023', city: 'Maringá/PR' },
  { id: 's-youtubepro', name: 'YouTube Pro School', handle: '@youtubepro', logo: '▶️', color: 'from-red-600 to-red-800', verified: true, rating: 4.7, sales: 3890, followers: 2980, category: 'Criador', bio: 'Cresça no YouTube do zero.', plan: 'pro', since: '2022', city: 'São Paulo/SP' },
  { id: 's-tiktokking', name: 'TikTokKing', handle: '@tiktokking', logo: '🎵', color: 'from-pink-500 to-cyan-500', verified: true, rating: 4.8, sales: 4560, followers: 3890, category: 'Social', bio: 'Cresça no TikTok rápido.', plan: 'pro', since: '2023', city: 'Goiânia/GO' },
  { id: 's-afiliadoselite', name: 'Afiliados Elite', handle: '@afiliadoselite', logo: '💎', color: 'from-purple-600 to-indigo-800', verified: true, rating: 4.9, sales: 12890, followers: 10230, category: 'Afiliados', bio: 'Afiliado hotmart/monetizze.', plan: 'vendor_pro', since: '2020', city: 'Belo Horizonte/MG' },
  { id: 's-seminovosdigital', name: 'Seminovos Digital', handle: '@seminovos', logo: '♻️', color: 'from-teal-500 to-emerald-700', verified: false, rating: 4.3, sales: 780, followers: 430, category: 'Outro', bio: 'Produtos digitais seminovos.', plan: 'free', since: '2024', city: 'Campina Grande/PB' },
  { id: 's-revistashome', name: 'Revistas Home', handle: '@revistashome', logo: '🏠', color: 'from-amber-500 to-yellow-600', verified: false, rating: 4.5, sales: 1230, followers: 890, category: 'Casa', bio: 'Revistas de decoração e casa.', plan: 'free', since: '2024', city: 'Pelotas/RS' },
  { id: 's-codigostore', name: 'Código Store', handle: '@codigostore', logo: '⌨️', color: 'from-emerald-500 to-cyan-700', verified: true, rating: 4.9, sales: 3450, followers: 2890, category: 'Dev', bio: 'Códigos, templates e snippets.', plan: 'plus', since: '2023', city: 'São Carlos/SP' },
  { id: 's-maquiagemx', name: 'Maquiagem X', handle: '@maquiagemx', logo: '💋', color: 'from-pink-500 to-rose-700', verified: true, rating: 4.7, sales: 2100, followers: 1670, category: 'Beleza', bio: 'Presets e guias de maquiagem.', plan: 'plus', since: '2023', city: 'Uberaba/MG' },
  { id: 's-mathemaf', name: 'Matemaf', handle: '@mathemaf', logo: '🔢', color: 'from-blue-500 to-indigo-700', verified: true, rating: 4.8, sales: 1890, followers: 1420, category: 'Educação', bio: 'Resumos e listas ENEM.', plan: 'free', since: '2023', city: 'Juiz de Fora/MG' },
  { id: 's-viagembarata', name: 'Viagem Barata', handle: '@viagembarata', logo: '✈️', color: 'from-sky-400 to-blue-600', verified: false, rating: 4.6, sales: 1450, followers: 1100, category: 'Viagem', bio: 'Guias e planilhas de viagem.', plan: 'free', since: '2024', city: 'Foz do Iguaçu/PR' },
  { id: 's-petzshop', name: 'Petz Shop Digital', handle: '@petzshop', logo: '🐾', color: 'from-amber-500 to-orange-600', verified: false, rating: 4.5, sales: 780, followers: 520, category: 'Pets', bio: 'Planilhas e guias para pets.', plan: 'free', since: '2024', city: 'Petrolina/PE' },
  { id: 's-mentebilionaria', name: 'Mente Bilionária', handle: '@mentebilion', logo: '🧠', color: 'from-purple-600 to-indigo-800', verified: true, rating: 4.7, sales: 5670, followers: 4320, category: 'Mindset', bio: 'Mentalidade e desenvolvimento.', plan: 'plus', since: '2023', city: 'São Paulo/SP' },
  { id: 's-eventostore', name: 'Evento Store', handle: '@eventostore', logo: '🎉', color: 'from-pink-500 to-purple-700', verified: false, rating: 4.5, sales: 890, followers: 620, category: 'Eventos', bio: 'Convites e kits de festa.', plan: 'free', since: '2024', city: 'Bauru/SP' },
  { id: 's-papeldeparede', name: 'Papel de Parede', handle: '@wallpapersbr', logo: '🖼️', color: 'from-cyan-500 to-violet-600', verified: false, rating: 4.6, sales: 2340, followers: 1780, category: 'Wallpaper', bio: 'Wallpapers 4K e packs.', plan: 'free', since: '2024', city: 'Anápolis/GO' },
  { id: 's-sejapro', name: 'SejaPRO', handle: '@sejapro', logo: '🏆', color: 'from-yellow-500 to-amber-600', verified: true, rating: 4.9, sales: 8900, followers: 7230, category: 'Carreira', bio: 'Cursos profissionalizantes.', plan: 'pro', since: '2022', city: 'Fortaleza/CE' },
  { id: 's-cervejaartesanal', name: 'Cerveja Artesanal', handle: '@cervejaart', logo: '🍺', color: 'from-amber-600 to-orange-700', verified: false, rating: 4.7, sales: 340, followers: 210, category: 'Gastronomia', bio: 'Receitas de cerveja artesanal.', plan: 'free', since: '2024', city: 'Blumenau/SC' },
  { id: 's-motorpro', name: 'MotorPRO', handle: '@motorpro', logo: '🚗', color: 'from-slate-700 to-zinc-800', verified: false, rating: 4.4, sales: 560, followers: 340, category: 'Auto', bio: 'Manuais e guias automotivos.', plan: 'free', since: '2024', city: 'Betim/MG' },
  { id: 's-yogabrasil', name: 'Yoga Brasil', handle: '@yogabrasil', logo: '🧘‍♀️', color: 'from-purple-400 to-pink-600', verified: true, rating: 4.8, sales: 1230, followers: 910, category: 'Bem-estar', bio: 'Rotinas e guias de yoga.', plan: 'plus', since: '2023', city: 'Florianópolis/SC' },
  { id: 's-kdpbrasil', name: 'KDP Brasil', handle: '@kdpbrasil', logo: '📕', color: 'from-orange-500 to-red-600', verified: true, rating: 4.7, sales: 2340, followers: 1870, category: 'Livros', bio: 'Templates KDP Amazon Brasil.', plan: 'plus', since: '2023', city: 'Porto Velho/RO' },
  { id: 's-dieta30dias', name: 'Dieta 30 Dias', handle: '@dieta30', logo: '🥗', color: 'from-lime-500 to-green-700', verified: false, rating: 4.6, sales: 3210, followers: 2430, category: 'Saúde', bio: 'Cardápios e planos alimentares.', plan: 'free', since: '2024', city: 'Campos dos Goytacazes/RJ' },
  { id: 's-kiyvostore', name: 'KIYVO Oficial', handle: '@kiyvo', logo: '⚡', color: 'from-brand-500 to-brand-700', verified: true, rating: 5.0, sales: 99999, followers: 99999, category: 'Oficial', bio: 'Loja oficial KIYVO — Brasil.', plan: 'vendor_pro', since: '2025', city: 'Brasil' },
]

// Helper: pegar loja por ID
export function getStoreById(id: string): Store | undefined {
  return STORES.find(s => s.id === id)
}

export function getRandomStore(): Store {
  return STORES[Math.floor(Math.random() * STORES.length)]
}

export function getStoresByCategory(cat: string): Store[] {
  return STORES.filter(s => s.category.toLowerCase() === cat.toLowerCase())
}
