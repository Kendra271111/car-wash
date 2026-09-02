import { api } from '../api/api'
import type { RevenueItem, OrdersReportItem, ComparisonReport } from '../types'

export const fetchRevenueReport = async (period: string = '30d'): Promise<RevenueItem[]> => {
  const res = await api.get<{ data: RevenueItem[] }>('/reports/revenue', { params: { period } })
  return res.data.data || []
}

export const fetchOrdersReport = async (period: string = '30d'): Promise<OrdersReportItem[]> => {
  const res = await api.get<{ data: OrdersReportItem[] }>('/reports/orders', { params: { period } })
  return res.data.data || []
}

export const fetchComparisonReport = async (period: string = '30d'): Promise<ComparisonReport | null> => {
  const res = await api.get<{ data: ComparisonReport }>('/reports/comparison', { params: { period } })
  return res.data.data || null
}

export default { fetchRevenueReport, fetchOrdersReport, fetchComparisonReport }
