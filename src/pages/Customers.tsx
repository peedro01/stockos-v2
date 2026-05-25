import { Plus, Pencil, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockCustomers } from '@/lib/mock-data'
import { getInitials, cn } from '@/lib/utils'

export default function Customers() {
  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Novo</span> cliente</Button>
      </div>
      <Card>
        <div className="border-b border-border px-4 py-3"><h2 className="text-sm font-semibold">Base de clientes</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-border">
                {['Cliente', 'Tipo', 'Documento', 'Email', 'Cidade', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map(c => (
                <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 sm:px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-[9px] font-bold text-white">
                        {getInitials(c.name)}
                      </div>
                      <span className="text-xs font-semibold truncate max-w-[100px]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold',
                      c.type === 'pj' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400')}>
                      {c.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5"><span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{c.document ?? '—'}</span></td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-primary truncate max-w-[140px]">{c.email ?? '—'}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">{c.city}/{c.state}</td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
                      c.is_active ? 'bg-green-500/15 text-green-400' : 'bg-secondary text-muted-foreground')}>
                      {c.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <div className="flex gap-1">
                      <button className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                      <button className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground"><Eye className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
