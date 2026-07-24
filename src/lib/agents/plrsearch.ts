// Agente PLRSearch — ideias de produtos PLR (Private Label Rights) por nicho
export interface PLRInput { nicho: string; quantidade?: number }
export interface PLR { titulo: string; precoSugerido: number; valorPercebido: number; formato: string; paginas: number; idioma: string }
export interface PLRResult { produtos: PLR[]; checklist: string[]; aviso: string }

const FORMATOS = ['Ebook','Checklist','Planilha','Pack Templates','Pack Canva','Curso em vídeo','Áudios','Swipe File']
export function gerarIdeiasPLR(input: PLRInput): PLRResult {
  const { nicho, quantidade = 10 } = input
  const produtos: PLR[] = []
  for (let i = 0; i < quantidade; i++) {
    const formato = FORMATOS[i % FORMATOS.length]
    const preco = formato === 'Curso em vídeo' ? 97 : formato === 'Pack Templates' || formato === 'Pack Canva' ? 37 : 19.9
    const vp = preco * 4 + Math.floor(Math.random()*100)
    produtos.push({
      titulo: `${formato} sobre ${nicho}: ${['Método','Guia Definitivo','Passo a Passo','Para Iniciantes','Checklist','Sem enrolação','Fórmula'][i % 7]}`,
      precoSugerido: preco, valorPercebido: vp, formato,
      paginas: formato === 'Ebook' ? 30 + Math.floor(Math.random()*60) : formato === 'Checklist' ? 15 : 0,
      idioma: 'Português (Brasil)',
    })
  }
  return {
    produtos,
    checklist: [
      'Reescreva 30-50% do conteúdo antes de vender (diferencial).',
      'Adicione sua própria capa e identidade visual.',
      'Inclua seus próprios bônus para valorizar.',
      'Revise o conteúdo antes de publicar (plr pode ter erros).',
      'Não revenda o PLR como é (isso diminui o valor do mercado).',
    ],
    aviso: 'Dica: PLR é ótimo para ímã de leads ou produto front-end barato — combine com bônus próprio para dar cara sua.',
  }
}
