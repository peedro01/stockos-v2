import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, Alert, DashboardStats } from '@/types'

interface AppState {
  // Auth
  user: UserProfile | null
  setUser: (user: UserProfile | null) => void

  // UI
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void

  // Theme
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void

  // Alerts
  alerts: Alert[]
  unreadAlertsCount: number
  setAlerts: (alerts: Alert[]) => void
  markAlertRead: (id: string) => void
  markAllAlertsRead: () => void

  // Dashboard
  dashboardStats: DashboardStats | null
  setDashboardStats: (stats: DashboardStats) => void
  statsLoading: boolean
  setStatsLoading: (v: boolean) => void

  // Global loading / toast
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
}

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // UI
      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Alerts
      alerts: [],
      unreadAlertsCount: 0,
      setAlerts: (alerts) =>
        set({ alerts, unreadAlertsCount: alerts.filter((a) => !a.is_read).length }),
      markAlertRead: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
          unreadAlertsCount: Math.max(0, s.unreadAlertsCount - 1),
        })),
      markAllAlertsRead: () =>
        set((s) => ({
          alerts: s.alerts.map((a) => ({ ...a, is_read: true })),
          unreadAlertsCount: 0,
        })),

      // Dashboard
      dashboardStats: null,
      setDashboardStats: (stats) => set({ dashboardStats: stats }),
      statsLoading: false,
      setStatsLoading: (v) => set({ statsLoading: v }),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = crypto.randomUUID()
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
        setTimeout(() => get().removeToast(id), 5000)
      },
      removeToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'stockos-storage',
      partialize: (s) => ({ theme: s.theme, sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
)
