// Agente NameForge — gera nomes de marcas, produtos e slogans
export interface NameForgeInput { nicho: string; palavraChave?: string; estilo?: 'moderno'|'premium'|'descontraido'|'tech'|'brasileiro'|'memoravel' }
export interface NomeGerado { nome: string; slogan: string; explicacao: string; disponibilidade: { dominio: string; instagram: string }; estilo: string }
export interface NameForgeOutput { nomes: NomeGerado[]; topPick: NomeGerado; dicas: string[]; categorias: string[] }
const PREFIXOS = ['Ki','Zap','Vibe','Novo','Hyper','Neo','Pro','Ultra','Lume','Ora','Aura','Vega','Nova','Soul','Bloom','Pulse','Plex','Flow','Zen','Eco','Evra','Maxx','Flex','Azz','Omni','Real','True','Smart','Digital','Br','Bra','Top','Super','Meu','Minha']
const SUFIXOS = ['fy','ly','ix','ex','yz','a','o','us','ar','io','lab','hub','go','on','me','app','pro','tech','pay','dy','zza','zeiro','br','plus','now','fy','zen','ora','ity','ca']
const PALAVRAS_BR = ['brazil','br','brasil','verde','amarelo','fogo','terra','sol','lua','rio','cafe','caipira','dengo','moleque','minas','gaucho','sertao','praia','brasilia','paulista','carioca']
function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() }
function gerarNomeEstilo(palavraChave: string, estilo: string): NomeGerado {
  const p = palavraChave.toLowerCase().replace(/\s+/g,'').slice(0,5)
  let nome = ''
  const estiloFinal = estilo
  switch (estilo) {
    case 'tech': {
      const combos = [`${pick(PREFIXOS)}${p}${pick(SUFIXOS)}`, `${capitalize(p)}AI`, `${capitalize(pick(PREFIXOS))}${p}ify`, `${capitalize(p)}Lab`, `${capitalize(p)}Stack`, `${capitalize(p)}Hub`, `${capitalize(pick(PREFIXOS))}${p}X`, `${p.toUpperCase()}.io`]
      nome = pick(combos); break
    }
    case 'premium': {
      const pre = ['Maison','Couture','Atelier','Noir','Luxe','Or','Élite','Royal','Grand','Noble','Bela']
      nome = `${pick(pre)} ${capitalize(p)}`; break
    }
    case 'descontraido': {
      const combos = [`${capitalize(p)}zi`, `${capitalize(p)}da`, `Meu${capitalize(p)}`, `Pro${capitalize(p)}`, `${capitalize(p)}ca`, `${capitalize(p)}nho`, `Aquele${capitalize(p)}`, `Oi${capitalize(p)}`]
      nome = pick(combos); break
    }
    case 'brasileiro': {
      const br = pick(PALAVRAS_BR)
      const combos = [`${capitalize(p)}${br}`, `${capitalize(p)}Brasil`, `Só${capitalize(p)}`, `${capitalize(p)}BR`, `${capitalize(p)}Carioca`, `${capitalize(p)}Paulista`, `${capitalize(p)}Ca`, `Meu${capitalize(p)}Br`]
      nome = pick(combos); break
    }
    case 'memoravel': {
      const letras = 'aeiou'
      const combos = [
        `${capitalize(p)}${letras[Math.floor(Math.random()*5)]}${letras[Math.floor(Math.random()*5)]}`,
        `${capitalize(pick(PREFIXOS))}${p}`,
        `${capitalize(p)}${pick(SUFIXOS)}`,
        `${capitalize(p)}${p}`,
      ]
      nome = pick(combos); break
    }
    default: { // moderno
      const combos = [`${capitalize(pick(PREFIXOS))}${capitalize(p)}`, `${capitalize(p)}${pick(SUFIXOS)}`, `${capitalize(pick(PREFIXOS))}${p}`, `${capitalize(p)}Now`, `${capitalize(p)}Up`]
      nome = pick(combos); break
    }
  }
  const slogans = [
    `${nome}: ${palavraChave} que funciona para você.`,
    `Simplesmente ${nome}.`,
    `${nome}. A nova forma de ${palavraChave}.`,
    `${nome} — ${palavraChave} reinventado.`,
    `${palavraChave} elevado ao próximo nível com ${nome}.`,
  ]
  const dominio = nome.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')
  return {
    nome,
    slogan: pick(slogans),
    explicacao: `Nome ${estiloFinal}: fácil de pronunciar, memorizar e escrever. Soa bem em português e inglês.`,
    disponibilidade: { dominio: `${dominio}.com.br`, instagram: `@${dominio}` },
    estilo: estiloFinal,
  }
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)] }
export function gerarNomes(input: NameForgeInput): NameForgeOutput {
  const { nicho, palavraChave = nicho, estilo = 'moderno' } = input
  const estilos: Array<'moderno'|'premium'|'descontraido'|'tech'|'brasileiro'|'memoravel'> = ['moderno','premium','descontraido','tech','brasileiro','memoravel']
  const nomes: NomeGerado[] = []
  for (let i = 0; i < 8; i++) {
    const est = i === 0 ? estilo : estilos[(i) % estilos.length]
    nomes.push(gerarNomeEstilo(palavraChave, est))
  }
  // Evita duplicatas
  const vistos = new Set<string>()
  const unicos = nomes.filter(n => { if (vistos.has(n.nome)) return false; vistos.add(n.nome); return true })
  return {
    nomes: unicos,
    topPick: unicos[0],
    categorias: ['Moderno','Premium','Descontraído','Tech','Brasileiro','Memorável'],
    dicas: [
      '✅ Antes de decidir, cheque INPI, domínio .com.br e @usuário no Instagram',
      '✅ Nome ideal tem entre 5 e 10 caracteres e é fácil de pronunciar',
      '✅ Evite números, hífens e caracteres especiais',
      '✅ Teste falar o nome em voz alta com outra pessoa',
      '✅ Nome não é marca: MARCA é o que você faz repetidamente para o cliente',
    ],
  }
}
