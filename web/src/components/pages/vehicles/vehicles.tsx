import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import vehicleController from '../../../controllers/vehicleController'
import type { Vehicle } from '../../../types'

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

type VehicleSortKey = 'id' | 'name' | 'plateNumber' | 'brand' | 'model'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [sortKey, setSortKey] = useState<VehicleSortKey>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    let cancelled = false
    const loadVehicles = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await vehicleController.fetchVehicles(search)
        if (!cancelled) setVehicles(data)
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load vehicles.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadVehicles()
    return () => {
      cancelled = true
    }
  }, [search])

  const filtered = useMemo(() => {
    if (!search) return vehicles
    const q = search.toLowerCase()
    return vehicles.filter(
      (v) =>
        (v.name || '').toLowerCase().includes(q) ||
        (v.plateNumber || '').toLowerCase().includes(q) ||
        (v.brand || '').toLowerCase().includes(q) ||
        (v.model || '').toLowerCase().includes(q)
    )
  }, [vehicles, search])

  const requestSort = (key: VehicleSortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (vehicle: Vehicle, key: VehicleSortKey): string | number => {
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
    <div className="flex flex-col gap-6">
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
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
      </div>

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-teal-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading vehicles...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">directions_car</span>
              <p className="text-gray-500 dark:text-gray-400">No vehicles found.</p>
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
                  <th className="cursor-pointer select-none" onClick={() => requestSort('plateNumber')}>
                    <div className="flex items-center gap-1">Plate Number <SortIndicator active={sortKey === 'plateNumber'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('brand')}>
                    <div className="flex items-center gap-1">Brand <SortIndicator active={sortKey === 'brand'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('model')}>
                    <div className="flex items-center gap-1">Model <SortIndicator active={sortKey === 'model'} direction={sortDirection} /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((vehicle) => (
                  <tr key={vehicle.id} className="hover">
                    <td className="font-mono text-sm">{vehicle.id}</td>
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
  )
}

export default Vehicles
