import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import vehicleController from '../../../controllers/vehicleController.js'

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loadVehicles = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await vehicleController.fetchVehicles()
        if (!cancelled) setVehicles(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load vehicles.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadVehicles()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Vehicles</h1>
          <Link to="/vehicles/create" className="btn btn-primary">Add Vehicle</Link>
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
            ) : vehicles.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No vehicles found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Plate Number</th>
                    <th>Brand</th>
                    <th>Model</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
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
