import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockAlerts } from '@/lib/mock-data'
import type { StockAlert } from '@/types'

interface AlertsState {
  alerts: StockAlert[]
  markRead: (id: string) => void
  dismiss: (id: string) => void
  markAllRead: () => void
  clearAll: () => void
  unreadCount: () => number
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      alerts: mockAlerts,
      markRead: (id) => set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, is_read: true } : a) })),
      dismiss: (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
      markAllRead: () => set(s => ({ alerts: s.alerts.map(a => ({ ...a, is_read: true })) })),
      clearAll: () => set({ alerts: [] }),
      unreadCount: () => get().alerts.filter(a => !a.is_read).length,
    }),
    { name: 'stockos-alerts' }
  )
)
