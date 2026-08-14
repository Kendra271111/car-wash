import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import paymentController from '../../controllers/paymentController.js'

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

  const filtered = useMemo(() => {
    let result = payments
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        (p.order?.customer?.name || '').toLowerCase().includes(q) ||
        (p.method || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q)
      )
    }
    if (startDate && result.length > 0) {
      result = result.filter((p) => {
        if (!p.createdAt) return false
        const paymentDate = new Date(p.createdAt).toISOString().split('T')[0]
        return paymentDate >= startDate
      })
    }
    if (endDate && result.length > 0) {
      result = result.filter((p) => {
        if (!p.createdAt) return false
        const paymentDate = new Date(p.createdAt).toISOString().split('T')[0]
        return paymentDate <= endDate
      })
    }
    return result
  }, [payments, search, startDate, endDate])

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
      case 'orderId':
        return payment.orderId
      case 'customer':
        return payment.order?.customer?.name ? payment.order.customer.name.toLowerCase() : ''
      case 'vehicle':
        return payment.order?.vehicle ? `${payment.order.vehicle.brand} ${payment.order.vehicle.model}`.toLowerCase() : ''
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value || 0)
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
    const colors = {
      PAID: 'badge-success',
      PENDING: 'badge-warning',
      FAILED: 'badge-error',
    }
    return colors[status] || 'badge-neutral'
  }

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payments</h1>
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
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-ghost btn-sm" onClick={() => setRefetchKey((k) => k + 1)}>
                <span className="material-symbols-outlined mr-1">refresh</span>
                Refresh
              </button>
            </div>
          </div>
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
                <p className="text-gray-500 dark:text-gray-400">No payments found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                <tr>
                  <th className="cursor-pointer" onClick={() => requestSort('id')}>
                    ID {sortKey === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="cursor-pointer" onClick={() => requestSort('orderId')}>
                      Order ID {sortKey === 'orderId' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('customer')}>
                      Customer {sortKey === 'customer' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('vehicle')}>
                      Vehicle {sortKey === 'vehicle' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('method')}>
                      Method {sortKey === 'method' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('amount')}>
                      Amount {sortKey === 'amount' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('change')}>
                      Change {sortKey === 'change' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('status')}>
                      Status {sortKey === 'status' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('created')}>
                      Date {sortKey === 'created' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((payment) => (
                    <tr key={payment.id}>
                      <td>#{payment.orderId}</td>
                      <td>
                        {payment.order?.customer?.name || `Customer #${payment.order?.customerId}`}
                      </td>
                      <td>
                        {payment.order?.vehicle
                          ? `${payment.order.vehicle.brand} ${payment.order.vehicle.model}`
                          : `Vehicle #${payment.order?.vehicleId}`}
                      </td>
                      <td>{payment.method}</td>
                      <td className="font-medium">{formatCurrency(payment.amount)}</td>
                      <td>{formatCurrency(payment.change)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td>{formatDate(payment.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payments
