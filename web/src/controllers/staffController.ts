import { api } from '../api/api'
import type { Staff } from '../types'

export const getStaff = async (search: string = ''): Promise<Staff[]> => {
  const res = await api.get<{ data: Staff[] }>('/staff', search ? { params: { search } } : undefined)
  return res.data.data || []
}

export const getStaffById = async (id: number | string): Promise<Staff> => {
  const res = await api.get<{ data: Staff }>(`/staff/${id}`)
  return res.data.data
}

export const createStaff = async (staffData: Partial<Staff> | Record<string, any>): Promise<any> => {
  const res = await api.post('/staff', staffData)
  return res.data
}

export const updateStaff = async (id: number | string, staffData: Partial<Staff> | Record<string, any>): Promise<any> => {
  const res = await api.put(`/staff/${id}`, staffData)
  return res.data
}

export const deleteStaff = async (id: number | string): Promise<any> => {
  const res = await api.delete(`/staff/${id}`)
  return res.data
}

export default { getStaff, getStaffById, createStaff, updateStaff, deleteStaff }
