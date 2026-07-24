// Agente StoryBuilder — sequência de stories com interação para Instagram/TikTok
// Inclui enquetes, perguntas, quiz, contadores e CTA
export interface StoryFrame {
  ordem: number
  tipo: 'hook'|'enquete'|'pergunta'|'quiz'|'resultado'|'conteudo'|'cta'|'deslizar'|'emoji_slider'
  texto: string
  fundo: string
  corTexto: string
  adesivo?: string
  cta?: string
}
export interface StoryInput { nicho: string; produto?: string; objetivo?: 'engajar'|'vender'|'audiencia'|'enquete'; tom?: 'influencer'|'amigo'|'marca' }
export interface StoryOutput { frames: StoryFrame[]; duracaoTotal: string; hasPoll: boolean; hasQuestion: boolean; ideiasEnquetes: string[]; dicas: string[]; sequenciaLegendas: string[] }
const FUNDOS = ['#0F172A','#2563EB','#7C3AED','#EC4899','#10B981','#F59E0B','#EF4444','#000000','#FAFAFA']
export function criarSequenciaStories(input: StoryInput): StoryOutput {
  const { nicho, produto, objetivo = 'engajar', tom = 'influencer' } = input
  const frames: StoryFrame[] = []
  let ordem = 1
  // Hook
  frames.push({ ordem: ordem++, tipo:'hook', texto:`"VOCÊ NÃO VAI ACREDITAR NO QUE ACONTECEU 🤯"\n\n(sobre ${nicho}${produto?` + ${produto}`:''})`, fundo: pick(FUNDOS), corTexto:'#FFFFFF' })
  if (objetivo === 'enquete' || objetivo === 'engajar') {
    frames.push({ ordem: ordem++, tipo:'enquete', texto:`Você já teve problema com ${nicho}?`, fundo:pick(FUNDOS), corTexto:'#FFFFFF', adesivo:'Sim | Não' })
    frames.push({ ordem: ordem++, tipo:'emoji_slider', texto:`Quão frustrante é isso pra você? 😤`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'conteudo', texto:`Pois eu descobri uma forma de resolver isso em 15min 🤫`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'quiz', texto:`Qual você acha que é o erro nº1? 🧠`, fundo:pick(FUNDOS), corTexto:'#FFFFFF', adesivo:'A) Desistir cedo | B) Falta de método | C) Ferramentas erradas' })
    frames.push({ ordem: ordem++, tipo:'resultado', texto:`É a B! Método é tudo...\n\nEu achava que era A até aprender isso 👇`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
  } else if (objetivo === 'vender') {
    frames.push({ ordem: ordem++, tipo:'conteudo', texto:`3 motivos que fazem ${produto||nicho} valer CADA centavo:`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'conteudo', texto:`1. Resultado em 7 dias ✅`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'conteudo', texto:`2. Suporte em português em 1h 💙`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'conteudo', texto:`3. Garantia incondicional de 7 dias 🛡️`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'enquete', texto:`Você já comprou algo parecido e se arrependeu?`, fundo:pick(FUNDOS), corTexto:'#FFFFFF', adesivo:'Já | Nunca' })
  } else {
    frames.push({ ordem: ordem++, tipo:'pergunta', texto:`Pergunta: qual sua maior dificuldade em ${nicho}?`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'conteudo', texto:`Amanhã eu posto a resposta dos especialistas 👀`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
  }
  if (produto && (objetivo === 'vender' || objetivo === 'engajar')) {
    frames.push({ ordem: ordem++, tipo:'conteudo', texto:`Eu testei ${produto} por 7 dias e olha no que deu 👀`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'resultado', texto:`Antes x Depois:`, fundo:pick(FUNDOS), corTexto:'#FFFFFF' })
    frames.push({ ordem: ordem++, tipo:'cta', texto:`Clica no link da bio pra pegar o seu 🔥\nCupom: KIYVO10`, fundo:'#0F172A', corTexto:'#FFFFFF', cta:'Link na bio' })
  } else {
    frames.push({ ordem: ordem++, tipo:'cta', texto:`Segue pra não perder a parte 2 🚀`, fundo:pick(FUNDOS), corTexto:'#FFFFFF', cta:'Seguir' })
  }
  return {
    frames,
    duracaoTotal: `${frames.length * 5}s (5s por story)`,
    hasPoll: frames.some(f => f.tipo === 'enquete' || f.tipo === 'quiz'),
    hasQuestion: frames.some(f => f.tipo === 'pergunta'),
    ideiasEnquetes: [
      `Você já usou ${produto||nicho}?`,
      `Preço ideal: R$97 ou R$197?`,
      `Você prefere vídeo curto ou longo?`,
      `Começou em ${nicho} há quanto tempo?`,
      `Qual sua maior dificuldade? Dinheiro/Tempo/Medo`,
    ],
    sequenciaLegendas: frames.map(f => f.texto),
    dicas: [
      '📱 Stories tem duração MÁXIMA de atenção: 3s por frame',
      '🎯 SEMPRE comece com pergunta/afirmação chocante nos 2 primeiros',
      '💬 Enquetes e quizzes AUMENTAM alcance em até 3x (algoritmo ama interação)',
      '🔗 Coloque CTA no penúltimo ou último story — nunca no primeiro',
      '✨ Fundo escuro + texto amarelo/claro tem melhor legibilidade',
      '🎵 Use áudio em alta para aumentar tempo de visualização',
      '🚫 Não coloque texto MUITO em cima da área do nome/perfil',
    ],
  }
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }
