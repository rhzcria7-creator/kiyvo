# KIYVO v0.0.1 — pre-launch

Marketplace brasileiro para produtos e serviços digitais com compra protegida, entrega verificável e operação orientada a confiança.

## Princípios

- **Segurança antes de crescimento:** rate limit, auditoria, score de risco, validação de identidade por risco e disputa com evidências.
- **Entrega comprovável:** download tokens expiráveis, limite de uso, arquivos privados e inventário de chaves de uso único.
- **Transparência financeira:** comissão sem teto, ledger de dupla entrada e saldo de vendedor pendente durante a garantia.
- **UX mobile-first:** Next.js 14.2.29, React 18, TypeScript strict, Tailwind 3.4 e Framer Motion.
- **IA como ferramenta, não como enfeite:** Kiya é a interface pública; o motor interno permanece invisível ao usuário.

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js **14.2.29** | App Router; versão pinada e não atualizável neste projeto |
| Supabase | Postgres, RLS, Storage, Realtime e Auth opcional |
| Firebase | Fluxos de autenticação existentes |
| Stripe | Checkout, Connect e webhooks assinados |
| Zod | Contratos e validação de fronteira |
| Zustand | Estado client-side com fallback demo |

## Arquitetura v0.0.1

- `src/domain/`: regras financeiras e transacionais puras.
- `src/skills/`: capacidades reutilizáveis com input Zod e testes.
- `src/lib/security/`: validação antifraude, fingerprint minimizada e inspeção de arquivo.
- `src/lib/delivery/`: emissão, validação e revogação de tokens de entrega.
- `supabase/00_MASTER_V0_0_1.sql`: estruturas idempotentes do núcleo de confiança.
- `analise_competidores.md`: benchmark de 25 marketplaces e decisões de produto legais/éticas.

## Desenvolvimento

```bash
npm install next@14.2.29 --save-exact
npm run dev
npm test -- --runInBand
./node_modules/.bin/next build
```

## Ativação de produção

Leia `DEPLOY_GUIDE_V0_0_1.md`, `TODO_LIST_DONO_V0_0_1.md` e `supabase/README.md`. Sem as credenciais de Supabase/Stripe, o aplicativo permanece em modo demo com guardrails locais; operações financeiras e Storage reais exigem infraestrutura configurada.

## Compliance de parceiros

Catálogos externos só podem ser usados com autorização documentada, API pública ou programa de afiliados. Não copie conteúdo, imagens ou identidade de concorrentes, nem apresente um item de parceiro como produto próprio.
