// Agente HeadlineAnalyzer — 10 fórmulas clássicas de headline que vendem
export interface HeadlineInput { nicho?: string; dor?: string; resultado?: string; produto?: string }
export interface HeadlineResult { formulas: Array<{ formula: string; exemplo: string }>; titulos: string[] }

export function gerarHeadlines(input: HeadlineInput): HeadlineResult {
  const { nicho = 'marketing', dor = 'não consegue vender', resultado = 'faturar mais', produto = 'o método' } = input
  const formulas = [
    { formula: 'Como [RESULTADO] em [TEMPO] sem [DOR]', exemplo: `Como ${resultado} em 30 dias sem ${dor}` },
    { formula: 'Eles disseram que [RESULTADO] era impossível. Aqui está a prova.', exemplo: `Eles disseram que ${resultado} era impossível. Aqui está a prova.` },
    { formula: '[NÚMERO] erros de [NICHO] que estão te roubando dinheiro', exemplo: `7 erros de ${nicho} que estão te roubando dinheiro` },
    { formula: 'A verdade sobre [NICHO] que ninguém te conta', exemplo: `A verdade sobre ${nicho} que ninguém te conta` },
    { formula: '[NÚMERO] coisas que eu gostaria de saber antes de [DOR]', exemplo: `5 coisas que eu gostaria de saber antes de ${dor}` },
    { formula: 'Por que [NICHO] não funciona para você (e como consertar)', exemplo: `Por que ${nicho} não funciona para você (e como consertar)` },
    { formula: 'Eu tentei tudo em [NICHO] — eis o que realmente funciona', exemplo: `Eu tentei tudo em ${nicho} — eis o que realmente funciona` },
    { formula: '[PÚBLICO], pare de [DOR] agora', exemplo: `Iniciantes em ${nicho}, parem de ${dor} agora` },
    { formula: 'O segredo de [RESULTADO] que só os top 1% sabem', exemplo: `O segredo de ${resultado} que só os top 1% sabem` },
    { formula: `${produto}: funciona mesmo ou é golpe? (análise honesta)`, exemplo: `${produto}: funciona mesmo ou é golpe?` },
  ]
  const titulos = formulas.map(f => f.exemplo)
  return { formulas, titulos }
}
