import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import orderController from '../../controllers/orderController'
import type { Order, OrderStatus } from '../../types'

const { statusColors, statusLabels } = orderController

interface SortIndicatorProps {
  active: boolean
  direction: 'asc' | 'desc'
}

const SortIndicator = ({ active, direction }: SortIndicatorProps) => {
  if (!active) {
    return <span className="opacity-20 text-xs ml-1">↑↓</span>
  }
  return (
    <span className="text-teal-600 dark:text-teal-400 text-xs ml-1">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

type HistorySortKey = 'id' | 'vehicle' | 'customer' | 'staff' | 'services' | 'status' | 'created'

const History = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [refetchKey, setRefetchKey] = useState<number>(0)
  const [search, setSearch] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [sortKey, setSortKey] = useState<HistorySortKey>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    let cancelled = false
    const loadOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await orderController.fetchOrders(search, {
          startDate,
          endDate,
        })
        if (!cancelled) setOrders(data)
      } catch (err: any) {
        if (!cancelled)
          setError(err.response?.data?.message || 'Failed to load orders.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrders()
    return () => {
      cancelled = true
    }
  }, [refetchKey, search, startDate, endDate])

  const completedOrders = orders.filter((o) => {
    const isCompleted = (o.status || 'PENDING') === 'COMPLETED'
    const isPaid = o.payements?.some((p) => p.status === 'PAID')
    if (!isCompleted || !isPaid) return false
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

  const filtered = useMemo(() => {
    let result = completedOrders
    if (filter !== 'all') {
      result = result.filter((o) => (o.status || 'PENDING') === filter)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          (o.customer?.name || '').toLowerCase().includes(q) ||
          (o.vehicle?.name || '').toLowerCase().includes(q) ||
          (o.vehicle?.plateNumber || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [completedOrders, filter, search])

  const requestSort = (key: HistorySortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (order: Order, key: HistorySortKey): string | number => {
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

  const applyPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const totalCount = filtered.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Order History
          </h1>
          <div className="flex flex-row gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setRefetchKey((k) => k + 1)}
            >
              <span className="material-symbols-outlined mr-1">refresh</span>
              Refresh
            </button>
          </div>
        </div>

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
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setRefetchKey((k) => k + 1)}>Retry</button>
        </div>
      )}

      <div className="flex flex-row gap-2 overflow-x-auto pb-1">
        <button
          className={`btn btn-ghost btn-sm ${filter === 'all' ? 'btn-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({totalCount})
        </button>
        <button
          className={`btn btn-ghost btn-sm ${filter === 'COMPLETED' ? 'btn-active' : ''}`}
          onClick={() => setFilter('COMPLETED')}
        >
          Completed ({completedOrders.length})
        </button>
      </div>

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-teal-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading history...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">inventory_2</span>
              <p className="text-gray-500 dark:text-gray-400">No completed orders found.</p>
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
                {sorted.map((order) => {
                  const status = (order.status || 'PENDING') as OrderStatus
                  return (
                    <tr key={order.id} className="hover">
                      <td className="font-mono text-sm">{order.id}</td>
                      <td>
                        {order.vehicle ? (
                          <div>
                            <p className="font-medium">
                              {order.vehicle.brand} {order.vehicle.model}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {order.vehicle.name}
                            </p>
                            {order.vehicle.plateNumber && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {order.vehicle.plateNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            #{order.vehicleId}
                          </span>
                        )}
                      </td>
                      <td>
                        {order.customer ? (
                          <div>
                            <p className="font-medium">
                              {order.customer.name}
                            </p>
                            {order.customer.phone && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {order.customer.phone}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            #{order.customerId}
                          </span>
                        )}
                      </td>
                      <td>
                        {order.staff ? (
                          <p className="font-medium">{order.staff.name}</p>
                        ) : (
                          <span className="text-gray-400">
                            #{order.staffId}
                          </span>
                        )}
                      </td>
                      <td>
                        {order.order_items && order.order_items.length > 0
                          ? order.order_items.reduce(
                              (sum, item) => sum + (item.qty || 0),
                              0
                            )
                          : '-'}
                      </td>
                      <td>
                        <span
                          className={`badge ${statusColors[status] || 'badge-neutral'}`}
                        >
                          {statusLabels[status] || status}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Link
                            to={`/orders/${order.id}`}
                            className="btn btn-ghost btn-sm btn-square"
                            title="View"
                          >
                            <span className="material-symbols-outlined">
                              visibility
                            </span>
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
  )
}

export default History
