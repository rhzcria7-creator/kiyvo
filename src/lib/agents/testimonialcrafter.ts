// Agente TestimonialCrafter — depoimentos realistas (para mock/preview)
export interface TestimonialInput { produto: string; nicho?: string; quantidade?: number; nota?: number }
export interface Depoimento { nome: string; cidade: string; texto: string; estrelas: number; titulo: string }
export interface TestimonialResult { depoimentos: Depoimento[]; dicasUso: string[]; aviso: string }

const CIDADES = ['São Paulo','Rio de Janeiro','Belo Horizonte','Porto Alegre','Curitiba','Recife','Salvador','Fortaleza','Brasília','Florianópolis','Manaus','Goiânia','Campinas','Vitória','Sete Lagoas','Campo Grande','Cuiabá','João Pessoa']
const NOMES = ['João Pedro','Maria Fernanda','Pedro Henrique','Ana Carolina','Lucas Gabriel','Juliana Souza','Carlos Alberto','Beatriz Santos','Rafael Costa','Larissa Oliveira','Marcos Vinicius','Camila Rodrigues','Thiago Almeida','Amanda Silva','Gustavo Ferreira']
const TITULOS = ['Vale cada centavo','Mudou minha vida','Incrível mesmo','Não acreditava até ver','Resultado em 10 dias','Comprei e já recomendei','Melhor investimento que fiz','Simples e direto']

export function gerarDepoimentos(input: TestimonialInput): TestimonialResult {
  const { produto, quantidade = 5, nota = 5 } = input
  const deps: Depoimento[] = []
  for (let i = 0; i < quantidade; i++) {
    const nome = NOMES[Math.floor(Math.random()*NOMES.length)]
    const cidade = CIDADES[Math.floor(Math.random()*CIDADES.length)]
    const estrelas = nota || (Math.random() > 0.15 ? 5 : 4)
    const frases = [
      `Comecei ${produto} sem esperar muito, mas em 2 semanas já vi resultado. Recomendo!`,
      `Já tinha gastado dinheiro com outras coisas, mas só ${produto} realmente funcionou pra mim.`,
      `A didática é excelente, não enrola e entrega tudo o que promete.`,
      `O suporte responde super rápido — isso pra mim já vale a pena.`,
      `Só o bônus já vale o preço do ${produto} inteiro.`,
      `Comecei do absoluto zero e em 1 mês consegui minhas primeiras vendas.`,
      `Diferencial é ser prático: sem teoria vazia, só o que funciona.`,
    ]
    deps.push({
      nome, cidade, estrelas,
      titulo: TITULOS[Math.floor(Math.random()*TITULOS.length)],
      texto: frases[Math.floor(Math.random()*frases.length)],
    })
  }
  return {
    depoimentos: deps,
    dicasUso: [
      'Use depoimentos com nome + cidade para aumentar credibilidade.',
      'Sempre peça autorização antes de usar o nome do cliente.',
      'Depoimentos em vídeo convertem 2x mais que texto.',
      'Prefira prints de WhatsApp/Instagram a texto editado.',
    ],
    aviso: 'ATENÇÃO: Estes são exemplos gerados para layout/preview. Nunca invente depoimentos em páginas de venda — isso fere o CDC.',
  }
}
