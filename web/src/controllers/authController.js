import { api, clearAuth } from '../services/api'

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  const { token, user } = res.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return { token, user, message: res.data.message }
}

export const register = async (formData) => {
  const res = await api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const logout = () => {
  clearAuth()
}

export default { login, register, logout }
