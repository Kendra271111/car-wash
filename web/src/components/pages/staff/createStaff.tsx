import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router'
import staffController from '../../../controllers/staffController'

interface StaffFormState {
  name: string
  email: string
  phone: string
  position: string
  isActive: boolean
}

const CreateStaff = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const [form, setForm] = useState<StaffFormState>({
    name: '',
    email: '',
    phone: '',
    position: '',
    isActive: true,
  })

  const formRef = useRef<StaffFormState>(form)
  useEffect(() => {
    formRef.current = form
  })

  const updateField = <K extends keyof StaffFormState>(field: K, value: StaffFormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await staffController.createStaff({
        name: formRef.current.name,
        email: formRef.current.email,
        phone: formRef.current.phone,
        position: formRef.current.position,
        isActive: formRef.current.isActive,
      })
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', position: '', isActive: true })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create staff.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Staff</h1>
          <p className="text-gray-600 dark:text-gray-300">Create a new staff account.</p>
        </div>
        <Link to="/staff" className="btn btn-ghost">
          <span className="material-symbols-outlined mr-1">arrow_back</span>
          Back to Staffs
        </Link>
      </div>

      {success && (
        <div className="alert alert-success">
          <span className="material-symbols-outlined">check_circle</span>
          <span>Staff created successfully!</span>
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
          <div className="w-full flex flex-row gap-5">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter staff name"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="w-full flex flex-row gap-5">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter position"
                value={form.position}
                onChange={(e) => updateField('position', e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-gray-800 dark:text-white"
              value={String(form.isActive)}
              onChange={(e) => updateField('isActive', e.target.value === 'true')}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateStaff
