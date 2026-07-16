import { Category } from '@/types'

export const mockCategories: Category[] = [
  // 🔥 Top categorias digitais — jogos + muito mais
  { id: '1', name: 'Jogos & Contas', slug: 'jogos-contas', image: 'https://picsum.photos/seed/jogos/300/200', productCount: 2341, featured: true, icon: '🎮' },
  { id: '2', name: 'Software & Licenças', slug: 'software-licencas', image: 'https://picsum.photos/seed/software/300/200', productCount: 1876, featured: true, icon: '💿' },
  { id: '3', name: 'Cursos Online', slug: 'cursos-online', image: 'https://picsum.photos/seed/cursos/300/200', productCount: 1456, featured: true, icon: '🎓' },
  { id: '4', name: 'E-books & PDFs', slug: 'ebooks-pdfs', image: 'https://picsum.photos/seed/ebooks/300/200', productCount: 987, featured: true, icon: '📚' },
  { id: '5', name: 'Design & Templates', slug: 'design-templates', image: 'https://picsum.photos/seed/design/300/200', productCount: 2345, featured: true, icon: '🎨' },
  { id: '6', name: 'Streaming & Mídia', slug: 'streaming-midia', image: 'https://picsum.photos/seed/streaming/300/200', productCount: 1234, featured: true, icon: '🎬' },
  { id: '7', name: 'Gift Cards', slug: 'gift-cards', image: 'https://picsum.photos/seed/giftcard/300/200', productCount: 3456, featured: true, icon: '🎁' },
  { id: '8', name: 'Domínios & Sites', slug: 'dominios-sites', image: 'https://picsum.photos/seed/dominios/300/200', productCount: 567, featured: true, icon: '🌐' },
  // Categorias secundárias
  { id: '9', name: 'APIs & Serviços Cloud', slug: 'apis-cloud', image: 'https://picsum.photos/seed/apis/300/200', productCount: 432, featured: false, icon: '⚡' },
  { id: '10', name: 'Música & Áudio', slug: 'musica-audio', image: 'https://picsum.photos/seed/musica/300/200', productCount: 678, featured: false, icon: '🎵' },
  { id: '11', name: 'Fotos & Vídeos', slug: 'fotos-videos', image: 'https://picsum.photos/seed/fotos/300/200', productCount: 890, featured: false, icon: '📸' },
  { id: '12', name: 'Cripto & NFT', slug: 'cripto-nft', image: 'https://picsum.photos/seed/cripto/300/200', productCount: 345, featured: false, icon: '🪙' },
  { id: '13', name: 'Steam Keys', slug: 'steam-keys', image: 'https://picsum.photos/seed/steam/300/200', productCount: 806, featured: false, icon: '🔑' },
  { id: '14', name: 'Moedas & Gold', slug: 'moedas-gold', image: 'https://picsum.photos/seed/gold/300/200', productCount: 567, featured: false, icon: '💰' },
  { id: '15', name: 'Itens & Skins', slug: 'itens-skins', image: 'https://picsum.photos/seed/skins/300/200', productCount: 1234, featured: false, icon: '⚔️' },
  { id: '16', name: 'Plugins & Extensões', slug: 'plugins-extensoes', image: 'https://picsum.photos/seed/plugins/300/200', productCount: 756, featured: false, icon: '🧩' },
  { id: '17', name: 'Ferramentas & Apps', slug: 'ferramentas-apps', image: 'https://picsum.photos/seed/ferramentas/300/200', productCount: 456, featured: false, icon: '🛠️' },
  { id: '18', name: 'Assinaturas', slug: 'assinaturas', image: 'https://picsum.photos/seed/assin/300/200', productCount: 1234, featured: false, icon: '🔄' },
  { id: '19', name: '3D & Modelos', slug: '3d-modelos', image: 'https://picsum.photos/seed/3dmodel/300/200', productCount: 234, featured: false, icon: '🧊' },
  { id: '20', name: 'Serviços Freelance', slug: 'servicos-freelance', image: 'https://picsum.photos/seed/freelance/300/200', productCount: 678, featured: false, icon: '💼' },
]

export const digitalSubcategories = [
  { name: 'Contas & Acessos', icon: '👤' },
  { name: 'Keys & Códigos', icon: '🔑' },
  { name: 'Licenças & Ativações', icon: '📜' },
  { name: 'Cursos & Treinamentos', icon: '🎓' },
  { name: 'Templates & Assets', icon: '🎨' },
  { name: 'Gift Cards', icon: '🎁' },
  { name: 'Domínios & APIs', icon: '🌐' },
  { name: 'Serviços', icon: '🛠️' },
]
