// ─────────────────────────────────────────────────────────────
// ptBrMessages — tradução amigável de mensagens de erro para PT-BR.
// Supabase/Auth/Stripe/Network/Validation. NUNCA mensagens genéricas.
// Comentários em PT-BR, variáveis em EN.
// ─────────────────────────────────────────────────────────────

export interface ErrorResult {
  title: string
  message: string
  /** Categoria para telemetry/UI */
  kind: 'auth' | 'network' | 'validation' | 'permission' | 'payment' | 'server' | 'unknown'
  /** Se o erro é recuperável / permite retry */
  retryable?: boolean
}

const NETWORK_HINTS = [
  'network', 'fetch', 'failed to fetch', 'load failed', 'networkerror',
  'abort', 'timeout', 'socket', 'econnrefused', 'enotfound', 'cors',
]

function isNetworkError(msg: string): boolean {
  return NETWORK_HINTS.some(h => msg.includes(h))
}

/**
 * Converte qualquer erro/mensagem bruta em mensagem amigável em PT-BR.
 */
export function toPtBrError(input: unknown, context?: string): ErrorResult {
  if (!input) {
    return {
      title: 'Algo deu errado',
      message: 'Ocorreu um erro inesperado. Tente novamente em instantes.',
      kind: 'unknown',
      retryable: true,
    }
  }

  const raw = typeof input === 'string'
    ? input
    : input instanceof Error
      ? input.message
      : typeof input === 'object' && input !== null && 'message' in input
        ? String((input as { message?: unknown }).message)
        : String(input)

  const msg = raw.toLowerCase().trim()

  // ── Erros de rede (antes de tudo) ──────────────────────
  if (isNetworkError(msg)) {
    return {
      title: 'Sem conexão',
      message: 'Não foi possível conectar aos servidores da Kiyvo. Verifique sua internet e tente novamente.',
      kind: 'network',
      retryable: true,
    }
  }

  // ── Auth / Login ───────────────────────────────────────
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials') || msg.includes('email ou senha')) {
    return {
      title: 'Erro de login',
      message: 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.',
      kind: 'auth',
    }
  }
  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed') || msg.includes('precisa confirmar')) {
    return {
      title: 'Conta não verificada',
      message: 'Sua conta ainda não foi verificada. Confira seu e-mail para ativar a conta.',
      kind: 'auth',
    }
  }
  if (msg.includes('user already registered') || msg.includes('already been registered') || msg.includes('already exists') || msg.includes('duplicate')) {
    return {
      title: 'E-mail já cadastrado',
      message: 'Este e-mail já está em uso. Tente fazer login ou recupere sua senha.',
      kind: 'auth',
    }
  }
  if (msg.includes('invalid email') || msg.includes('email is invalid')) {
    return {
      title: 'E-mail inválido',
      message: 'Digite um endereço de e-mail válido (ex: seu@email.com).',
      kind: 'validation',
    }
  }
  if (msg.includes('password is too short') || msg.includes('password too short') || msg.includes('should be at least')) {
    return {
      title: 'Senha muito curta',
      message: 'A senha precisa ter pelo menos 6 caracteres para continuar.',
      kind: 'validation',
    }
  }
  if (msg.includes('weak password') || msg.includes('senha fraca')) {
    return {
      title: 'Senha fraca',
      message: 'Use uma senha mais forte (letras, números e símbolos).',
      kind: 'validation',
    }
  }
  if (msg.includes('jwt') && (msg.includes('expired') || msg.includes('invalid'))) {
    return {
      title: 'Sessão expirada',
      message: 'Sua sessão expirou. Faça login novamente para continuar.',
      kind: 'auth',
    }
  }
  if (msg.includes('invalid refresh token') || msg.includes('refresh_token_not_found')) {
    return {
      title: 'Sessão inválida',
      message: 'Sua sessão expirou ou é inválida. Faça login novamente.',
      kind: 'auth',
    }
  }
  if (msg.includes('no user') || msg.includes('user not found')) {
    return {
      title: 'Conta não encontrada',
      message: 'Não encontramos uma conta com esses dados. Verifique o e-mail ou cadastre-se.',
      kind: 'auth',
    }
  }
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('over_request_rate_limit')) {
    return {
      title: 'Muitas tentativas',
      message: 'Você fez muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.',
      kind: 'auth',
      retryable: true,
    }
  }

  // ── Permissões ────────────────────────────────────────
  if (msg.includes('permission denied') || msg.includes('not authorized') || msg.includes('forbidden') || msg.includes('não autorizado') || msg.includes('403')) {
    return {
      title: 'Permissão negada',
      message: 'Você não tem permissão para acessar este recurso.',
      kind: 'permission',
    }
  }
  if (msg.includes('unauthorized') || msg.includes('401') || msg.includes('not authenticated')) {
    return {
      title: 'Login necessário',
      message: 'Faça login para continuar.',
      kind: 'auth',
    }
  }

  // ── Pagamento / Stripe ────────────────────────────────
  if (msg.includes('card_declined') || msg.includes('recuso') || msg.includes('recusado')) {
    return {
      title: 'Pagamento recusado',
      message: 'Seu cartão recusou a cobrança. Verifique os dados com seu banco ou use outro método de pagamento.',
      kind: 'payment',
    }
  }
  if (msg.includes('insufficient_funds')) {
    return {
      title: 'Saldo insuficiente',
      message: 'Saldo insuficiente para completar a transação.',
      kind: 'payment',
    }
  }
  if (msg.includes('expired_card')) {
    return {
      title: 'Cartão expirado',
      message: 'Seu cartão está expirado. Use um cartão válido.',
      kind: 'payment',
    }
  }
  if (msg.includes('incorrect_cvc') || msg.includes('incorrect_cvv')) {
    return {
      title: 'Código CVV incorreto',
      message: 'O código de segurança (CVV) do cartão está incorreto.',
      kind: 'payment',
    }
  }
  if (msg.includes('processing_error')) {
    return {
      title: 'Erro no processamento',
      message: 'O pagamento não pôde ser processado. Tente novamente em instantes.',
      kind: 'payment',
      retryable: true,
    }
  }
  if (msg.includes('pix') && (msg.includes('expired') || msg.includes('expir'))) {
    return {
      title: 'QR Code expirado',
      message: 'O QR Code PIX expirou. Gere um novo para continuar.',
      kind: 'payment',
    }
  }

  // ── Validação ────────────────────────────────────────
  if (msg.includes('required') || msg.includes('obrigat')) {
    return {
      title: 'Campo obrigatório',
      message: 'Preencha todos os campos obrigatórios para continuar.',
      kind: 'validation',
    }
  }
  if (msg.includes('cpf') || msg.includes('cnpj')) {
    return {
      title: 'Documento inválido',
      message: 'Informe um CPF/CNPJ válido.',
      kind: 'validation',
    }
  }
  if (msg.includes('invalid token') || msg.includes('token inválido') || msg.includes('otp') || msg.includes('código')) {
    return {
      title: 'Código inválido',
      message: 'O código informado é inválido ou já expirou.',
      kind: 'validation',
    }
  }

  // ── Server ───────────────────────────────────────────
  if (msg.includes('500') || msg.includes('internal server error') || msg.includes('502') || msg.includes('503') || msg.includes('504')) {
    return {
      title: 'Erro no servidor',
      message: 'Nossos servidores estão enfrentando instabilidade. Tente novamente em alguns minutos.',
      kind: 'server',
      retryable: true,
    }
  }
  if (msg.includes('404') || msg.includes('not found') || msg.includes('não encontrado')) {
    return {
      title: 'Não encontrado',
      message: 'O conteúdo que você tentou acessar não existe ou foi removido.',
      kind: 'server',
    }
  }

  // ── Fallback com contexto ────────────────────────────
  const ctx = context ? `${context}: ` : ''
  return {
    title: 'Não foi possível completar a ação',
    message: `${ctx}${raw || 'Tente novamente em instantes.'}`,
    kind: 'unknown',
    retryable: true,
  }
}

/**
 * Helper para toast.error com mensagem PT-BR já resolvida.
 */
export function ptBrErrorMessage(err: unknown, context?: string): string {
  return toPtBrError(err, context).message
}

export default toPtBrError
