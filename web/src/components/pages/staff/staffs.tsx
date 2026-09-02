import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router'
import staffController from '../../../controllers/staffController'
import type { Staff } from '../../../types'

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

type StaffSortKey = 'id' | 'name' | 'email' | 'phone' | 'position' | 'status'

const Staffs = () => {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [sortKey, setSortKey] = useState<StaffSortKey>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    let cancelled = false
    const loadStaff = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await staffController.getStaff(search)
        if (!cancelled) setStaff(data)
      } catch (err: any) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load staff.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadStaff()
    return () => {
      cancelled = true
    }
  }, [search])

  const filtered = useMemo(() => {
    if (!search) return staff
    const q = search.toLowerCase()
    return staff.filter((s) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    )
  }, [staff, search])

  const requestSort = (key: StaffSortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc'
    }
    setSortKey(key)
    setSortDirection(direction)
  }

  const getSortValue = (member: Staff, key: StaffSortKey): string | number => {
    switch (key) {
      case 'id':
        return member.id
      case 'name':
        return (member.name || '').toLowerCase()
      case 'email':
        return (member.email || '').toLowerCase()
      case 'phone':
        return (member.phone || '').toLowerCase()
      case 'position':
        return (member.position || '').toLowerCase()
      case 'status':
        return member.isActive ? 'active' : 'inactive'
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Staffs</h1>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-64"
              placeholder="Search staffs..."
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
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
      </div>

      <div className="card bg-white dark:bg-gray-950 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <span className="loading loading-spinner loading-lg text-teal-600"></span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading staffs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-3">badge</span>
              <p className="text-gray-500 dark:text-gray-400">No staffs found.</p>
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
                  <th className="cursor-pointer select-none" onClick={() => requestSort('email')}>
                    <div className="flex items-center gap-1">Email <SortIndicator active={sortKey === 'email'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('phone')}>
                    <div className="flex items-center gap-1">Phone <SortIndicator active={sortKey === 'phone'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('position')}>
                    <div className="flex items-center gap-1">Position <SortIndicator active={sortKey === 'position'} direction={sortDirection} /></div>
                  </th>
                  <th className="cursor-pointer select-none" onClick={() => requestSort('status')}>
                    <div className="flex items-center gap-1">Status <SortIndicator active={sortKey === 'status'} direction={sortDirection} /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((member) => (
                  <tr key={member.id} className={`hover ${!member.isActive ? 'opacity-50' : ''}`}>
                    <td className="font-mono text-sm">{member.id}</td>
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
  )
}

export default Staffs
