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
    <tr className="hover">
      <td className="font-mono text-sm">{order.id}</td>
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
      <td>
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

const SortIndicator = ({ active, direction }) => {
  if (!active) {
    return (
      <span className="opacity-20 text-xs ml-1">↑↓</span>
    )
  }
  return (
    <span className="text-indigo-600 dark:text-indigo-400 text-xs ml-1">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

const getStatColorClasses = (key) => {
  switch (key) {
    case 'PENDING':
      return {
        icon: 'text-amber-500 dark:text-amber-400',
        value: 'text-amber-500 dark:text-amber-400',
      }
    case 'PROCESSING':
      return {
        icon: 'text-blue-500 dark:text-blue-400',
        value: 'text-blue-500 dark:text-blue-400',
      }
    case 'COMPLETED':
      return {
        icon: 'text-emerald-500 dark:text-emerald-400',
        value: 'text-emerald-500 dark:text-emerald-400',
      }
    case 'CANCELLED':
      return {
        icon: 'text-red-500 dark:text-red-400',
        value: 'text-red-500 dark:text-red-400',
      }
    default:
      return {
        icon: 'text-gray-500 dark:text-gray-400',
        value: 'text-gray-500 dark:text-gray-400',
      }
  }
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
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')

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

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (order, key) => {
    switch (key) {
      case 'id':
        return order.id
      case 'vehicle':
        return order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model}`.toLowerCase() : ''
      case 'customer':
        return order.customer ? order.customer.name.toLowerCase() : ''
      case 'staff':
        return order.staff ? order.staff.name.toLowerCase() : ''
      case 'services':
        return order.order_items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0
      case 'status':
        return order.status || 'PENDING'
      case 'created':
        return order.createdAt ? new Date(order.createdAt).getTime() : 0
      default:
        return ''
    }
  }

  const sorted = useMemo(() => {
    const data = [...filtered]
    data.sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return data
  }, [filtered, sortKey, sortDirection])

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
    { key: 'PENDING', label: 'Waiting', value: stats.PENDING, desc: 'orders waiting to be processed', icon: 'schedule' },
    { key: 'PROCESSING', label: 'In Progress', value: stats.PROCESSING, desc: 'orders currently being processed', icon: 'build' },
    { key: 'COMPLETED', label: 'Completed (unpaid)', value: stats.COMPLETED, desc: 'completed but unpaid orders', icon: 'assignment_turned_in' },
    { key: 'CANCELLED', label: 'Cancelled', value: stats.CANCELLED, desc: 'Cancelled orders', icon: 'cancel' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Active Orders</h1>
          <Link to="/orders/create" className="btn btn-primary btn-sm">
            <span className="material-symbols-outlined">add</span>
            Add Order
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between p-4 bg-white dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date Range</span>
            <div className="join join-sm">
              <button type="button" className="btn join-item btn-ghost btn-xs" onClick={() => applyPreset(0)}>Today</button>
              <button type="button" className="btn join-item btn-ghost btn-xs" onClick={() => applyPreset(7)}>Last 7 days</button>
              <button type="button" className="btn join-item btn-ghost btn-xs" onClick={() => applyPreset(30)}>Last 30 days</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full xl:w-auto">
            <div className="flex flex-row gap-2 items-center">
              <input
                type="date"
                className="input input-bordered input-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-gray-400 dark:text-gray-500">→</span>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {dateRangeLabel && (
                <button type="button" className="btn btn-ghost btn-xs" onClick={clearDates}>
                  <span className="material-symbols-outlined text-sm">close</span>
                  Clear
                </button>
              )}
            </div>
            <input
              type="text"
              className="input input-bordered input-sm w-full sm:w-64"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const colors = getStatColorClasses(card.key)
          return (
            <div key={card.key} className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-950 rounded-lg shadow border border-gray-200 dark:border-gray-800">
              <div className="flex flex-row items-center justify-between gap-3">
                <span className={`material-symbols-outlined text-2xl ${colors.icon}`}>{card.icon}</span>
                <span className={`text-2xl font-bold ${colors.value}`}>{card.value}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{card.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{card.desc}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="tabs tabs-boxed bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-1 rounded-xl w-fit">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            className={`tab tab-sm gap-2 ${filter === key ? 'tab-active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? `${label} (${totalCount})` : `${label} (${stats[key] || 0})`}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setRefetchKey((k) => k + 1)}>Retry</button>
        </div>
      )}

      {/* Table Card */}
      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-indigo-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">inventory_2</span>
              <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
            </div>
          ) : (
            <table className="table table-zebra">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('id')}>
                    <div className="flex items-center gap-1">ID <SortIndicator active={sortKey === 'id'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('vehicle')}>
                    <div className="flex items-center gap-1">Vehicle <SortIndicator active={sortKey === 'vehicle'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('customer')}>
                    <div className="flex items-center gap-1">Customer <SortIndicator active={sortKey === 'customer'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('staff')}>
                    <div className="flex items-center gap-1">Staff <SortIndicator active={sortKey === 'staff'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('services')}>
                    <div className="flex items-center gap-1">Services <SortIndicator active={sortKey === 'services'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1">Status <SortIndicator active={sortKey === 'status'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('created')}>
                    <div className="flex items-center gap-1">Created <SortIndicator active={sortKey === 'created'} direction={sortDirection} /></div>
                  </th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((order) => (
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
