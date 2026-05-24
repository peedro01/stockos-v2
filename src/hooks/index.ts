import { useState, useEffect, useCallback } from 'react'
import { productService, movementService } from '@/services/productService'
import { supplierService, clientService, categoryService, dashboardService } from '@/services/dataService'
import { useAppStore } from '@/store/useAppStore'
import type { ProductFilters, MovementFilters, PaginationParams } from '@/types'

export function useProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await productService.getAll(filters, pagination)
      setData(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters), pagination.page, pagination.pageSize])

  useEffect(() => { fetch() }, [fetch])

  return { data, total, totalPages, loading, error, refetch: fetch }
}

export function useMovements(
  filters: MovementFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: 30 }
) {
  const [data, setData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const result = await movementService.getHistory(filters, pagination)
      setData(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters), pagination.page])

  useEffect(() => { fetch() }, [fetch])

  return { data, total, totalPages, loading, refetch: fetch }
}

export function useSuppliers() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supplierService.getAll()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, refetch: () => supplierService.getAll().then(setData) }
}

export function useClients() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clientService.getAll()
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, refetch: () => clientService.getAll().then(setData) }
}

export function useCategories() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    categoryService.getAll().then(setData)
  }, [])

  return { data }
}

export function useDashboardStats() {
  const { dashboardStats, setDashboardStats, statsLoading, setStatsLoading } = useAppStore()
  const [monthlyData, setMonthlyData] = useState<any[]>([])

  const fetch = useCallback(async () => {
    setStatsLoading(true)
    try {
      const [stats, monthly] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getMonthlyMovements(),
      ])
      setDashboardStats(stats)
      setMonthlyData(monthly)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { stats: dashboardStats, monthlyData, loading: statsLoading, refetch: fetch }
}

export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function useToast() {
  const { addToast } = useAppStore()

  return {
    toast: (msg: { title: string; description?: string; variant?: 'default' | 'success' | 'warning' | 'destructive' }) =>
      addToast(msg),
    success: (title: string, description?: string) => addToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) => addToast({ title, description, variant: 'destructive' }),
    warning: (title: string, description?: string) => addToast({ title, description, variant: 'warning' }),
  }
}
