import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  mockDashboardStats, mockChartData, mockCategoryDistribution,
  mockMovements, mockStockEvolution,
} from '@/lib/mock-data'
import type { DashboardStats, ChartDataPoint, CategoryDistribution, StockMovement } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const PALETTE = ['#6366f1', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#a855f7', '#5a5a72']
const WINDOW_MONTHS = 6

export interface DashboardData {
  stats: DashboardStats
  chartData: ChartDataPoint[]
  categoryDistribution: CategoryDistribution[]
  stockEvolution: { month: string; value: number }[]
  recentMovements: StockMovement[]
  currentMonthLabel: string
  previousMonthLabel: string
}

const monthKey = (d: Date) => d.getFullYear() * 12 + d.getMonth()

function demoData(): DashboardData {
  return {
    stats: mockDashboardStats,
    chartData: mockChartData,
    categoryDistribution: mockCategoryDistribution,
    stockEvolution: mockStockEvolution,
    recentMovements: mockMovements.slice(0, 6),
    currentMonthLabel: 'mai.',
    previousMonthLabel: 'abr.',
  }
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return Math.round(((current - previous) / previous) * 100)
}

async function loadReal(): Promise<DashboardData> {
  const now = new Date()
  const nowKey = monthKey(now)
  const windowStart = new Date(now.getFullYear(), now.getMonth() - (WINDOW_MONTHS - 1), 1)

  const [productsRes, movementsRes] = await Promise.all([
    supabase
      .from('products')
      .select('id, current_stock, min_stock, cost_price, category:categories(name, color)'),
    supabase
      .from('stock_movements')
      .select('id, product_id, type, quantity, balance_after, user_id, created_at, product:products(id, name, sku, unit), user:user_profiles(full_name)')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000),
  ])
  if (productsRes.error) throw productsRes.error
  if (movementsRes.error) throw movementsRes.error

  const products = (productsRes.data ?? []) as any[]
  const movements = (movementsRes.data ?? []) as any[]

  // ── KPIs de estoque ──
  const totalStock = products.reduce((s, p) => s + (p.current_stock ?? 0), 0)
  const outOfStockCount = products.filter(p => (p.current_stock ?? 0) === 0).length
  const lowStockCount = products.filter(p => p.current_stock > 0 && p.current_stock <= (p.min_stock ?? 0)).length
  const totalStockValue = products.reduce((s, p) => s + (p.current_stock ?? 0) * Number(p.cost_price ?? 0), 0)

  // ── Entradas × Saídas por mês ──
  const buckets: ChartDataPoint[] = []
  const indexByKey = new Map<number, number>()
  for (let i = WINDOW_MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    indexByKey.set(monthKey(d), buckets.length)
    buckets.push({ month: MONTHS[d.getMonth()], entradas: 0, saidas: 0 })
  }
  for (const m of movements) {
    const idx = indexByKey.get(monthKey(new Date(m.created_at)))
    if (idx === undefined) continue
    if (m.type === 'entrada') buckets[idx].entradas += m.quantity
    else if (m.type === 'saida' || m.type === 'perda') buckets[idx].saidas += m.quantity
  }
  const cur = buckets[buckets.length - 1]
  const prev = buckets[buckets.length - 2]

  // ── Evolução do estoque (itens), reconstruída de trás pra frente ──
  // delta de cada movimentação = balance_after - saldo anterior do mesmo produto
  const byProduct = new Map<string, any[]>()
  for (const m of [...movements].reverse()) {
    const list = byProduct.get(m.product_id) ?? []
    list.push(m)
    byProduct.set(m.product_id, list)
  }
  const deltaByMonth = new Map<number, number>()
  for (const list of byProduct.values()) {
    let prevBalance: number | null = null
    for (const m of list) {
      let delta = 0
      if (prevBalance !== null) delta = m.balance_after - prevBalance
      else if (m.type === 'entrada') delta = m.quantity
      else if (m.type === 'saida' || m.type === 'perda') delta = -m.quantity
      prevBalance = m.balance_after
      const k = monthKey(new Date(m.created_at))
      deltaByMonth.set(k, (deltaByMonth.get(k) ?? 0) + delta)
    }
  }
  const stockEvolution: { month: string; value: number }[] = []
  let running = totalStock
  for (let i = 0; i < WINDOW_MONTHS; i++) {
    const idx = WINDOW_MONTHS - 1 - i // do mês atual para trás
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    stockEvolution[idx] = { month: MONTHS[d.getMonth()], value: running }
    running -= deltaByMonth.get(monthKey(d)) ?? 0
  }

  // ── Distribuição por categoria (% das unidades em estoque) ──
  const perCategory = new Map<string, { value: number; color?: string }>()
  for (const p of products) {
    const name = p.category?.name ?? 'Sem categoria'
    const entry = perCategory.get(name) ?? { value: 0, color: p.category?.color }
    entry.value += p.current_stock ?? 0
    perCategory.set(name, entry)
  }
  const totalForPct = [...perCategory.values()].reduce((s, c) => s + c.value, 0)
  const categoryDistribution: CategoryDistribution[] = [...perCategory.entries()]
    .sort((a, b) => b[1].value - a[1].value)
    .map(([name, c], i) => ({
      name,
      value: totalForPct ? Math.round((c.value / totalForPct) * 100) : 0,
      color: c.color || PALETTE[i % PALETTE.length],
    }))

  const curDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  return {
    stats: {
      totalProducts: products.length,
      totalStock,
      lowStockCount,
      outOfStockCount,
      monthlyInbound: cur.entradas,
      monthlyOutbound: cur.saidas,
      totalStockValue,
      monthlyInboundChange: pctChange(cur.entradas, prev.entradas),
      monthlyOutboundChange: pctChange(cur.saidas, prev.saidas),
    },
    chartData: buckets,
    categoryDistribution,
    stockEvolution,
    recentMovements: movements.slice(0, 6) as StockMovement[],
    currentMonthLabel: MONTHS[curDate.getMonth()].toLowerCase() + '.',
    previousMonthLabel: MONTHS[prevDate.getMonth()].toLowerCase() + '.',
  }
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(IS_DEMO ? demoData() : null)
  const [isLoading, setIsLoading] = useState(!IS_DEMO)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (IS_DEMO) { setData(demoData()); setIsLoading(false); return }
    setIsLoading(true)
    setError(null)
    try {
      setData(await loadReal())
    } catch (e: any) {
      console.error('Erro ao carregar dashboard', e)
      setError(e?.message ?? 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}
