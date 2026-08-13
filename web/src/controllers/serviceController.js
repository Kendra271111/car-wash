import { api } from '../api/api'

export const fetchServices = async (search = '') => {
  const res = await api.get('/services', search ? { params: { search } } : undefined)
  return res.data.data || []
}

export const fetchServiceById = async (id) => {
  const res = await api.get(`/services/${id}`)
  return res.data.data
}

export const createService = async (serviceData) => {
  const res = await api.post('/services', serviceData)
  return res.data
}

export default { fetchServices, fetchServiceById, createService }
