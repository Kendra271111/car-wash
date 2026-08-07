import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

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

export const fetchOrders = async () => {
  const res = await api.get('/orders')
  return res.data || []
}

export const fetchOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`)
  return res.data
}

export const createOrder = async (orderData) => {
  const res = await api.post('/orders', orderData)
  return res.data
}

export const updateOrder = async (id, orderData) => {
  const res = await api.patch(`/orders/${id}`, orderData)
  return res.data
}

export const deleteOrder = async (id) => {
  await api.delete(`/orders/${id}`)
  return true
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
  deleteOrder,
}
