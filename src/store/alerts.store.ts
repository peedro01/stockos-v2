import { create } from 'zustand'
import { alertsService } from '@/services/alerts.service'
import { mockAlerts } from '@/lib/mock-data'
import type { StockAlert } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

interface AlertsState {
  alerts: StockAlert[]
  load: () => Promise<void>
  markRead: (id: string) => void
  dismiss: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
  unreadCount: () => number
}

// Alertas de estoque são gerados pelo banco (trigger em products);
// aqui só lemos e aplicamos as ações do usuário (com atualização otimista).
export const useAlertsStore = create<AlertsState>()((set, get) => {
  const sync = (promise: Promise<void>) => {
    if (IS_DEMO) return
    promise.catch(() => { void get().load() })
  }

  return {
    alerts: IS_DEMO ? mockAlerts : [],

    load: async () => {
      if (IS_DEMO) return
      try {
        set({ alerts: await alertsService.getAll() })
      } catch (e) {
        console.error('Erro ao carregar alertas', e)
      }
    },

    markRead: (id) => {
      set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, is_read: true } : a) }))
      sync(alertsService.markRead(id))
    },
    dismiss: (id) => {
      set(s => ({ alerts: s.alerts.filter(a => a.id !== id) }))
      sync(alertsService.delete(id))
    },
    markAllRead: () => {
      set(s => ({ alerts: s.alerts.map(a => ({ ...a, is_read: true })) }))
      sync(alertsService.markAllRead())
    },
    clearAll: () => {
      set({ alerts: [] })
      sync(alertsService.deleteAll())
    },
    unreadCount: () => get().alerts.filter(a => !a.is_read).length,
  }
})
