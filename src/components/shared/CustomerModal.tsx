import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Customer, CustomerFormData } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['pf', 'pj']),
  document: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  notes: z.string().optional(),
  is_active: z.boolean(),
})

interface CustomerModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: CustomerFormData) => void
  customer?: Customer | null
}

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
    {children}
    {error && <p className="text-[11px] text-red-400">{error}</p>}
  </div>
)

const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn('flex h-9 w-full rounded-md border border-border bg-secondary px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-ring text-foreground', className)} {...props} />
)

export function CustomerModal({ open, onClose, onSave, customer }: CustomerModalProps) {
  const isEdit = !!customer
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'pj', is_active: true },
  })

  const type = watch('type')

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        type: customer.type,
        document: customer.document ?? '',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        address: customer.address ?? '',
        city: customer.city ?? '',
        state: customer.state ?? '',
        notes: customer.notes ?? '',
        is_active: customer.is_active,
      })
    } else {
      reset({ type: 'pj', is_active: true })
    }
  }, [customer, reset])

  async function onSubmit(data: CustomerFormData) {
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
            <h2 className="text-sm font-semibold">{isEdit ? 'Editar cliente' : 'Novo cliente'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Dados do cliente</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Dados do cliente</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Tipo">
                  <Select {...register('type')}>
                    <option value="pj">Pessoa Jurídica (PJ)</option>
                    <option value="pf">Pessoa Física (PF)</option>
                  </Select>
                </Field>
                <Field label={type === 'pj' ? 'Razão social *' : 'Nome completo *'} error={errors.name?.message}>
                  <Input placeholder={type === 'pj' ? 'Empresa XYZ Ltda.' : 'João da Silva'} {...register('name')} />
                </Field>
                <Field label={type === 'pj' ? 'CNPJ' : 'CPF'}>
                  <Input placeholder={type === 'pj' ? '00.000.000/0001-00' : '000.000.000-00'} {...register('document')} />
                </Field>
                <Field label="Telefone">
                  <Input placeholder="(11) 99999-0000" {...register('phone')} />
                </Field>
                <Field label="E-mail" error={errors.email?.message}>
                  <Input type="email" placeholder="contato@email.com" {...register('email')} />
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
              <input type="checkbox" id="is_active_c" className="accent-primary h-4 w-4" {...register('is_active')} />
              <label htmlFor="is_active_c" className="text-sm font-medium cursor-pointer">Cliente ativo</label>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 flex-shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Salvando...</> : isEdit ? 'Salvar alterações' : 'Criar cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
