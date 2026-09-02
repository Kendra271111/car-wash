import { api } from '../api/api'
import type { Customer } from '../types'

export const fetchCustomers = async (search: string = ''): Promise<Customer[]> => {
  const res = await api.get<{ data: Customer[] }>('/customers', search ? { params: { search } } : undefined)
  return res.data.data || []
}

export const fetchCustomerById = async (id: number | string): Promise<Customer> => {
  const res = await api.get<{ data: Customer }>(`/customers/${id}`)
  return res.data.data
}

export const createCustomer = async (customerData: Partial<Customer>): Promise<any> => {
  const res = await api.post('/customers', customerData)
  return res.data
}

export default { fetchCustomers, fetchCustomerById, createCustomer }
