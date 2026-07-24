// MEGA CATÁLOGO KIYVO — ~680 produtos reais distribuídos entre as 60 lojas.
// Objetivo: chegar em ~789 produtos no catálogo combinado (demo 58 + ggmax 50 + mega 681 = 789).
// Cada loja tem produtos coerentes com sua categoria. Tudo em PT-BR, preços reais, emojis e gradientes bonitos.
// Comentários em PT-BR.

import type { Store } from './stores'
import { STORES } from './stores'

export interface MegaProduct {
  id: string
  slug: string
  titulo: string
  descricao_curta: string
  descricao: string
  preco: number
  preco_de: number
  categoria: string
  tipo: string
  vendedor_nome: string
  vendor_id: string
  gradient: string
  emoji: string
  imagem_capa: null
  rating: number
  total_reviews: number
  total_vendas: number
  boost: boolean
  verificado: boolean
  entrega_automatica: boolean
  garantia_dias: number
  tipo_anuncio: 'unico' | 'dinamico'
  store_id: string
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// BANCO DE IDEIAS por categoria (título, descrição curta, preço, de, emoji)
// Estrutura: [titulo, desc_curta, preco, preco_de, emoji]
// ─────────────────────────────────────────────────────────────────────────────
type Idea = [string, string, number, number, string]

const IDEAS: Record<string, Idea[]> = {
  marketing: [
    ['Tráfego Orgânico Turbo — 30 Dias de Conteúdo', 'Calendário de 30 dias com posts prontos para Instagram/TikTok que viralizam.', 37, 197, '📈'],
    ['Checklist Lançamento Milionário 7 Dígitos', 'Checklist completo de lançamento com todas as etapas, do hype ao pico.', 47, 297, '🚀'],
    ['Pack Criativos para Facebook/Google Ads', '+200 peças prontas (imagens + copies) para campanhas de alta conversão.', 29, 147, '🎯'],
    ['Estratégia WhatsApp Vendas 24h', 'Funil de mensagens que converte leads em clientes no piloto automático.', 19, 97, '💬'],
    ['Bio Link Premium — Templates Canva', '50 templates de link na bio prontos para editar no Canva.', 9, 47, '🔗'],
    ['Método Pinterest Pro Tráfego Infinito', 'Estratégia de pins que geram visitas por anos sem gastar nada.', 39, 197, '📌'],
    ['Pack Hashtags Milionárias 2026', '+5.000 hashtags separadas por nicho e tamanho de público.', 14, 97, '#️⃣'],
    ['E-mail Marketing que Abre 60%+', 'Sequências de e-mail com altíssima taxa de abertura e clique.', 27, 147, '📧'],
    ['Calendário Editorial 365 Dias', 'Um ano inteiro de ideias de conteúdo para qualquer nicho.', 49, 297, '📅'],
    ['Script de Reels/Viral Short Comprovado', 'Scripts prontos que geram milhões de views em qualquer nicho.', 19, 97, '🎬'],
    ['Automação RD Station/ActiveCampaign', 'Fluxos de automação prontos para importar e usar.', 57, 397, '⚙️'],
    ['ROI Ads Calculadora Pro', 'Planilha que calcula ROI, CAC, LTV e break-even em segundos.', 17, 97, '📊'],
  ],
  copywriting: [
    ['100 Copys Prontos para Qualquer Nicho', 'Copys testados e validados para headlines, bullets, CTA e páginas de venda.', 27, 197, '✍️'],
    ['VSL de 8 Dígitos — Framework Completo', 'Estrutura de VSL que já vendeu milhões em diversos nichos.', 97, 497, '🎥'],
    ['Headlines Magnéticas — 200 Modelos', 'Títulos que prendem a atenção e geram clique instantâneo.', 19, 97, '📰'],
    ['Copy para WhatsApp que Fecha Sozinha', 'Mensagens de vendas para WhatsApp que convertem sem call.', 17, 97, '💚'],
    ['E-mail Swipe File Premium +500', 'Arquivo de e-mails que já venderam milhões, em PT-BR.', 37, 247, '📬'],
    ['Bullet Points que Vendem — 300 Exemplos', 'Bullets persuasivos que geram desejo e escassez.', 14, 77, '🔸'],
    ['Script de Storytelling que Conecta', 'Framework de histórias que emocionam e convertem.', 29, 147, '📖'],
    ['Upsell/Downsell Copys Testados', 'Ofertas de order bump e upsell com alta aceitação.', 24, 127, '💰'],
  ],
  curso: [
    ['Excel Completo do Zero ao Avançado', 'Do básico ao VBA com aulas práticas e exercícios resolvidos.', 49, 297, '📗'],
    ['Python para Iniciantes em 7 Dias', 'Curso intensivo com projetos reais (web, dados, automação).', 67, 397, '🐍'],
    ['Inglês Fluente em 6 Meses — Método Próprio', 'Método acelerado com foco em conversação real.', 97, 497, '🇺🇸'],
    ['Gestão Financeira para Pequenos Negócios', 'Organize as finanças e lucre mais sem planilha complicada.', 39, 197, '💼'],
    ['Fotografia com Celular Profissional', 'Fotos incríveis apenas com smartphone, edição inclusa.', 29, 147, '📱'],
    ['Maquiagem Profissional para Iniciantes', 'Do dia a dia a makes artísticas com aulas em vídeo.', 37, 247, '💋'],
    ['Violão em 30 Dias — Método Rápido', 'Aprenda acordes e músicas sem enrolação.', 27, 197, '🎸'],
    ['Investimentos na Bolsa para Leigos', 'Comece a investir com segurança e sem jargões.', 47, 297, '📈'],
    ['Programação Front-end React + Next.js', 'Do HTML a projetos profissionais deployados.', 147, 697, '⚛️'],
    ['Marketing Digital Completo Hotmart', 'Afiliado de sucesso sem aparecer, do zero à primeira venda.', 57, 397, '🏝️'],
    ['Desenho Digital — Personagens e Anime', 'Procreate, Photoshop e tablet para criar artes profissionais.', 49, 247, '🎨'],
    ['Culinária Italiana em Casa', 'Massas frescas, risotos, molhos e sobremesas italianas.', 29, 147, '🍝'],
    ['Jiu-Jitsu Faixa Preta em Casa', 'Aulas técnicas com faixa preta para treinar em casa.', 39, 197, '🥋'],
    ['Confeitaria Profissional Lucrativa', 'Bolos caseiros, doces finos e brigadeiros gourmet para vender.', 47, 297, '🎂'],
  ],
  planilhas: [
    ['Planilha Fluxo de Caixa MEI Completa', 'Controle mensal com DAS, IRRF, pró-labore e gráficos automáticos.', 27, 97, '💵'],
    ['Dashboard Power BI de Vendas', 'Dashboard pronto para conectar no seu ERP/CSV e ver tudo de cara.', 49, 247, '📊'],
    ['Planilha Orçamento Doméstico 50/30/20', 'Controle gastos e economize com o método comprovado.', 9, 47, '🏠'],
    ['Calculadora de Preço de Venda', 'Calcule preço ideal com markup, margem, custos e taxas.', 17, 97, '🏷️'],
    ['Controle de Estoque Automático', 'Estoque com aviso de reposição, curva ABC e relatórios.', 37, 197, '📦'],
    ['Planilha de Investimentos (FIIs/Ações)', 'Acompanhe carteira, proventos, DY e rentabilidade.', 29, 147, '💹'],
    ['Planilha Lançamento de Produto', 'Cronograma, custos, projeção de faturamento e ROI.', 39, 197, '🚀'],
    ['Planilha de Treino Hipertrofia', 'Montagem de treino ABCDE com progressão automática.', 19, 97, '💪'],
    ['Planilha de Casamento Orçamento+Fornecedores', 'Organize casamento completo sem gastar além da conta.', 24, 147, '💍'],
    ['Dashboard Financeiro Pessoal Excel', 'Todas as contas do mês em um painel visual e intuitivo.', 14, 77, '💳'],
  ],
  templates: [
    ['Pack Canva Instagram Profissional', '+300 templates editáveis para feed, stories e reels.', 27, 147, '🎨'],
    ['Template Currículo ATS Aprovado', 'Currículo que passa por robôs de RH em grandes empresas.', 9, 49, '📄'],
    ['Notion Vida Organizada Premium', 'Sistema completo de vida no Notion: finanças, saúde, tarefas.', 37, 197, '📝'],
    ['Templates Figma Landing Page Moderna', '10 landing pages prontas para editar e exportar.', 47, 297, '🖼️'],
    ['Pack Apresentações Google/PPT', '+80 slides profissionais para reuniões e pitch.', 19, 97, '📽️'],
    ['Template Loja Shopify Conversion', 'Tema Shopify otimizado para conversão mobile-first.', 97, 497, '🛍️'],
    ['Templates de Contrato Jurídico', '50 contratos prontos (prestação de serviços, NDA, locação).', 39, 197, '📑'],
    ['Canva Pack Feed Organizado 2026', 'Paleta, fontes e grid para feed harmônico.', 17, 97, '🖌️'],
    ['Template de Proposta Comercial', 'Propostas que fecham clientes em 24h.', 29, 147, '💼'],
    ['Templates de E-mail Marketing HTML', '30 e-mails responsivos editáveis sem código.', 24, 127, '📧'],
  ],
  ebook: [
    ['1001 Receitas Low Carb Deliciosas', 'E-book com mais de mil receitas para emagrecer comendo bem.', 19, 97, '🥗'],
    ['Hábitos Atômicos — Guia Prático Aplicado', 'Resumo e exercícios para implementar hábitos poderosos.', 14, 47, '🧠'],
    ['Guia da Renda Extra em Casa 2026', '+50 formas reais de renda extra para começar hoje.', 9, 37, '💸'],
    ['Vinhos do Mundo para Iniciantes', 'Aprenda a escolher, harmonizar e apreciar vinhos.', 17, 77, '🍷'],
    ['Investindo em Cripto com Segurança', 'Guia sem jargões para começar sem cair em golpe.', 27, 147, '🪙'],
    ['Maternidade Real — Primeiros 12 Meses', 'Rotinas, sono, alimentação e saúde do bebê.', 24, 97, '👶'],
    ['Marketing Pessoal LinkedIn', 'Construa autoridade e consiga emprego/clientes.', 19, 97, '💼'],
    ['Plantas em Casa — Guia Completo', 'Cultivo, rega, adubo e problemas comuns de plantas.', 9, 47, '🪴'],
    ['Ansiedade: Como Controlar Crises', 'Técnicas baseadas em ciência para crises de ansiedade.', 14, 77, '🧭'],
    ['História do Brasil em 50 Fatos', 'Fatos e curiosidades que ninguém te contou.', 7, 27, '📜'],
  ],
  software: [
    ['Microsoft Office 365 Vitalício', 'Word, Excel, PowerPoint e Outlook com ativação vitalícia.', 49, 297, '📘'],
    ['Windows 11 Pro Chave Original', 'Chave de ativação original com garantia e suporte.', 29, 197, '🪟'],
    ['Antivírus Kaspersky 1 Ano 3 Dispositivos', 'Proteção total com licença ativada.', 37, 147, '🛡️'],
    ['Adobe Creative Cloud Anual', 'Pacote Adobe completo com Photoshop, Premiere, Illustrator.', 147, 797, '🎨'],
    ['ChatGPT Plus 1 Mês Garantido', 'Acesso Plus sem mensagem de espera.', 27, 97, '🤖'],
    ['Netflix Premium 4K Tela Extra', 'Tela extra com garantia de 30 dias.', 14, 47, '🎬'],
    ['Spotify Premium Individual 3 Meses', 'Conta premium individual com login.', 19, 59, '🎵'],
    ['Disney+ e Star+ Combo', 'Acesso a ambas plataformas por preço promocional.', 24, 79, '🏰'],
    ['Canva Pro Vitalício', 'Canva Pro com todos os elementos premium liberados.', 39, 247, '🖌️'],
    ['Figma Professional 1 Ano', 'Figma Pro para designers freelancers e equipes.', 49, 297, '🎨'],
    ['AutoCAD 2026 Licença Anual', 'Software CAD profissional para engenharia e arquitetura.', 97, 597, '📐'],
    ['Key Steam — AAA Games Sorteio', 'Keys Steam de jogos AAA: Elden Ring, Cyberpunk, GTA V.', 29, 197, '🎮'],
    ['PlayStation Plus 12 Meses BR', 'Assinatura PS Plus Essential em conta BR.', 119, 397, '🎮'],
    ['Xbox Game Pass Ultimate 3 Meses', 'Game Pass com EA Play e Xbox Live Gold.', 69, 197, '🎮'],
  ],
  design: [
    ['Presets Lightroom — Estilo Filme', '+60 presets para fotos com look cinematográfico.', 19, 97, '📷'],
    ['LUTs Vídeo Cinema Grade Hollywood', 'Pacote de LUTs para vídeos com cor de cinema.', 29, 147, '🎞️'],
    ['Mockups Realistas PSD — 200 Peças', 'Mockups de camisetas, livros, telas e embalagens.', 24, 147, '🖼️'],
    ['Brush Pack Procreate Completo', '+800 pincéis para ilustração, lettering e textura.', 17, 77, '🖌️'],
    ['Fontes Premium Pack 500+', 'Tipos profissionais para todos os estilos de projeto.', 14, 77, '🔤'],
    ['Ícones SVG Flat 5.000 Ícones', 'Biblioteca de ícones editáveis para web e apps.', 19, 97, '🔲'],
    ['Texturas Overlay 4K', '+200 texturas em alta para sobrepor em fotos e vídeos.', 24, 127, '🎨'],
    ['Pack Logotipos Editáveis 100 Modelos', 'Logos prontos para editar no Canva/AI.', 29, 147, '🏷️'],
    ['3D Models Blender Starter Pack', '+100 modelos 3D prontos para Blender/C4D.', 39, 197, '🧊'],
  ],
  social: [
    ['Pack Stories Interativos Prontos', '+150 templates de stories com enquetes e caixas de pergunta.', 14, 77, '📱'],
    ['Legendas Prontas Instagram 365 Dias', 'Uma legenda por dia para você só postar.', 17, 97, '✍️'],
    ['Enquetes que Engajam — 200 Ideias', 'Perguntas para stories que geram comentários.', 9, 47, '❓'],
    ['Calendário Post TikTok Viral', 'Roteiros de TikTok com hooks testados.', 27, 147, '🎵'],
    ['Destaques Instagram Capas Premium', '+100 capas de destaques em 6 estilos.', 12, 47, '🔖'],
    ['Pack Carrossel Instagram Informativo', '30 carrosséis prontos sobre diversos temas.', 24, 97, '🎠'],
    ['Feed Organizado Paleta Pastel', 'Grid e paleta para feed harmônico e profissional.', 19, 77, '🌸'],
    ['Títulos que Clicam Reels/Shorts', '+200 ideias de títulos que geram visualizações.', 14, 77, '⚡'],
  ],
  saude: [
    ['Treino em Casa Sem Equipamentos 8 Semanas', 'Programa completo para fazer em casa com peso corporal.', 19, 97, '🏋️'],
    ['Dieta Cetogênica Cardápio 30 Dias', 'Cardápios fechados com receitas e lista de compras.', 29, 147, '🥑'],
    ['Guia da Massa Muscular — Hardgainer', 'Como ganhar massa mesmo sendo ectomorfo.', 37, 197, '💪'],
    ['Yoga para Iniciantes 30 Dias', 'Aulas curtas diárias para fazer em casa.', 17, 97, '🧘'],
    ['Corrida de Rua Planilha 5k-10k-Meia', 'Planilhas de treino evolutivas provas de rua.', 14, 77, '🏃'],
    ['Guia do Sono Restaurador 7h+', 'Técnicas para dormir melhor e acordar disposto.', 19, 97, '😴'],
    ['Cardápio Vegano 30 Dias Completo', 'Café, almoço, janta e lanches com lista de compras.', 27, 147, '🌱'],
    ['Hiit Queima Calorias 20 Minutos', 'Treinos curtos de alta intensidade para todos os níveis.', 9, 47, '🔥'],
    ['Guia de Suplementação Inteligente', 'Quais suplementos realmente valem a pena.', 14, 77, '💊'],
    ['Postura Correta em 15 Dias', 'Exercícios para corrigir postura no trabalho e em casa.', 17, 97, '🧍'],
  ],
  financas: [
    ['Planilha Controle Gastos Cartão', 'Controle faturas múltiplas e não pague juros nunca mais.', 17, 97, '💳'],
    ['Guia FIIs Para Iniciantes', 'Como escolher fundos imobiliários e montar carteira.', 19, 97, '🏢'],
    ['Curso Day Trade Mini Índice', 'Estratégia de day trade com gerenciamento de risco.', 97, 497, '📉'],
    ['Planilha Imposto de Renda 2026', 'Calcule IRPF automaticamente com todos os lançamentos.', 24, 147, '🧾'],
    ['Ações de Valor — Carteira Barsi', 'Filosofia de investimento em valor com exemplos BR.', 29, 147, '🏦'],
    ['Reserva de Emergência em 6 Meses', 'Planilha + guia para construir reserva rapidamente.', 9, 47, '🛟'],
    ['Planilha Juros Compostos Mágica', 'Projeção de patrimônio com aportes mensais.', 14, 77, '✨'],
    ['Divórcio Financeiro do Casal', 'Como separar finanças e organizar vida financeira a dois.', 19, 97, '💔'],
    ['Guia Financiamento Imobiliário', 'Entenda sistemas SAC vs Price e economize milhares.', 24, 127, '🏠'],
    ['Simulador Aposentadoria Privada', 'Quanto juntar para se aposentar com R$X.', 14, 77, '🏖️'],
  ],
  beleza: [
    ['Presets Maquiagem Selfie Perfeita', '+40 presets para valorizar makes em selfies.', 14, 77, '💄'],
    ['Skincare Rotina Pele Oleosa', 'Passo a passo de skincare com produtos baratos.', 9, 47, '🧴'],
    ['Guia Cabelo Cacheado Definido', 'Cronograma capilar, umectação e finalização.', 19, 97, '🌀'],
    ['Maquiagem para Noiva Iniciantes', 'Curso de automaquiagem para casamento e festas.', 27, 147, '👰'],
    ['Unhas de Gel em Casa Kit Digital', 'Técnica de unhas de gel que dura 3 semanas.', 24, 127, '💅'],
    ['Sobrancelha Perfeita Passo a Passo', 'Design e henna em casa com formato ideal.', 14, 77, '👁️'],
    ['Presets Beleza Natural Lightroom', 'Presets que valorizam a pele sem exageros.', 17, 97, '📸'],
    ['Perfumes Importados Baratos Guia', 'Onde comprar, como identificar falsos e decants.', 9, 47, '🌸'],
  ],
  gastronomia: [
    ['+300 Receitas Fit Deliciosas', 'Receitas rápidas e saborosas para emagrecer.', 17, 97, '🥗'],
    ['Pizza Napolitana em Casa', 'Massa, molho, forno e como assar como pizzaiolo.', 24, 127, '🍕'],
    ['Cerveja Artesanal Iniciantes', 'Equipamento, receitas e processo para fazer em casa.', 37, 197, '🍺'],
    ['Bolos Caseiros para Vender', '+50 receitas de bolos que vendem muito.', 19, 97, '🍰'],
    ['Churrasco Perfeito — Guia Completo', 'Corte, fogo, tempo, sal e acompanhamentos.', 14, 77, '🥩'],
    ['Doces Finos para Festas e Casamentos', 'Receitas profissionais com passo a passo.', 27, 147, '🍬'],
    ['Comida Japonesa em Casa Sushi', 'Sushi, sashimi, temaki e molhos em casa.', 29, 147, '🍣'],
    ['Marmitas Semanais Fit', 'Preparo em lote para semana toda, rápidas e baratas.', 17, 97, '🍱'],
    ['Café Especial em Casa', 'Métodos de extração, grãos e moagem para café de qualidade.', 14, 77, '☕'],
    ['Sucos Detox 50 Receitas', 'Sucos naturais para desinchar e ter energia.', 7, 27, '🥤'],
  ],
  prompts: [
    ['500 Prompts ChatGPT Produtividade', 'Prompts prontos para escrever, resumir e organizar.', 17, 97, '🤖'],
    ['Prompts Midjourney Arte Surreal', '+200 prompts para gerar artes incríveis no Midjourney.', 24, 147, '🎨'],
    ['Prompts Copywriting para GPT', 'Prompts que geram copy de alta conversão.', 19, 97, '✍️'],
    ['Prompts para Vídeos YouTube/Rumble', 'Prompts de roteiro, thumbnails, títulos.', 14, 77, '🎬'],
    ['Prompts de Estudo e Vestibular', 'Prompts para resumos, flashcards, exercícios.', 9, 47, '📚'],
    ['Prompts para Programadores', 'Prompts que escrevem códigos e debuggam.', 19, 97, '⌨️'],
    ['Prompts para Instagram Criativos', 'Gere posts, legendas e roteiros de reels.', 14, 77, '📱'],
    ['Prompts SEO Rankear no Google', 'Prompts para gerar conteúdo que rankeia.', 27, 147, '🔍'],
  ],
  video: [
    ['Presets Premiere/FCPX Color Cinemat', '+80 presets de cor para vídeos de cinema.', 29, 147, '🎞️'],
    ['Transições Premiere Pro 200+', 'Transições profissionais seamless para editar.', 24, 147, '🎬'],
    ['Pack Efeitos Sonoros 10.000 SFX', 'Biblioteca de efeitos sonoros livres de direitos.', 37, 197, '🔊'],
    ['Templates After Effects Intros Logo', '+50 intros animadas de logo para YouTube.', 47, 297, '✨'],
    ['Música Royalty Free 500 Tracks', 'Músicas livres para usar em vídeos monetizados.', 29, 147, '🎵'],
    ['LUTs Drone Dji Mavic/Air', 'LUTs para footage de drone com cor aérea profissional.', 19, 97, '🚁'],
    ['Motion Graphics Elements 1000+', 'Elementos animados prontos para qualquer vídeo.', 39, 197, '📹'],
    ['Templates CapCut Edit Pro', '+100 templates prontos para editar no CapCut.', 14, 77, '✂️'],
  ],
  pack: [
    ['Mega Pack Empreendedor Digital', '+100 produtos digitais prontos para revender.', 47, 497, '📦'],
    ['Bundle Canva + Notion + Planilhas', 'Pacote completo para produtividade e criação.', 39, 247, '🎁'],
    ['Super Pack Afiliado Iniciante', 'Tudo para afiliado começar com o pé direito.', 29, 197, '💎'],
    ['Kit Criador de Conteúdo Completo', 'Presets, templates, trilhas, SFX e efeitos em um pacote.', 57, 397, '🎒'],
    ['Pack PLR Premium 200 Ebooks', 'E-books PLR para editar e revender como seu.', 37, 297, '📚'],
    ['Bundle Design Completo', 'Mockups, fontes, presets, LUTs e templates.', 49, 297, '🎨'],
    ['Kit Dropshipping Nacional', 'Fornecedores nacionais, scripts, planilhas e loja.', 57, 397, '🚢'],
    ['Combo Renda Extra 2026', '+30 métodos testados para renda extra em casa.', 27, 197, '💰'],
  ],
  juridico: [
    ['Contrato Prestação de Serviços', 'Contrato completo e adaptável para qualquer serviço.', 19, 97, '📄'],
    ['LGPD Kit Documentos Completo', 'Política de privacidade, DPO, termo de consentimento.', 39, 197, '🔒'],
    ['Contrato Locação Residencial', 'Contrato de aluguel com cláusulas atualizadas 2026.', 14, 77, '🏠'],
    ['Abertura MEI Passo a Passo', 'Guia completo para abrir MEI e emitir nota em 1 dia.', 9, 47, '🆔'],
    ['Modelo de Notificação Extrajudicial', 'Modelo pronto para cobrar dívidas sem advogado.', 17, 97, '⚖️'],
    ['Testamento Simples Digital', 'Modelo de testamento simples e válido juridicamente.', 14, 77, '📜'],
    ['Contrato Casamento Pacto Antenupcial', 'Pacto antenupcial pronto para adaptar.', 24, 127, '💍'],
    ['Recibo de Pagamento Profissional', 'Modelo de recibo com valor legal.', 7, 27, '🧾'],
  ],
  produtividade: [
    ['Sistema GTD Notion Completo', 'Getting Things Done completo no Notion.', 29, 147, '✅'],
    ['Rotina Matinal Milionária', 'Guia + planilha + habit tracker para rotina matinal.', 14, 77, '🌅'],
    ['Gestão de Tempo Método Pomodoro Pro', 'Planilha + sistema para render 2x mais.', 9, 47, '⏱️'],
    ['Habit Tracker Anual Imprimível', 'Rastreador de hábitos para imprimir ou preencher.', 7, 27, '📅'],
    ['Sistema de Projetos Ágeis Simples', 'Kanban e sprints simples para times pequenos.', 19, 97, '📋'],
    ['Segundo Cérebro Digital Tiago Forte', 'Templates Notion + guia do método CODE.', 29, 147, '🧠'],
    ['Reuniões Eficientes Kit', 'Agenda, ata e templates de reunião produtiva.', 14, 77, '🗣️'],
    ['Template OKR Trimestral', 'Sistema OKR completo para metas individuais.', 19, 97, '🎯'],
  ],
  games: [
    ['Gift Card Steam R$50 Imediato', 'Código digital com entrega automática após pagamento.', 49, 60, '💳'],
    ['Gift Card PlayStation R$100', 'Créditos PSN BR com entrega imediata.', 97, 120, '🎮'],
    ['Gift Card Xbox R$100', 'Créditos Microsoft Store BR.', 97, 120, '🟢'],
    ['Conta Steam com 10 Jogos AAA', 'Conta com jogos famosos, garantia de troca.', 297, 597, '🎮'],
    ['Key Minecraft Java + Bedrock', 'Chave original Minecraft para PC.', 79, 147, '⛏️'],
    ['Key GTA V Premium Online', 'Chave para GTA V com bônus online.', 39, 147, '🚗'],
    ['Roblox 800 Robux Digital', 'Créditos Robux com entrega automática.', 49, 60, '👾'],
    ['Valorant Points R$50', 'VP para skins e passe do Valorant.', 49, 60, '🔫'],
    ['League of Legends RP R$50', 'Riot Points para LoL.', 49, 60, '⚔️'],
    ['Xbox Game Pass Ultimate 1 Mês', 'Game Pass Ultimate mensal.', 29, 49, '🎮'],
  ],
  streaming: [
    ['Netflix Premium 4K 30 Dias', 'Tela individual em 4K com garantia.', 14, 35, '🎬'],
    ['Spotify Premium 3 Meses', 'Premium individual com login próprio.', 29, 59, '🎵'],
    ['Disney+ Premium 30 Dias', 'Acesso 4K individual.', 12, 30, '🏰'],
    ['Prime Video 30 Dias', 'Acesso Prime Video.', 9, 25, '📺'],
    ['HBO Max 30 Dias', 'Acesso individual garantido.', 12, 30, '🔥'],
    ['Crunchyroll Premium 3 Meses', 'Animes sem anúncios.', 19, 49, '⛩️'],
    ['Paramount+ 30 Dias', 'Acesso Paramount.', 9, 25, '⭐'],
    ['YouTube Premium 3 Meses', 'Sem anúncios + YT Music.', 29, 59, '▶️'],
  ],
  educacao: [
    ['Resumo ENEM 2026 Completo', 'Resumo de todas as matérias do ENEM com exercícios.', 27, 147, '📘'],
    ['Mapas Mentais Vestibular Medicina', 'Mapas mentais coloridos para medicina.', 39, 197, '🧠'],
    ['Flashcards Anki Medicina 5.000 Cards', 'Baralhos prontos para Anki de todas as matérias.', 49, 297, '🗂️'],
    ['Redação Nota 1000 ENEM', 'Guia + modelos que já tiraram nota mil.', 19, 97, '✍️'],
    ['Kit Concursos Públicos 2026', 'Apostilas, questões e simulados de concursos.', 47, 297, '📚'],
    ['Matemática Básica em 30 Dias', 'Revisão completa de matemática do zero.', 17, 97, '🔢'],
    ['Física para o ENEM Sem Drama', 'Explicações simples e exercícios resolvidos.', 19, 97, '⚛️'],
    ['Química Orgânica Descomplicada', 'Mapas, exercícios e macetes de química.', 24, 127, '⚗️'],
    ['Cronograma de Estudos 12h Produtivo', 'Horários e rotina de estudos para vestibular.', 14, 77, '🕒'],
  ],
  idiomas: [
    ['Inglês com Séries e Filmes 2026', 'Aprenda inglês com cenas de filmes e séries.', 29, 147, '🎬'],
    ['Espanhol em 3 Meses — Dia a Dia', 'Curso prático para conversação em viagens.', 24, 127, '🇪🇸'],
    ['Francês Básico para Viagem', 'Vocabulário e frases essenciais de viagem.', 14, 77, '🇫🇷'],
    ['Alemão Profissional A1-A2', 'Iniciação ao alemão para trabalho e estudo.', 37, 197, '🇩🇪'],
    ['Italiano para Gastronomia e Viagem', 'Aprenda italiano de forma divertida com gastronomia.', 19, 97, '🇮🇹'],
    ['Japonês Hiragana Katakana Kanji', 'Fundamentos do japonês com exercícios.', 29, 147, '🇯🇵'],
    ['Mandarim para Negócios Iniciante', 'Primeiros passos do mandarim para o ambiente corporativo.', 47, 247, '🇨🇳'],
    ['Libras — Básico e Intermediário', 'Língua brasileira de sinais com vídeo-aulas.', 19, 97, '🤟'],
  ],
  dev: [
    ['Template Next.js Landing Page SaaS', 'Boilerplate completo com auth, pagamentos e dashboard.', 47, 297, '⚛️'],
    ['Components React UI Kit 80+', 'Componentes React/TS estilizados com Tailwind.', 37, 197, '⚙️'],
    ['Snippets VS Code Produtividade', 'Snippets e configurações para codar 2x mais rápido.', 9, 47, '⌨️'],
    ['API Node.js Boilplate TypeScript', 'API REST em TypeScript com Prisma e JWT.', 29, 147, '🟢'],
    ['Templates de E-mail Responsivo MJML', '10 e-mails transacionais responsivos.', 19, 97, '📧'],
    ['Python Automação Web Scraping Pack', 'Scripts prontos de scraping e automação.', 24, 127, '🐍'],
    ['Design System Figma + Code 30 Components', 'Design system completo com código.', 57, 397, '🎨'],
    ['Docker Compose Stack Produção', 'Templates de docker-compose para apps em produção.', 19, 97, '🐳'],
    ['Script Backup Automático Nuvem', 'Script de backup para S3/GDrive com cron.', 14, 77, '💾'],
    ['SQL Consultas Avançadas Cheat Sheet', 'Guia de SQL avançado com janelas e CTEs.', 9, 47, '🗃️'],
  ],
  carreira: [
    ['Currículo + LinkedIn Otimizado Kit', 'Templates, checklist e guia para conseguir emprego.', 24, 147, '💼'],
    ['Entrevista de Emprego — Respostas', 'Respostas prontas para as 50 perguntas mais comuns.', 17, 97, '🎙️'],
    ['Pitch Elevador Networking', 'Como se apresentar em 30 segundos com impacto.', 9, 47, '🎤'],
    ['Transição de Carreira para TI', 'Mudar de área para tecnologia sem voltar à estaca zero.', 29, 147, '🔀'],
    ['Carta de Motivação Mestrado/MBA', 'Modelos e exemplos de cartas que aprovam.', 14, 77, '📝'],
    ['Negociação Salarial Script Completo', 'Script para negociar salário sem travar.', 19, 97, '💰'],
    ['LinkedIn Post Templates 30 Dias', 'Posts prontos para engajar no LinkedIn.', 14, 77, '🔵'],
    ['Currículo para Estágio Template', 'Currículo simples e eficaz para estagiários.', 7, 27, '🎓'],
  ],
  foto: [
    ['Presets Casamento Ensolarado', '+30 presets para casamento em luz natural.', 24, 147, '👰'],
    ['Presets Retrato Studio', 'Presets para ensaios de retrato em estúdio.', 19, 97, '📸'],
    ['Pack Fundos Photoshop 4K', 'Fundos e backdrops digitais para composições.', 29, 147, '🖼️'],
    ['Ações Photoshop Pele Perfeita', 'Ações para retocar pele sem perder textura.', 24, 127, '✨'],
    ['Overlays Bokeh Luzes 4K', '+100 overlays de luz e bokeh para fotos.', 14, 77, '💡'],
    ['Presets Viagem Instagram', 'Presets para foto de viagem com look quente.', 17, 97, '✈️'],
    ['Sky Replacements Céus Dramáticos', 'Céus em alta resolução para troca no PS.', 19, 97, '☁️'],
  ],
  musica: [
    ['Beats Trap Estúdio Profissional', '+50 beats de trap prontos para gravar.', 39, 197, '🎧'],
    ['Sample Pack Lo-Fi Hip Hop', 'Sampes lo-fi para beats e study music.', 24, 127, '🎹'],
    ['Presets Serum Synthwave/Future Bass', 'Presets profissionais para Xfer Serum.', 29, 147, '🎛️'],
    ['Loops Funk Brasil 130 BPM', 'Loops de funk carioca e paulista.', 19, 97, '🥁'],
    ['Kit Drum and Bass Samples', 'Samples de bateria e baixo para DnB.', 24, 127, '🎚️'],
    ['Sound Design Trailer Cinematográfico', 'Efeitos de trailer épico para vídeos e jogos.', 37, 197, '🎺'],
    ['Projeto Ableton EDM Completo', 'Projeto pronto de EDM para estudar produção.', 47, 247, '🎚️'],
    ['Acapellas Studio Qualidade', '+100 acapellas livres para usar em remixes.', 19, 97, '🎤'],
  ],
  bemestar: [
    ['Meditação Guiada Ansiedade 21 Dias', 'Áudios diários de 10 min para reduzir ansiedade.', 19, 97, '🧘'],
    ['Respiração 4-7-8 Guia Áudio', 'Técnica de respiração para acalmar em minutos.', 7, 27, '🌬️'],
    ['Autoestima em 30 Dias', 'Exercícios diários para elevar autoestima.', 17, 97, '💖'],
    ['Mindfulness no Trabalho', 'Exercícios curtos para fazer no expediente.', 9, 47, '🌸'],
    ['Diário de Gratidão Imprimível', 'Template de diário de gratidão para imprimir.', 7, 27, '🙏'],
    ['Gestão Emocional para Pais', 'Como lidar com emoções das crianças.', 19, 97, '👨‍👩‍👧'],
  ],
  agencia: [
    ['Proposta Comercial Agência Digital', 'Proposta vendedora para fechar clientes de marketing.', 29, 147, '📄'],
    ['Contrato de Serviços Agência', 'Contrato mensal com cláusulas de escopo e rescisão.', 19, 97, '📑'],
    ['Relatório de Resultados Mensal Agência', 'Template de relatório que impressiona clientes.', 14, 77, '📊'],
    ['Onboarding Cliente Agência Pack', 'Kit de boas-vindas, briefing e cronograma.', 24, 127, '🎁'],
    ['SLA e Processos Internos Agência', 'Documentos para profissionalizar a agência.', 19, 97, '⏱️'],
    ['Script Reunião Diagnóstico', 'Script de reunião que converte em contrato.', 17, 97, '🎙️'],
  ],
  criador: [
    ['Kit YouTube do Zero Iniciante', 'Equipamento, nicho, thumbnails e primeiros vídeos.', 29, 147, '▶️'],
    ['Thumbnails YouTube Pack 50 PSD', 'Templates de thumbnails que geram clique.', 24, 147, '🖼️'],
    ['Roteiro Vídeo Longo YouTube', 'Framework de roteiro de 8-15 min com alta retenção.', 19, 97, '📝'],
    ['Pack Cortes Shorts/Reels', 'Como cortar e editar vídeos longos em virais.', 17, 97, '✂️'],
    ['Brand Kit Criador de Conteúdo', 'Paleta, fontes e logos de canal.', 29, 147, '🎨'],
    ['Kit Podcast Iniciante Completo', 'Equipamento, pautas, edição e publicação.', 37, 197, '🎙️'],
    ['Newsletter Crescimento Kit', 'Como crescer newsletter de 0 a 10k inscritos.', 24, 127, '📧'],
  ],
  afiliados: [
    ['Método Afiliado Orgânico 2026', 'Vender como afiliado sem gastar em anúncios.', 47, 297, '🤝'],
    ['Hotmart/Monetizze Como Escolher Produto', 'Critérios de escolha de produto campeão.', 19, 97, '🎯'],
    ['Funil de Vendas Afiliado 5 E-mails', 'Sequência de e-mails para afiliados.', 24, 147, '📧'],
    ['Pinterest para Afiliados Método', 'Pins que vendem no automático.', 27, 147, '📌'],
    ['Copy Pronta Afiliado WhatsApp', 'Mensagens de WhatsApp que convertem.', 14, 77, '💬'],
    ['TikTok para Afiliados Iniciantes', 'Método de vendas por TikTok sem aparecer.', 29, 147, '🎵'],
  ],
  escritor: [
    ['Como Escrever um Livro em 90 Dias', 'Método passo a passo para escrever e publicar livro.', 37, 197, '✍️'],
    ['Templates KDP Amazon Interior', 'Interiores prontos para KDP (planners, diários).', 24, 147, '📕'],
    ['Capas de Livro Canva Templates', '+30 capas editáveis para livros.', 19, 97, '📖'],
    ['Marketing de Livro Lançamento', 'Como lançar livro best-seller na Amazon.', 29, 147, '🚀'],
    ['Escrita Criativa Exercícios Diários', 'Prompts diários para destravar a escrita.', 14, 77, '📝'],
  ],
  casa: [
    ['Organização Residencial Marie Kondo', 'Método de organização com listas e planos.', 17, 97, '🏠'],
    ['Limpeza Casa Cronograma 30 Dias', 'Rotina de faxina que mantém casa limpa sem esforço.', 9, 47, '🧹'],
    ['Pequenos Reparos Domésticos Guia', 'Consertos simples sem precisar chamar pedreiro.', 14, 77, '🔧'],
    ['Decoração Pequenos Ambientes', 'Como decorar apartamento pequeno sem gastar muito.', 19, 97, '🛋️'],
    ['Plantas de Sombra Resistentes Guia', 'Plantas fáceis de cuidar dentro de casa.', 9, 47, '🪴'],
    ['Checklist Mudança Sem Stress', 'Lista completa para mudança organizada.', 7, 27, '📦'],
  ],
  pets: [
    ['Adestramento Cachorro em Casa', 'Comandos básicos e obediência com reforço positivo.', 19, 97, '🐶'],
    ['Alimentação Natural Cães Receitas', 'Receitas caseiras balanceadas para cachorros.', 24, 127, '🦴'],
    ['Guia Gatos Felizes em Apartamento', 'Como cuidar de gatos em espaço pequeno.', 17, 97, '🐱'],
    ['Primeiros Socorros Pets Guia Completo', 'Emergências e o que fazer antes do veterinário.', 14, 77, '🚑'],
    ['Pet Fotos Ensaios Caseiros', 'Como fotografar pets bonitos com celular.', 9, 47, '📸'],
    ['Planilha Custos Pet Anual', 'Controle de gastos com pet ao longo do ano.', 7, 27, '💳'],
  ],
  viagem: [
    ['Checklist Mala Viagem Internacional', 'Checklist de mala para não esquecer nada.', 7, 27, '🧳'],
    ['Como Viajar Barato com Milhas', 'Acumular milhas e viajar de graça.', 24, 127, '✈️'],
    ['Roteiro Europa 15 Dias Econômico', 'Roteiro completo com hospedagem e passeios.', 19, 97, '🇪🇺'],
    ['Mochilão América do Sul 30 Dias', 'Roteiro de mochilão barato pela América do Sul.', 14, 77, '🎒'],
    ['Seguro Viagem Comparador Guia', 'Como escolher seguro viagem sem pagar caro.', 9, 47, '🛟'],
    ['Fotografia de Viagem com Celular', 'Como registrar viagens com fotos incríveis.', 17, 97, '📸'],
  ],
  wallpaper: [
    ['Wallpapers 4K Minimalistas 100 un', 'Papel de parede para celular e desktop minimalista.', 7, 27, '🖼️'],
    ['Wallpapers Natureza 4K 200 un', 'Paisagens naturais em alta resolução.', 9, 37, '🏞️'],
    ['Wallpapers Animes 4K +300', 'Artes de anime para celular e desktop.', 12, 47, '⛩️'],
    ['Wallpapers Motivacionais Frases', 'Wallpapers com frases de motivação para trabalho.', 7, 27, '💪'],
    ['Wallpapers 3D Abstratos 4K', 'Artes 3D abstratas em altíssima resolução.', 9, 37, '🔮'],
  ],
  eventos: [
    ['Convites Digitais Casamento Canva', '+30 convites editáveis para casamento.', 14, 77, '💌'],
    ['Kit Festa Infantil Decoração', 'Tudo para festa infantil em casa (bandeiras, tags).', 19, 97, '🎈'],
    ['Chá de Bebê Completo Digital', 'Convites, tags, brincadeiras e planejamento.', 17, 97, '👶'],
    ['Kit Chá Revelação', 'Ideias, decoração e convites para chá revelação.', 14, 77, '🎊'],
    ['Cardápio Jantar Romântico', 'Receitas e playlist para jantar romântico.', 9, 47, '🕯️'],
  ],
  mindset: [
    ['Lei da Atração Exercícios Diários', 'Práticas diárias para manifestar objetivos.', 17, 97, '🧘'],
    ['Disciplina de Ferro 30 Dias', 'Como construir disciplina mesmo sem motivação.', 19, 97, '🔥'],
    ['Síndrome do Impostor Como Superar', 'Guia para vencer a autossabotagem profissional.', 14, 77, '🎭'],
    ['Produtividade Máxima Método Ninja', 'Produtividade sem burnout.', 24, 127, '⚡'],
    ['Meditação para Iniciantes Guiada', 'Primeiros passos da meditação mindfulness.', 9, 47, '🧘'],
  ],
  tecnologia: [
    ['Inteligência Artificial para Negócios', 'Como aplicar IA na sua empresa para lucrar mais.', 37, 197, '🤖'],
    ['Automação com n8n Curso', 'Automações avançadas sem código com n8n.', 47, 247, '🔗'],
    ['Curso Excel Avançado Macros', 'Macros e VBA no Excel para automatizar planilhas.', 39, 197, '📊'],
    ['Power Platform Microsoft', 'Power Apps, Power Automate e Power BI.', 57, 397, '⚙️'],
    ['No-Code Bubble.io do Zero', 'Criar apps sem programação com Bubble.', 49, 297, '🧩'],
    ['IA Generativa para Criadores', 'Usar IA para criar conteúdo 10x mais rápido.', 29, 147, '✨'],
  ],
  oficial: [
    ['KIYVO Taxa Zero — Primeiras 5.000 vendas', 'Comece a vender com 0% de taxa em suas primeiras 5.000 vendas.', 0, 0, '🎁'],
    ['KIYVO Plano PRO Vendedor 1 Mês', 'Plano PRO com taxas reduzidas e recursos avançados.', 97, 197, '⚡'],
    ['KIYVO Boost 24h Destaque Máximo', 'Coloque seu produto em destaque por 24 horas.', 14.9, 29.9, '🚀'],
    ['KIYVO Selos Verificado de Vendedor', 'Selo de vendedor verificado na plataforma.', 49, 99, '✅'],
    ['KIYVO — Guia do Vendedor Iniciante', 'E-book oficial gratuito sobre como vender na KIYVO.', 0, 0, '📚'],
  ],
}

// Mapeia lojas para categoria principal de ideias (fallback se não bater)
const STORE_TO_CAT: Record<string, keyof typeof IDEAS> = {
  's-digitalflow': 'marketing',
  's-copykings': 'copywriting',
  's-templatehub': 'templates',
  's-cursostop': 'curso',
  's-excelmaster': 'planilhas',
  's-softpro': 'software',
  's-midiasmart': 'social',
  's-gamestorebr': 'games',
  's-fitpro': 'saude',
  's-financaspro': 'financas',
  's-belezaelite': 'beleza',
  's-chefmaster': 'gastronomia',
  's-promptpro': 'prompts',
  's-videokit': 'video',
  's-juridicofacil': 'juridico',
  's-produtividadex': 'produtividade',
  's-ecommercestack': 'marketing',
  's-packbrasil': 'pack',
  's-streamingbr': 'streaming',
  's-photopreset': 'foto',
  's-musicabeat': 'musica',
  's-stockninja': 'financas',
  's-academicopro': 'educacao',
  's-kidscode': 'educacao',
  's-agenciafly': 'agencia',
  's-notionbr': 'produtividade',
  's-ebookstore': 'ebook',
  's-podcastmaster': 'criador',
  's-dropshipx': 'pack',
  's-cvprof': 'carreira',
  's-meditacaomind': 'bemestar',
  's-culinariasaudavel': 'gastronomia',
  's-smmbeast': 'social',
  's-dataviz': 'planilhas',
  's-liguapro': 'idiomas',
  's-pixelperfect': 'design',
  's-ai-lab': 'tecnologia',
  's-gamestart': 'games',
  's-consultorlgpd': 'juridico',
  's-printables': 'design',
  's-treinohiit': 'saude',
  's-investidoriniciante': 'financas',
  's-youtubepro': 'criador',
  's-tiktokking': 'social',
  's-afiliadoselite': 'afiliados',
  's-seminovosdigital': 'pack',
  's-revistashome': 'casa',
  's-codigostore': 'dev',
  's-maquiagemx': 'beleza',
  's-mathemaf': 'educacao',
  's-viagembarata': 'viagem',
  's-petzshop': 'pets',
  's-mentebilionaria': 'mindset',
  's-eventostore': 'eventos',
  's-papeldeparede': 'wallpaper',
  's-sejapro': 'carreira',
  's-cervejaartesanal': 'gastronomia',
  's-motorpro': 'tecnologia',
  's-yogabrasil': 'bemestar',
  's-kdpbrasil': 'escritor',
  's-dieta30dias': 'saude',
  's-kiyvostore': 'oficial',
}

const GRADIENTS = [
  'from-rose-500 to-pink-600', 'from-orange-500 to-red-600', 'from-amber-400 to-orange-600',
  'from-yellow-400 to-amber-600', 'from-lime-400 to-green-600', 'from-emerald-500 to-teal-700',
  'from-teal-400 to-cyan-600', 'from-sky-400 to-blue-600', 'from-blue-500 to-indigo-700',
  'from-indigo-500 to-violet-700', 'from-violet-500 to-purple-700', 'from-purple-500 to-fuchsia-700',
  'from-fuchsia-500 to-pink-700', 'from-pink-500 to-rose-700', 'from-slate-500 to-slate-800',
  'from-red-500 to-orange-600', 'from-cyan-500 to-blue-700', 'from-green-500 to-emerald-700',
]

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 70)
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

// Gerar ~700 produtos únicos
function generateMegaCatalog(): MegaProduct[] {
  const out: MegaProduct[] = []
  let counter = 0
  const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString()

  for (const store of STORES) {
    const catKey = STORE_TO_CAT[store.id] || 'marketing'
    const baseIdeas = IDEAS[catKey] || IDEAS.marketing
    // Cada loja recebe ~12 produtos (60 lojas × ~12 = ~720)
    // Distribuindo: 12 por loja
    const productsPerStore = store.id === 's-kiyvostore' ? 10 : 11
    for (let i = 0; i < productsPerStore; i += 1) {
      const idea = baseIdeas[i % baseIdeas.length]
      const [titulo, desc_curta, preco, preco_de, emoji] = idea
      const variation = Math.floor(counter / baseIdeas.length) // variação se repetir ideia
      const title = variation === 0 ? titulo : `${titulo} (Pack ${variation + 1})`
      const id = `m-${String(counter + 1).padStart(4, '0')}`
      const rating = 4.2 + ((counter * 7) % 8) / 10 // 4.2-5.0
      const reviews = 20 + ((counter * 13) % 480)
      const vendas = 30 + ((counter * 37) % 3500)
      const precoNum = preco === 0 ? 0 : Math.max(1.9, preco + ((counter * 3) % 100) / 10)
      const precoDeNum = preco_de === 0 ? 0 : preco_de + ((counter * 5) % 50)
      const cat = catKey
      const tipoMap: Record<string, string> = {
        software: 'software', games: 'keys', streaming: 'assinatura', curso: 'curso',
        ebook: 'ebook', planilhas: 'planilha', templates: 'template', video: 'video',
        prompts: 'prompt', pack: 'pack', wallpaper: 'wallpaper', foto: 'preset',
        musica: 'audio', dev: 'código',
      }
      const tipo = tipoMap[cat] || 'digital'
      const entregaAuto = ['software', 'games', 'streaming', 'planilhas', 'templates', 'ebook', 'pack', 'prompts', 'video', 'foto', 'musica', 'wallpaper', 'dev', 'cursos', 'educacao', 'oferta', 'afiliados'].includes(cat)
      const isUnico = i % 4 === 0 ? false : true // alguns dinâmicos

      out.push({
        id,
        slug: `${slugify(title)}-${id}`,
        titulo: title,
        descricao_curta: desc_curta,
        descricao: `${desc_curta} Produto oficial da loja ${store.name} com garantia de 7 dias, suporte e atualizações gratuitas. ${store.bio}`,
        preco: precoNum,
        preco_de: precoDeNum > precoNum ? precoDeNum : Math.round(precoNum * 2.5),
        categoria: cat,
        tipo,
        vendedor_nome: store.name,
        vendor_id: store.id,
        gradient: GRADIENTS[(counter * 3 + store.id.length) % GRADIENTS.length],
        emoji,
        imagem_capa: null,
        rating: Math.round(rating * 10) / 10,
        total_reviews: reviews,
        total_vendas: vendas,
        boost: (counter % 23 === 0),
        verificado: store.verified,
        entrega_automatica: entregaAuto,
        garantia_dias: 7,
        tipo_anuncio: isUnico ? 'unico' : 'dinamico',
        store_id: store.id,
        created_at: iso((counter * 1.7) | 0),
      })
      counter += 1
    }
  }
  return out
}

export const MEGA_PRODUCTS: MegaProduct[] = generateMegaCatalog()

// Helper para juntar tudo
export function getMegaCatalogCount(): number {
  return MEGA_PRODUCTS.length
}
