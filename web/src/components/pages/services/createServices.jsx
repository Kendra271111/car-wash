import { useState } from 'react'
import { Link } from 'react-router'
import serviceController from '../../../controllers/serviceController.js'

const CreateServices = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name: '',
    duration: '',
    price: '',
  })

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await serviceController.createService({
        name: form.name,
        duration: Number(form.duration),
        price: Number(form.price),
      })
      setSuccess(true)
      setForm({ name: '', duration: '', price: '' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const responseData = err?.response?.data
      const msg = responseData?.message || err?.message || 'Failed to create service.'
      console.error('Create service error:', err)
      console.error('Response data:', responseData)
      setError(`${msg}${responseData?.errors ? ` | ${JSON.stringify(responseData.errors)}` : ''}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Service</h1>
          <p className="text-gray-600 dark:text-gray-300">Create a new car wash service.</p>
        </div>
        <Link to="/services" className="btn btn-ghost">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Back to Services
        </Link>
      </div>

      {success && (
        <div className="alert alert-success">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Service created successfully!</span>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter service name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter duration"
                value={form.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                required
              />
            </div>
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter price"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateServices
