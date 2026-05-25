import { useState } from 'react'
import { ArrowDown, ArrowUp, SlidersHorizontal, Download, ArrowLeftRight, Wrench } from 'lucide-react'
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
  { key: 'transferencia', label: 'Transf.' },
]

export default function Movements() {
  const [activeType, setActiveType] = useState<MovementType | 'all'>('all')
  const filtered = mockMovements.filter(m => activeType === 'all' || m.type === activeType)

  const stats = {
    entradas: mockMovements.filter(m => m.type === 'entrada').reduce((s, m) => s + m.quantity, 0),
    saidas: mockMovements.filter(m => m.type === 'saida').reduce((s, m) => s + m.quantity, 0),
    ajustes: mockMovements.filter(m => m.type === 'ajuste').length,
    transferencias: mockMovements.filter(m => m.type === 'transferencia').length,
  }

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[
          { icon: ArrowDown, label: 'Entradas hoje', value: `+${formatNumber(stats.entradas)}`, color: 'text-green-400' },
          { icon: ArrowUp, label: 'Saídas hoje', value: `-${formatNumber(stats.saidas)}`, color: 'text-red-400' },
          { icon: Wrench, label: 'Ajustes hoje', value: String(stats.ajustes), color: 'text-amber-400' },
          { icon: ArrowLeftRight, label: 'Transferências', value: String(stats.transferencias), color: 'text-blue-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className={cn('h-3.5 w-3.5', color)} />
              <span className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight">{label}</span>
            </div>
            <p className={cn('text-xl sm:text-2xl font-bold', color)}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" className="text-xs"><ArrowDown className="h-3.5 w-3.5" />Entrada</Button>
        <Button variant="outline" size="sm" className="text-xs text-red-400 border-red-500/30"><ArrowUp className="h-3.5 w-3.5" />Saída</Button>
        <Button variant="outline" size="sm" className="text-xs text-amber-400 border-amber-500/30"><SlidersHorizontal className="h-3.5 w-3.5" />Ajuste</Button>
        <Button variant="outline" size="sm" className="text-xs text-blue-400 border-blue-500/30 hidden sm:flex"><ArrowLeftRight className="h-3.5 w-3.5" />Transferência</Button>
        <Button variant="outline" size="sm" className="text-xs ml-auto"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Exportar</span></Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border px-3 sm:px-4 py-3">
          <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1 overflow-x-auto w-full sm:w-auto">
            {typeFilters.map(t => (
              <button key={t.key} onClick={() => setActiveType(t.key)}
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                  activeType === t.key ? 'bg-card text-foreground border border-border' : 'text-muted-foreground hover:text-foreground')}>
                {t.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="text-xs flex-shrink-0"><SlidersHorizontal className="h-3.5 w-3.5" />Filtros</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-border">
                {['#', 'Produto', 'Tipo', 'Qtd', 'Saldo', 'Data'].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 sm:px-4 py-2.5 font-mono text-[10px] text-muted-foreground">#{String(m.id).padStart(4,'0')}</td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <div className="text-xs font-semibold truncate max-w-[120px]">{m.product?.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{m.product?.sku}</div>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5"><MovementBadge type={m.type} /></td>
                  <td className={cn('px-3 sm:px-4 py-2.5 text-xs font-bold',
                    m.type === 'entrada' ? 'text-green-400' : m.type === 'saida' ? 'text-red-400' : 'text-amber-400')}>
                    {m.type === 'entrada' ? '+' : m.type === 'saida' ? '-' : '±'}{formatNumber(m.quantity)}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs font-semibold">{formatNumber(m.balance_after)}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
