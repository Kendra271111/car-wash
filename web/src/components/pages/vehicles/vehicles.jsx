import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import vehicleController from '../../../controllers/vehicleController.js'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')

  useEffect(() => {
    let cancelled = false
    const loadVehicles = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await vehicleController.fetchVehicles(search)
        if (!cancelled) setVehicles(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load vehicles.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadVehicles()
    return () => { cancelled = true }
  }, [search])

  const filtered = useMemo(() => {
    if (!search) return vehicles
    const q = search.toLowerCase()
    return vehicles.filter((v) =>
      (v.name || '').toLowerCase().includes(q) ||
      (v.plateNumber || '').toLowerCase().includes(q) ||
      (v.brand || '').toLowerCase().includes(q) ||
      (v.model || '').toLowerCase().includes(q)
    )
  }, [vehicles, search])

  const requestSort = (key) => {
    let direction = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (vehicle, key) => {
    switch (key) {
      case 'id':
        return vehicle.id
      case 'name':
        return (vehicle.name || '').toLowerCase()
      case 'plateNumber':
        return (vehicle.plateNumber || '').toLowerCase()
      case 'brand':
        return (vehicle.brand || '').toLowerCase()
      case 'model':
        return (vehicle.model || '').toLowerCase()
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Vehicles</h1>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-64"
              placeholder="Search vehicles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link to="/vehicles/create" className="btn btn-primary btn-sm">Add Vehicle</Link>
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
                <p className="text-gray-500 dark:text-gray-400">No vehicles found.</p>
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
                    <th className="cursor-pointer" onClick={() => requestSort('plateNumber')}>
                      Plate Number {sortKey === 'plateNumber' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('brand')}>
                      Brand {sortKey === 'brand' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th className="cursor-pointer" onClick={() => requestSort('model')}>
                      Model {sortKey === 'model' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.id}</td>
                      <td>{vehicle.name}</td>
                      <td>{vehicle.plateNumber}</td>
                      <td>{vehicle.brand}</td>
                      <td>{vehicle.model}</td>
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

export default Vehicles
