// Agente BlogIdeia — ideias de posts de blog com ângulos e palavras-chave
export interface BlogIdeiaInput { nicho: string; quantidade?: number }
export interface BlogPost { titulo: string; angulo: string; palavrasChave: string[]; duracaoLeitura: number; tipo: string; }
export interface BlogIdeiaResult { posts: BlogPost[]; categorias: string[]; calendario: string[] }

const ANGULOS = ['Como fazer','Lista','Erros','Comparativo','Verdade secreta','Iniciante','PASSO A PASSO','Antes e depois','Case de sucesso','Contra-intuitivo']
const TIPOS = ['tutorial','lista','review','case','opiniao','comparativo','guia','entrevista','checklist']

export function gerarIdeiasBlog(input: BlogIdeiaInput): BlogIdeiaResult {
  const { nicho, quantidade = 15 } = input
  const posts: BlogPost[] = []
  const usados = new Set<string>()
  let i = 0; let tenta = 0
  while (posts.length < quantidade && tenta < quantidade * 4) {
    tenta++
    const angulo = ANGULOS[i % ANGULOS.length]
    const tipo = TIPOS[i % TIPOS.length]
    const numero = 5 + ((i * 3) % 15)
    let titulo = ''
    if (angulo === 'Como fazer') titulo = `Como ${nicho} do zero em ${numero} dias`
    else if (angulo === 'Lista') titulo = `${numero} ferramentas de ${nicho} que realmente uso`
    else if (angulo === 'Erros') titulo = `${numero} erros de iniciantes em ${nicho}`
    else if (angulo === 'Comparativo') titulo = `Os ${numero} melhores métodos de ${nicho} (${new Date().getFullYear()})`
    else if (angulo === 'Verdade secreta') titulo = `A verdade sobre ${nicho} que ninguém conta`
    else if (angulo === 'Iniciante') titulo = `${nicho} para iniciantes: guia completo`
    else if (angulo === 'PASSO A PASSO') titulo = `Passo a passo: ${nicho} em ${numero} etapas`
    else if (angulo === 'Antes e depois') titulo = `${nicho}: minha jornada de 0 a ${numero}k`
    else if (angulo === 'Case de sucesso') titulo = `Como [pessoa] conseguiu ${numero}k com ${nicho}`
    else titulo = `Por que ${nicho} não está funcionando pra você (e o que fazer)`
    if (usados.has(titulo)) { i++; continue }
    usados.add(titulo)
    posts.push({
      titulo, angulo, tipo, duracaoLeitura: 6 + (i % 8),
      palavrasChave: [`${nicho}`, `${nicho} ${new Date().getFullYear()}`, `como ${nicho}`, `dicas de ${nicho}`, `melhor ${nicho}`],
    })
    i++
  }
  const categorias = [`Iniciantes em ${nicho}`, 'Estudos de caso', 'Ferramentas', 'Erros comuns', 'Tutoriais']
  const calendario = posts.slice(0,7).map((p,j) => `Semana ${Math.floor(j/7)+1} dia ${(j%7)+1}: ${p.titulo}`)
  return { posts, categorias, calendario }
}
