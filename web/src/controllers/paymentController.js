import { api } from '../api/api'

export const createPayment = async (paymentData) => {
  const res = await api.post('/payments', paymentData)
  return res.data
}

export const getPaymentByOrderId = async (orderId) => {
  const res = await api.get(`/payments/order/${orderId}`)
  return res.data.data
}

export const fetchPayments = async (search = '', { startDate, endDate } = {}) => {
  const params = {}
  if (search) params.search = search
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const res = await api.get('/payments', { params })
  return res.data.data || []
}

export default { createPayment, getPaymentByOrderId, fetchPayments }
