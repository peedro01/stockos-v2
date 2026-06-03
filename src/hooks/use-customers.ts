import { useState, useEffect } from 'react'
import { customersService } from '@/services/customers.service'
import { mockCustomers } from '@/lib/mock-data'
import type { Customer, CustomerFormData } from '@/types'

const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('SEU_PROJETO') ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        if (IS_DEMO) {
          await new Promise(r => setTimeout(r, 200))
          setCustomers(mockCustomers)
        } else {
          setCustomers(await customersService.getAll())
        }
      } catch { setCustomers(mockCustomers) }
      finally { setIsLoading(false) }
    }
    fetch()
  }, [])

  async function createCustomer(data: CustomerFormData) {
    if (IS_DEMO) {
      const novo: Customer = { ...data, id: Math.random().toString(36).slice(2), company_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      setCustomers(prev => [novo, ...prev]); return novo
    }
    const c = await customersService.create({ ...data, company_id: '1' })
    setCustomers(prev => [c, ...prev]); return c
  }

  async function updateCustomer(id: string, data: CustomerFormData) {
    if (IS_DEMO) { setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...data } : c)); return }
    const c = await customersService.update(id, data)
    setCustomers(prev => prev.map(x => x.id === id ? c : x))
  }

  async function deleteCustomer(id: string) {
    if (IS_DEMO) { setCustomers(prev => prev.filter(c => c.id !== id)); return }
    await customersService.delete(id)
    setCustomers(prev => prev.filter(c => c.id !== id))
  }

  return { customers, isLoading, createCustomer, updateCustomer, deleteCustomer }
}
