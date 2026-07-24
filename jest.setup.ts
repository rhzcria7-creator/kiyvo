// Jest setup pós-jsdom
// Aqui ficam os matchers do @testing-library/jest-dom e qualquer ajuste final.
// Polyfills de runtime (TextEncoder, crypto.subtle, Response) estão em jest.polyfills.ts,
// pois precisam ser aplicados ANTES da criação do window pelo jsdom.

import '@testing-library/jest-dom'

// Suprimir warnings do Next.js em ambiente de teste
// (evita poluição do output quando o Next tenta logar info de roteamento)
const originalWarn = console.warn
console.warn = function (...args: unknown[]) {
  // Ignorar warnings específicos do React/Next que não afetam testes
  if (typeof args[0] === 'string' && /react-router|next\/router|useLayoutEffect/.test(args[0])) {
    return
  }
  originalWarn.apply(console, args)
}
