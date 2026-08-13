import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import paymentController from '../../controllers/paymentController.js'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchKey, setRefetchKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const loadPayments = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await paymentController.fetchPayments()
        if (!cancelled) setPayments(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load payments.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadPayments()
    return () => { cancelled = true }
  }, [refetchKey])

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
          <button className="btn btn-ghost btn-sm" onClick={() => setRefetchKey((k) => k + 1)}>
            <span className="material-symbols-outlined mr-1">refresh</span>
            Refresh
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
            ) : payments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No payments found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Change</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
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
