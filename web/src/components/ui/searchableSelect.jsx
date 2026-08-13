import { useState, useRef, useEffect } from 'react'

const SearchableSelect = ({ label, options, value, onChange, placeholder, getOptionLabel}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  const selected = options.find((o) => String(o.id) === String(value))

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setQuery('')
  }, [value])

  const filtered = options.filter((o) =>
    String(getOptionLabel ? getOptionLabel(o) : o.name || o.plateNumber || o.phone || '')
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <div className='w-full relative' ref={ref}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <button
        type="button"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white text-left flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? '' : 'text-gray-400'}>
          {selected ? (getOptionLabel ? getOptionLabel(selected) : selected.name || selected.plateNumber) : placeholder}
        </span>
        <span className="material-symbols-outlined text-gray-400">expand_more</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white text-sm"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No results found</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    String(option.id) === String(value) ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-gray-900 dark:text-white'
                  }`}
                  onClick={() => {
                    onChange(String(option.id))
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  {getOptionLabel ? getOptionLabel(option) : option.name || option.plateNumber}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
