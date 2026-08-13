import { api } from '../api/api'

export const createPayment = async (paymentData) => {
  const res = await api.post('/payments', paymentData)
  return res.data
}

export const getPaymentByOrderId = async (orderId) => {
  const res = await api.get(`/payments/order/${orderId}`)
  return res.data.data
}

export const fetchPayments = async () => {
  const res = await api.get('/payments')
  return res.data.data || []
}

export default { createPayment, getPaymentByOrderId, fetchPayments }
