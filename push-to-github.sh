#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# KIYVO — Script de Push para GitHub
# Execute este script no terminal com seu token:
#   ./push-to-github.sh SEU_GITHUB_TOKEN
# ═══════════════════════════════════════════════════════════════

set -e

TOKEN="${1:-}"
REPO="rhzcria7-creator/kiyvo"
BRANCH="main"

if [ -z "$TOKEN" ]; then
  echo "❌ Uso: ./push-to-github.sh SEU_GITHUB_PAT_TOKEN"
  echo ""
  echo "Para criar um token:"
  echo "  1. Vá em https://github.com/settings/tokens"
  echo "  2. Clique 'Generate new token (classic)'"
  echo "  3. Selecione scope 'repo'"
  echo "  4. Copie o token e execute este script"
  exit 1
fi

echo "🚀 KIYVO — Preparando push para GitHub..."

# Configurar remote com token
git remote set-url origin "https://${TOKEN}@github.com/${REPO}.git"

# Verificar build
echo "📦 Verificando build..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build falhou! Corrija os erros antes de fazer push."
  exit 1
fi

echo "✅ Build passou!"

# Adicionar tudo
git add -A

# Commit
git commit -m "🚀 KIYVO v6.0 — Rebrand completa + 351 páginas + segurança bancária" || echo "Nada novo para commitar"

# Push
echo "📤 Fazendo push para ${REPO}..."
git push -u origin ${BRANCH}

if [ $? -eq 0 ]; then
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "✅ KIYVO v6.0 publicado com sucesso no GitHub!"
  echo "   https://github.com/${REPO}"
  echo "═══════════════════════════════════════════════════════"
else
  echo "❌ Push falhou. Verifique o token e as permissões."
fi

# Remover token do remote por segurança
git remote set-url origin "https://github.com/${REPO}.git"
echo "🔒 Token removido do remote por segurança."
