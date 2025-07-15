import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useAlerts } from '../../hooks/useAlerts'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { unreadCount, getCriticalAlerts, getUrgentAlerts } = useAlerts()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/login')
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

  const closeDropdown = () => setDropdownOpen(false)

  // Obtener alertas críticas y urgentes
  const criticalAlerts = getCriticalAlerts ? getCriticalAlerts() : []
  const urgentAlerts = getUrgentAlerts ? getUrgentAlerts() : []
  const hasCriticalAlerts = criticalAlerts.length > 0
  const hasUrgentAlerts = urgentAlerts.length > 0

  // Determinar el estilo del botón de alertas
  const getAlertButtonStyle = () => {
    if (hasCriticalAlerts) {
      return {
        className: 'relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-red-500 hover:text-red-600 animate-pulse bg-red-50',
        iconClass: 'h-6 w-6',
        badgeClass: 'bg-red-600 animate-pulse'
      }
    } else if (hasUrgentAlerts || unreadCount > 0) {
      return {
        className: 'relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-yellow-500 hover:text-yellow-600 bg-yellow-50',
        iconClass: 'h-6 w-6',
        badgeClass: 'bg-yellow-600'
      }
    } else {
      return {
        className: 'relative p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-secondary-400 hover:text-secondary-500',
        iconClass: 'h-6 w-6',
        badgeClass: 'bg-primary-500'
      }
    }
  }

  const alertButtonStyle = getAlertButtonStyle()

  // Obtener el icono apropiado según el estado de las alertas
  const getAlertIcon = () => {
    if (hasCriticalAlerts) {
      return (
        <svg className={alertButtonStyle.iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    } else if (hasUrgentAlerts) {
      return (
        <svg className={alertButtonStyle.iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    } else {
      return (
        <svg className={alertButtonStyle.iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
        </svg>
      )
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
            {/* Botón de alertas/notificaciones mejorado */}
            <button 
              onClick={() => navigate('/alerts')}
              className={alertButtonStyle.className}
              title={
                hasCriticalAlerts 
                  ? `${criticalAlerts.length} alerta${criticalAlerts.length !== 1 ? 's' : ''} crítica${criticalAlerts.length !== 1 ? 's' : ''}`
                  : unreadCount > 0 
                    ? `${unreadCount} alerta${unreadCount !== 1 ? 's' : ''} pendiente${unreadCount !== 1 ? 's' : ''}`
                    : 'Ver alertas del sistema'
              }
            >
              <span className="sr-only">
                Ver alertas {unreadCount > 0 && `(${unreadCount} sin leer)`}
              </span>
              
              {/* Icono dinámico según estado */}
              {getAlertIcon()}
              
              {/* Contador de alertas */}
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full ${alertButtonStyle.badgeClass}`}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              
              {/* Indicador de estado crítico con animación */}
              {hasCriticalAlerts && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* Menú de perfil */}
            <div className="relative">
              <button
                type="button"
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="sr-only">Abrir menú de usuario</span>
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.nombre ? user.nombre.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Dropdown mejorado */}
              {dropdownOpen && (
                <>
                  {/* Overlay para cerrar */}
                  <div 
                    className="fixed inset-0 z-30"
                    onClick={closeDropdown}
                  />
                  
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                    <div className="py-1">
                      {/* Header del usuario */}
                      <div className="px-4 py-3 text-sm text-secondary-700 border-b border-secondary-200">
                        <div className="font-medium">{user?.nombre || user?.email}</div>
                        <div className="text-xs text-secondary-500 mt-1">
                          {getRoleDisplayName(user?.rol)}
                        </div>
                        
                        {/* Estado de alertas en el dropdown */}
                        {unreadCount > 0 && (
                          <div className="mt-2 flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              hasCriticalAlerts ? 'bg-red-500 animate-pulse' : 
                              hasUrgentAlerts ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <span className="text-xs text-secondary-600">
                              {unreadCount} alerta{unreadCount !== 1 ? 's' : ''} pendiente{unreadCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {/* Resumen de alertas críticas */}
                        {hasCriticalAlerts && (
                          <div className="mt-2 px-2 py-1 bg-red-100 border border-red-200 rounded text-xs">
                            <span className="text-red-800 font-medium">
                              🚨 {criticalAlerts.length} alerta{criticalAlerts.length !== 1 ? 's' : ''} crítica{criticalAlerts.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}

                        {/* Resumen de alertas urgentes */}
                        {hasUrgentAlerts && !hasCriticalAlerts && (
                          <div className="mt-2 px-2 py-1 bg-yellow-100 border border-yellow-200 rounded text-xs">
                            <span className="text-yellow-800 font-medium">
                              ⚠️ {urgentAlerts.length} alerta{urgentAlerts.length !== 1 ? 's' : ''} urgente{urgentAlerts.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Enlace directo a alertas críticas */}
                      {hasCriticalAlerts && (
                        <>
                          <button
                            onClick={() => {
                              closeDropdown()
                              navigate('/alerts?filter=critica')
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-medium border-b border-secondary-200"
                          >
                            🚨 Ver Alertas Críticas ({criticalAlerts.length})
                          </button>
                        </>
                      )}

                      {/* Enlace general a alertas si hay pendientes */}
                      {unreadCount > 0 && !hasCriticalAlerts && (
                        <>
                          <button
                            onClick={() => {
                              closeDropdown()
                              navigate('/alerts')
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 font-medium border-b border-secondary-200"
                          >
                            📋 Ver Todas las Alertas ({unreadCount})
                          </button>
                        </>
                      )}
                      
                      {/* Opciones del menú */}
                      <button
                        onClick={() => {
                          closeDropdown()
                          navigate('/profile')
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      >
                        Mi Perfil
                      </button>
                      
                      <button
                        onClick={() => {
                          closeDropdown()
                          navigate('/settings')
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      >
                        Configuración
                      </button>
                      
                      <div className="border-t border-secondary-200"></div>
                      
                      <button
                        onClick={() => {
                          closeDropdown()
                          handleSignOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar