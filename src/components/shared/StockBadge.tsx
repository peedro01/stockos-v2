import { cn } from '@/lib/utils'
import type { ProductStatus } from '@/types'

type StockStatus = 'ok' | 'low' | 'out'

const stockLabels: Record<StockStatus, string> = {
  ok: 'OK',
  low: 'Baixo',
  out: 'Zerado',
}

const stockClasses: Record<StockStatus, string> = {
  ok: 'bg-green-500/15 text-green-400',
  low: 'bg-amber-500/15 text-amber-400',
  out: 'bg-red-500/15 text-red-400',
}

const statusClasses: Record<ProductStatus, string> = {
  ativo: 'bg-green-500/15 text-green-400',
  inativo: 'bg-secondary text-muted-foreground',
  descontinuado: 'bg-red-500/15 text-red-400',
}

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', stockClasses[status])}>
      {stockLabels[status]}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold capitalize', statusClasses[status])}>
      {status}
    </span>
  )
}

type MovType = 'entrada' | 'saida' | 'ajuste' | 'transferencia' | 'perda' | 'inventario'
const movLabels: Record<MovType, string> = {
  entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste',
  transferencia: 'Transferência', perda: 'Perda', inventario: 'Inventário',
}
const movClasses: Record<MovType, string> = {
  entrada: 'bg-green-500/15 text-green-400',
  saida: 'bg-red-500/15 text-red-400',
  ajuste: 'bg-amber-500/15 text-amber-400',
  transferencia: 'bg-blue-500/15 text-blue-400',
  perda: 'bg-red-500/15 text-red-400',
  inventario: 'bg-purple-500/15 text-purple-400',
}
export function MovementBadge({ type }: { type: MovType }) {
  return (
    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', movClasses[type])}>
      {movLabels[type]}
    </span>
  )
}

export function StockBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min(Math.round((current / max) * 100), 100) : 0
  const color = pct === 0 ? 'bg-red-500' : pct <= 20 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className="h-1 w-16 rounded-full bg-secondary">
      <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}
