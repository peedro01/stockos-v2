import { useState } from 'react'
import { Plus, Download, Pencil, Trash2, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SupplierModal } from '@/components/shared/SupplierModal'
import { DeleteConfirmModal } from '@/components/products/DeleteConfirmModal'
import { mockSuppliers } from '@/lib/mock-data'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import type { Supplier, SupplierFormData } from '@/types'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [toDelete, setToDelete] = useState<Supplier | null>(null)

  const filtered = suppliers.filter(s =>
    s.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  function handleNew() { setSelected(null); setModalOpen(true) }
  function handleEdit(s: Supplier) { setSelected(s); setModalOpen(true) }
  function handleDeleteClick(s: Supplier) { setToDelete(s); setDeleteOpen(true) }

  function handleSave(data: SupplierFormData) {
    if (selected) {
      setSuppliers(prev => prev.map(s => s.id === selected.id ? { ...s, ...data, updated_at: new Date().toISOString() } : s))
      toast({ title: '✓ Fornecedor atualizado', description: data.company_name, variant: 'success' })
    } else {
      const novo: Supplier = { ...data, id: Math.random().toString(36).slice(2), company_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      setSuppliers(prev => [novo, ...prev])
      toast({ title: '✓ Fornecedor criado', description: data.company_name, variant: 'success' })
    }
  }

  function handleConfirmDelete() {
    if (toDelete) {
      setSuppliers(prev => prev.filter(s => s.id !== toDelete.id))
      toast({ title: '✓ Fornecedor removido', description: toDelete.company_name, variant: 'success' })
    }
  }

  return (
    <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 max-w-xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar fornecedor..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Exportar</span></Button>
          <Button size="sm" className="text-xs" onClick={handleNew}><Plus className="h-3.5 w-3.5" /><span className="hidden sm:inline">Novo</span> fornecedor</Button>
        </div>
      </div>

      <Card>
        <div className="border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Fornecedores cadastrados</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                {['Empresa', 'CNPJ', 'Responsável', 'Email', 'Cidade/UF', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 sm:px-4 py-2.5 text-xs font-semibold">{s.company_name}</td>
                  <td className="px-3 sm:px-4 py-2.5"><span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{s.cnpj ?? '—'}</span></td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">{s.contact_name ?? '—'}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-primary truncate max-w-[140px]">{s.email ?? '—'}</td>
                  <td className="px-3 sm:px-4 py-2.5 text-xs text-muted-foreground">{s.city && s.state ? `${s.city}/${s.state}` : '—'}</td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
                      s.is_active ? 'bg-green-500/15 text-green-400' : 'bg-secondary text-muted-foreground')}>
                      {s.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(s)} className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                      <button onClick={() => handleDeleteClick(s)} className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">Nenhum fornecedor encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <SupplierModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} supplier={selected} />
      <DeleteConfirmModal
        open={deleteOpen}
        product={toDelete ? { ...toDelete, name: toDelete.company_name } as any : null}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
