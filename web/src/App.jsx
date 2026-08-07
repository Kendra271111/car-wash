import { Routes, Route } from 'react-router'
import Sidebar from './components/ui/sidebar.jsx'
import Index from './components/index.jsx'
import Orders from './components/pages/orders.jsx'
import Services from './components/pages/services.jsx'
import Payments from './components/pages/payments.jsx'
import History from './components/pages/history.jsx'
import Customers from './components/pages/customers.jsx'
import Vehicles from './components/pages/vehicles.jsx'
import Reports from './components/pages/reports.jsx'
import Settings from './components/pages/settings.jsx'

function App() {
  return (
    <Sidebar>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Index />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/services" element={<Services />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/history" element={<History />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Sidebar>
  )
}

export default App
