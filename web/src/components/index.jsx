import { useEffect, useState } from 'react'
import orderController from '../controllers/orderController.js'
import userController from '../controllers/userController.js'
import manWashingCar1 from '../assets/img/bg/manwashingacar.jpeg'
import manWashingCar2 from '../assets/img/bg/manwashingcar2.jpeg'
import manWashingCar3 from '../assets/img/bg/manwashingcar3.jpeg'
import manWashingCar4 from '../assets/img/bg/manwashingcar4.jpeg'
import manWashingCar5 from '../assets/img/bg/manwashingcar5.jpeg'

const bgImages = [manWashingCar1, manWashingCar2, manWashingCar3, manWashingCar4, manWashingCar5]

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    pending: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [currentBg, setCurrentBg] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
    { label: 'Total Orders', value: stats.totalOrders, desc: 'All time orders', icon: 'local_car_wash', color: 'from-blue-500 to-blue-600' },
    { label: 'Total Users', value: stats.totalUsers, desc: 'Registered users', icon: 'people', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending', value: stats.pending, desc: 'Orders waiting to be processed', icon: 'schedule', color: 'from-amber-500 to-amber-600' },
    { label: 'Completed', value: stats.completed, desc: 'Orders completed successfully', icon: 'check_circle', color: 'from-teal-500 to-teal-600' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
        {bgImages.map((img, idx) => (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${img})`,
              opacity: idx === currentBg ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center h-full p-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
          <p className="text-gray-200 text-lg max-w-xl">
            Welcome to your car wash command center. Monitor orders, payments, and performance at a glance.
          </p>

          <div className="flex gap-2 mt-6">
            {bgImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentBg(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentBg ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          cards.map((_, i) => (
            <div key={i} className="card bg-white dark:bg-gray-950 p-5 rounded-xl shadow-md">
              <div className="skeleton h-8 w-8 rounded-lg mb-3" />
              <div className="skeleton h-8 w-16 mb-2" />
              <div className="skeleton h-4 w-24" />
            </div>
          ))
        ) : (
          cards.map((card, i) => (
            <div key={i} className="card bg-white dark:bg-gray-950 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                <span className="material-symbols-outlined text-xl">{card.icon}</span>
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{card.label}</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">{card.desc}</p>
            </div>
          ))
        )}
      </div>

   
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card bg-white dark:bg-gray-950 p-6 rounded-xl shadow-md lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Jump to common tasks to keep your operations moving.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="/orders/create" className="btn btn-primary btn-sm">New Order</a>
            <a href="/customers/create" className="btn btn-secondary btn-sm">Add Customer</a>
            <a href="/vehicles/create" className="btn btn-secondary btn-sm">Add Vehicle</a>
            <a href="/payments" className="btn btn-ghost btn-sm">Process Payments</a>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-teal-500 to-teal-700 p-6 rounded-xl shadow-md text-white">
          <h2 className="text-lg font-semibold mb-2">Need Help?</h2>
          <p className="text-teal-100 text-sm mb-4">
            Use the sidebar to navigate orders, customers, vehicles, services, and more.
          </p>
          <a href="/orders" className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-teal-100 transition-colors">
            Go to Orders
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
