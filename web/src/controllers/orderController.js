import { api } from '../api/api'

export const statusColors = {
  PENDING: 'badge-warning',
  PROCESSING: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-error',
}

export const statusLabels = {
  PENDING: 'Waiting',
  PROCESSING: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const statusCounts = {
  PENDING: 0,
  PROCESSING: 0,
  COMPLETED: 0,
  CANCELLED: 0,
}

export const computeStats = (orders) => {
  const stats = { ...statusCounts }
  orders.forEach((o) => {
    const s = o.status || 'PENDING'
    if (stats[s] !== undefined) stats[s] += 1
  })
  return stats
}

export const fetchOrders = async (search = '', { startDate, endDate } = {}) => {
  const params = {}
  if (search) params.search = search
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const res = await api.get('/orders', { params })
  return res.data.data || []
}

export const fetchOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`)
  return res.data.data
}

export const createOrder = async (orderData) => {
  const res = await api.post('/orders', orderData)
  return res.data
}

export const updateOrder = async (id, orderData) => {
  const res = await api.put(`/orders/${id}`, orderData)
  return res.data
}

export const updateOrderStatus = async (id, status) => {
  const res = await api.patch(`/orders/${id}/status`, { status })
  return res.data
}

export const deleteOrder = async (id) => {
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
