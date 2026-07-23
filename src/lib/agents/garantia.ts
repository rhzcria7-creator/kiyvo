// GarantiaExpress — Escreve garantias que reduzem objeções SEM incentivar abuso
import { AgentContext, AgentResult } from './types'
export interface GarantiaInput { produtoNome: string; preco?: number; nicho: string; tipo?: 'incondicional' | 'resultado' | 'estendida' | 'risco_zero' }
export async function runGarantia(input: GarantiaInput, _ctx?: AgentContext): Promise<AgentResult> {
  const { produtoNome, nicho, tipo = 'incondicional' } = input
  if (!produtoNome) return { ok: false, error: 'Informe o nome do produto.' }
  const modelos: Record<string, any> = {
    incondicional: { titulo: 'Garantia Incondicional de 7 Dias', texto: `Experimente o ${produtoNome} por 7 dias inteiros. Se por qualquer motivo você não ficar 100% satisfeito, basta enviar um e-mail que devolvemos 100% do seu dinheiro sem perguntas, sem burocracia. O risco é todo nosso.`, dias: 7, selo: '🛡️ RISCO ZERO' },
    resultado: { titulo: 'Garantia de Resultado em 30 Dias', texto: `Use o ${produtoNome} por 30 dias seguindo o método passo-a-passo. Se você aplicar e não ver resultado, mostramos seu acesso que devolvemos seu investimento integral mais um bônus simbólico de R$50 pelo seu tempo.`, dias: 30, selo: '🎯 RESULTADO GARANTIDO' },
    estendida: { titulo: 'Garantia Estendida de 15 Dias', texto: `Além dos 7 dias legais, oferecemos mais 8 dias extras pra você testar à vontade. São 15 dias de paz total pra decidir se o ${produtoNome} é pra você.`, dias: 15, selo: '✅ 15 DIAS DE PAZ' },
    risco_zero: { titulo: 'Tripla Garantia KIYVO', texto: `1) 7 dias incondicional, 2) Se não gostar devolvemos o dobro do seu dinheiro no primeiro dia, 3) Suporte 24h/7 pra ajudar com qualquer problema. No ${produtoNome} você nunca perde.`, dias: 7, selo: '🔒 TRIPLA GARANTIA' },
  }
  const m = modelos[tipo] || modelos.incondicional
  return { ok: true, data: { ...m, produto: produtoNome, nicho, seloCheckout: m.selo, scriptParaVideo: `E sabe por que eu posso oferecer ${m.titulo.toLowerCase()}? Porque eu confio tanto no ${produtoNome} que o risco é TODO MEU. Se não der resultado, você não perde NADA.`, objecoes: ['"E se eu não gostar?" — resposta: use os 7 dias.','"Como confio?" — garantia por política do site + devolução por suporte.','"É golpe?" — garantia incondicional elimina risco.'], avisoLegal: 'Garantia válida por ' + m.dias + ' dias corridos após confirmação do pagamento, conforme Código de Defesa do Consumidor.' } }
}
