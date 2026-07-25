# KIYVO v0.0.1 — análise competitiva e decisões de produto

> Pesquisa de produto, não cópia de interface, marca, conteúdo ou catálogo. Taxas são referências públicas/terceiras e devem ser verificadas nas páginas oficiais antes de qualquer comunicação comercial. A importação de parceiro exige autorização/API/afiliado e proveniência visível ao admin.

## Protocolo xthink aplicado

Cada linha foi avaliada em cinco camadas: **P** problema fundamental, **C** solução/limite competitivo, **J** fricção na jornada, **F** vetor de fraude prioritário e **R** resposta real KIYVO. A decisão comum é: pagamento confirmado → ledger pendente → entrega verificável → evidência auditável → saldo liberado após garantia ou resolução.

| # | Marketplace | Tipo | Feature legal a adaptar | Referência de taxa | Confiança/anti-golpe | UX a aprender | KIYVO melhor (P/C/J/F/R) |
|---:|---|---|---|---|---|---|---|
| 1 | Mercado Livre | Geral | termômetro reputação + SLA | variável por anúncio | mediação e proteção | intenção de compra clara | P confiança; C reputação opaca para digital; J comparar vendedor; F entrega contestada; R termômetro explicável + evidência de token/arquivo. |
| 2 | Shopee | Geral | check-in, ofertas com limite real | variável | proteção on-platform | descoberta lúdica | P retenção; C gamificação pode induzir; J achar oferta; F abuso de cupom; R streak com rate limit, sem dark patterns. |
| 3 | Amazon | Geral | autocomplete, cross-sell, 1-click com consentimento | variável | reviews verificadas | busca densa e objetiva | P encontrar produto; C catálogo massivo; J filtro; F review artificial; R FTS/trigram + review só após entrega. |
| 4 | Magalu | Geral | carteira e jornada integrada | variável | ecossistema financeiro | serviços próximos | P pagamento simples; C dependência de wallet; J checkout; F conta tomada; R sessão por dispositivo e step-up 2FA. |
| 5 | Americanas | Geral | cashback contextual | variável | políticas de reembolso | promoção agrupada | P valor percebido; C cashback confuso; J resgate; F múltiplas contas; R KD ledger idempotente e limites. |
| 6 | AliExpress | Geral | disputa com prova e prazo | variável | escrow prolongado | cupons em camadas | P receber o prometido; C disputa longa; J status; F prova falsa; R janela curta digital + evidência imutável/audit log. |
| 7 | Enjoei | Geral | curadoria e voz de marca | variável | intermediação | catálogo editorial | P confiança em item único; C fee alta; J avaliar qualidade; F falsificação; R verificação de licença/origem e regras por categoria. |
| 8 | Elo7 | Geral | personalização estruturada | variável | reputação artesanal | briefing humano | P pedido sob medida; C escopo ambíguo; J aprovar arte; F chargeback de serviço; R milestones, revisão e escrow. |
| 9 | Hotmart | Infoprodutos | members, afiliado, bump | referência ~9,99% + fixo | garantia | checkout focado | P acesso imediato; C pouca proteção de arquivo; J compra→aula; F download/reembolso; R token, watermark e ledger de garantia. |
| 10 | Kiwify | Infoprodutos | checkout minimalista | referência variável | prevenção chargeback | área de membros simples | P converter sem atrito; C sinais pouco explicados; J pagamento; F cartão teste; R Luhn, BIN bloqueado, score e PIX. |
| 11 | Eduzz | Infoprodutos | ecossistema de afiliado | referência variável | controles de saque | painel operacional | P distribuir produto; C comissões complexas; J conciliar; F autoafiliado; R atribuição 30d, antifraude e ledger. |
| 12 | Monetizze | Infoprodutos | opções de cobrança | referência variável | checkout | funil | P pagar como preferir; C boleto lento; J confirmação; F boleto falso; R status assinado por webhook, jamais screenshot. |
| 13 | G2G | Games P2P | níveis e proteção por trade | referência ~5% + processamento | escrow GamerProtect | prazo de entrega visível | P risco de item virtual; C risco de ToS do jogo; J escolher seller; F entrega fora da plataforma; R chat/evidência in-app e política de itens permitidos. |
| 14 | PlayerAuctions | Games P2P | escrow por etapas | referência ~7–13% | proteção e seller tier | filtros de vendedor | P transferir ativo; C fluxo complexo; J concluir trade; F account recovery; R proibir categorias sem transferência verificável e KYC de risco. |
| 15 | GGMAX | Games BR | estoque e entrega automatizada | variável | revendedor | painel direto | P key instantânea; C chave duplicada; J resgatar; F revenda repetida; R `product_keys` transacional single-use. |
| 16 | Eldorado.gg | Games P2P | sellers verificados + trade status | referência variável | TradeShield | fluxo P2P limpo | P proteção rápida; C risco de conta; J rastrear; F chargeback; R device/IP/timeline e freeze automático de saldo. |
| 17 | M2G/MidasBuy/Eneba | Keys/top-up | catálogo de códigos e top-up | variável | entrega verificável | compra em poucos passos | P receber código válido; C fornecedor externo; J ativar; F estoque obsoleto; R parceiro autorizado, preço/estoque com timestamp e fallback de reembolso. |
| 18 | Kinguin/Instant Gaming | Keys | proteção opcional e cashback | variável | buyer protection | catálogo preço primeiro | P preço competitivo; C extras confusos; J decidir proteção; F key inválida; R proteção incluída e termos transparentes. |
| 19 | Gameflip | Games | wallet, escrow e disputa | referência variável | garantia | mobile de trade | P negociar com segurança; C wallet aumenta risco; J sacar; F lavagem de saldo; R limites, KYC progressivo e risk score. |
| 20 | Patreon/Ko-fi/Gumroad | Creator | membership, posts e pay-what-you-want | referência ~10% Gumroad; variável | pagamentos processados | criador no centro | P receita recorrente; C descoberta limitada; J entrar comunidade; F chargeback recorrente; R assinatura Stripe + revogação de acesso. |
| 21 | Fiverr/Upwork/99freelas/Workana | Serviços | pacotes, extras, milestones | variável | escrow e disputa | proposta estruturada | P contratar resultado; C escopo aberto; J briefing; F entrega vazia; R critérios de aceite, revisão e provas. |
| 22 | Etsy Digital | Templates | descoberta e reviews visuais | referência ~6,5% + listing | reviews | catálogo editorial | P achar asset confiável; C cópia de template; J licença; F copyright; R licença explícita e report DMCA. |
| 23 | Envato/Creative Fabrica | Assets | licença e assinatura | variável | curadoria | preview rico | P uso comercial seguro; C licença confusa; J comparar planos; F uso indevido; R licença versionada por compra. |
| 24 | Udemy/Coursera | Cursos | módulos, progresso e certificado | variável | avaliação/qualidade | trilha clara | P aprender; C progresso não prova resultado; J assistir; F compartilhamento; R acesso individual, progresso e certificado verificável. |
| 25 | Discord Marketplace/Whop | Comunidades | acesso automático e API | referência ~2,7–3% + processamento | controle de acesso | dashboard creator | P comunidade paga; C convite vazável; J entrar; F link compartilhado; R integração autorizada, vínculo de Discord e revogação no cancelamento. |

## Decisões v0.0.1 priorizadas

1. **Trust before growth:** KYC de risco, device/IP, rate limit persistente, score e audit log vêm antes de roleta/cupom.
2. **Entrega comprovável:** tokens limitados, chaves consumidas atomicamente, watermark quando aplicável, status de entrega e prova de download.
3. **Escrow proporcional:** saldo de vendedor fica pendente por sete dias; disputa congela somente a parcela relacionada.
4. **Descoberta honesta:** FTS, trigram, filtros, boost identificado e ranking auditável; não comprar reviews nem esconder patrocinado.
5. **Importação legal:** CSV de parceiro autorizado gera rascunho com `source`, `external_url`, consentimento e revisão humana. Nunca reescrever/camuflar origem para parecer produto próprio.

## Vetores de fraude cobertos no núcleo

1. cartão de teste; 2. CPF inválido; 3. e-mail descartável; 4. bot/honeypot; 5. credential stuffing; 6. device novo; 7. VPN/Tor/proxy de alto risco; 8. key vendida duas vezes; 9. arquivo executável ou MIME falsificado; 10. download contestado; 11. chargeback; 12. review sem compra; 13. abuso de cupom/referral; 14. saque após disputa; 15. importação de catálogo sem autorização.

## Fontes de benchmark

- Taxas de plataformas brasileiras são variáveis e a comparação de mercado deve ser conferida nas páginas oficiais antes de uso comercial: [comparativo](https://tactus.com.br/qual-a-melhor-plataforma-digital/).
- Referências de proteção, prazo e níveis nos marketplaces de games: [comparativo G2G/PlayerAuctions/Eldorado](https://pricemygame.com/blog/best-fortnite-account-marketplaces) e [análise de escrow](https://www.eneba.com/hub/play-to-earn/sell-game-items/).
- Referência de modelos creator/digital atuais: [Whop](https://whop.com/blog/where-to-sell-digital-products/) e [benchmark de templates](https://insightraider.com/en/answers/where-to-sell-digital-templates).
