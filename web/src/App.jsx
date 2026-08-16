import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router'
import Sidebar from './components/ui/sidebar.jsx'
import Index from './components/index.jsx'
import Orders from './components/pages/orders/orders.jsx'
import CreateOrder from './components/pages/orders/createOrders.jsx'
import EditOrder from './components/pages/orders/editOrders.jsx'
import ViewOrder from './components/pages/orders/viewOrders.jsx'
import Services from './components/pages/services/services.jsx'
import CreateServices from './components/pages/services/createServices.jsx'
import Payments from './components/pages/payments/payments.jsx'
import OrderPayment from './components/pages/orders/orderPayment.jsx'
import History from './components/pages/history.jsx'
import Customers from './components/pages/customers/customers.jsx'
import CreateCustomer from './components/pages/customers/createCustomer.jsx'
import Staff from './components/pages/staff/staff.jsx'
import CreateStaff from './components/pages/staff/createStaff.jsx'
import Vehicles from './components/pages/vehicles/vehicles.jsx'
import CreateVehicle from './components/pages/vehicles/createVehicle.jsx'
import Reports from './components/pages/reports.jsx'
import Settings from './components/pages/settings.jsx'
import Login from './components/pages/auth/Login.jsx'

const RequireAuth = () => {
  const token = localStorage.getItem('token')
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

const GuestOnly = () => {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function App() {
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored === 'dark'
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.classList.remove('dark')
    }
    setThemeReady(true)
  }, [])

  if (!themeReady) return null

  return (
    <Routes>
      <Route path="/login" element={<GuestOnly />}>
        <Route index element={<Login />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={<Index />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/create" element={<CreateOrder />} />
          <Route path="/orders/:id/edit" element={<EditOrder />} />
          <Route path="/orders/:id" element={<ViewOrder />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/create" element={<CreateServices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/:orderId" element={<OrderPayment />} />
          <Route path="/history" element={<History />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/create" element={<CreateCustomer />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/staff/create" element={<CreateStaff />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/create" element={<CreateVehicle />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
