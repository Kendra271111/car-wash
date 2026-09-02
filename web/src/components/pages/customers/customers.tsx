import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import customerController from '../../../controllers/customerController'
import type { Customer } from '../../../types'

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

type SortKey = 'id' | 'name' | 'email' | 'phone'

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    let cancelled = false
    const loadCustomers = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await customerController.fetchCustomers(search)
        if (!cancelled) setCustomers(data)
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load customers.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadCustomers()
    return () => {
      cancelled = true
    }
  }, [search])

  const filtered = useMemo(() => {
    if (!search) return customers
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    )
  }, [customers, search])

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (customer: Customer, key: SortKey): string | number => {
    switch (key) {
      case 'id':
        return customer.id
      case 'name':
        return (customer.name || '').toLowerCase()
      case 'email':
        return (customer.email || '').toLowerCase()
      case 'phone':
        return String(customer.phone || '').toLowerCase()
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

  return (
    <div className="flex flex-col gap-6">
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
            <Link to="/customers/create" className="btn btn-primary btn-sm">
              Add Customer
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-teal-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading customers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">
                group
              </span>
              <p className="text-gray-500 dark:text-gray-400">No customers found.</p>
            </div>
          ) : (
            <table className="table table-zebra">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('id')}>
                    <div className="flex items-center gap-1">
                      ID <SortIndicator active={sortKey === 'id'} direction={sortDirection} />
                    </div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-1">
                      Name <SortIndicator active={sortKey === 'name'} direction={sortDirection} />
                    </div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('email')}>
                    <div className="flex items-center gap-1">
                      Email <SortIndicator active={sortKey === 'email'} direction={sortDirection} />
                    </div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('phone')}>
                    <div className="flex items-center gap-1">
                      Phone <SortIndicator active={sortKey === 'phone'} direction={sortDirection} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((customer) => (
                  <tr key={customer.id} className="hover">
                    <td className="font-mono text-sm">{customer.id}</td>
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
  )
}

export default Customers
