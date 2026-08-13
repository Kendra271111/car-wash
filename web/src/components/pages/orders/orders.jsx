import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import orderController from '../../../controllers/orderController.js'

const { statusColors, statusLabels, computeStats } = orderController

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Waiting' },
  { key: 'PROCESSING', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed (unpaid)' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusBadge = (order) => {
  const status = order.status || 'PENDING'
  const isUnpaidCompleted = status === 'COMPLETED' && !order.payements?.some((p) => p.status === 'PAID')
  const label = isUnpaidCompleted ? 'Completed (unpaid)' : statusLabels[status] || status
  return <span className={`badge ${statusColors[status] || 'badge-neutral'}`}>{label}</span>
}

const OrderRow = ({ order }) => {
  const vehicle = order.vehicle
  const customer = order.customer
  const staff = order.staff
  const serviceCount = order.order_items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0

  return (
    <tr>
      <td>{order.id}</td>
      <td>
        {vehicle ? (
          <div>
            <p className="font-medium">
              {vehicle.brand} {vehicle.model}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{vehicle.name}</p>
            {vehicle.plateNumber && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{vehicle.plateNumber}</p>
            )}
          </div>
        ) : (
          <span className="text-gray-400">#{order.vehicleId}</span>
        )}
      </td>
      <td>
        {customer ? (
          <div>
            <p className="font-medium">{customer.name}</p>
            {customer.phone && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</p>
            )}
          </div>
        ) : (
          <span className="text-gray-400">#{order.customerId}</span>
        )}
      </td>
      <td>
        {staff ? (
          <p className="font-medium">{staff.name}</p>
        ) : (
          <span className="text-gray-400">#{order.staffId}</span>
        )}
      </td>
      <td>{serviceCount || '-'}</td>
      <td>{getStatusBadge(order)}</td>
      <td>{formatDate(order.createdAt)}</td>
      <td className="text-right">
        <div className="flex gap-1 justify-end">
          <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm btn-square" title="View">
            <span className="material-symbols-outlined">visibility</span>
          </Link>
          <Link to={`/orders/${order.id}/edit`} className="btn btn-ghost btn-sm btn-square" title="Edit">
            <span className="material-symbols-outlined">edit</span>
          </Link>
        </div>
      </td>
    </tr>
  )
}

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [refetchKey, setRefetchKey] = useState(0)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await orderController.fetchOrders(search, { startDate, endDate })
        if (!cancelled) setOrders(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load orders.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrders()
    return () => { cancelled = true }
  }, [refetchKey, search, startDate, endDate])

  const activeOrders = orders.filter((o) => {
    const isCompletedPaid = (o.status || 'PENDING') === 'COMPLETED' && o.payements?.some((p) => p.status === 'PAID')
    if (isCompletedPaid) return false
    if (startDate && o.createdAt) {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0]
      if (orderDate < startDate) return false
    }
    if (endDate && o.createdAt) {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0]
      if (orderDate > endDate) return false
    }
    return true
  })

  const stats = computeStats(activeOrders)
  const totalCount = activeOrders.length

  const filtered = filter === 'all' ? activeOrders : activeOrders.filter((o) => (o.status || 'PENDING') === filter)

  const dateRangeLabel = useMemo(() => {
    if (!startDate && !endDate) return ''
    if (startDate && endDate) return `${startDate} → ${endDate}`
    if (startDate) return `From ${startDate}`
    return `Until ${endDate}`
  }, [startDate, endDate])

  const clearDates = () => {
    setStartDate('')
    setEndDate('')
  }

  const applyPreset = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const statCards = [
    { label: 'Waiting', value: stats.PENDING, desc: 'orders waiting to be processed' },
    { label: 'In Progress', value: stats.PROCESSING, desc: 'orders currently being processed' },
    { label: 'Completed (unpaid)', value: stats.COMPLETED, desc: 'completed but unpaid orders' },
    { label: 'Cancelled', value: stats.CANCELLED, desc: 'Cancelled orders' },
  ]

  return (
    <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Active Orders</h1>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Date range:</span>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => applyPreset(0)}>Today</button>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => applyPreset(7)}>Last 7 days</button>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => applyPreset(30)}>Last 30 days</button>
              {dateRangeLabel && (
                <span className="badge badge-primary badge-outline ml-2">{dateRangeLabel}</span>
              )}
              {dateRangeLabel && (
                <button type="button" className="btn btn-ghost btn-xs" onClick={clearDates}>Clear</button>
              )}
            </div>
            <div className="flex flex-row gap-2 items-center">
              <div className="flex flex-row gap-2 items-center">
                <label className="text-sm text-gray-600 dark:text-gray-300">From:</label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <label className="text-sm text-gray-600 dark:text-gray-300">To:</label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <input
                type="text"
                className="input input-bordered input-sm w-64"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Link to="/orders/create" className="btn btn-primary btn-sm">Add Order</Link>
            </div>
          </div>
        </div>

      <div className="flex flex-row gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="flex-1 card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">{card.label}</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.desc}.</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-row gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`btn btn-ghost btn-sm ${filter === key ? 'btn-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? `${label} (${totalCount})` : `${label} (${stats[key] || 0})`}
          </button>
        ))}
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
                  <th></th>
                  <th>Vehicle</th>
                  <th>Customer</th>
                  <th>Staff</th>
                  <th>Services</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders
