import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import serviceController from '../../../controllers/serviceController.js'

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
    <div>
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
                <p className="text-gray-500 dark:text-gray-400">No services found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                <tr>
                  <th className="cursor-pointer" onClick={() => requestSort('id')}>
                    ID {sortKey === 'id' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="cursor-pointer" onClick={() => requestSort('name')}>
                      Name {sortKey === 'name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('duration')}>
                      Duration (min) {sortKey === 'duration' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('price')}>
                      Price {sortKey === 'price' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((service) => (
                    <tr key={service.id}>
                      <td>{service.id}</td>
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
    </div>
  )
}

export default Services
