# PROMPT DE INICIALIZAÇÃO - COPIE TUDO ABAIXO NO CHAT NOVO

## 👇 COPIE DAQUI ATÉ O FINAL E COLE NO CHAT NOVO:

```
Você está trabalhando no repositório KIYVO, localizado em `/home/user/kiyvo`.
É um marketplace brasileiro de produtos digitais em Next.js 14.2.29.

## PRIMEIRA COISA A FAZER, ANTES DE RESPONDER QUALQUER COISA:

1. Use as ferramentas para LER OS DOIS ARQUIVOS DE MEMÓRIA que estão no repositório:
   - Primeiro leia `/home/user/kiyvo/MEMORY.md` (a bíblia de 900+ linhas com TUDO sobre o projeto: regras, stack, design system, arquitetura, stores, rotas, bugs conhecidos, performance, credenciais, roadmap, convenções)
   - Depois leia `/home/user/kiyvo/PROMPT.md` (instruções de como trabalhar e como interpretar o dono)
   
2. Depois de ler os DOIS arquivos por inteiro, siga ABSOLUTAMENTE todas as regras, convenções, fluxos de deploy, e prioridades descritas neles.

3. CONFIRME que leu e entendeu, resumindo em 3-5 linhas:
   - Que versão do Next está fixada (e que não pode atualizar)
   - Quais os 3 bugs críticos mais importantes pra corrigir primeiro (segundo seção 17 do MEMORY)
   - Qual o comando exato de deploy que deve usar
   - Que está pronto pra começar

4. NÃO PERGUNTE NADA. Comece IMEDIATAMENTE a corrigir os bugs CRÍTICOS na ordem de prioridade:
   1º → **Performance mobile e travamentos** (seção 21 do MEMORY): reduzir partículas, desligar efeitos pesados em <768px, eliminar memory leaks, usar dynamic imports. O dono reclamou MUITO que trava no celular — essa é a prioridade MÁXIMA número 1.
   2º → **Proteção de rotas e gates de login**: verificar que /checkout, /conta/*, /vendor/*, /admin/* e todas rotas privadas realmente redirecionam para login. Não pode entrar em nada sem estar logado.
   3º → **Erros de requisição**: revisar todas APIs em src/app/api/ garantindo try/catch, status HTTP corretos, respostas JSON.
   4º → **Polimento visual mobile**: área de toque 44px, tipografia legível, espaçamentos, header limpo no mobile.
   5º → Só DEPOIS de corrigir esses 4, adicione MELHORIAS GRANDES e VISÍVEIS (não só uma coisinha). O dono odeia quando parece que mudou nada.

## REGRAS MAIS IMPORTANTES (relembrando):
- NÃO APAGUE NADA DO CÓDIGO EXISTENTE, SÓ EVOLUA E ADICIONE.
- Next SEMPRE em 14.2.29 PINNADO. Antes de QUALQUER build, rode `npm install next@14.2.29 --save-exact`.
- ZERO `any`, ZERO `console.log`, ZERO TODO. Comentários em PT-BR, código em EN.
- Framer Motion em todos componentes interativos.
- Mobile-first SEMPRE.
- Estados loading/error/empty/success/disabled em tudo.
- Não fale "Hermes" na UI nunca. Só "Kiya" ou nome do agente específico.
- O dono fala português com frases curtas e erros de digitação. Interprete a intenção, não peça esclarecimentos óbvios. Quando ele disser "quero mais" → faça MUITA coisa.
- SEMPRE build (`./node_modules/.bin/next build`) antes de push. Se houver erros, corrija antes.
- SEMPRE que criar um novo store Zustand, adicione a inicialização dele em `src/components/kyc/KYCProvider.tsx`.
- SEMPRE dê `git add -A && git -c user.email="arena@kiyvo.com.br" -c user.name="KIYVO Arena" commit -m "vX.Y: descrição" && git push origin arena/019f75ba-kiyvo:main --force && git remote set-url origin "https://github.com/rhzcria7-creator/kiyvo.git" após cada lote de mudanças.

Comece agora. Lembre-se: PRIMEIRO leia os dois arquivos (MEMORY.md e PROMPT.md), DEPOIS confirme e comece a trabalhar na hora.
```

---

## ✅ PRONTO!

Como usar:
1. Abra um chat **NOVO**
2. Copie TODO o texto acima (dentro da caixa ```)
3. Cole no chat novo e envie
4. Ele vai:
   ✅ Ler o MEMORY.md (toda a memória do projeto)
   ✅ Ler o PROMPT.md
   ✅ Seguir todas as regras de ambos
   ✅ Confirmar que entendeu
   ✅ Começar DIRETO a corrigir travamentos no celular (que foi a sua maior reclamação)
   ✅ Depois corrigir os outros bugs
   ✅ Depois adicionar muitas melhorias
   ✅ Buildar e dar push automático a cada lote

Você não vai precisar explicar mais nada depois de colar isso — ele vai saber exatamente o que fazer. 🚀
