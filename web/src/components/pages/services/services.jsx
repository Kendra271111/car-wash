import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import serviceController from '../../../controllers/serviceController.js'

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

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    let cancelled = false
    const loadServices = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await serviceController.fetchServices(search)
        if (!cancelled) setServices(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load services.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadServices()
    return () => { cancelled = true }
  }, [search])

  const filtered = useMemo(() => {
    if (!search) return services
    const q = search.toLowerCase()
    return services.filter((s) => (s.name || '').toLowerCase().includes(q))
  }, [services, search])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (service, key) => {
    switch (key) {
      case 'id':
        return service.id
      case 'name':
        return (service.name || '').toLowerCase()
      case 'duration':
        return Number(service.duration || 0)
      case 'price':
        return Number(service.price || 0)
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Services</h1>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-64"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link to="/services/create" className="btn btn-primary btn-sm">Add Service</Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
      </div>

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-indigo-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading services...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">local_car_wash</span>
              <p className="text-gray-500 dark:text-gray-400">No services found.</p>
            </div>
          ) : (
            <table className="table table-zebra">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('id')}>
                    <div className="flex items-center gap-1">ID <SortIndicator active={sortKey === 'id'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-1">Name <SortIndicator active={sortKey === 'name'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('duration')}>
                    <div className="flex items-center gap-1">Duration (min) <SortIndicator active={sortKey === 'duration'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('price')}>
                    <div className="flex items-center gap-1">Price <SortIndicator active={sortKey === 'price'} direction={sortDirection} /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((service) => (
                  <tr key={service.id} className="hover">
                    <td className="font-mono text-sm">{service.id}</td>
                    <td>{service.name}</td>
                    <td>{service.duration}</td>
                    <td>${Number(service.price).toFixed(2)}</td>
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

export default Services
