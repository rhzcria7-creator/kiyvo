# 🚀 Kiyvo v2.0 — Guia de Deploy Completo

## Passo 1: Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Nome: `kiyvo`, Senha: (escolha uma forte), Região: **South America (São Paulo)**
4. Aguarde o projeto ser criado (~2 min)

## Passo 2: Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Copie TODO o conteúdo de `supabase/schema.sql`
3. Cole e clique em **Run**
4. Isso criará todas as 18 tabelas, RLS, triggers e seed data

## Passo 3: Configurar Autenticação

1. No Supabase, vá em **Authentication → URL Configuration**
2. Site URL: `https://seu-dominio.vercel.app`
3. Redirect URLs: adicione `https://seu-dominio.vercel.app/**`
4. Em **Providers**, ative **Google** e **GitHub** se quiser OAuth

## Passo 4: Configurar Storage (para verificação de docs)

1. Vá em **Storage**
2. Crie um bucket chamado `documents`
3. Marque como **Private**
4. Em **Policies**, adicione:
   - INSERT: `auth.uid() = storage.folder(name)[1]` (users can upload to own folder)
   - SELECT: `auth.uid() = storage.folder(name)[1]` (users can read own files)

## Passo 5: Pegar as Chaves do Supabase

1. Vá em **Settings → API**
2. Copie a **Project URL** e a **anon public key**

## Passo 6: Configurar Variáveis na Vercel

1. No seu projeto na Vercel, vá em **Settings → Environment Variables**
2. Adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-anon-key
   ```

## Passo 7: Deploy

1. Faça push do código para o GitHub
2. A Vercel fará o deploy automaticamente
3. O build deve passar sem erros ✅

---

## 📋 Resumo do que foi construído

### Backend (Supabase)
- **18 tabelas** com relacionamentos completos
- **Row Level Security** em todas as tabelas
- **Triggers** para auto-criar perfil no signup e auto-update timestamps
- **Schema SQL** completo para rodar no SQL Editor

### Autenticação
- **Login** com e-mail/senha via Supabase Auth
- **Cadastro** em 2 passos (dados pessoais + acesso)
- **Google/GitHub OAuth** configurável
- **Middleware** que protege rotas
- **Verificação KYC obrigatória** para vender (4 etapas: CPF, Data Nascimento, Selfie, Endereço)

### Frontend Premium
- **SVGs Animados**: Shield, Lightning, Star, Globe, Cart, Handshake, Wave, FloatingDots
- **Animações Framer Motion**: Page transitions, stagger containers, fade-in on scroll, scale-in, slide-in, animated counters, typing effect, ripple, skeleton loading, full-page loader
- **Página de produto** premium: galeria com thumbnails, avaliações, vendedor, badges, favoritos, share
- **Toasts** com react-hot-toast

### Páginas (37 total)
**Novas páginas:**
- `/dashboard` — Painel do usuário com stats, pedidos, ações rápidas
- `/perfil` — Perfil público do vendedor
- `/favoritos` — Produtos salvos
- `/configuracoes` — Editar perfil, segurança, verificação
- `/planos` — Planos para vendedores (Prata/Ouro/Diamante)
- `/ofertas` — Ofertas em destaque + cupons
- `/garantia` — Política de compra garantida
- `/verificacao` — KYC completo em 4 etapas
- `/admin` — Painel administrativo
- `/admin/usuarios` — Gerenciar usuários
- `/admin/produtos` — Gerenciar produtos
- `/admin/pedidos` — Gerenciar pedidos

**Páginas existentes (evoluídas):**
- `/` — Home premium com SVGs animados, how it works, stats, payments, CTA
- `/login` — Login com Supabase Auth + OAuth
- `/cadastro` — Cadastro em 2 passos
- `/produto/[id]` — Produto premium com galeria, avaliações, vendedor
- + todas as outras mantidas intactas

### Rebrand Completo
- **Kiyvo = TUDO digital** (não só jogos)
- 20 categorias diversificadas
- 15 produtos de todas as categorias
- Textos, FAQ, reviews, blog — tudo atualizado

---

## ⚠️ Importante
- Sem as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, o site funciona em modo demonstração (mock data)
- Com as variáveis configuradas, o Supabase Auth e o banco funcionam de verdade
- A verificação KYC salva dados no banco real
- O middleware protege rotas quando Supabase está configurado
