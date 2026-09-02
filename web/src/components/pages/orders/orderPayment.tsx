import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import orderController from '../../../controllers/orderController'
import paymentController from '../../../controllers/paymentController'
import type { Order } from '../../../types'

const formatCurrency = (value: number | string) =>
  `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

interface DetailItemProps {
  label: string
  value: string
}

const DetailItem = ({ label, value }: DetailItemProps) => (
  <div>
    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className="font-medium text-gray-900 dark:text-white break-words">{value}</p>
  </div>
)

const OrderPayment = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH')
  const [amountReceived, setAmountReceived] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  const subtotal = order?.order_items?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0
  const total = subtotal
  const change = Number(amountReceived) - total

  useEffect(() => {
    if (!orderId) return
    let cancelled = false
    const loadOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await orderController.fetchOrderById(orderId)
        if (!cancelled) setOrder(data)
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load order.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadOrder()
    return () => {
      cancelled = true
    }
  }, [orderId])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!orderId) return
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
        notes: notes || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate(`/orders/${orderId}`)
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment</h1>
            <p className="text-gray-600 dark:text-gray-300">Loading order #{orderId}...</p>
          </div>
          <Link to="/orders" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back to Orders
          </Link>
        </div>
        <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-12 text-center">
            <span className="loading loading-spinner loading-lg text-teal-600"></span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-row justify-between items-center">
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
    <div className="flex flex-col gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customer, vehicle, and service breakdown</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <DetailItem label="Customer" value={order.customer?.name || `Customer #${order.customerId}`} />
              <DetailItem label="Vehicle" value={order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model} - ${order.vehicle.plateNumber}` : `Vehicle #${order.vehicleId}`} />
              <DetailItem label="Staff" value={order.staff?.name || `Staff #${order.staffId}`} />
            </div>

            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Services</h3>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                    <th className="text-center py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items?.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <td className="py-3 text-sm text-gray-900 dark:text-white">{item.service?.name || `Service #${item.serviceId}`}</td>
                      <td className="py-3 text-sm text-center text-gray-600 dark:text-gray-300">{item.duration} min</td>
                      <td className="py-3 text-sm text-right text-gray-600 dark:text-gray-300">{formatCurrency(item.price)}</td>
                      <td className="py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={2} className="text-right py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Total Duration</td>
                    <td className="text-right py-3 text-sm text-gray-600 dark:text-gray-300">{totalDuration} min</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Summary</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete the payment below</p>
          </div>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Discount</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-base font-bold text-gray-900 dark:text-white">TOTAL</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {['CASH', 'QRIS', 'E-MONEY', 'TRANSFER'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all truncate ${paymentMethod === method ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'}`}
                    >
                      {method}
                    </button>
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
                <p className={`text-lg font-bold ${change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(change >= 0 ? change : 0)}
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
                <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Processing...' : 'Mark as Paid'}
                </button>
                <Link to="/orders" className="btn btn-ghost w-full">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderPayment
