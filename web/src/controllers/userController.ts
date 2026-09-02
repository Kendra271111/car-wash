import { api } from '../api/api'
import type { User } from '../types'

export const fetchUsers = async (): Promise<User[]> => {
  const res = await api.get<{ data: User[] }>('/users')
  return res.data.data || []
}

export const fetchUserById = async (id: number | string): Promise<User> => {
  const res = await api.get<{ data: User }>(`/users/${id}`)
  return res.data.data
}

export default { fetchUsers, fetchUserById }
