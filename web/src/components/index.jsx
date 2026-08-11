import { useEffect, useState } from 'react'
import orderController from '../controllers/orderController.js'
import userController from '../controllers/userController.js'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    pending: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadStats = async () => {
      setLoading(true)
      try {
        const [orders, users] = await Promise.all([
          orderController.fetchOrders(),
          userController.fetchUsers(),
        ])
        if (!cancelled) {
          const orderStats = orderController.computeStats(orders)
          setStats({
            totalOrders: orders.length,
            totalUsers: users.length,
            pending: orderStats.PENDING,
            completed: orderStats.COMPLETED,
          })
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadStats()
    return () => { cancelled = true }
  }, [])

  const cards = [
    { label: 'Total Orders', value: stats.totalOrders, desc: 'All time orders' },
    { label: 'Total Users', value: stats.totalUsers, desc: 'Registered users' },
    { label: 'Pending', value: stats.pending, desc: 'Orders waiting to be processed' },
    { label: 'Completed', value: stats.completed, desc: 'Orders completed successfully' },
  ]

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

        {loading ? (
          <div className="flex flex-row gap-4">
            {cards.map((_, i) => (
              <div key={i} className="flex-1 card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
                <div className="skeleton h-8 w-16 mb-2"></div>
                <div className="skeleton h-4 w-24"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-row gap-4 overflow-x-auto">
            {cards.map((card, i) => (
              <div key={i} className="flex-1 card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{card.label}</p>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome to Car Wash</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Use the sidebar to navigate between orders, customers, vehicles, services, and more.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
