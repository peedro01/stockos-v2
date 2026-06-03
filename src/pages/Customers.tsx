import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CustomerModal } from '@/components/shared/CustomerModal'
import { DeleteConfirmModal } from '@/components/products/DeleteConfirmModal'
import { useCustomers } from '@/hooks/use-customers'
import { toast } from '@/hooks/use-toast'
import { getInitials, cn } from '@/lib/utils'
import type { Customer, CustomerFormData } from '@/types'

export default function Customers() {
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [toDelete, setToDelete] = useState<Customer | null>(null)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.document ?? '').includes(search) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function handleSave(data: CustomerFormData) {
    try {
      if (selected) { await updateCustomer(selected.id, data); toast({ title: '✓ Cliente atualizado', variant: 'success' }) }
      else { await createCustomer(data); toast({ title: '✓ Cliente criado', variant: 'success' }) }
    } catch (e: any) { toast({ title: 'Erro', description: e.message, variant: 'error' }) }
  }

  async function handleDelete() {
    if (!toDelete) return
    try { await deleteCustomer(toDelete.id); toast({ title: '✓ Cliente removido', variant: 'success' }) }
    catch (e: any) { toast({ title: 'Erro', description: e.message, variant: 'error' }) }
  }

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 max-w-xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
        </div>
        <Button size="sm" className="text-xs" onClick={() => { setSelected(null); setModalOpen(true) }}>
          <Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Novo</span> cliente
        </Button>
      </div>

      <Card>
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Base de clientes</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} registros</span>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border">
                  {['Cliente', 'Tipo', 'Documento', 'Email', 'Telefone', 'Status', 'Ações'].map(h => (
                    <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-[9px] font-bold text-white">{getInitials(c.name)}</div>
                        <span className="text-xs font-semibold truncate max-w-[100px]">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold', c.type === 'pj' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400')}>
                        {c.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5"><span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{c.document ?? '—'}</span></td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-primary truncate max-w-[140px]">{c.email ?? '—'}</td>
                    <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">{c.phone ?? '—'}</td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold', c.is_active ? 'bg-green-500/15 text-green-400' : 'bg-secondary text-muted-foreground')}>
                        {c.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => { setSelected(c); setModalOpen(true) }} className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => { setToDelete(c); setDeleteOpen(true) }} className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">Nenhum cliente encontrado</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CustomerModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} customer={selected} />
      <DeleteConfirmModal open={deleteOpen} product={toDelete as any} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
    </div>
  )
}
