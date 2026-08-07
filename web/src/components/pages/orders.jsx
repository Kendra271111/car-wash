import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import orderController from '../../controllers/orderControllers.jsx'

const { statusColors, statusLabels, computeStats } = orderController

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [refetchKey, setRefetchKey] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [form, setForm] = useState({
    vehicleId: '',
    customerId: '',
    staffId: '',
    status: 'PENDING',
  })

  useEffect(() => {
    let cancelled = false
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await orderController.fetchOrders()
        if (!cancelled) setOrders(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load orders.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrders()
    return () => { cancelled = true }
  }, [refetchKey])

  const stats = computeStats(orders)
  const totalCount = orders.length

  const filtered = filter === 'all' ? orders : orders.filter((o) => (o.status || 'PENDING') === filter)

  const statCards = [
    { label: 'Waiting', value: stats.PENDING, desc: 'Orders waiting to be processed' },
    { label: 'In Progress', value: stats.PROCESSING, desc: 'Orders currently being processed' },
    { label: 'Completed', value: stats.COMPLETED, desc: 'Completed orders' },
    { label: 'Cancelled', value: stats.CANCELLED, desc: 'Cancelled orders' },
  ]

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Active Orders</h1>
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            New Order
          </button>
        </div>

        <div className="flex flex-row gap-4">
          {statCards.map((card, i) => (
            <div key={i} className="flex-1 card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">{card.label}</p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.desc}.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-row gap-2 overflow-x-auto pb-1">
          <button
            className={`btn btn-ghost btn-sm ${filter === 'all' ? 'btn-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            className={`btn btn-ghost btn-sm ${filter === 'PENDING' ? 'btn-active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Waiting ({stats.PENDING})
          </button>
          <button
            className={`btn btn-ghost btn-sm ${filter === 'PROCESSING' ? 'btn-active' : ''}`}
            onClick={() => setFilter('PROCESSING')}
          >
            In Progress ({stats.PROCESSING})
          </button>
          <button
            className={`btn btn-ghost btn-sm ${filter === 'COMPLETED' ? 'btn-active' : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed ({stats.COMPLETED})
          </button>
        </div>

        <div className="card bg-white dark:bg-gray-950 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <span className="loading loading-spinner loading-lg text-indigo-600"></span>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-error">{error}</p>
                <button className="btn btn-ghost btn-sm mt-2" onClick={() => setRefetchKey((k) => k + 1)}>Retry</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vehicle</th>
                    <th>Customer</th>
                    <th>Staff</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const status = order.status || 'PENDING'
                    return (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>
                          {order.vehicle ? (
                            <div>
                              <p className="font-medium">
                                {order.vehicle.brand} {order.vehicle.model}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{order.vehicle.name}</p>
                              {order.vehicle.plateNumber && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.vehicle.plateNumber}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">#{order.vehicleId}</span>
                          )}
                        </td>
                        <td>
                          {order.customer ? (
                            <div>
                              <p className="font-medium">{order.customer.name}</p>
                              {order.customer.phone && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.phone}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">#{order.customerId}</span>
                          )}
                        </td>
                        <td>
                          {order.staff ? (
                            <p className="font-medium">{order.staff.name}</p>
                          ) : (
                            <span className="text-gray-400">#{order.staffId}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${statusColors[status] || 'badge-neutral'}`}>
                            {statusLabels[status] || status}
                          </span>
                        </td>
                        <td>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Link
                              to={`/orders/${order.id}`}
                              className="btn btn-ghost btn-sm btn-square"
                              title="View"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </Link>
                            <Link
                              to={`/orders/${order.id}/edit`}
                              className="btn btn-ghost btn-sm btn-square"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Order</h2>
                <button
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => { setModalOpen(false); setSubmitError(null) }}
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {submitError && (
                <div className="mb-4 p-3 text-sm text-error bg-error/10 border border-error/20 rounded-md">
                  {submitError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle ID</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter vehicle ID"
                    value={form.vehicleId}
                    onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer ID</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter customer ID"
                    value={form.customerId}
                    onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Staff ID</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter staff ID"
                    value={form.staffId}
                    onChange={(e) => setForm({ ...form, staffId: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="PENDING">Waiting</option>
                    <option value="PROCESSING">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="btn btn-ghost"
                onClick={() => { setModalOpen(false); setSubmitError(null) }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={submitLoading}
                onClick={async () => {
                  setSubmitLoading(true)
                  setSubmitError(null)
                  try {
                    await orderController.createOrder({
                      vehicleId: Number(form.vehicleId),
                      customerId: Number(form.customerId),
                      staffId: Number(form.staffId),
                      status: form.status,
                    })
                    setModalOpen(false)
                    setForm({ vehicleId: '', customerId: '', staffId: '', status: 'PENDING' })
                    setRefetchKey((k) => k + 1)
                  } catch (err) {
                    setSubmitError(err.response?.data?.message || 'Failed to create order.')
                  } finally {
                    setSubmitLoading(false)
                  }
                }}
              >
                {submitLoading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Orders
