import { api, clearAuth } from '../api/api'
import type { User } from '../types'

export interface LoginResponse {
  token: string
  user: User
  message?: string
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const res = await api.post<{ token: string; user: User; message?: string }>('/auth/login', { email, password })
  const { token, user } = res.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return { token, user, message: res.data.message }
}

export const register = async (formData: FormData): Promise<any> => {
  const res = await api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const logout = (): void => {
  clearAuth()
}

export default { login, register, logout }
