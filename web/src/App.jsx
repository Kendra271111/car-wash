import { Routes, Route, Navigate, Outlet } from 'react-router'
import Sidebar from './components/ui/sidebar.jsx'
import Index from './components/index.jsx'
import Orders from './components/pages/orders/orders.jsx'
import CreateOrder from './components/pages/orders/createOrders.jsx'
import Services from './components/pages/services/services.jsx'
import CreateServices from './components/pages/services/createServices.jsx'
import Payments from './components/pages/payments.jsx'
import History from './components/pages/history.jsx'
import Customers from './components/pages/customers/customers.jsx'
import CreateCustomer from './components/pages/customers/createCustomer.jsx'
import Vehicles from './components/pages/vehicles/vehicles.jsx'
import CreateVehicle from './components/pages/vehicles/createVehicle.jsx'
import Reports from './components/pages/reports.jsx'
import Settings from './components/pages/settings.jsx'
import Login from './components/pages/login.jsx'

const RequireAuth = () => {
  const token = localStorage.getItem('token')
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

const GuestOnly = () => {
  const token = localStorage.getItem('token')
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function App() {
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
          <Route path="/services" element={<Services />} />
          <Route path="/services/create" element={<CreateServices />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/history" element={<History />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/create" element={<CreateCustomer />} />
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
