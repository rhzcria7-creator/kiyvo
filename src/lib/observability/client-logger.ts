// ─────────────────────────────────────────────────────────────
// KIYVO — Logger Client-Safe
// Versão do logger que NÃO importa nada de server-side
// Pode ser usada em Client Components (error.tsx, etc.)
// ─────────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  service: string
  metadata?: Record<string, unknown>
}

class ClientLogger {
  private service: string
  private minLevel: LogLevel

  constructor(service: string = 'kiyvo-client') {
    this.service = service
    const envLevel = (process.env.LOG_LEVEL || 'info') as LogLevel
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical']
    const index = levels.indexOf(envLevel)
    this.minLevel = levels[Math.max(0, index)] as LogLevel
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

export const clientLogger = new ClientLogger()
