import { api } from '../services/api'

export const fetchUsers = async () => {
  const res = await api.get('/users')
  return res.data.data || []
}

export const fetchUserById = async (id) => {
  const res = await api.get(`/users/${id}`)
  return res.data.data
}

export default { fetchUsers, fetchUserById }
