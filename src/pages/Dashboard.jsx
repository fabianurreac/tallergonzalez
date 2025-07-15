import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import StatsCards from '../components/Dashboard/StatsCards'

const Dashboard = () => {
  const { user } = useAuth() // ✅ Usar el nuevo hook simplificado
  const navigate = useNavigate()
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      setLoading(true)
      
      // Obtener actividad reciente (últimas reservas)
      const { data: reservasData, error } = await supabase
        .from('reservas')
        .select(`
          *,
          empleados (nombre_completo, cargo),
          herramientas (nombre, categoria)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching recent activity:', error)
        return
      }

      setRecentActivity(reservasData || [])

    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Función mejorada para actualizar datos
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await fetchRecentActivity()
      // Esto también actualizará las StatsCards si tienen un método de refresh
      window.dispatchEvent(new Event('refreshDashboard'))
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (estado) => {
    if (estado === 'reservada') {
      return (
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    }
  }

  // ✅ Función para obtener el nombre de display del rol
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
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            {/* ✅ Adaptado al nuevo sistema de auth */}
            Bienvenido, {user?.nombre || user?.email} - {getRoleDisplayName(user?.rol)}
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              refreshing 
                ? 'bg-secondary-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200`}
          >
            <svg 
              className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <StatsCards />

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Actividad Reciente
              </h3>
              {/* ✅ Botón para ir a reservas */}
              <button
                onClick={() => navigate('/reservations')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Ver todas →
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 animate-pulse">
                    <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                      <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-secondary-50 transition-colors">
                    {getActivityIcon(activity.estado)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900">
                        {activity.empleados?.nombre_completo}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {activity.estado === 'reservada' ? 'Reservó' : 'Devolvió'} la herramienta{' '}
                        <span className="font-medium">{activity.herramientas?.nombre}</span>
                        {activity.herramientas?.categoria && (
                          <span className="text-xs text-secondary-500 ml-1">
                            ({activity.herramientas.categoria})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-secondary-900">No hay actividad reciente</h3>
                <p className="mt-1 text-sm text-secondary-500">Ir a Reservas</p>
                <button
                  onClick={() => navigate('/reservations')}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                >
                  Ver Reservas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Accesos Rápidos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
              Accesos Rápidos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* ✅ Inventario */}
              <button
                onClick={() => navigate('/inventory')}
                className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border-2 border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left w-full"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-secondary-900 group-hover:text-primary-700 transition-colors">
                    Inventario
                  </h3>
                  <p className="mt-2 text-sm text-secondary-500">
                    Gestionar herramientas
                  </p>
                </div>
              </button>

              {/* ✅ Reservas */}
              <button
                onClick={() => navigate('/reservations')}
                className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg border-2 border-secondary-200 hover:border-green-300 hover:shadow-md transition-all duration-200 text-left w-full"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2a1 1 0 0 1 1 1v1h4V3a1 1 0 1 1 2 0v1h3a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V3a1 1 0 0 1 1-1zM8 6H5v3h14V6h-3v1a1 1 0 1 1-2 0V6h-4v1a1 1 0 0 1-2 0V6zm11 5H5v8h14v-8z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-secondary-900 group-hover:text-green-700 transition-colors">
                    Reservas
                  </h3>
                  <p className="mt-2 text-sm text-secondary-500">
                    Visualiza y gestiona reservas
                  </p>
                </div>
              </button>

              {/* ✅ Empleados */}
              <button
                onClick={() => navigate('/employees')}
                className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border-2 border-secondary-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left w-full"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-secondary-900 group-hover:text-blue-700 transition-colors">
                    Empleados
                  </h3>
                  <p className="mt-2 text-sm text-secondary-500">
                    Gestionar personal
                  </p>
                </div>
              </button>

              {/* ✅ Reportes */}
              <button
                onClick={() => navigate('/reports')}
                className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border-2 border-secondary-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left w-full"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-secondary-900 group-hover:text-purple-700 transition-colors">
                    Reportes
                  </h3>
                  <p className="mt-2 text-sm text-secondary-500">
                    Ver estadísticas
                  </p>
                </div>
              </button>
            </div>

            {/* ✅ Acceso rápido a alertas si hay alguna */}
            <div className="mt-6 pt-4 border-t border-secondary-200">
              <button
                onClick={() => navigate('/alerts')}
                className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-800">
                      Centro de Alertas
                    </p>
                    <p className="text-xs text-yellow-600">
                      Revisar notificaciones del sistema
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Información adicional del usuario */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
            Información de Sesión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-secondary-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-900">Usuario</p>
                  <p className="text-sm text-secondary-600">{user?.nombre || user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-900">Rol</p>
                  <p className="text-sm text-primary-600 font-medium">{getRoleDisplayName(user?.rol)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-900">Sesión</p>
                  <p className="text-sm text-green-600">Activa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard