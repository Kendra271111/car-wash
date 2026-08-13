import { api } from '../api/api'

export const fetchCustomers = async (search = '') => {
  const res = await api.get('/customers', search ? { params: { search } } : undefined)
  return res.data.data || []
}

export const fetchCustomerById = async (id) => {
  const res = await api.get(`/customers/${id}`)
  return res.data.data
}

export const createCustomer = async (customerData) => {
  const res = await api.post('/customers', customerData)
  return res.data
}

export default { fetchCustomers, fetchCustomerById, createCustomer }
