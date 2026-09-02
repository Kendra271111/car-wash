import { api } from '../api/api'
import type { Service } from '../types'

export const fetchServices = async (search: string = ''): Promise<Service[]> => {
  const res = await api.get<{ data: Service[] }>('/services', search ? { params: { search } } : undefined)
  return res.data.data || []
}

export const fetchServiceById = async (id: number | string): Promise<Service> => {
  const res = await api.get<{ data: Service }>(`/services/${id}`)
  return res.data.data
}

export const createService = async (serviceData: Partial<Service>): Promise<any> => {
  const res = await api.post('/services', serviceData)
  return res.data
}

export default { fetchServices, fetchServiceById, createService }
