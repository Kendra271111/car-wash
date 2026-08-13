import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import customerController from '../../../controllers/customerController.js'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadCustomers = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await customerController.fetchCustomers(search)
        if (!cancelled) setCustomers(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load customers.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadCustomers()
    return () => { cancelled = true }
  }, [search])

  const filtered = useMemo(() => {
    if (!search) return customers
    const q = search.toLowerCase()
    return customers.filter((c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    )
  }, [customers, search])

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Customers</h1>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-64"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link to="/customers/create" className="btn btn-primary btn-sm">Add Customer</Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="card bg-white dark:bg-gray-950 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <span className="loading loading-spinner loading-lg text-indigo-600"></span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No customers found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
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

export default Customers
