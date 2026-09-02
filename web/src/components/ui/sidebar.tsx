import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router'
import authController from '../../controllers/authController'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: 'home' },
  { href: '/orders', label: 'Orders', icon: 'local_car_wash' },
  { href: '/customers', label: 'Customers', icon: 'people' },
  { href: '/staff', label: 'Staffs', icon: 'badge' },
  { href: '/vehicles', label: 'Vehicles', icon: 'directions_car' },
  { href: '/services', label: 'Services', icon: 'handyman' },
  { href: '/history', label: 'Order History', icon: 'restore' },
  { href: '/payments', label: 'Payments', icon: 'credit_card' },
  { href: '/reports', label: 'Reports', icon: 'data_thresholding' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
]

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const location = useLocation()
  const navigate = useNavigate()
  const activeLink = location.pathname
  const isAuthenticated = !!localStorage.getItem('token')

  const handleLogout = () => {
    authController.logout()
    navigate('/login')
  }

  const isActive = (href: string) =>
    href === '/' ? activeLink === '/' || activeLink === '/dashboard' : activeLink === href

  const linkClasses = (href: string) => {
    const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 border-l-4'
    if (isActive(href)) {
      return `${base} bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border-teal-600`
    }
    return `${base} text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/60 border-transparent`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        <div className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 dark:border-gray-800 dark:bg-gray-950 transition-all duration-300 ease-in-out shadow-sm z-50 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${collapsed ? 'w-16' : 'w-64'}`}>
          <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            {!collapsed ? (
              <Link to="/dashboard" className="flex items-center gap-3 flex-1 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                  <span className="material-symbols-outlined text-xl">directions_car</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-tight">WASHINGTON</span>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-tight">Car Wash</span>
                </div>
              </Link>
            ) : (
              <div className="flex-1 flex justify-center">
                <Link to="/dashboard" className="group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
                    <span className="material-symbols-outlined text-xl">directions_car</span>
                  </div>
                </Link>
              </div>
            )}
            <div className="flex items-center">
              <button 
                className="hidden lg:flex p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                onClick={() => setCollapsed(!collapsed)}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <span className="material-symbols-outlined text-xl text-gray-500 dark:text-gray-400">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
              </button>
              <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setMobileOpen(false)}>
                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
              </button>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="w-full">
              <nav className="menu p-3 w-full">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link 
                      to={item.href} 
                      className={linkClasses(item.href)}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="material-symbols-outlined text-xl">{item.icon}</span>
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </nav>
              <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                <button 
                  onClick={handleLogout} 
                  className="btn btn-ghost btn-sm w-full justify-start gap-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  title={collapsed ? 'Logout' : undefined}
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  {!collapsed && <span className="font-medium">Logout</span>}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              {!collapsed ? (
                <Link to="/login" className="btn btn-primary w-full">Sign In</Link>
              ) : (
                <div className="flex justify-center">
                  <Link to="/login" className="btn btn-primary btn-square" title="Sign In">
                    <span className="material-symbols-outlined">login</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800 lg:hidden">
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setMobileOpen(true)}>
              <span className="material-symbols-outlined text-xl text-gray-600 dark:text-gray-300">menu</span>
            </button>
            <span className="font-semibold text-gray-900 dark:text-white tracking-tight">WASHINGTON</span>
          </header>
          <main className="p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
