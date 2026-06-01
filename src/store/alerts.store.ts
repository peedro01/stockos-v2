import { create } from 'zustand'
import { mockAlerts } from '@/lib/mock-data'
import type { StockAlert } from '@/types'

interface AlertsState {
  alerts: StockAlert[]
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  unreadCount: () => number
}

export const useAlertsStore = create<AlertsState>()((set, get) => ({
  alerts: mockAlerts,
  markRead: (id) => set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, is_read: true } : a) })),
  markAllRead: () => set(s => ({ alerts: s.alerts.map(a => ({ ...a, is_read: true })) })),
  dismiss: (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
  unreadCount: () => get().alerts.filter(a => !a.is_read).length,
}))
