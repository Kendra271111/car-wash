import { useEffect, useState, useMemo } from 'react'
import reportController from '../../controllers/reportController.js'
import LineChart from '../../components/ui/lineChart.jsx'

const formatCurrency = (value) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatPercent = (value) => {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

const GrowthBadge = ({ value }) => {
  if (value === undefined || value === null || isNaN(value)) return null
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'}`}>
      <span className="material-symbols-outlined text-sm">{isPositive ? 'trending_up' : 'trending_down'}</span>
      {formatPercent(value)}
    </span>
  )
}

const StatCard = ({ title, value, subtitle, growth, icon, colorClass }) => (
  <div className="card bg-white dark:bg-gray-950 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass || 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400'}`}>
          <span className="material-symbols-outlined text-xl">{icon || 'analytics'}</span>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h2>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {growth !== undefined && <GrowthBadge value={growth} />}
    </div>
  </div>
)

const Reports = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('30d')
  const [revenueData, setRevenueData] = useState([])
  const [ordersData, setOrdersData] = useState([])
  const [comparison, setComparison] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loadReports = async () => {
      setLoading(true)
      setError(null)
      try {
        const [revenue, orders, comp] = await Promise.all([
          reportController.fetchRevenueReport(period),
          reportController.fetchOrdersReport(period),
          reportController.fetchComparisonReport(period),
        ])
        if (!cancelled) {
          setRevenueData(revenue)
          setOrdersData(orders)
          setComparison(comp)
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
  const avgOrderValue = totalOrders === 0 ? 0 : totalRevenue / totalOrders
  const completionRate = totalOrders === 0 ? 0 : (completedOrders / totalOrders) * 100

  const stats = useMemo(() => {
    if (!comparison) return []
    return [
      {
        title: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        subtitle: `Previous: ${formatCurrency(comparison.previous.revenue)}`,
        growth: comparison.growth.revenue,
        icon: 'payments',
        colorClass: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
      },
      {
        title: 'Total Orders',
        value: totalOrders.toLocaleString(),
        subtitle: `Previous: ${comparison.previous.orders.toLocaleString()}`,
        growth: comparison.growth.orders,
        icon: 'shopping_cart',
        colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      },
      {
        title: 'Completed Orders',
        value: completedOrders.toLocaleString(),
        subtitle: `Previous: ${comparison.previous.completed.toLocaleString()}`,
        growth: comparison.growth.completed,
        icon: 'check_circle',
        colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      },
      {
        title: 'Avg. Order Value',
        value: formatCurrency(avgOrderValue),
        subtitle: 'Revenue per order',
        icon: 'receipt_long',
        colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
      },
      {
        title: 'Completion Rate',
        value: `${completionRate.toFixed(1)}%`,
        subtitle: `${completedOrders} of ${totalOrders} orders`,
        icon: 'task_alt',
        colorClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
      },
    ]
  }, [comparison, totalRevenue, totalOrders, completedOrders, avgOrderValue, completionRate])

  return (
    <div className="flex flex-col gap-6">
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card bg-white dark:bg-gray-950 p-5 rounded-xl shadow-md border border-gray-200 dark:border-gray-800">
              <div className="skeleton h-8 w-8 rounded-lg mb-3" />
              <div className="skeleton h-8 w-24 mb-2" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      )}

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Daily revenue over the selected period</p>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="p-8 text-center">
              <span className="loading loading-spinner loading-lg text-teal-600"></span>
            </div>
          ) : (
            <LineChart data={revenueData} xKey="date" yKey="amount" color="#14b8a6" />
          )}
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders Trend</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total and completed orders over the selected period</p>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="p-8 text-center">
              <span className="loading loading-spinner loading-lg text-teal-600"></span>
            </div>
          ) : (
            <LineChart data={ordersData} xKey="date" yKey="total" color="#14b8a6" />
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports