import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockCustomers } from '../lib/mock-data'
import type { Customer, CustomerFormData } from '../types'

interface CustomersState {
  customers: Customer[]
  addCustomer: (data: CustomerFormData) => void
  updateCustomer: (id: string, data: CustomerFormData) => void
  deleteCustomer: (id: string) => void
}

export const useCustomersStore = create<CustomersState>()(
  persist(
    (set) => ({
      customers: mockCustomers,
      addCustomer: (data) => set((s) => ({
        customers: [{
          ...data,
          id: Math.random().toString(36).slice(2),
          company_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, ...s.customers]
      })),
      updateCustomer: (id, data) => set((s) => ({
        customers: s.customers.map(c =>
          c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
        )
      })),
      deleteCustomer: (id) => set((s) => ({
        customers: s.customers.filter(c => c.id !== id)
      })),
    }),
    { name: 'stockos-customers' }
  )
)
