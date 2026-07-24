// Agente BioGenerator — bios otimizadas para Instagram/TikTok/YouTube/LinkedIn/X
export interface BioInput { nicho: string; nome: string; publico?: string; tom?: 'profissional'|'descontraido'|'luxo'|'influencer'|'criador'|'ceo'; cta?: string; link?: string }
export interface BioOutput { plataformas: Record<string, { bio: string; dicas: string[]; tamanho: number}>; usernameSugestoes: string[]; estrutura: string[] }
export function gerarBio(input: BioInput): BioOutput {
  const { nicho, nome, publico = 'brasileiros', tom = 'criador', cta = 'Link na bio', link } = input
  const emoji = tom === 'luxo' ? '•' : tom === 'profissional' ? '▸' : tom === 'ceo' ? '●' : '|'
  const emojis = tom === 'luxo' ? ['✨','◾','◽','💎'] : tom === 'profissional' ? ['▸','💼','📈',''] : tom === 'influencer' ? ['✨','🔥','💙','🚀'] : ['✨','💫','🚀','💙']
  const g = emojis[Math.floor(Math.random()*emojis.length)]
  const usernameBase = [
    `${nome.replace(/\s+/g,'').toLowerCase()}.${nicho.replace(/\s+/g,'').toLowerCase().slice(0,8)}`,
    `o${nicho.replace(/\s+/g,'').toLowerCase().slice(0,8)}_${nome.replace(/\s+/g,'').toLowerCase().slice(0,6)}`,
    `${nome.replace(/\s+/g,'').toLowerCase()}.official`,
    `${nome.replace(/\s+/g,'').toLowerCase()}_brasil`,
    `sou${nome.replace(/\s+/g,'').toLowerCase()}`,
  ]
  const instagram = `${nome} ${g}\n${emoji} ${nicho} para ${publico}\n${emoji} Resultados reais, sem enrolação\n${emoji} ${cta}\n${link||'linktr.ee/'+nome.replace(/\s+/g,'').toLowerCase()}`
  const tiktok = `${nome} ✨\n💙 ${nicho}\n🔥 ${cta}\n⬇️ ${link||'Link na bio'}`
  const linkedin = `${nome} | Especialista em ${nicho}\n\nAjudando ${publico} a alcançarem resultados através de ${nicho}.\n\n${cta}: ${link||'linkedin.com/in/'+nome.toLowerCase().replace(/\s+/g,'')}`
  const youtube = `${nome}\n\n${nicho} descomplicado para ${publico}.\n\nInscreva-se para novos vídeos toda semana.\n\n${cta}: ${link||''}`
  const x = `${nome} • ${nicho} para ${publico}. ${cta}. ${link||''}`
  return {
    plataformas: {
      Instagram: { bio: instagram, dicas: ['Use até 150 caracteres (ideal)','Palavras-chave do nicho','Emoji como separador','CTA claro no final'], tamanho: instagram.length },
      TikTok: { bio: tiktok, dicas: ['Máximo 80 caracteres','Seja direto','Use 1-2 emojis','Link apenas se tiver 1k+ seguidores'], tamanho: tiktok.length },
      LinkedIn: { bio: linkedin, dicas: ['Use "ajudo [público] a [resultado] através de [nicho]"','Sem emojis excessivos','Inclua palavras-chave do nicho para recrutadores'], tamanho: linkedin.length },
      YouTube: { bio: youtube, dicas: ['Primeira linha deve dizer o que o canal entrega','Palavras-chave para o algoritmo','Inclua agenda de postagens'], tamanho: youtube.length },
      X_Twitter: { bio: x, dicas: ['Máximo 160 caracteres','Seja conciso','Inclua link'], tamanho: x.length },
    },
    usernameSugestoes: usernameBase,
    estrutura: ['1. Quem você é (nome + nicho)','2. O que você entrega (resultado)','3. Para quem (público)','4. CTA claro','5. Link'],
  }
}
