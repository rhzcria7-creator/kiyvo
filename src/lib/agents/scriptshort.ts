// Agente ScriptShort — gera roteiros curtos para TikTok/Reels/Shorts
export interface ScriptShortInput {
  nicho: string
  topico?: string
  duracao?: '15s' | '30s' | '60s'
  tom?: 'iniciante' | 'urgente' | 'curioso' | 'divertido' | 'autoridade'
  gancho?: string
}
export interface ScriptShortResult {
  titulo: string
  duracao: string
  hook: string
  cenas: Array<{ tempo: string; falas: string; textoTela: string; visual: string }>
  legendaFinal: string
  callToAction: string
  hashtags: string[]
  trilhaIdeal: string
  dicasGravacao: string[]
}

const HOOKS: Record<string, string[]> = {
  urgente: ['VOCÊ ESTÁ PERDENDO DINHEIRO por não saber disso 👇', 'PARA TUDO e assista até o final!', 'Se você faz X, pare AGORA.'],
  curioso: ['Ninguém te conta isso sobre ${n}...', 'O segredo que ninguém quer que você saiba.', 'Eu descobri um erro de ${n} que TODO MUNDO comete.'],
  divertido: ['Eu tentei ${n} por 7 dias — olha no que deu 😂', 'Quando você pensa que sabe de ${n}...', 'POV: você finalmente aprendeu ${n}.'],
  iniciante: ['Passo 1 para começar em ${n} (do zero)', 'Se você é iniciante em ${n}, esse vídeo é pra você.', 'Primeiro vídeo que você deveria ver sobre ${n}.'],
  autoridade: ['Como eu fiz ${n} em 30 dias (método validado)', '3 coisas que eu faria se começasse em ${n} hoje.', 'Eu faturei ${Math.floor(Math.random()*80)+20}k com essa estratégia de ${n}.'],
}

export function gerarScriptShort(input: ScriptShortInput): ScriptShortResult {
  const { nicho, topico = nicho, duracao = '30s', tom = 'curioso' } = input
  const hooksArr = HOOKS[tom] || HOOKS.curioso
  const hookBase = hooksArr[Math.floor(Math.random() * hooksArr.length)]
  const hook = hookBase.replace(/\$\{n\}/g, nicho)
  const cenas: ScriptShortResult['cenas'] = []
  if (duracao === '15s') {
    cenas.push({ tempo: '0-3s', falas: hook, textoTela: hook.slice(0, 50), visual: 'Close no rosto + expressão de surpresa.' })
    cenas.push({ tempo: '3-10s', falas: `O segredo é: ${topico} na prática, sem enrolação.`, textoTela: topico.toUpperCase(), visual: 'Tela com texto e anotações.' })
    cenas.push({ tempo: '10-15s', falas: 'Salva esse vídeo e segue pra mais dicas!', textoTela: 'SALVA E SEGUE 🔥', visual: 'Apontando para o perfil.' })
  } else if (duracao === '60s') {
    cenas.push({ tempo: '0-3s', falas: hook, textoTela: hook.slice(0, 50), visual: 'Close emocionado.' })
    cenas.push({ tempo: '3-15s', falas: `Vou te mostrar exatamente como ${topico} — eu já testei e funciona.`, textoTela: 'MÉTODO VALIDADO ✅', visual: 'Tela com gráfico.' })
    cenas.push({ tempo: '15-40s', falas: `Primeiro, você precisa definir o objetivo. Depois, aplicar a técnica de ${nicho} de forma consistente por 21 dias.`, textoTela: 'PASSO 1 + PASSO 2', visual: 'Animação com passos.' })
    cenas.push({ tempo: '40-52s', falas: 'O erro que 90% comete é pular esse passo. Não pule.', textoTela: 'NÃO PULE ESSE PASSO', visual: 'X vermelho.' })
    cenas.push({ tempo: '52-60s', falas: 'Comenta "QUERO" que eu te mando o material completo.', textoTela: 'COMENTA "QUERO"', visual: 'Apontar para comentários.' })
  } else {
    cenas.push({ tempo: '0-3s', falas: hook, textoTela: hook.slice(0, 50), visual: 'Close rosto.' })
    cenas.push({ tempo: '3-12s', falas: `Eu vou te ensinar ${topico} em 3 passos simples.`, textoTela: '3 PASSOS', visual: 'Levanta 3 dedos.' })
    cenas.push({ tempo: '12-22s', falas: `Passo 1: entenda o básico de ${nicho}. Passo 2: aplique diariamente por 7 dias. Passo 3: ajuste o que não funcionou.`, textoTela: '1. APRENDA  2. APLIQUE  3. AJUSTE', visual: 'Cortes rápidos.' })
    cenas.push({ tempo: '22-30s', falas: 'Segue pra ver a parte 2!', textoTela: 'SEGUE PRA PART 2 🔥', visual: 'Apontando para seguir.' })
  }
  return {
    titulo: `Como ${topico} — ${duracao} (${tom})`,
    duracao,
    hook,
    cenas,
    legendaFinal: `${hook} Salva esse vídeo e segue pra mais dicas de ${nicho}!`,
    callToAction: 'Segue + comenta "QUERO" e marca um amigo que precisa ver isso.',
    hashtags: [`#${nicho.replace(/\s+/g,'')}`, `#${nicho.replace(/\s+/g,'')}brasil`, '#kiyvo', '#dicasonline', '#foryou', '#fy', '#viralbrasil'],
    trilhaIdeal: 'Trending upbeat brasil (120-140 BPM), voz clara na frente, beat baixo.',
    dicasGravacao: [
      'Posicione câmera na altura dos olhos.',
      'Use luz natural de frente (não contra luz).',
      'Fale alto, claro e rápido (corte silêncios).',
      'Legendas em caixa ALTA, cor amarela ou branca com contorno preto.',
      'Primeiros 3 segundos: rosto + emoção forte (surpresa, choque, felicidade).',
    ],
  }
}
