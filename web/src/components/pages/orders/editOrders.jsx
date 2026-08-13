import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import orderController from '../../../controllers/orderController.js'
import serviceController from '../../../controllers/serviceController.js'
import vehicleController from '../../../controllers/vehicleController.js'
import customerController from '../../../controllers/customerController.js'
import staffController from '../../../controllers/staffController.js'
import useCartStore from '../../../stores/cartStore.js'
import SearchableSelect from '../../../components/ui/searchableSelect.jsx'

const EditOrders = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [services, setServices] = useState([])
  const [fetchingServices, setFetchingServices] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [fetchingVehicles, setFetchingVehicles] = useState(true)
  const [customers, setCustomers] = useState([])
  const [fetchingCustomers, setFetchingCustomers] = useState(true)
  const [staffList, setStaffList] = useState([])
  const [fetchingStaff, setFetchingStaff] = useState(true)

  const user = (() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })()

  const canDelete = user?.role === 'ADMIN'

  const [form, setForm] = useState({
    vehicleId: '',
    customerId: '',
    staffId: '',
    status: 'PENDING',
    note: '',
  })

  const cartItems = useCartStore((s) => s.items) || []
  const setServiceOptions = useCartStore((s) => s.setServiceOptions)
  const addEmptyItem = useCartStore((s) => s.addEmptyItem)
  const selectService = useCartStore((s) => s.selectService)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const setItems = useCartStore((s) => s.setItems)
  const totalAmount = useCartStore((s) => s.totalAmount)
  const totalItems = useCartStore((s) => s.totalItems)
  const totalDuration = useCartStore((s) => s.totalDuration)

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  useEffect(() => {
    let cancelled = false
    const loadVehicles = async () => {
      setFetchingVehicles(true)
      try {
        const data = await vehicleController.fetchVehicles()
        if (!cancelled) setVehicles(data)
      } catch (err) {
        console.error('Failed to load vehicles:', err)
      } finally {
        if (!cancelled) setFetchingVehicles(false)
      }
    }
    loadVehicles()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadCustomers = async () => {
      setFetchingCustomers(true)
      try {
        const data = await customerController.fetchCustomers()
        if (!cancelled) setCustomers(data)
      } catch (err) {
        console.error('Failed to load customers:', err)
      } finally {
        if (!cancelled) setFetchingCustomers(false)
      }
    }
    loadCustomers()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadStaff = async () => {
      setFetchingStaff(true)
      try {
        const data = await staffController.getStaff()
        if (!cancelled) setStaffList(data)
      } catch (err) {
        console.error('Failed to load staff:', err)
      } finally {
        if (!cancelled) setFetchingStaff(false)
      }
    }
    loadStaff()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadServices = async () => {
      setFetchingServices(true)
      try {
        const data = await serviceController.fetchServices()
        if (!cancelled) {
          setServices(data)
          setServiceOptions(data)
        }
      } catch (err) {
        console.error('Failed to load services:', err)
      } finally {
        if (!cancelled) setFetchingServices(false)
      }
    }
    loadServices()
    return () => { cancelled = true }
  }, [setServiceOptions])

  useEffect(() => {
    let cancelled = false
    const loadOrder = async () => {
      setFetching(true)
      setError(null)
      try {
        const order = await orderController.fetchOrderById(id)
        if (!cancelled) {
          setForm({
            vehicleId: String(order.vehicleId),
            customerId: String(order.customerId),
            staffId: order.staffId ? String(order.staffId) : '',
            status: order.status || 'PENDING',
            note: order.note || '',
          })
          if (order.order_items && order.order_items.length > 0) {
            const items = order.order_items.map((item) => ({
              serviceId: item.serviceId,
              service: item.service?.name || '',
              duration: item.duration,
              price: item.price,
              quantity: item.qty,
              subtotal: item.subtotal,
              empty: false,
            }))
            setItems(items)
          } else {
            clearCart()
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load order.')
      } finally {
        if (!cancelled) setFetching(false)
      }
    }
    loadOrder()
    return () => { cancelled = true }
  }, [id, setItems, clearCart])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const validItems = cartItems.filter((item) => !item.empty && item.serviceId)
      if (validItems.length === 0) {
        setError('Please add at least one service.')
        return
      }
      const orderData = {
        vehicleId: Number(form.vehicleId),
        customerId: Number(form.customerId),
        staffId: Number(form.staffId),
        status: form.status,
        note: form.note,
        items: validItems.map((item) => ({
          serviceId: item.serviceId,
          duration: Number(item.duration),
          amount: item.subtotal,
          price: item.price,
          qty: item.quantity,
          subtotal: item.subtotal,
        })),
      }
      await orderController.updateOrder(id, orderData)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    setLoading(true)
    setError(null)
    try {
      await orderController.deleteOrder(id)
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order.')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className=''>
        <div className="flex flex-row justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Order</h1>
            <p className="text-gray-600 dark:text-gray-300">Loading order #{id}...</p>
          </div>
          <Link to="/orders" className="btn btn-ghost">
            <span className="material-symbols-outlined mr-1">arrow_back</span>
            Back to Orders
          </Link>
        </div>
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="p-8 text-center">
            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className=''>
      <div className="flex flex-row justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Order</h1>
          <p className="text-gray-600 dark:text-gray-300">Update order #{id}.</p>
        </div>
        <Link to="/orders" className="btn btn-ghost">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Back to Orders
        </Link>
      </div>

      {success && (
        <div className="alert alert-success mb-4">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Order updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h2>
          <div className="flex-col flex gap-4">
            <div className='w-full flex flex-row gap-5'>
              <div className='w-full'>
                <SearchableSelect
                  label="Vehicle"
                  options={vehicles}
                  value={form.vehicleId}
                  onChange={(value) => updateField('vehicleId', value)}
                  placeholder="Select vehicle"
                  getOptionLabel={(vehicle) => `${vehicle.name} - ${vehicle.plateNumber}`}
                  required
                />
              </div>
              <div className='w-full'>
                <SearchableSelect
                  label="Customer"
                  options={customers}
                  value={form.customerId}
                  onChange={(value) => updateField('customerId', value)}
                  placeholder="Select customer"
                  getOptionLabel={(customer) => `${customer.name} (${customer.email})`}
                  required
                />
              </div>
              <div className='w-full'>
                <SearchableSelect
                  label="Staff"
                  options={staffList}
                  value={form.staffId}
                  onChange={(value) => updateField('staffId', value)}
                  placeholder="Select staff"
                  getOptionLabel={(staff) => `${staff.name}${staff.position ? ` - ${staff.position}` : ''}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
              >
                <option value="PENDING">Waiting</option>
                <option value="PROCESSING">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
          <div className="flex flex-row justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Services</h2>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => addEmptyItem()}
            >
              <span className="material-symbols-outlined mr-1">add</span>
              Add
            </button>
          </div>

          {fetchingServices ? (
            <div className="p-8 text-center">
              <span className="loading loading-spinner loading-lg text-indigo-600"></span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Duration (min)</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 dark:text-gray-400 py-4">
                        No services added yet. Click "Add" to add a service.
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.empty ? (
                            <select
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                              value=""
                              onChange={(e) => {
                                const service = services.find((s) => s.id === Number(e.target.value))
                                if (service) {
                                  selectService(index, service)
                                }
                              }}
                              autoFocus
                            >
                              <option value="" disabled>Select a service...</option>
                              {services?.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-medium">{item.service}</span>
                          )}
                        </td>
                        <td>
                          {item.empty ? '-' : item.duration}
                        </td>
                        <td>
                          {item.empty ? '-' : item.price.toFixed(2)}
                        </td>
                        <td>
                          {!item.empty && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square"
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                              >
                                <span className="material-symbols-outlined">remove</span>
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm btn-square"
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                              >
                                <span className="material-symbols-outlined">add</span>
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          {item.empty ? '-' : <span className="font-medium">{item.subtotal.toFixed(2)}</span>}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-square text-error"
                            onClick={() => removeItem(index)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className='flex flex-col gap-2 mt-5'>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
            <input
              type='text'
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
              value={form.note}
              onChange={(e) => updateField('note', e.target.value)}
              placeholder='Add any notes for this order...'
            />
          </div>

          <div className="flex gap-10 flex-row justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems()}</p>
              </div>
            </div>
            <div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDuration()} min</p>
              </div>
            </div>
            <div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAmount().toFixed(2)}</p>
                {totalItems() > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{totalItems()} service(s)</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link to="/orders" className="btn btn-ghost">Cancel</Link>
          {canDelete && (
            <button type="button" className="btn btn-error" onClick={handleDelete} disabled={loading}>
              Delete Order
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading || cartItems.length === 0}>
            {loading ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditOrders
