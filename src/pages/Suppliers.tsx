import { Plus, Download, Pencil, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { mockSuppliers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function Suppliers() {
  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Exportar</span></Button>
        <Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Novo</span> fornecedor</Button>
      </div>
      <Card>
        <div className="border-b border-border px-4 py-3"><h2 className="text-sm font-semibold">Fornecedores cadastrados</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                {['Empresa', 'CNPJ', 'Responsável', 'Email', 'Cidade', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockSuppliers.map(s => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 sm:px-4 py-2.5 text-xs font-semibold">{s.company_name}</td>
                  <td className="px-3 sm:px-4 py-2.5"><span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{s.cnpj ?? '—'}</span></td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">{s.contact_name ?? '—'}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-primary truncate max-w-[140px]">{s.email ?? '—'}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">{s.city}/{s.state}</td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
                      s.is_active ? 'bg-green-500/15 text-green-400' : 'bg-secondary text-muted-foreground')}>
                      {s.is_active ? 'Ativo' : 'Inativo'}
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
