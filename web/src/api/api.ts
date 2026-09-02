import axios, { type InternalAxiosRequestConfig } from 'axios'
import type { User } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(error)
  }
)

export const getToken = (): string | null => localStorage.getItem('token')
export const getUser = (): User | null => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}
export const setUser = (token: string, user: User): void => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
export const clearAuth = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
