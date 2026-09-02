import { api } from '../api/api'
import type { Payment, DateRangeFilter } from '../types'

export const createPayment = async (paymentData: Partial<Payment> | Record<string, any>): Promise<any> => {
  const res = await api.post('/payments', paymentData)
  return res.data
}

export const getPaymentByOrderId = async (orderId: number | string): Promise<Payment> => {
  const res = await api.get<{ data: Payment }>(`/payments/order/${orderId}`)
  return res.data.data
}

export const fetchPayments = async (search: string = '', { startDate, endDate }: DateRangeFilter = {}): Promise<Payment[]> => {
  const params: Record<string, string> = {}
  if (search) params.search = search
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  const res = await api.get<{ data: Payment[] }>('/payments', { params })
  return res.data.data || []
}

export default { createPayment, getPaymentByOrderId, fetchPayments }
