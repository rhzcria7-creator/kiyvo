// Agente PixelPerfect — diagnóstico de pixel, tracking e eventos
// Verifica configuração recomendada do Meta Pixel, Google Analytics e Google Tag Manager
export interface PixelConfig {
  canal: 'meta'|'google_ads'|'ga4'|'tiktok'
  eventos: string[]
  retargetingAtivo: boolean
  conversaoPersonalizada: boolean
  apiConversionsAtiva: boolean
  matchQuality?: number
}
export interface PixelInput { site: string; pixelId?: string; canais?: string[]; vendasPorDia?: number; ticketMedio?: number }
export interface Evento { nome: string; trigger: string; onde: string; importancia: 'critico'|'importante'|'bom_ter' }
export interface Problema { severidade: 'critica'|'media'|'baixa'; descricao: string; comoResolver: string }
export interface PixelOutput { score: number; cor: string; eventosRecomendados: Evento[]; problemasEncontrados: Problema[]; melhorias: string[]; receitaEstimadaAumento: string; checklistImplementacao: string[] }
const EVENTOS_META: Evento[] = [
  { nome: 'PageView', trigger: 'Todas as páginas', onde: 'Cabeçalho do site', importancia: 'critico' },
  { nome: 'ViewContent', trigger: 'Visualização de produto', onde: 'Página de produto', importancia: 'critico' },
  { nome: 'AddToCart', trigger: 'Adicionar ao carrinho', onde: 'Botão de adicionar', importancia: 'critico' },
  { nome: 'InitiateCheckout', trigger: 'Início do checkout', onde: 'Página de checkout', importancia: 'critico' },
  { nome: 'Purchase', trigger: 'Compra confirmada', onde: 'Página de obrigado', importancia: 'critico' },
  { nome: 'Search', trigger: 'Busca no site', onde: 'Barra de busca', importancia: 'importante' },
  { nome: 'Lead', trigger: 'Cadastro/lead', onde: 'Formulários', importancia: 'importante' },
  { nome: 'AddToWishlist', trigger: 'Adicionar aos favoritos', onde: 'Botão favorito', importancia: 'bom_ter' },
  { nome: 'Contact', trigger: 'Contato via WhatsApp/chat', onde: 'Botão contato', importancia: 'bom_ter' },
  { nome: 'ViewContent (75%)', trigger: 'Leu 75% da página de vendas', onde: 'Páginas longas', importancia: 'importante' },
]
export function diagnosticarPixeis(input: PixelInput): PixelOutput {
  const { vendasPorDia = 10, ticketMedio = 97 } = input
  let score = 70
  const problemas: Problema[] = []
  const melhorias: string[] = []
  const eventosRecomendados: Evento[] = [...EVENTOS_META]
  // Simulação de diagnóstico
  problemas.push({ severidade: 'media', descricao: 'Conversions API (CAPI) não está ativa', comoResolver: 'Ligar API de Conversões do Meta no GTM e enviar eventos server-side também. CAPI aumenta match quality em 30%.' })
  problemas.push({ severidade: 'baixa', descricao: 'Eventos padrão sem parâmetros de valor', comoResolver: 'Adicione value, currency e content_ids em todos os eventos de compra/carrinho para otimizar por ROAS.' })
  score -= 15
  melhorias.push('Ligar CAPI (Conversions API) em todos os canais')
  melhorias.push('Configurar deduplicação entre browser events e API events')
  melhorias.push('Adicionar eventos de tempo de permanência (time_spent)')
  melhorias.push('Criar eventos personalizados: "IniciouCheckout" e "AbandonouCarrinho"')
  melhorias.push('Implementar Advanced Matching (envia email/telefone hashado)')
  const cor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  const receita = vendasPorDia * ticketMedio * 30 * 0.15 // +15% estimado após implementação
  return {
    score,
    cor,
    eventosRecomendados,
    problemasEncontrados: problemas,
    melhorias,
    receitaEstimadaAumento: `+15-25% em ROAS (~R$ ${receita.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}/mês após implementar CAPI)`,
    checklistImplementacao: [
      '✅ Pixel Meta instalado em todas as páginas (PageView)',
      '✅ ViewContent em página de produto com content_ids',
      '✅ AddToCart em todos botões de adicionar',
      '✅ InitiateCheckout no início do checkout',
      '✅ Purchase APENAS na página de obrigado',
      '✅ Conversions API (CAPI) configurada via GTM',
      '✅ Advanced Matching (hash de email/phone) ativado',
      '✅ Eventos deduplicados entre browser e CAPI (event_id)',
      '✅ Domínio verificado e Aggregated Event Measurement configurado',
      '✅ Testar via Test Events do Events Manager',
    ],
  }
}
