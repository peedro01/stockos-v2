import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, ArrowDown, ArrowUp, SlidersHorizontal, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { mockProducts } from '@/lib/mock-data'
import type { MovementFormData, MovementType } from '@/types'

const schema = z.object({
  product_id: z.string().min(1, 'Selecione um produto'),
  type: z.enum(['entrada','saida','ajuste','transferencia','perda','inventario']),
  quantity: z.coerce.number().min(1, 'Quantidade mínima: 1'),
  unit_cost: z.coerce.number().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

interface MovementModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: MovementFormData) => void
  defaultType?: MovementType
}

const typeConfig = {
  entrada: { label: 'Entrada de estoque', icon: ArrowDown, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
  saida: { label: 'Saída de estoque', icon: ArrowUp, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  ajuste: { label: 'Ajuste manual', icon: SlidersHorizontal, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  transferencia: { label: 'Transferência', icon: ArrowLeftRight, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  perda: { label: 'Perda / Avaria', icon: ArrowUp, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  inventario: { label: 'Inventário', icon: SlidersHorizontal, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
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

export function MovementModal({ open, onClose, onSave, defaultType = 'entrada' }: MovementModalProps) {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<MovementFormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType, quantity: 1 },
  })

  const currentType = watch('type') as MovementType
  const cfg = typeConfig[currentType] ?? typeConfig.entrada
  const Icon = cfg.icon

  useEffect(() => {
    if (open) reset({ type: defaultType, quantity: 1 })
  }, [open, defaultType, reset])

  async function onSubmit(data: MovementFormData) {
    await new Promise(r => setTimeout(r, 400))
    onSave(data)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg flex flex-col rounded-t-2xl sm:rounded-xl border border-border bg-card shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={cn('flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0', cfg.bg)}>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border', cfg.bg)}>
              <Icon className={cn('h-4 w-4', cfg.color)} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{cfg.label}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Registrar movimentação de estoque</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="px-5 py-4 space-y-4">

            {/* Tipo */}
            <Field label="Tipo de movimentação *">
              <Select {...register('type')}>
                <option value="entrada">📥 Entrada</option>
                <option value="saida">📤 Saída</option>
                <option value="ajuste">🔧 Ajuste manual</option>
                <option value="transferencia">🔄 Transferência</option>
                <option value="perda">⚠️ Perda / Avaria</option>
                <option value="inventario">📋 Inventário</option>
              </Select>
            </Field>

            {/* Produto */}
            <Field label="Produto *" error={errors.product_id?.message}>
              <Select {...register('product_id')}>
                <option value="">Selecione o produto...</option>
                {mockProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Estoque: {p.current_stock} {p.unit}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              {/* Quantidade */}
              <Field label="Quantidade *" error={errors.quantity?.message}>
                <Input type="number" min="1" placeholder="0" {...register('quantity')} />
              </Field>

              {/* Custo unitário */}
              {(currentType === 'entrada') && (
                <Field label="Custo unitário (R$)">
                  <Input type="number" step="0.01" placeholder="0,00" {...register('unit_cost')} />
                </Field>
              )}
            </div>

            {/* Referência */}
            <Field label="Referência (NF, pedido...)">
              <Input placeholder="Ex: NF 44821 / Pedido #3821" {...register('reference')} />
            </Field>

            {/* Observações */}
            <Field label="Observações">
              <Input placeholder="Observações adicionais..." {...register('notes')} />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}
              className={cn(currentType === 'saida' || currentType === 'perda' ? 'bg-red-500 hover:bg-red-600' :
                currentType === 'ajuste' || currentType === 'inventario' ? 'bg-amber-500 hover:bg-amber-600' :
                currentType === 'transferencia' ? 'bg-blue-500 hover:bg-blue-600' : '')}>
              {isSubmitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Salvando...</> : 'Registrar movimentação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
