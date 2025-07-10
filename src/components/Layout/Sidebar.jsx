import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { hasPermission, userRole, user } = useAuth() // ✅ Agregado user

  const navigation = [
    {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
      </svg>
    ),
    permission: 'almacenista'
  },
  {
    name: 'Gestión de Usuarios',
    href: '/users',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    permission: 'superadmin'
  },
   {
      name: 'Inventario',
      href: '/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      permission: 'almacenista'
    },
    {
      name: 'Reservas',
      href: '/reservations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      permission: 'almacenista'
    },
    {
      name: 'Empleados',
      href: '/employees',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      permission: 'almacenista'
    },
    /*{
      name: 'Escáner QR',
      href: '/scanner',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      permission: 'almacenista'
    },*/
    {
      name: 'Alertas',
      href: '/alerts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      permission: 'almacenista'
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      permission: 'almacenista'
    }
  ]

  // ✅ Filtrar navegación según permisos - Solo si hay usuario autenticado
  const filteredNavigation = user ? navigation.filter(item => hasPermission(item.permission)) : []

  // ✅ Función mejorada para manejar clicks en navegación
  const handleNavItemClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-secondary-200">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-8 w-auto"
            onError={(e) => {
              e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNEQzI2MjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IiNGRkZGRkYiPgo8cGF0aCBkPSJNMTIgNkg2djRoNnY2aC0ydjRoLTJ2Nmg2VjZoNnptLTQgMHY0aDRWNmgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo="
            }}
          />
          <span className="ml-2 text-lg font-semibold text-secondary-900 lg:block hidden">
            Taller
          </span>
        </div>
        
        {/* Botón cerrar en móvil */}
        <button
          type="button"
          className="lg:hidden p-2 rounded-md text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          onClick={() => setSidebarOpen(false)}
        >
          <span className="sr-only">Cerrar menú</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {/* ✅ Verificación mejorada de navegación */}
        {filteredNavigation.length > 0 ? (
          filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-500'
                    : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
                }`
              }
              onClick={handleNavItemClick} // ✅ Uso de la función mejorada
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))
        ) : (
          // ✅ Estado de carga cuando no hay navegación
          <div className="px-3 py-2 text-sm text-secondary-500">
            Cargando menú...
          </div>
        )}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-4 border-t border-secondary-200">
        <div className="text-xs text-secondary-500 text-center">
          {/* ✅ Verificación mejorada de userRole */}
          <p className="font-medium">
            Rol: {userRole === 'superadmin' ? 'Super Admin' : userRole === 'almacenista' ? 'Almacenista' : 'Cargando...'}
          </p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-secondary-200">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="lg:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 flex z-40"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-secondary-600 bg-opacity-75" />
            
            {/* Sidebar panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar