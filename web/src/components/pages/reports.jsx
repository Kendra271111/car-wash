import { useEffect, useState } from 'react'
import reportController from '../../controllers/reportController.js'
import LineChart from '../../components/ui/lineChart.jsx'

const Reports = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('30d')
  const [revenueData, setRevenueData] = useState([])
  const [ordersData, setOrdersData] = useState([])

  useEffect(() => {
    let cancelled = false
    const loadReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const [revenue, orders] = await Promise.all([
          reportController.fetchRevenueReport(period),
          reportController.fetchOrdersReport(period),
        ])
        if (!cancelled) {
          setRevenueData(revenue)
          setOrdersData(orders)
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load reports.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadReports()
    return () => { cancelled = true }
  }, [period])

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.amount, 0)
  const totalOrders = ordersData.reduce((sum, d) => sum + d.total, 0)
  const completedOrders = ordersData.reduce((sum, d) => sum + d.completed, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reports</h1>
        <select
          className="select select-bordered select-sm"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last 1 year</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</h2>
          </div>
        </div>
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed Orders</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{completedOrders}</h2>
          </div>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
        {loading ? (
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
          </div>
        ) : (
          <LineChart data={revenueData} xKey="date" yKey="amount" color="#6366f1" />
        )}
      </div>

      <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Orders Trend</h2>
        {loading ? (
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
          </div>
        ) : (
          <LineChart data={ordersData} xKey="date" yKey="total" color="#10b981" />
        )}
      </div>
    </div>
  )
}

export default Reports
