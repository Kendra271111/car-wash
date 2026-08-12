import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import serviceController from '../../../controllers/serviceController.js'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loadServices = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await serviceController.fetchServices()
        if (!cancelled) setServices(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load services.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadServices()
    return () => { cancelled = true }
  }, [])

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Services</h1>
          <Link to="/services/create" className="btn btn-primary">Add Service</Link>
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
            ) : services.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No services found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Duration (min)</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
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
