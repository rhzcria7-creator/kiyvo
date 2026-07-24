// Agente ContratoRapido — gera minutas simples (prestação de serviços, parceria, afiliado)
// NÃO é documento jurídico oficial — apenas ponto de partida
export interface ContratoInput {
  tipo: 'prestacao' | 'afiliado' | 'parceria' | 'licenca' | 'freelance'
  contratante?: string
  contratado?: string
  valor?: number
  prazo?: string
  escopo?: string
}
export interface ContratoResult { titulo: string; clausulas: string[]; aviso: string }

export function gerarMinuta(input: ContratoInput): ContratoResult {
  const { tipo, contratante = '[CONTRATANTE]', contratado = '[CONTRATADO]', valor = 0, prazo = '[PRAZO]', escopo = '[DESCRIÇÃO DOS SERVIÇOS]' } = input
  const clausulas: string[] = []
  clausulas.push(`1. PARTES: Entre ${contratante}, doravante denominado CONTRATANTE, e ${contratado}, denominado CONTRATADO.`)
  if (tipo === 'prestacao' || tipo === 'freelance') {
    clausulas.push(`2. OBJETO: O CONTRATADO prestará os seguintes serviços: ${escopo}.`)
    clausulas.push(`3. VALOR: O CONTRATANTE pagará ao CONTRATADO o valor de R$ ${valor.toFixed(2)} em ${prazo}.`)
    clausulas.push('4. PAGAMENTO: Via PIX/transferência em até 5 dias úteis após entrega.')
    clausulas.push('5. PROPRIEDADE INTELECTUAL: O trabalho entregue será de propriedade do CONTRATANTE após pagamento.')
  } else if (tipo === 'afiliado') {
    clausulas.push('2. OBJETO: O CONTRATADO promoverá os produtos do CONTRATANTE em troca de comissão.')
    clausulas.push(`3. COMISSÃO: ${valor}% sobre cada venda realizada através do link único.`)
    clausulas.push('4. COOKIE: Atribuição por 30 dias após clique no link.')
    clausulas.push('5. RESTRIÇÕES: É proibido spam, promessas enganosas ou leilão de palavras marcadas.')
  } else if (tipo === 'parceria') {
    clausulas.push(`2. OBJETO: Parceria entre as partes para ${escopo} pelo prazo de ${prazo}.`)
    clausulas.push(`3. DIVISÃO: Lucros divididos em partes iguais conforme acordo.`)
  } else {
    clausulas.push(`2. LICENÇA: Licença de uso pessoal e intransferível de ${escopo}.`)
    clausulas.push('3. RESTRIÇÕES: Proibida revenda ou compartilhamento da licença.')
  }
  clausulas.push('6. CONFIDENCIALIDADE: As partes concordam em manter sigilo sobre dados compartilhados.')
  clausulas.push('7. RESCISÃO: Qualquer parte pode rescindir o acordo com aviso prévio de 7 dias.')
  clausulas.push('8. LEI: Este acordo é regido pelas leis brasileiras, foro da comarca do CONTRATANTE.')
  clausulas.push(`Local, data: ${new Date().toLocaleDateString('pt-BR')}`)
  clausulas.push('\n_____________________________\n' + contratante)
  clausulas.push('\n_____________________________\n' + contratado)
  const titulos: Record<string,string> = {
    prestacao: 'Minuta de Prestação de Serviços',
    afiliado: 'Acordo de Afiliado',
    parceria: 'Termo de Parceria',
    licenca: 'Termo de Licença de Uso',
    freelance: 'Contrato de Freelance',
  }
  return {
    titulo: titulos[tipo],
    clausulas,
    aviso: 'ATENÇÃO: Esta minuta é apenas ponto de partida. Valide sempre com advogado antes de assinar. Não substitui assessoria jurídica.',
  }
}
