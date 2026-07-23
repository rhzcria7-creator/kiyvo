// Agente BulletForge — bullets de alta conversão para páginas de produto
// Inspirado no método de copywriting de Ben Settle e Gary Halbert
export interface BulletInput { beneficio: string; tipo?: 'curiosidade'|'mecanismo'|'resultado'|'prova'|'demonstracao'|'ameaca' }
export interface Bullet { texto: string; tipo: string; poder: number }
export interface BulletForgeInput {
  produto: string
  nicho: string
  beneficios: string[]
  publico?: string
  preco?: number
}
export interface BulletForgeOutput { bullets: Bullet[]; top5Bullets: Bullet[]; headlineBullets: string[]; dicas: string }
const TEMPLATES: Record<string, (b: string, produto: string, nicho: string) => string> = {
  curiosidade: (b, produto, nicho) => `O segredo de ${nicho} que ninguém te conta — e como ${produto} usa isso para você ${b.toLowerCase()}`,
  mecanismo: (b, produto) => `Descubra o mecanismo secreto por trás de ${produto} que faz você ${b.toLowerCase()} sem esforço`,
  resultado: (b, produto) => `Como ${b.toLowerCase()} em apenas 7 dias usando ${produto} — sem precisar gastar mais com isso`,
  prova: (b, produto) => `Como milhares de pessoas estão usando ${produto} para ${b.toLowerCase()} (e você também pode)`,
  demonstracao: (b, produto) => `Veja o exato passo-a-passo para ${b.toLowerCase()} usando ${produto} (mesmo que você seja iniciante)`,
  ameaca: (b, produto) => `Se você não usar ${produto}, você vai continuar ${b.toLowerCase()} pelos próximos anos (e nem percebe)`,
}
export function gerarBullets(input: BulletForgeInput): BulletForgeOutput {
  const { produto, nicho, beneficios } = input
  const bullets: Bullet[] = []
  const tipos: Array<Bullet['tipo']> = ['curiosidade','mecanismo','resultado','prova','demonstracao','ameaca']
  for (const b of beneficios) {
    for (const t of tipos) {
      const fn = TEMPLATES[t]
      const texto = fn(b, produto, nicho)
      const poder = Math.round(60 + Math.random()*40)
      bullets.push({ texto, tipo: t, poder })
    }
  }
  const top5 = [...bullets].sort((a,b) => b.poder - a.poder).slice(0,5)
  const headlineBullets = top5.map(b => b.texto)
  return {
    bullets,
    top5Bullets: top5,
    headlineBullets,
    dicas: `Bullets de alta conversão:\n• NUNCA comece com verbo fraco (tenha, use, faça)\n• Comece com DESCOBERTA, MECANISMO ou SEGREDO\n• Cada bullet deve vender o produto SOZINHO\n• Use especificidade (números, tempos)\n• Crie CURIOSIDADE (fascinations)`,
  }
}
export function exemploBulletRapido(produto: string, beneficio: string): string {
  const t = TEMPLATES.resultado(beneficio, produto, '')
  return t
}
