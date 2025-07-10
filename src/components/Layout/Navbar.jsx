import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlerts } from '../../hooks/useAlerts'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, userRole, signOut } = useAuth()
  const { unreadCount } = useAlerts()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false) // ✅ Estado para loading logout
  const dropdownRef = useRef(null) // ✅ Ref para cerrar dropdown
  const navigate = useNavigate()

  // ✅ Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // ✅ Manejo mejorado del signOut
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      setDropdownOpen(false)
      
      await signOut()
      
      // La redirección se manejará automáticamente por el Layout
      // cuando detecte que user es null
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // En caso de error, intentar navegar manualmente
      navigate('/login', { replace: true })
    } finally {
      setIsSigningOut(false)
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'superadmin':
        return 'Super Administrador'
      case 'almacenista':
        return 'Almacenista'
      default:
        return 'Usuario'
    }
  }

  return (
    <nav className="bg-white shadow-lg border-b border-secondary-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Botón del menú móvil */}
            <button
              type="button"
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-secondary-500 hover:text-secondary-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              disabled={isSigningOut} // ✅ Deshabilitar durante logout
            >
              <span className="sr-only">Abrir menú</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo y título */}
            <div className="flex items-center ml-4 lg:ml-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNEQzI2MjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiNGRkZGRkYiPgo8cGF0aCBkPSJNMTIgNkg2djRoNnY2aC0ydjRoLTJ2Nmg2VjZoNnptLTQgMHY0aDRWNmgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo="
                }}
              />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-secondary-900">
                  Gestión de Inventario
                </h1>
              </div>
            </div>
          </div>

          {/* Notificaciones y perfil */}
          <div className="flex items-center space-x-4">
            {/* Botón de notificaciones con contador */}
            <button 
              onClick={() => navigate('/alerts')}
              disabled={isSigningOut} // ✅ Deshabilitar durante logout
              className="relative p-2 rounded-full text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50"
            >
              <span className="sr-only">Ver alertas</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
              </svg>
              {/* Indicador de alertas no leídas */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Menú de perfil */}
            <div className="relative" ref={dropdownRef}> {/* ✅ Agregado ref */}
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={isSigningOut} // ✅ Deshabilitar durante logout
              >
                <span className="sr-only">Abrir menú de usuario</span>
                <div className={`h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ${isSigningOut ? 'opacity-50' : ''}`}>
                  {isSigningOut ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {dropdownOpen && !isSigningOut && ( // ✅ No mostrar dropdown durante logout
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-secondary-700 border-b border-secondary-200">
                      <div className="font-medium">{user?.email}</div>
                      <div className="text-xs text-secondary-500 mt-1">
                        {getRoleDisplayName(userRole)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/alerts')
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
                      </svg>
                      Alertas
                      {unreadCount > 0 && (
                        <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/profile')
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      Mi Perfil
                    </button>
                    
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        navigate('/settings')
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      Configuración
                    </button>
                    
                    <div className="border-t border-secondary-200"></div>
                    
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar