import { useState } from 'react'
import { ArrowDown, ArrowUp, SlidersHorizontal, RefreshCw, Download, ArrowLeftRight, Wrench } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MovementBadge } from '@/components/shared/StockBadge'
import { mockMovements } from '@/lib/mock-data'
import { formatDateTime, formatNumber, cn } from '@/lib/utils'
import type { MovementType } from '@/types'

const typeFilters: { key: MovementType | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'entrada', label: 'Entradas' },
  { key: 'saida', label: 'Saídas' },
  { key: 'ajuste', label: 'Ajustes' },
  { key: 'transferencia', label: 'Transferências' },
]

export default function Movements() {
  const [activeType, setActiveType] = useState<MovementType | 'all'>('all')

  const filtered = mockMovements.filter(m => activeType === 'all' || m.type === activeType)

  const todayStats = {
    entradas: mockMovements.filter(m => m.type === 'entrada').reduce((s, m) => s + m.quantity, 0),
    saidas: mockMovements.filter(m => m.type === 'saida').reduce((s, m) => s + m.quantity, 0),
    ajustes: mockMovements.filter(m => m.type === 'ajuste').length,
    transferencias: mockMovements.filter(m => m.type === 'transferencia').length,
  }

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: ArrowDown, label: 'Entradas hoje', value: `+${formatNumber(todayStats.entradas)}`, color: 'text-green-400' },
          { icon: ArrowUp, label: 'Saídas hoje', value: `-${formatNumber(todayStats.saidas)}`, color: 'text-red-400' },
          { icon: Wrench, label: 'Ajustes hoje', value: String(todayStats.ajustes), color: 'text-amber-400' },
          { icon: ArrowLeftRight, label: 'Transferências', value: String(todayStats.transferencias), color: 'text-blue-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn('h-4 w-4', color)} />
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm"><ArrowDown className="h-3.5 w-3.5" />Entrada</Button>
        <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:border-red-500/50"><ArrowUp className="h-3.5 w-3.5" />Saída</Button>
        <Button variant="outline" size="sm" className="text-amber-400 border-amber-500/30"><SlidersHorizontal className="h-3.5 w-3.5" />Ajuste</Button>
        <Button variant="outline" size="sm" className="text-blue-400 border-blue-500/30"><ArrowLeftRight className="h-3.5 w-3.5" />Transferência</Button>
        <Button variant="outline" size="sm" className="ml-auto"><Download className="h-3.5 w-3.5" />Exportar</Button>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1">
            {typeFilters.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveType(t.key)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  activeType === t.key ? 'bg-card text-foreground border border-border' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5" />Hoje</Button>
            <Button variant="outline" size="sm"><SlidersHorizontal className="h-3.5 w-3.5" />Filtros</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['#', 'Produto', 'Tipo', 'Qtd', 'Saldo após', 'Usuário', 'Data/Hora', 'Ref./Obs.'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-[10px] text-muted-foreground">#{String(m.id).padStart(4,'0')}</td>
                  <td className="px-4 py-2.5">
                    <div className="text-xs font-semibold">{m.product?.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{m.product?.sku}</div>
                  </td>
                  <td className="px-4 py-2.5"><MovementBadge type={m.type} /></td>
                  <td className={cn('px-4 py-2.5 text-xs font-bold',
                    m.type === 'entrada' ? 'text-green-400' : m.type === 'saida' ? 'text-red-400' : 'text-amber-400')}>
                    {m.type === 'entrada' ? '+' : m.type === 'saida' ? '-' : '±'}{formatNumber(m.quantity)}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-semibold">{formatNumber(m.balance_after)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {m.user_id === 'u1' ? 'João Silva' : m.user_id === 'u2' ? 'Maria Lima' : 'Pedro Melo'}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{m.reference ?? m.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
