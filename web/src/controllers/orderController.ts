import { api } from '../api/api'
import type { Order, OrderStatus, StatusCounts, DateRangeFilter } from '../types'

export const statusColors: Record<OrderStatus, string> = {
  PENDING: 'badge-warning',
  PROCESSING: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-error',
}

export const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Waiting',
  PROCESSING: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const statusCounts: StatusCounts = {
  PENDING: 0,
  PROCESSING: 0,
  COMPLETED: 0,
  CANCELLED: 0,
}

export const computeStats = (orders: Order[]): StatusCounts => {
  const stats: StatusCounts = { ...statusCounts }
  orders.forEach((o) => {
    const s = o.status || 'PENDING'
    if (stats[s] !== undefined) stats[s] += 1
  })
  return stats
}

export const fetchOrders = async (search: string = '', { startDate, endDate }: DateRangeFilter = {}): Promise<Order[]> => {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const res = await api.get<{ data: Order[] }>('/orders', { params })
  return res.data.data || []
}

export const fetchOrderById = async (id: number | string): Promise<Order> => {
  const res = await api.get<{ data: Order }>(`/orders/${id}`)
  return res.data.data
}

export const createOrder = async (orderData: Partial<Order> | Record<string, any>): Promise<any> => {
  const res = await api.post('/orders', orderData)
  return res.data
}

export const updateOrder = async (id: number | string, orderData: Partial<Order> | Record<string, any>): Promise<any> => {
  const res = await api.put(`/orders/${id}`, orderData)
  return res.data
}

export const updateOrderStatus = async (id: number | string, status: OrderStatus): Promise<any> => {
  const res = await api.patch(`/orders/${id}/status`, { status })
  return res.data
}

export const deleteOrder = async (id: number | string): Promise<any> => {
  const res = await api.delete(`/orders/${id}`)
  return res.data
}

export default {
  statusColors,
  statusLabels,
  statusCounts,
  computeStats,
  fetchOrders,
  fetchOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
}
