// Agente PersonaBuilder — cria personas completas (avatars de cliente)
// Inspirado em Jobs To Be Done + 4Questions Framework
export interface PersonaInput { nicho: string; produto?: string; faixaEtaria?: string; renda?: string; regiao?: string; genero?: string }
export interface Persona {
  nome: string
  idade: number
  profissao: string
  renda: string
  cidade: string
  familia: string
  frustracoes: string[]
  desejos: string[]
  objeções: string[]
  ondeEsta: string[]
  canaisFavoritos: string[]
  horarioCompra: string
  gatilho: string
  ofertaIdeal: string
  precoSensibilidade: 'baixa'|'media'|'alta'
  fotoDescricao: string
  citacao: string
}
export interface PersonaOutput { personas: Persona[]; publicoFrio: Persona; publicoQuente: Persona; estrategia: string }
const NOMES_F = ['Juliana','Ana','Beatriz','Carla','Daniela','Eduarda','Fernanda','Gabriela','Helena','Isabela','Juliana','Larissa','Mariana','Natália','Patrícia']
const NOMES_M = ['Carlos','André','Bruno','Daniel','Eduardo','Felipe','Gustavo','Henrique','Igor','João','Lucas','Marcelo','Nathan','Pedro','Rafael','Thiago']
const CIDADES = ['São Paulo (SP)','Rio de Janeiro (RJ)','Belo Horizonte (MG)','Curitiba (PR)','Porto Alegre (RS)','Brasília (DF)','Salvador (BA)','Fortaleza (CE)','Recife (PE)','Florianópolis (SC)','Campinas (SP)','Goiânia (GO)','Manaus (AM)','Sete Lagoas (MG)']
const PROFISSOES = ['Designer freelancer','Engenheira de software','Chefe de cozinha','Enfermeira','Empreendedor digital','Vendedora','Professor','Dona de casa','Influenciadora digital','Médico','Estudante universitária','Gerente de marketing','Desenvolvedor frontend','Analista de RH','Coach']
const RENDA = ['R$ 1.500 - R$ 3.000 (iniciante/classe média-baixa)','R$ 3.000 - R$ 8.000 (classe média)','R$ 8.000 - R$ 15.000 (classe média-alta)','R$ 15.000+ (alta renda)']
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }
export function criarPersonas(input: PersonaInput): PersonaOutput {
  const { nicho, produto = 'seu produto', faixaEtaria = '25-35', regiao = 'Brasil' } = input
  const [minI, maxI] = faixaEtaria.split('-').map(x => Number(x) || 25)
  const makePersona = (nome: string, genero: 'F'|'M', idadeOffset: number): Persona => {
    const idade = Math.max(18, Math.floor((minI+maxI)/2 + idadeOffset + (Math.random()-0.5)*6))
    const profissao = pick(PROFISSOES)
    const cidade = pick(CIDADES)
    const renda = pick(RENDA)
    return {
      nome, idade, profissao, renda, cidade,
      familia: idade < 28 ? 'Solteiro(a), sem filhos, mora só ou com amigos' : idade < 40 ? 'Casado(a)/união estável, pode ter 1 filho' : 'Casado(a), filhos, casa própria',
      frustracoes: [
        `Já tentou várias soluções de ${nicho} e nada funcionou`,
        `Não tem tempo de ficar consumindo conteúdo gratuito de YouTube`,
        `Sente que está perdendo dinheiro/resultado por não saber o caminho certo`,
        `Cansado(a) de promessas vazias de gurus de ${nicho}`,
      ],
      desejos: [
        `Resultado RÁPIDO em menos de 30 dias com ${produto}`,
        `Método passo a passo sem enrolação`,
        `Suporte humano que responde em menos de 24h`,
        `Garantia caso não funcione`,
        `Fazer parte de uma comunidade de pessoas com o mesmo objetivo`,
      ],
      objeções: [
        `'Está caro'`,
        `'Já comprei outro curso/produto de ${nicho} que foi furada'`,
        `'Não sei se tenho tempo para aplicar'`,
        `'Será que funciona para mim especificamente?'`,
      ],
      ondeEsta: ['Instagram Reels','TikTok','YouTube','WhatsApp','Google ao pesquisar sobre o tema','Grupos de Telegram de nicho','E-mail newsletters'],
      canaisFavoritos: genero === 'F' ? ['Instagram Reels','TikTok','Pinterest','E-mail marketing'] : ['YouTube','Google','Instagram','LinkedIn'],
      horarioCompra: genero === 'F' ? 'Noite 20h-22h' : 'Horário de almoço 12h-13h ou noite 21h-23h',
      gatilho: 'Ver resultado de uma pessoa REAL (não influencer) usando o produto + depoimento em vídeo',
      ofertaIdeal: `${produto} + bônus exclusivo + garantia 7 dias + comunidade`,
      precoSensibilidade: idade < 25 ? 'alta' : idade < 35 ? 'media' : 'baixa',
      fotoDescricao: idade < 30 ? 'Foto sorrindo, óculos de sol ou filtro suave, look casual de dia' : 'Foto profissional, camisa/business casual, fundo neutro',
      citacao: `"Quero resultado sem enrolação e por um preço que valha a pena"`,
    }
  }
  const persona1 = makePersona(pick(NOMES_F), 'F', -3)
  const persona2 = makePersona(pick(NOMES_M), 'M', 4)
  const persona3 = makePersona(pick(NOMES_F), 'F', 8)
  const publicoFrio: Persona = {
    ...persona1, nome: 'Visitante Frio',
    frustracoes: [...persona1.frustracoes, 'Ainda não sabe que tem um problema'],
    desejos: ['Conteúdo gratuito que resolva um pedacinho da dor','Dicas rápidas'],
    objeções: ['Não sabe quem você é','Não confia ainda','Não estava procurando comprar'],
    gatilho: 'Hook que chama atenção no feed (dor/revelação)',
    ofertaIdeal: 'Isca digital (PDF/checklist GRÁTIS)',
    precoSensibilidade: 'alta',
  }
  const publicoQuente: Persona = {
    ...persona2, nome: 'Cliente Quente',
    frustracoes: [...persona2.frustracoes, 'Já decidiu comprar mas falta o empurrãozinho'],
    desejos: [...persona2.desejos, 'Desconto exclusivo','Urgência','Segurança de garantia'],
    objeções: ['Só tem dúvida de qual opção','Esperando uma promoção'],
    gatilho: 'Oferta relâmpago com contador + prova social de compradores recentes',
    ofertaIdeal: 'Produto + desconto 10% + bônus por tempo limitado',
    precoSensibilidade: 'baixa',
  }
  return {
    personas: [persona1, persona2, persona3],
    publicoFrio, publicoQuente,
    estrategia: `FUNIL: 1) Tráfego frio: reels de dor + isca digital → capturar WhatsApp/email.\n2) Meio: nutrir com conteúdo educativo, provas e casos por 3-7 dias.\n3) Fundo: oferta com escassez real (bônus expirando, estoque baixo) + garantia.\nPúblico-alvo: ${nicho} em ${regiao} na faixa etária ${faixaEtaria}.\nOrçamento de mídia: alocar 60% no canal onde sua persona principal mais consome (${persona1.canaisFavoritos[0]}).`,
  }
}
