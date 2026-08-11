import { useState } from 'react'
import { Link } from 'react-router'
import vehicleController from '../../../controllers/vehicleController.js'

const CreateVehicle = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    plateNumber: '',
    brand: '',
    model: '',
    customerId: '',
  })

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await vehicleController.createVehicle({
        name: form.name,
        plateNumber: form.plateNumber,
        brand: form.brand,
        model: form.model,
        customerId: Number(form.customerId),
      })
      setSuccess(true)
      setForm({ name: '', plateNumber: '', brand: '', model: '', customerId: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create vehicle.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Vehicle</h1>
          <p className="text-gray-600 dark:text-gray-300">Add a new vehicle to the system.</p>
        </div>
        <Link to="/vehicles" className="btn btn-ghost">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Back to Vehicles
        </Link>
      </div>

      {success && (
        <div className="alert alert-success">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Vehicle created successfully!</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-white dark:bg-gray-950 p-4 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className='w-full flex flex-row gap-5'>
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vehicle Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter vehicle name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plate Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter plate number"
                value={form.plateNumber}
                onChange={(e) => updateField('plateNumber', e.target.value)}
                required
              />
            </div>
          </div>
          <div className='w-full flex flex-row gap-5'>
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter brand"
                value={form.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                required
              />
            </div>
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter model"
                value={form.model}
                onChange={(e) => updateField('model', e.target.value)}
                required
              />
            </div>
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer ID</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter customer ID"
                value={form.customerId}
                onChange={(e) => updateField('customerId', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateVehicle
