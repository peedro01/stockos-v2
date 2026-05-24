import { useState, useCallback } from 'react'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

let externalAddToast: ((toast: Omit<ToastItem, 'id'>) => void) | null = null

export function toast(options: Omit<ToastItem, 'id'>) {
  if (externalAddToast) externalAddToast(options)
}

export function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((options: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...options, id }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  externalAddToast = addToast

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, dismiss }
}
