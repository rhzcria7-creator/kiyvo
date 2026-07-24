// Agente PersonaCraft — cria personas detalhadas com base em nicho
// (evolui o PersonaBuilder existente com mais profundidade)
export interface PersonaCraftInput {
  nicho: string
  produto?: string
  publicoAlvo?: string
  faixaEtaria?: string
  renda?: string
}
export interface PersonaCraftPersona {
  nome: string
  idade: number
  profissao: string
  cidade: string
  rendaMensal: string
  estadoCivil: string
  filhos: boolean
  nivelEducacional: string
  redesSociais: string[]
  dispositivos: string[]
  horariosOnline: string[]
  dores: string[]
  desejos: string[]
  objecoes: string[]
  influenciadores: string[]
  fontesInformacao: string[]
  historia: string
  diaADia: string
  fraseRepresentativa: string
  ofertaIdeal: string
}
export interface PersonaCraftResult {
  personas: PersonaCraftPersona[]
  antiPersonas: PersonaCraftPersona[]
  hookIdeais: string[]
  canaisAquisicao: string[]
}

const NOMES_M = ['Carlos','João','Pedro','Lucas','Rafael','Marcos','Gustavo','Thiago','Rodrigo','Felipe']
const NOMES_F = ['Ana','Maria','Juliana','Fernanda','Beatriz','Larissa','Camila','Amanda','Patricia','Mariana']
const CIDADES = ['São Paulo','Rio de Janeiro','Belo Horizonte','Porto Alegre','Curitiba','Salvador','Recife','Fortaleza','Brasília','Manaus','Florianópolis','Goiânia']

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export function criarPersonasCraft(input: PersonaCraftInput): PersonaCraftResult {
  const { nicho, produto = nicho } = input
  const mkPersona = (ehAnti = false): PersonaCraftPersona => {
    const fem = Math.random() > 0.5
    const nome = fem ? pick(NOMES_F) : pick(NOMES_M)
    const sobre = fem ? 'Silva' : 'Oliveira'
    const idade = ehAnti ? 17 + Math.floor(Math.random() * 45) : 25 + Math.floor(Math.random() * 30)
    return {
      nome: `${nome} ${sobre}`,
      idade,
      profissao: ehAnti
        ? pick(['Estudante','Aposentado','Desempregado'])
        : pick(['Empreendedor digital','CLT com renda extra','Freelancer','MEI','Professor','Vendedor','Marketing','Infoprodutor','Criador de conteúdo']),
      cidade: pick(CIDADES),
      rendaMensal: ehAnti ? '< R$ 1.500' : pick(['R$ 2k - R$ 4k', 'R$ 4k - R$ 8k', 'R$ 8k - R$ 15k', 'R$ 15k+']),
      estadoCivil: pick(['Solteiro(a)','Casado(a)','União estável']),
      filhos: Math.random() > 0.5,
      nivelEducacional: pick(['Ensino Superior completo','Pós-graduado','Cursando superior']),
      redesSociais: pick(['Instagram','TikTok','YouTube','Facebook','LinkedIn']) ? ['Instagram','TikTok','YouTube'] : ['Instagram','Facebook'],
      dispositivos: ['Smartphone Android','iPhone','Notebook'],
      horariosOnline: ['7h-9h (café)','12h-13h (almoço)','19h-23h (noite)'],
      dores: [
        `Não sabe como começar em ${nicho} mesmo consumindo conteúdo grátis há meses`,
        'Já comprou outros cursos e não aplicou nada',
        'Tem pouco tempo por dia por causa do trabalho/família',
        `Sente que ${nicho} é complicado e cheio de detalhes`,
      ],
      desejos: [
        `Conseguir resultados em ${nicho} em menos de 30 dias`,
        'Ter uma renda extra ou sair do emprego',
        'Ser reconhecido(a) no nicho',
        `Aplicar ${produto} sem precisar de ajuda`,
      ],
      objecoes: [
        '"Será que funciona para mim?"',
        '"Já gastei dinheiro com outras coisas que não funcionaram"',
        '"Não tenho tempo"',
        '"Não tenho dinheiro para investir"',
        '"Será que não é mais um golpe?"',
      ],
      influenciadores: [pick(['Hotmart','Monetizze','Kipper','Peter Jordan','Primo Rico','Thiago Nigro','Camila Coutinho','Rafaella Kalimann','Niina Secrets'])],
      fontesInformacao: ['YouTube','Instagram','Podcasts','Blogs de nicho','Grupos de WhatsApp'],
      historia: `${nome} trabalha há ${Math.floor(idade - 22)} anos na área, sempre sonhou em trabalhar com ${nicho} mas nunca teve um caminho claro. Já tentou sozinho(a) e travou no meio. Agora está decidido(a) a investir em um método estruturado.`,
      diaADia: `${nome} acorda às 6h30, trabalha o dia todo, tem ${Math.random() > 0.5 ? '1 filho pequeno' : 'vida social agitada'} e só tem 1-2h por dia para estudar/criar. Usa o celular em 80% do tempo online.`,
      fraseRepresentativa: `"Quero algo que funcione SEM eu ter que pensar muito — passo a passo, direto ao ponto."`,
      ofertaIdeal: ehAnti
        ? 'Não é cliente — busca só conteúdo gratuito e nunca compra.'
        : `${produto} com garantia de 7 dias, por R$ 97 à vista ou 12x de R$ 9,74, com bônus se comprar hoje.`,
    }
  }
  const personas = [mkPersona(false), mkPersona(false)]
  const antiPersonas = [mkPersona(true)]
  return {
    personas,
    antiPersonas,
    hookIdeais: [
      `Para quem está travado em ${nicho} e não sabe mais o que tentar`,
      `Como ${personas[0].profissao.toLowerCase()} faturou sua primeira renda extra com ${nicho} em 21 dias`,
      `O erro de ${Math.floor(Math.random() * 80) + 10}% das pessoas que começam em ${nicho} (e como evitar)`,
      `${produto}: funciona mesmo? Veja o resultado da ${personas[0].nome.split(' ')[0]} em 30 dias.`,
    ],
    canaisAquisicao: ['Instagram Reels','TikTok','YouTube Shorts','Facebook Ads','Google Search','Afiliados','Indicação orgânica'],
  }
}
