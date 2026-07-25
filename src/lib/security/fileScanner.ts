// v0.0.1 — Validação por magic bytes antes de enviar arquivos ao Storage.

export type ScanStatus = 'clean' | 'blocked'
export interface FileScanResult { status: ScanStatus; detectedMime: string; reason?: string }

const EXECUTABLE_SIGNATURES: Array<{ signature: number[]; name: string }> = [
  { signature: [0x4d, 0x5a], name: 'executável Windows' },
  { signature: [0x7f, 0x45, 0x4c, 0x46], name: 'executável ELF' },
  { signature: [0x23, 0x21], name: 'script executável' },
]

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value)
}

export function inspectFileHeader(bytes: Uint8Array, declaredMime: string, maxBytes = 50 * 1024 * 1024, sizeBytes = bytes.byteLength): FileScanResult {
  if (sizeBytes > maxBytes) return { status: 'blocked', detectedMime: 'unknown', reason: 'Arquivo maior que o limite permitido.' }
  const executable = EXECUTABLE_SIGNATURES.find(({ signature }) => startsWith(bytes, signature))
  if (executable) return { status: 'blocked', detectedMime: 'application/octet-stream', reason: `${executable.name} não é permitido para entrega automática.` }
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return { status: 'clean', detectedMime: 'application/pdf' }
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) return { status: 'clean', detectedMime: 'application/zip' }
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return { status: 'clean', detectedMime: 'image/png' }
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { status: 'clean', detectedMime: 'image/jpeg' }
  if (declaredMime.startsWith('text/') || declaredMime === 'application/json') return { status: 'clean', detectedMime: declaredMime }
  return { status: 'blocked', detectedMime: 'unknown', reason: 'Não foi possível comprovar o tipo real do arquivo.' }
}
