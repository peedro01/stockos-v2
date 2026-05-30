import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Supplier, SupplierFormData } from '@/types'

const schema = z.object({
  company_name: z.string().min(2, 'Nome obrigatório'),
  cnpj: z.string().optional(),
  contact_name: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

interface SupplierModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: SupplierFormData) => void
  supplier?: Supplier | null
}

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
    {children}
    {error && <p className="text-[11px] text-red-400">{error}</p>}
  </div>
)

export function SupplierModal({ open, onClose, onSave, supplier }: SupplierModalProps) {
  const isEdit = !!supplier
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SupplierFormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  })

  useEffect(() => {
    if (supplier) {
      reset({
        company_name: supplier.company_name,
        cnpj: supplier.cnpj ?? '',
        contact_name: supplier.contact_name ?? '',
        email: supplier.email ?? '',
        phone: supplier.phone ?? '',
        address: supplier.address ?? '',
        city: supplier.city ?? '',
        state: supplier.state ?? '',
        notes: supplier.notes ?? '',
        is_active: supplier.is_active,
      })
    } else {
      reset({ is_active: true })
    }
  }, [supplier, reset])

  async function onSubmit(data: SupplierFormData) {
    await new Promise(r => setTimeout(r, 400))
    onSave(data)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl flex flex-col rounded-t-2xl sm:rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold">{isEdit ? 'Editar fornecedor' : 'Novo fornecedor'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Dados do fornecedor</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Dados da empresa</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nome da empresa *" error={errors.company_name?.message}>
                  <Input placeholder="Ex: TechCabo Ltda." {...register('company_name')} />
                </Field>
                <Field label="CNPJ">
                  <Input placeholder="00.000.000/0001-00" {...register('cnpj')} />
                </Field>
                <Field label="Responsável">
                  <Input placeholder="Nome do contato" {...register('contact_name')} />
                </Field>
                <Field label="Telefone">
                  <Input placeholder="(11) 99999-0000" {...register('phone')} />
                </Field>
                <Field label="E-mail" error={errors.email?.message}>
                  <Input type="email" placeholder="contato@empresa.com" {...register('email')} />
                </Field>
                <Field label="Cidade">
                  <Input placeholder="São Paulo" {...register('city')} />
                </Field>
                <Field label="Estado (UF)">
                  <Input placeholder="SP" maxLength={2} className="uppercase" {...register('state')} />
                </Field>
                <Field label="Endereço">
                  <Input placeholder="Rua, número, bairro" {...register('address')} />
                </Field>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Observações</p>
              <Field label="Notas internas">
                <Input placeholder="Informações adicionais..." {...register('notes')} />
              </Field>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
              <input type="checkbox" id="is_active" className="accent-primary h-4 w-4" {...register('is_active')} />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Fornecedor ativo</label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 flex-shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Salvando...</> : isEdit ? 'Salvar alterações' : 'Criar fornecedor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
