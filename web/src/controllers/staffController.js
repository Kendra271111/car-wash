import { api } from '../api/api'

export const getStaff = async () => {
  const res = await api.get('/staff')
  return res.data.data || []
}

export const getStaffById = async (id) => {
  const res = await api.get(`/staff/${id}`)
  return res.data.data
}

export const createStaff = async (staffData) => {
  const res = await api.post('/staff', staffData)
  return res.data
}

export const updateStaff = async (id, staffData) => {
  const res = await api.put(`/staff/${id}`, staffData)
  return res.data
}

export const deleteStaff = async (id) => {
  const res = await api.delete(`/staff/${id}`)
  return res.data
}

export default { getStaff, getStaffById, createStaff, updateStaff, deleteStaff }
