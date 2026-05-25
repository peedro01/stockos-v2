import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { mockCategories, mockSuppliers } from '@/lib/mock-data'
import type { Product, ProductFormData } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  sku: z.string().min(2, 'SKU obrigatório'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  brand: z.string().optional(),
  supplier_id: z.string().optional(),
  unit: z.enum(['un','kg','g','l','ml','cx','pc','par','rolo','m']),
  cost_price: z.coerce.number().min(0, 'Preço inválido'),
  sale_price: z.coerce.number().min(0, 'Preço inválido'),
  current_stock: z.coerce.number().min(0, 'Estoque inválido'),
  min_stock: z.coerce.number().min(0, 'Mínimo inválido'),
  max_stock: z.coerce.number().optional(),
  location: z.string().optional(),
  status: z.enum(['ativo','inativo','descontinuado']),
})

interface ProductModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: ProductFormData) => void
  product?: Product | null
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

export function ProductModal({ open, onClose, onSave, product }: ProductModalProps) {
  const isEdit = !!product

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: 'un',
      status: 'ativo',
      cost_price: 0,
      sale_price: 0,
      current_stock: 0,
      min_stock: 0,
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? '',
        description: product.description ?? '',
        category_id: product.category_id ?? '',
        brand: product.brand ?? '',
        supplier_id: product.supplier_id ?? '',
        unit: product.unit,
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        current_stock: product.current_stock,
        min_stock: product.min_stock,
        max_stock: product.max_stock,
        location: product.location ?? '',
        status: product.status,
      })
    } else {
      reset({ unit: 'un', status: 'ativo', cost_price: 0, sale_price: 0, current_stock: 0, min_stock: 0 })
    }
  }, [product, reset])

  async function onSubmit(data: ProductFormData) {
    await new Promise(r => setTimeout(r, 400))
    onSave(data)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0">
          <div>
            <h2 className="text-sm font-semibold">{isEdit ? 'Editar produto' : 'Novo produto'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Editando: ${product?.name}` : 'Preencha os dados do produto'}</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {/* Informações básicas */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Informações básicas</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Nome do produto *" error={errors.name?.message}>
                  <Input placeholder="Ex: Cabo HDMI 2.0" {...register('name')} />
                </Field>
                <Field label="SKU *" error={errors.sku?.message}>
                  <Input placeholder="Ex: CAB-00412" {...register('sku')} />
                </Field>
                <Field label="Código de barras" error={errors.barcode?.message}>
                  <Input placeholder="Ex: 7891234560412" {...register('barcode')} />
                </Field>
                <Field label="Marca" error={errors.brand?.message}>
                  <Input placeholder="Ex: TechCabo" {...register('brand')} />
                </Field>
                <Field label="Categoria">
                  <Select {...register('category_id')}>
                    <option value="">Selecione...</option>
                    {mockCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </Select>
                </Field>
                <Field label="Fornecedor">
                  <Select {...register('supplier_id')}>
                    <option value="">Selecione...</option>
                    {mockSuppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
                  </Select>
                </Field>
                <Field label="Descrição" error={errors.description?.message}>
                  <Input placeholder="Descrição do produto" {...register('description')} />
                </Field>
                <Field label="Localização física">
                  <Input placeholder="Ex: A-02-03" {...register('location')} />
                </Field>
              </div>
            </div>

            {/* Preços */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Preços e unidade</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Preço de custo *" error={errors.cost_price?.message}>
                  <Input type="number" step="0.01" placeholder="0,00" {...register('cost_price')} />
                </Field>
                <Field label="Preço de venda *" error={errors.sale_price?.message}>
                  <Input type="number" step="0.01" placeholder="0,00" {...register('sale_price')} />
                </Field>
                <Field label="Unidade *">
                  <Select {...register('unit')}>
                    {['un','kg','g','l','ml','cx','pc','par','rolo','m'].map(u => <option key={u} value={u}>{u}</option>)}
                  </Select>
                </Field>
              </div>
            </div>

            {/* Estoque */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Estoque</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label="Estoque atual *" error={errors.current_stock?.message}>
                  <Input type="number" placeholder="0" {...register('current_stock')} />
                </Field>
                <Field label="Estoque mínimo *" error={errors.min_stock?.message}>
                  <Input type="number" placeholder="0" {...register('min_stock')} />
                </Field>
                <Field label="Estoque máximo">
                  <Input type="number" placeholder="0" {...register('max_stock')} />
                </Field>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">Status</p>
              <Field label="Status do produto *">
                <Select {...register('status')} className="max-w-[200px]">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="descontinuado">Descontinuado</option>
                </Select>
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 flex-shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Salvando...</> : isEdit ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
