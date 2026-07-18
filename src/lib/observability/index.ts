// ─────────────────────────────────────────────────────────────
// KIYVO — Observabilidade e Monitoramento
// Logging estruturado, métricas e health checks
// Em produção: integrar com Datadog, Sentry ou similar
// ─────────────────────────────────────────────────────────────

// ─── LOG LEVELS ──────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  service: string
  traceId?: string
  userId?: string
  path?: string
  method?: string
  duration?: number
  statusCode?: number
  metadata?: Record<string, unknown>
}

// ─── STRUCTURED LOGGER ───────────────────────────────────────

class Logger {
  private service: string
  private minLevel: LogLevel

  constructor(service: string = 'kiyvo-api') {
    this.service = service
    const envLevel = (process.env.LOG_LEVEL || 'info') as LogLevel
    this.minLevel = this.getLevelValue(envLevel)
  }

  private getLevelValue(level: LogLevel): LogLevel {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical']
    const index = levels.indexOf(level)
    return levels[Math.max(0, index)] as LogLevel
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical']
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatEntry(level: LogLevel, message: string, data?: Partial<LogEntry>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      ...data,
    }
  }

  private output(entry: LogEntry): void {
    const output = JSON.stringify(entry)

    if (entry.level === 'critical' || entry.level === 'error') {
      process.stderr.write(output + '\n')
    } else {
      process.stdout.write(output + '\n')
    }
  }

  debug(message: string, data?: Partial<LogEntry>): void {
    if (!this.shouldLog('debug')) return
    this.output(this.formatEntry('debug', message, data))
  }

  info(message: string, data?: Partial<LogEntry>): void {
    if (!this.shouldLog('info')) return
    this.output(this.formatEntry('info', message, data))
  }

  warn(message: string, data?: Partial<LogEntry>): void {
    if (!this.shouldLog('warn')) return
    this.output(this.formatEntry('warn', message, data))
  }

  error(message: string, data?: Partial<LogEntry>): void {
    if (!this.shouldLog('error')) return
    this.output(this.formatEntry('error', message, data))
  }

  critical(message: string, data?: Partial<LogEntry>): void {
    if (!this.shouldLog('critical')) return
    this.output(this.formatEntry('critical', message, data))
  }
}

// Singleton logger
export const logger = new Logger()

// ─── API REQUEST LOGGER ──────────────────────────────────────

interface ApiLogParams {
  method: string
  path: string
  statusCode: number
  duration: number
  userId?: string
  ip?: string
  userAgent?: string
  error?: string
}

/**
 * Loga uma requisição de API de forma estruturada
 * Substitui console.log em API routes
 */
export function logApiRequest(params: ApiLogParams): void {
  const level: LogLevel = params.statusCode >= 500 ? 'error' : params.statusCode >= 400 ? 'warn' : 'info'

  logger[level](`${params.method} ${params.path} ${params.statusCode}`, {
    method: params.method,
    path: params.path,
    statusCode: params.statusCode,
    duration: params.duration,
    userId: params.userId,
    metadata: {
      ip: params.ip,
      userAgent: params.userAgent,
      error: params.error,
    },
  })
}

// ─── PERFORMANCE METRICS ─────────────────────────────────────

interface MetricEntry {
  name: string
  value: number
  unit: string
  timestamp: string
  tags?: Record<string, string>
}

const metrics: MetricEntry[] = []
const MAX_METRICS = 1000

/**
 * Registra uma métrica de performance
 */
export function recordMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>): void {
  const entry: MetricEntry = {
    name,
    value,
    unit,
    timestamp: new Date().toISOString(),
    tags,
  }

  metrics.push(entry)
  if (metrics.length > MAX_METRICS) metrics.shift()

  logger.debug(`Metric: ${name} = ${value}${unit}`, {
    metadata: { metric: name, value, unit, tags },
  })
}

/**
 * Obtém todas as métricas coletadas
 */
export function getMetrics(): MetricEntry[] {
  return [...metrics]
}

/**
 * Obtém métricas por nome
 */
export function getMetricsByName(name: string): MetricEntry[] {
  return metrics.filter((m) => m.name === name)
}

// ─── TIMER HELPER ────────────────────────────────────────────

/**
 * Mede o tempo de execução de uma função async
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    recordMetric(`${name}.duration`, duration, 'ms', tags)
    return result
  } catch (err) {
    const duration = performance.now() - start
    recordMetric(`${name}.duration`, duration, 'ms', { ...tags, status: 'error' })
    recordMetric(`${name}.errors`, 1, 'count', tags)
    throw err
  }
}

// ─── HEALTH CHECK ────────────────────────────────────────────

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  uptime: number
  checks: {
    supabase: 'up' | 'down' | 'unknown'
    stripe: 'up' | 'down' | 'unknown'
    storage: 'up' | 'down' | 'unknown'
    memory: { used: number; total: number; percentage: number }
  }
  metrics: {
    totalRequests: number
    errorRate: number
    avgResponseTime: number
  }
}

/**
 * Executa health check do sistema
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {
    supabase: 'unknown',
    stripe: 'unknown',
    storage: 'unknown',
    memory: getMemoryUsage(),
  }

  // Verificar Supabase
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { error } = await supabase.from('categories').select('id').limit(1)
    checks.supabase = error ? 'down' : 'up'
  } catch {
    checks.supabase = 'down'
  }

  // Verificar Stripe
  try {
    const { getStripeServer } = await import('@/lib/stripe/server')
    const stripe = getStripeServer()
    checks.stripe = stripe ? 'up' : 'down'
  } catch {
    checks.stripe = 'down'
  }

  // Verificar Storage
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = createAdminClient()
    if (admin) {
      const { error } = await admin.storage.listBuckets()
      checks.storage = error ? 'down' : 'up'
    } else {
      checks.storage = 'down'
    }
  } catch {
    checks.storage = 'down'
  }

  // Determinar status geral
  const downCount = Object.values(checks).filter(
    (v) => v === 'down'
  ).length
  const status: HealthStatus['status'] =
    downCount === 0 ? 'healthy' : downCount >= 2 ? 'unhealthy' : 'degraded'

  // Métricas
  const allMetrics = getMetrics()
  const durationMetrics = allMetrics.filter((m) => m.name.endsWith('.duration'))
  const errorMetrics = allMetrics.filter((m) => m.name.endsWith('.errors'))
  const avgResponseTime = durationMetrics.length > 0
    ? durationMetrics.reduce((sum, m) => sum + m.value, 0) / durationMetrics.length
    : 0
  const errorRate = errorMetrics.length > 0 && durationMetrics.length > 0
    ? (errorMetrics.length / durationMetrics.length) * 100
    : 0

  return {
    status,
    timestamp: new Date().toISOString(),
    version: '6.0.0',
    uptime: process.uptime(),
    checks,
    metrics: {
      totalRequests: durationMetrics.length,
      errorRate: Math.round(errorRate * 100) / 100,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
    },
  }
}

function getMemoryUsage(): { used: number; total: number; percentage: number } {
  const usage = process.memoryUsage()
  const used = Math.round(usage.heapUsed / 1024 / 1024)
  const total = Math.round(usage.heapTotal / 1024 / 1024)
  const percentage = total > 0 ? Math.round((used / total) * 100) : 0
  return { used, total, percentage }
}
