import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

interface DeleteConfirmModalProps {
  open: boolean
  product: Product | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmModal({ open, product, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    onConfirm()
    setLoading(false)
    onClose()
  }

  if (!open || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-xl border border-border bg-card shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Excluir produto</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tem certeza que deseja excluir <span className="font-semibold text-foreground">"{product.name}"</span>? Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-2 w-full mt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button size="sm" className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleConfirm} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Excluir'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
