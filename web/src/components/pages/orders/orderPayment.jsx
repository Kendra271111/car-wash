import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import orderController from '../../../controllers/orderController.js'
import paymentController from '../../../controllers/paymentController.js'

const OrderPayment = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [order, setOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [amountReceived, setAmountReceived] = useState('')
  const [notes, setNotes] = useState('')

  const subtotal = order?.order_items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0
  const discount = 0
  const total = subtotal - discount
  const change = Number(amountReceived) - total

  useEffect(() => {
    let cancelled = false
    const loadOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await orderController.fetchOrderById(orderId)
        if (!cancelled) setOrder(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load order.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrder()
    return () => { cancelled = true }
  }, [orderId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (!amountReceived || Number(amountReceived) < total) {
        setError('Amount received must be at least the total.')
        return
      }
      await paymentController.createPayment({
        orderId: Number(orderId),
        amount: total,
        change: change > 0 ? change : 0,
        method: paymentMethod,
        status: 'PAID',
      })
      setSuccess(true)
      setTimeout(() => {
        navigate(`/orders/${orderId}`)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className=''>
        <div className="flex flex-row justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment</h1>
            <p>Loading order #{orderId}...</p>
          </div>
          <Link to="/orders" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back to Orders
          </Link>
        </div>
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-lg text-teal-600"></span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className=''>
        <div className="flex flex-row justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment</h1>
            <p className="text-gray-600 dark:text-gray-300">Payment for order #{orderId}</p>
          </div>
          <Link to="/orders" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back to Orders
          </Link>
        </div>
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error || 'Order not found.'}</span>
        </div>
      </div>
    )
  }

  const totalDuration = order.order_items?.reduce((sum, item) => sum + Number(item.duration || 0), 0) || 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment</h1>
          <p className="text-gray-600 dark:text-gray-300">Payment for order #{order.id}</p>
        </div>
        <Link to="/orders" className="btn btn-ghost">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Back to Orders
        </Link>
      </div>

      {success && (
        <div className="alert alert-success">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Payment successful! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h2>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                <p className="text-gray-900 dark:text-white">{order.customer?.name || `Customer #${order.customerId}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle</p>
                <p className="text-gray-900 dark:text-white">
                  {order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model} - ${order.vehicle.plateNumber}` : `Vehicle #${order.vehicleId}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Staff</p>
                <p className="text-gray-900 dark:text-white">{order.staff?.name || `Staff #${order.staffId}`}</p>
              </div>
            </div>
          </div>

          <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-6 mb-2">Services</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item) => (
                  <tr key={item.id}>
                    <td>{item.service?.name || `Service #${item.serviceId}`}</td>
                    <td>{item.duration} min</td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td>${Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="text-right font-semibold">Total Duration</td>
                  <td className="text-right">{totalDuration} min</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Subtotal</span>
                <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Discount</span>
                <span className="text-gray-900 dark:text-white">${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">TOTAL</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
              <div className="flex flex-col gap-2">
                {['CASH', 'QRIS', 'E-MONEY', 'TRANSFER'].map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="radio radio-primary"
                    />
                    <span className="text-gray-900 dark:text-white">{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Received</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter amount received"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Change</label>
              <p className={`text-lg font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${change >= 0 ? change.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                placeholder="Add payment notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Processing...' : 'Mark as Paid'}
              </button>
              <Link to="/orders" className="btn btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderPayment
