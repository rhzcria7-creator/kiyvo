'use client'

// ─────────────────────────────────────────────────────────────
// KIYVO — Hook de Notificações Realtime
// Escuta novas notificações via Supabase Realtime
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar notificações iniciais
  const loadNotifications = useCallback(async () => {
    if (!userId) return

    try {
      const res = await fetch('/api/v1/notifications?limit=20')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(
          (data.notifications || []).filter((n: Notification) => !n.is_read).length
        )
      }
    } catch {
      // Erro silencioso
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Escutar novas notificações via Realtime
  useEffect(() => {
    if (!userId) return

    loadNotifications()

    const supabase = createClient()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          setNotifications((prev) => [notification, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Mostrar toast via CustomEvent (integrado com react-hot-toast)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kiyvo:notification', {
                detail: notification,
              })
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          )
          // Recalcular unread count
          setNotifications((current) => {
            const unread = current.filter((n) => !n.is_read).length
            setUnreadCount(unread)
            return current
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, loadNotifications])

  // Marcar como lida
  const markAsRead = useCallback(async (ids: string[]) => {
    try {
      const res = await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: ids }),
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - ids.length))
      }
    } catch {
      // Erro silencioso
    }
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all_read: true }),
      })

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch {
      // Erro silencioso
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  }
}
