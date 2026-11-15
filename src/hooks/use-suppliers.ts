import { useState, useEffect } from 'react'
import { suppliersService } from '@/services/suppliers.service'
import { mockSuppliers } from '@/lib/mock-data'
import { useAuthStore } from '@/store/auth.store'
import type { Supplier, SupplierFormData } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        if (IS_DEMO) {
          await new Promise(r => setTimeout(r, 200))
          setSuppliers(mockSuppliers)
        } else {
          setSuppliers(await suppliersService.getAll())
        }
      } catch { setSuppliers(mockSuppliers) }
      finally { setIsLoading(false) }
    }
    fetch()
  }, [])

  async function createSupplier(data: SupplierFormData) {
    if (IS_DEMO) {
      const novo: Supplier = { ...data, id: Math.random().toString(36).slice(2), company_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      setSuppliers(prev => [novo, ...prev]); return novo
    }
    const s = await suppliersService.create({ ...data, company_id: useAuthStore.getState().user?.company_id ?? '00000000-0000-0000-0000-000000000001' })
    setSuppliers(prev => [s, ...prev]); return s
  }

  async function updateSupplier(id: string, data: SupplierFormData) {
    if (IS_DEMO) { setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s)); return }
    const s = await suppliersService.update(id, data)
    setSuppliers(prev => prev.map(x => x.id === id ? s : x))
  }

  async function deleteSupplier(id: string) {
    if (IS_DEMO) { setSuppliers(prev => prev.filter(s => s.id !== id)); return }
    await suppliersService.delete(id)
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }

  return { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier }
}
