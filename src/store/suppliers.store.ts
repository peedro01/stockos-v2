import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockSuppliers } from '../lib/mock-data'
import type { Supplier, SupplierFormData } from '../types'

interface SuppliersState {
  suppliers: Supplier[]
  addSupplier: (data: SupplierFormData) => void
  updateSupplier: (id: string, data: SupplierFormData) => void
  deleteSupplier: (id: string) => void
}

export const useSuppliersStore = create<SuppliersState>()(
  persist(
    (set) => ({
      suppliers: mockSuppliers,
      addSupplier: (data) => set((s) => ({
        suppliers: [{
          ...data,
          id: Math.random().toString(36).slice(2),
          company_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, ...s.suppliers]
      })),
      updateSupplier: (id, data) => set((s) => ({
        suppliers: s.suppliers.map(sup =>
          sup.id === id ? { ...sup, ...data, updated_at: new Date().toISOString() } : sup
        )
      })),
      deleteSupplier: (id) => set((s) => ({
        suppliers: s.suppliers.filter(sup => sup.id !== id)
      })),
    }),
    { name: 'stockos-suppliers' }
  )
)
