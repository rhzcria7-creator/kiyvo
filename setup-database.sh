#!/bin/bash
# =============================================
# PLAYDEX — Setup Automático do Banco de Dados
# =============================================
# Execute este script na sua máquina local:
#   chmod +x setup-database.sh
#   ./setup-database.sh
# =============================================

echo "🚀 PLAYDEX — Setup do Banco de Dados"
echo "======================================"
echo ""

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ psql não encontrado. Instalando..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install libpq
    elif [[ "$OSTYPE" == "linux"* ]]; then
        sudo apt-get install -y postgresql-client
    fi
fi

# Configurações
SUPABASE_HOST="aws-0-sa-east-1.pooler.supabase.com"
SUPABASE_PORT="6543"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres.ytiyqkliojawihfnlwzo"
SUPABASE_PASS="playdexpassdata"

echo "📡 Conectando ao Supabase..."
echo "   Host: $SUPABASE_HOST"
echo "   User: $SUPABASE_USER"
echo ""

# Executar schema
PGPASSWORD=$SUPABASE_PASS psql \
    "host=$SUPABASE_HOST port=$SUPABASE_PORT dbname=$SUPABASE_DB user=$SUPABASE_USER sslmode=require" \
    -f supabase/schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schema executado com sucesso!"
    echo ""
    echo "🔍 Verificando tabelas criadas..."
    PGPASSWORD=$SUPABASE_PASS psql \
        "host=$SUPABASE_HOST port=$SUPABASE_PORT dbname=$SUPABASE_DB user=$SUPABASE_USER sslmode=require" \
        -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    echo ""
    echo "🎉 PLAYDEX está pronto!"
else
    echo ""
    echo "❌ Erro ao executar schema."
    echo "💡 Tente usar o SQL Editor no painel do Supabase:"
    echo "   1. Vá em https://supabase.com/dashboard/project/ytiyqkliojawihfnlwzo/sql"
    echo "   2. Cole o conteúdo de supabase/schema.sql"
    echo "   3. Clique em Run"
fi
