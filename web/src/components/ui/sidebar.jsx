import { useState } from 'react'
import { Link, useLocation } from 'react-router'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/orders', label: 'Orders', icon: 'local_car_wash' },
  { href: '/customers', label: 'Customers', icon: 'people' },
  { href: '/vehicles', label: 'Vehicles', icon: 'directions_car' },
  { href: '/services', label: 'Services', icon: 'handyman' },
  { href: '/history', label: 'Order History', icon: 'restore' },
  { href: '/payments', label: 'Payments', icon: 'credit_card' },
  { href: '/reports', label: 'Reports', icon: 'data_thresholding' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

const Sidebar = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const activeLink = location.pathname

  const isActive = (href) =>
    href === '/' ? activeLink === '/' || activeLink === '/dashboard' : activeLink === href

  const linkClasses = (href) =>
    isActive(href)
      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border-l-4 border-indigo-600'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 border-l-4 border-transparent'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <div className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-white border-r border-gray-200 dark:border-gray-800 dark:bg-gray-950 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">C</div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">CarWash</span>
            </div>
            <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="menu p-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className={linkClasses(item.href)}>
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </nav>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 lg:hidden">
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setMobileOpen(true)}>
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">CarWash</span>
          </header>
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
