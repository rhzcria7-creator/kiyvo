// ─────────────────────────────────────────────────────────────
// Testes — Observabilidade (Logger, Métricas, Health Check)
// ─────────────────────────────────────────────────────────────

import { logger, logApiRequest, recordMetric, getMetrics, getMetricsByName, measureTime } from '..'

// Mock do process.stdout/stderr para capturar output
let stdoutOutput = ''
let stderrOutput = ''
const originalStdoutWrite = process.stdout.write.bind(process.stdout)
const originalStderrWrite = process.stderr.write.bind(process.stderr)

function mockOutput() {
  stdoutOutput = ''
  stderrOutput = ''
  process.stdout.write = (chunk: string | Buffer) => {
    stdoutOutput += chunk.toString()
    return true
  }
  process.stderr.write = (chunk: string | Buffer) => {
    stderrOutput += chunk.toString()
    return true
  }
}

function restoreOutput() {
  process.stdout.write = originalStdoutWrite
  process.stderr.write = originalStderrWrite
}

describe('Observabilidade — Logger', () => {
  beforeEach(() => {
    mockOutput()
  })

  afterEach(() => {
    restoreOutput()
  })

  it('loga mensagem info em stdout como JSON', () => {
    logger.info('Teste de log')
    expect(stdoutOutput).toContain('"level":"info"')
    expect(stdoutOutput).toContain('"message":"Teste de log"')
    expect(stdoutOutput).toContain('"service":"kiyvo-api"')
  })

  it('não loga debug quando nível é info (padrão)', () => {
    logger.debug('Não deve aparecer')
    expect(stdoutOutput).toBe('')
  })

  it('loga info quando nível é info', () => {
    logger.info('Deve aparecer')
    expect(stdoutOutput).toContain('Deve aparecer')
  })

  it('loga error em stderr', () => {
    logger.error('Erro crítico')
    expect(stderrOutput).toContain('"level":"error"')
    expect(stderrOutput).toContain('Erro crítico')
  })

  it('loga critical em stderr', () => {
    logger.critical('Falha total')
    expect(stderrOutput).toContain('"level":"critical"')
  })

  it('inclui timestamp ISO no log', () => {
    logger.info('Com timestamp')
    const parsed = JSON.parse(stdoutOutput.trim())
    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('inclui dados extras no log', () => {
    logger.info('Com dados', { userId: 'user-123', path: '/api/test' })
    const parsed = JSON.parse(stdoutOutput.trim())
    expect(parsed.userId).toBe('user-123')
    expect(parsed.path).toBe('/api/test')
  })
})

describe('Observabilidade — logApiRequest', () => {
  beforeEach(() => {
    mockOutput()
  })

  afterEach(() => {
    restoreOutput()
  })

  it('loga request 200 como info', () => {
    logApiRequest({
      method: 'GET',
      path: '/api/v1/products',
      statusCode: 200,
      duration: 150,
    })
    expect(stdoutOutput).toContain('"level":"info"')
    expect(stdoutOutput).toContain('200')
  })

  it('loga request 404 como warn', () => {
    logApiRequest({
      method: 'GET',
      path: '/api/v1/products/nao-existe',
      statusCode: 404,
      duration: 50,
    })
    expect(stdoutOutput).toContain('"level":"warn"')
  })

  it('loga request 500 como error', () => {
    logApiRequest({
      method: 'POST',
      path: '/api/v1/checkout',
      statusCode: 500,
      duration: 3000,
      error: 'Database connection failed',
    })
    expect(stderrOutput).toContain('"level":"error"')
    expect(stderrOutput).toContain('500')
  })

  it('inclui dados do request no log', () => {
    logApiRequest({
      method: 'POST',
      path: '/api/v1/orders',
      statusCode: 201,
      duration: 200,
      userId: 'user-abc',
    })
    const parsed = JSON.parse(stdoutOutput.trim())
    expect(parsed.userId).toBe('user-abc')
    expect(parsed.method).toBe('POST')
    expect(parsed.path).toBe('/api/v1/orders')
    expect(parsed.statusCode).toBe(201)
    expect(parsed.duration).toBe(200)
  })
})

describe('Observabilidade — Métricas', () => {
  beforeEach(() => {
    mockOutput()
    // Limpar métricas globais
    const metrics = getMetrics()
    // Não podemos limpar diretamente, mas testamos o comportamento
  })

  afterEach(() => {
    restoreOutput()
  })

  it('registra métrica de performance', () => {
    recordMetric('api.request.duration', 250, 'ms')
    const metrics = getMetrics()
    const found = metrics.find((m) => m.name === 'api.request.duration')
    expect(found).toBeDefined()
    expect(found?.value).toBe(250)
    expect(found?.unit).toBe('ms')
  })

  it('registra métrica com tags', () => {
    recordMetric('db.query.duration', 50, 'ms', { table: 'products', operation: 'select' })
    const metrics = getMetrics()
    const found = metrics.find((m) => m.name === 'db.query.duration')
    expect(found?.tags).toEqual({ table: 'products', operation: 'select' })
  })

  it('filtra métricas por nome', () => {
    recordMetric('test.metric', 1)
    recordMetric('other.metric', 2)
    recordMetric('test.metric', 3)
    const found = getMetricsByName('test.metric')
    expect(found.length).toBeGreaterThanOrEqual(2)
    found.forEach((m) => {
      expect(m.name).toBe('test.metric')
    })
  })

  it('inclui timestamp ISO na métrica', () => {
    recordMetric('test.ts', 42)
    const found = getMetricsByName('test.ts')
    expect(found[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('Observabilidade — measureTime', () => {
  beforeEach(() => {
    mockOutput()
  })

  afterEach(() => {
    restoreOutput()
  })

  it('mede tempo de função async com sucesso', async () => {
    const result = await measureTime('test.op', async () => {
      return 'sucesso'
    })
    expect(result).toBe('sucesso')
    const metrics = getMetricsByName('test.op.duration')
    expect(metrics.length).toBeGreaterThanOrEqual(1)
    expect(metrics[0].value).toBeGreaterThanOrEqual(0)
  })

  it('registra métrica de erro quando função falha', async () => {
    await expect(
      measureTime('test.fail', async () => {
        throw new Error('boom')
      })
    ).rejects.toThrow('boom')
    const errorMetrics = getMetricsByName('test.fail.errors')
    const durationMetrics = getMetricsByName('test.fail.duration')
    expect(errorMetrics.length).toBeGreaterThanOrEqual(1)
    expect(durationMetrics.length).toBeGreaterThanOrEqual(1)
    expect(durationMetrics[0].tags?.status).toBe('error')
  })

  it('passa tags para métricas', async () => {
    await measureTime('test.tags', async () => 42, { env: 'test' })
    const metrics = getMetricsByName('test.tags.duration')
    expect(metrics[0].tags?.env).toBe('test')
  })
})
