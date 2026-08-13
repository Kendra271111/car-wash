import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import staffController from '../../../controllers/staffController.js'

const Staff = () => {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    const loadStaff = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await staffController.getStaff(search)
        if (!cancelled) setStaff(data)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load staff.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadStaff()
    return () => { cancelled = true }
  }, [search])

  const filtered = useMemo(() => {
    if (!search) return staff
    const q = search.toLowerCase()
    return staff.filter((s) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
  }, [staff, search])

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Staff</h1>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-64"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Link to="/staff/create" className="btn btn-primary btn-sm">Add Staff</Link>
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
                <p className="text-gray-500 dark:text-gray-400">No staff found.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Position</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member) => (
                    <tr key={member.id}>
                      <td>{member.id}</td>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.phone || '-'}</td>
                      <td>{member.position || '-'}</td>
                      <td>
                        <span className={`badge ${member.isActive ? 'badge-success' : 'badge-error'}`}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
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

export default Staff
