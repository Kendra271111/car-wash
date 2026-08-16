import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import paymentController from '../../../controllers/paymentController.js'

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

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusBadge = (status) => {
  const s = status || 'PENDING'
  const colors = {
    PAID: 'badge-success',
    PENDING: 'badge-warning',
    FAILED: 'badge-error',
  }
  return <span className={`badge ${colors[s] || 'badge-neutral'}`}>{s}</span>
}

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchKey, setRefetchKey] = useState(0)
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    let cancelled = false
    const loadPayments = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await paymentController.fetchPayments(search, { startDate, endDate })
        if (!cancelled) setPayments(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load payments.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadPayments()
    return () => { cancelled = true }
  }, [refetchKey, search, startDate, endDate])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (payment, key) => {
    switch (key) {
      case 'id':
        return payment.id
      case 'order':
        return payment.orderId || payment.order?.id || ''
      case 'customer':
        return payment.customer?.name?.toLowerCase() || payment.order?.customer?.name?.toLowerCase() || ''
      case 'method':
        return (payment.method || '').toLowerCase()
      case 'amount':
        return Number(payment.amount || 0)
      case 'change':
        return Number(payment.change || 0)
      case 'status':
        return (payment.status || '').toLowerCase()
      case 'created':
        return payment.createdAt ? new Date(payment.createdAt).getTime() : 0
      default:
        return ''
    }
  }

  const sorted = useMemo(() => {
    const data = [...payments]
    data.sort((a, b) => {
      const aValue = getSortValue(a, sortKey)
      const bValue = getSortValue(b, sortKey)
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return data
  }, [payments, sortKey, sortDirection])

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

  const totalCount = payments.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payments</h1>
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
              placeholder="Search payments..."
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

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-indigo-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading payments...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">account_balance_wallet</span>
              <p className="text-gray-500 dark:text-gray-400">No payments found.</p>
            </div>
          ) : (
            <table className="table table-zebra">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('id')}>
                    <div className="flex items-center gap-1">ID <SortIndicator active={sortKey === 'id'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('order')}>
                    <div className="flex items-center gap-1">Order <SortIndicator active={sortKey === 'order'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('customer')}>
                    <div className="flex items-center gap-1">Customer <SortIndicator active={sortKey === 'customer'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('method')}>
                    <div className="flex items-center gap-1">Method <SortIndicator active={sortKey === 'method'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('amount')}>
                    <div className="flex items-center gap-1">Amount <SortIndicator active={sortKey === 'amount'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('change')}>
                    <div className="flex items-center gap-1">Change <SortIndicator active={sortKey === 'change'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1">Status <SortIndicator active={sortKey === 'status'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('created')}>
                    <div className="flex items-center gap-1">Date <SortIndicator active={sortKey === 'created'} direction={sortDirection} /></div>
                  </th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((payment) => (
                  <tr key={payment.id} className="hover">
                    <td className="font-mono text-sm">{payment.id}</td>
                    <td>
                      {payment.order ? (
                        <div>
                          <p className="font-medium">Order #{payment.order.id}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.order.vehicle ? `${payment.order.vehicle.brand} ${payment.order.vehicle.model}` : ''}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">#{payment.orderId}</span>
                      )}
                    </td>
                    <td>
                      {payment.customer ? (
                        <p className="font-medium">{payment.customer.name}</p>
                      ) : payment.order?.customer ? (
                        <p className="font-medium">{payment.order.customer.name}</p>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>{payment.method || '-'}</td>
                    <td>${Number(payment.amount || 0).toFixed(2)}</td>
                    <td>${Number(payment.change || 0).toFixed(2)}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <div className="flex gap-1 justify-end">
                        {payment.orderId && (
                          <Link to={`/orders/${payment.orderId}`} className="btn btn-ghost btn-sm btn-square" title="View Order">
                            <span className="material-symbols-outlined">visibility</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Payments
