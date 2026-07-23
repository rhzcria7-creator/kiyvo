// Agente ProblemaAgitação — gera copy usando a fórmula PAS (Problema-Agitação-Solução)
export interface PASInput { dor: string; publico?: string; solucao?: string; consequencias?: string[]; produto?: string }
export interface PASResult { headline: string; corpo: string; hook: string; bullets: string[]; cta: string }

export function criarPAS(input: PASInput): PASResult {
  const { dor, publico = 'você', solucao = 'meu método', consequencias = [], produto = 'o produto' } = input
  const cons = consequencias.length ? consequencias : ['perder dinheiro','perder tempo','se frustrar','ver concorrentes passando na frente']
  const headline = `${publico}, você está sofrendo com ${dor}? Isso está te custando caro.`
  const hook = `Se você está enfrentando ${dor}, eu sei exatamente como é — já passei por isso.`
  const corpo =
    `Todo dia você acorda pensando em ${dor}. Tenta aplicar dicas soltas da internet, ${cons.slice(0,2).join(', ')}.\n\n` +
    `Quanto mais você tenta, mais longe o resultado parece. E o pior: ${cons[cons.length - 1]} cada vez que você adia a solução.\n\n` +
    `A boa notícia é que existe um caminho. ${solucao} resolve ${dor} em dias.`
  const bullets = [
    `✅ Acaba com ${dor} sem enrolação`,
    `✅ Resultados já na primeira semana`,
    `✅ Passo a passo, sem precisar saber nada de tecnologia`,
    `✅ Suporte 1:1 quando travar`,
    `✅ Garantia incondicional de 7 dias`,
  ]
  const cta = `Clique aqui para garantir ${produto} e parar de ${dor} a partir de hoje.`
  return { headline, corpo, hook, bullets, cta }
}
