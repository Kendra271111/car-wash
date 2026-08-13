import { api } from '../api/api'

export const fetchRevenueReport = async (period = '30d') => {
  const res = await api.get('/reports/revenue', { params: { period } })
  return res.data.data || []
}

export const fetchOrdersReport = async (period = '30d') => {
  const res = await api.get('/reports/orders', { params: { period } })
  return res.data.data || []
}

export default { fetchRevenueReport, fetchOrdersReport }
