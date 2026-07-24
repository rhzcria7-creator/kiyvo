'use client'
// Inicializa todas as proteções client-side e trigger do piloto
import { useEffect } from 'react'
import { initSecurity } from '@/lib/security/antiClone'

export function SecurityInit() {
  useEffect(() => {
    initSecurity()
  }, [])
  return null
}
