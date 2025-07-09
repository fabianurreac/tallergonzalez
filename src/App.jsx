import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import Layout from './components/Layout/Layout'
import UserManagement from './pages/UserManagement'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import Employees from './pages/Employees'
import Inventory from './pages/Inventory'
import Profile from './pages/Profile'
import Reports from './pages/Reports'
import Reservations from './pages/Reservations'
import Settings from './pages/Settings'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas con layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="employees" element={<Employees />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="profile" element={<Profile />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="settings" element={<Settings />} />
              
             </Route>

            {/* Ruta catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App