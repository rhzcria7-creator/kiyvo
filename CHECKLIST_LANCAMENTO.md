# 🚀 KIYVO — Checklist de Lançamento para kiyvo.com.br
## ⏱️ Tempo total estimado: 20-30 minutos

Você disse que o **Supabase já está funcionando**. Então faltam só estes passos para COMEÇAR A FATURAR HOJE.

---

## 🟢 PASSO 1 — Comprar o domínio (2 min)

1. Acesse **https://registro.br** (oficial do Brasil, mais barato e mais rápido)
2. Pesquise `kiyvo.com.br`
3. Compre (R$ 40/ano). Se já estiver registrado, tente alternativas:
   - `kiyvo.app.br`
   - `kiyvo.digital`
   - `kiyvo.com`
4. **NÃO PRECISA** configurar DNS ainda — a Vercel faz isso automaticamente.

---

## 🟢 PASSO 2 — Adicionar domínio na Vercel (3 min)

1. Abra: **https://vercel.com/dashboard** → selecione o projeto `kiyvo`
2. Vá em **Settings → Domains**
3. Digite `kiyvo.com.br` e clique **Add**
4. A Vercel vai te mostrar 2 registros DNS:
   - Um registro **A** apontando para `76.76.21.21`
   - Ou um **CNAME** `www` apontando para `cname.vercel-dns.com`
5. **Volte no registro.br** → Meus Domínios → `kiyvo.com.br` → DNS
6. Edite a zona DNS e adicione os registros exatamente como a Vercel pedir
7. Salve e volte pra Vercel — o SSL (HTTPS) é automático em ~5 min
8. ✅ Depois disso o site abre em `https://kiyvo.com.br`

---

## 🟢 PASSO 3 — Rodar o schema no Supabase (2 min) — CRÍTICO

O banco tem tabelas novas (afiliados, badges, ad_boosts, saques). Se não rodar, partes do site vão quebrar.

1. Abra: **https://supabase.com/dashboard/project/ytiyqkliojawihfnlwzo/sql/new**
2. Clique **New Query**
3. Abra o arquivo `supabase/00_RUN_THIS_FIRST_COMPLETE.sql` aqui do projeto
4. **Copie TUDO** (3.527 linhas) e cole no editor
5. Clique **Run** (Ctrl+Enter)
6. Vai aparecer "Success" — ✅ pronto

> Se aparecer erro de "já existe", é normal — o arquivo é idempotente (seguro rodar várias vezes).

---

## 🟢 PASSO 4 — Configurar variáveis de ambiente na Vercel (3 min)

Na Vercel → **Settings → Environment Variables** → Production.
Confirme que existem estas chaves (várias já devem estar da sessão anterior):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ytiyqkliojawihfnlwzo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (copiar do Supabase → Settings → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | (copiar do Supabase — chave secreta!) |
| `NEXT_PUBLIC_SITE_URL` | **`https://kiyvo.com.br`** 👈 TROQUE ESSE AGORA |
| `STRIPE_SECRET_KEY` | `sk_live_...` (a sua chave LIVE do Stripe) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | (só depois do passo 5) |
| `TOTP_ENCRYPTION_KEY` | gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

Depois de salvar: vá em **Deployments** → último deploy → ⋯ → **Redeploy**.

---

## 🟢 PASSO 5 — Configurar o Webhook do Stripe (3 min) — OBRIGATÓRIO para receber pagamentos

Sem webhook, **o comprador paga mas o produto não é entregue**.

1. Abra: **https://dashboard.stripe.com/webhooks**
2. **Add endpoint**
3. **Endpoint URL**: `https://kiyvo.com.br/api/stripe/webhook`
4. Em **Select events to listen to**, marque:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
   - `charge.refunded`
5. Clique **Add endpoint**
6. Na página do webhook, clique **Reveal** em **Signing secret**
7. Copie o valor (começa com `whsec_...`)
8. Volte na Vercel → Environment Variables → cole como `STRIPE_WEBHOOK_SECRET`
9. **Redeploy** novamente

✅ Agora quando alguém pagar (cartão ou PIX), o Stripe avisa o site automaticamente e o produto é entregue.

---

## 🟢 PASSO 6 — Configurar Pix no Stripe (opcional mas ALTAMENTE recomendado)

Brasileiro ama PIX. Sem PIX você perde 60%+ das vendas.

1. Abra: **https://dashboard.stripe.com/settings/payment_methods**
2. Procure por **PIX** → clique **Turn on**
4. Confirme seu CNPJ/CPF no Stripe se pedir
5. ✅ O checkout já tem código para PIX — basta ligar no painel.

> O PIX no Stripe funciona com QR Code + código "copia e cola". Expira em 30 min.

---

## 🟢 PASSO 7 — Testar compra real (5 min)

Antes de divulgar, valide o funil:

1. Abra **https://kiyvo.com.br** em aba anônima
2. Crie uma conta nova com seu email (ex: `comprador.teste@...`)
3. Navegue até um produto barato (ex: Gift Card Steam R$50)
4. Clique em **Comprar**
5. Vai pro Stripe Checkout — use um cartão de teste:
   - Número: `4242 4242 4242 4242`
   - Validade: qualquer data futura
   - CVV: qualquer 3 dígitos
6. Deve voltar para `/checkout/sucesso` com confete 🎉
7. Confira se:
   - Aparece o pedido em `/conta/compras`
   - Você recebeu KD Points (bônus de primeira compra)
   - Se foi por um link de afiliado, a comissão foi registrada

> ⚠️ Se quiser testar com DINHEIRO REAL, use um produto de R$5 e seu próprio cartão — você mesmo recebe o valor (menos taxas Stripe).

---

## 🟢 PASSO 8 — Configurar Supabase Auth URLs (2 min)

Se não fizer isso, login/cadastro pode dar erro em produção.

1. Abra: **https://supabase.com/dashboard/project/ytiyqkliojawihfnlwzo/auth/url-configuration`
2. **Site URL**: `https://kiyvo.com.br`
3. **Redirect URLs** (uma por linha):
   ```
   https://kiyvo.com.br/**
   https://kiyvo.vercel.app/**
   http://localhost:3000/**
   ```
4. Salve.

---

## 🟢 PASSO 9 — Storage no Supabase (1 min — para KYC de vendedores)

1. Abra: **https://supabase.com/dashboard/project/ytiyqkliojawihfnlwzo/storage/new/bucket`
2. Nome: `documents`
3. Marque **Private bucket**
4. Salve
5. Clique em **Policies → New Policy → Create policy from scratch**:
   - INSERT: `auth.role() = 'authenticated'` — nome: "Usuários autenticados podem enviar"
   - SELECT: `auth.uid()::text = (storage.foldername(name))[1]` — nome: "Usuários veem seus próprios docs"
6. Salve.

---

## 🟢 PASSO 10 — Divulgar e começar a faturar 🚀

### Tráfego orgânico:
- Post no seu Instagram/TikTok pessoal falando que lançou
- Chamar amigos pra testar e dar feedback
- Post em grupos de Facebook de jogos/devs/marketing digital
- Responder perguntas no Reddit r/gameseculo, r/brasil, grupos de Telegram

### Tráfego pago (quando tiver R$50-100 pra investir):
- **Meta Ads (Instagram/Facebook)** → público: "jogos pc", "streaming", "gift cards", 18-35 anos
- **TikTok Ads** → mesmo público, mais barato e melhor conversão pra jovem
- Criativos: "Netflix R$19/mês sem sair de casa?" ou "Steam Gift Card barato"

### Estratégia de afiliados (JÁ TEM SISTEMA PRONTO!):
- Cada usuário tem um link em `/indique-ganhe` (ex: `kiyvo.com.br/r/CODIGO`)
- Quem indica ganha 8% de comissão + bônus de R$5 na primeira compra
- Ofereça parceria para influencers pequenos (5k-50k seguidores) — eles já têm audiência e topam comissão
- Convide amigos para serem afiliados e divulgarem

### Como escalar a margem:
1. **Catálogo oficial KIYVO** (produtos seedados): 100% do lucro vai pra você. Sem vendedor dividindo.
2. **Boost de anúncios** (sistema já pago): vendedores te pagam pra destacar produtos — R$4,99 a R$249,99 por boost.
3. **Taxas de marketplace**: 10% sobre cada venda de terceiros.
4. **Planos de vendedor**: página `/planos` já está pronta (Prata/Ouro/Diamante).

---

## 🔑 Suas credenciais de admin (NÃO COMPARTILHE)

| Perfil | E-mail | Senha |
|---|---|---|
| **Administrador** | `admin@kiyvo.com.br` | `Kiyvo@2025` |
| CEO | `ceo@kiyvo.com.br` | `Kiyvo@2025` |
| CTO | `cto@kiyvo.com.br` | `Kiyvo@2025` |

> ⚠️ PRIMEIRA COISA ao logar em produção: **altere a senha** em `/configuracoes` ou no Supabase Auth dashboard.

---

## ❌ Se algo der errado, me avise:

1. "Erro ao entrar" → provavelmente esqueceu de rodar o schema.sql (passo 3)
2. "Pagamento não entrega" → webhook não configurado (passo 5) ou secret errada
3. "Não carrega produtos" → SUPABASE_SERVICE_ROLE_KEY faltando
4. "CSS quebrado" → precisa dar Hard Refresh (Ctrl+Shift+R)

---

## ✅ Resumo do que já está PRONTO no código (pushed hoje):

- ✅ Supabase Auth funcionando (login/cadastro/recuperar senha)
- ✅ Stripe Checkout com cartão + PIX
- ✅ Webhook com entrega automática
- ✅ Sistema de emblemas (28 badges) com desconto progressivo
- ✅ Programa de afiliados (link, cupom, cashback, saque em PIX)
- ✅ KD Points (100 KD = R$1, máx 50% de desconto)
- ✅ Anti-fraude (bloqueio temp mail, validação CPF/CEP, detector IA)
- ✅ Boost de anúncios pago (vendedores te pagam por destaque)
- ✅ Catálogo oficial (14 produtos seed)
- ✅ Afiliado dashboard
- ✅ Admin painel
- ✅ SEO (robots.txt, sitemap.xml, manifest, OG tags, metadata base)
- ✅ PWA manifest (app pode ser instalado no celular)
- ✅ Dark mode
- ✅ Walled garden com rotas públicas
- ✅ Framer Motion em toda parte
- ✅ Mobile-first

**Se você completar os passos 1-8 acima, o site está 100% pronto para vender.** 🎯
