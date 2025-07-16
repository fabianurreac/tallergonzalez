import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import StatsCards from '../components/Dashboard/StatsCards'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recentActivity, setRecentActivity] = useState([])
  const [overdueReservations, setOverdueReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchRecentActivity(),
        fetchOverdueReservations()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
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
    }
  }

  const fetchOverdueReservations = async () => {
    try {
      // Obtener reservas activas para verificar vencimientos
      const { data: reservasData, error } = await supabase
        .from('reservas')
        .select(`
          *,
          empleados (nombre_completo, cargo),
          herramientas (nombre, categoria, serial)
        `)
        .eq('estado', 'reservada')
        .order('fecha_devolucion_estimada', { ascending: true })

      if (error) {
        console.error('Error fetching reservations:', error)
        return
      }

      // Filtrar solo las reservas vencidas
      const now = new Date()
      const overdue = (reservasData || []).filter(reservation => {
        const dueDate = new Date(reservation.fecha_devolucion_estimada)
        return dueDate < now
      })

      setOverdueReservations(overdue)
    } catch (error) {
      console.error('Error fetching overdue reservations:', error)
    }
  }

  const getDaysOverdue = (reservation) => {
    const now = new Date()
    const dueDate = new Date(reservation.fecha_devolucion_estimada)
    const diffTime = Math.abs(now - dueDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await fetchDashboardData()
      // Disparar evento para que StatsCards se actualice
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

      {/* Alerta de reservas vencidas */}
      {overdueReservations.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                ¡Atención! {overdueReservations.length} reserva{overdueReservations.length !== 1 ? 's' : ''} vencida{overdueReservations.length !== 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {overdueReservations.length === 1 
                    ? 'Hay una reserva que no ha sido devuelta a tiempo.' 
                    : `Hay ${overdueReservations.length} reservas que no han sido devueltas a tiempo.`
                  }
                </p>
              </div>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={() => navigate('/reservations')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Ver Reservas
                </button>
                <button
                  onClick={() => navigate('/alerts')}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Ver Alertas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas */}
      <StatsCards overdueCount={overdueReservations.length} />

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Actividad Reciente
              </h3>
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

        {/* Vista rápida de reservas vencidas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Estado de Reservas
              </h3>
              <button
                onClick={() => navigate('/reservations')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                Gestionar →
              </button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {overdueReservations.length > 0 ? (
                  <>
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-red-800">
                            Reservas Vencidas ({overdueReservations.length})
                          </h4>
                          <p className="text-xs text-red-600 mt-1">
                            Requieren atención inmediata
                          </p>
                        </div>
                        <button
                          onClick={() => navigate('/reservations')}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Mostrar las 3 más urgentes */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-secondary-700 uppercase tracking-wide">
                        Más Urgentes:
                      </h5>
                      {overdueReservations.slice(0, 3).map((reservation) => (
                        <div key={reservation.id} className="flex items-center space-x-3 p-2 bg-red-50 rounded border border-red-200">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-red-900 truncate">
                              {reservation.herramientas?.nombre}
                            </p>
                            <p className="text-xs text-red-700">
                              {reservation.empleados?.nombre_completo} - {getDaysOverdue(reservation)} día{getDaysOverdue(reservation) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                      {overdueReservations.length > 3 && (
                        <p className="text-xs text-red-600 text-center pt-2">
                          +{overdueReservations.length - 3} más...
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-green-800">¡Todo al día!</h3>
                    <p className="mt-1 text-sm text-green-600">No hay reservas vencidas</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
            Accesos Rápidos
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/inventory')}
              className="group relative bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border-2 border-secondary-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left w-full"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-secondary-900 group-hover:text-primary-700 transition-colors">
                  Inventario
                </h3>
              </div>
            </button>

            <button
              onClick={() => navigate('/reservations')}
              className={`group relative bg-white p-4 focus-within:ring-2 focus-within:ring-inset rounded-lg border-2 hover:shadow-md transition-all duration-200 text-left w-full ${
                overdueReservations.length > 0 
                  ? 'border-red-300 ring-red-500 focus-within:ring-red-500'
                  : 'border-secondary-200 hover:border-green-300 focus-within:ring-green-500'
              }`}
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 transition-colors ${
                  overdueReservations.length > 0 
                    ? 'bg-red-50 text-red-600 group-hover:bg-red-100'
                    : 'bg-green-50 text-green-600 group-hover:bg-green-100'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {overdueReservations.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {overdueReservations.length}
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-4">
                <h3 className={`text-sm font-medium transition-colors ${
                  overdueReservations.length > 0 
                    ? 'text-red-900 group-hover:text-red-700'
                    : 'text-secondary-900 group-hover:text-green-700'
                }`}>
                  Reservas
                  {overdueReservations.length > 0 && (
                    <span className="block text-xs text-red-600 font-normal">
                      {overdueReservations.length} vencida{overdueReservations.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </h3>
              </div>
            </button>

            <button
              onClick={() => navigate('/employees')}
              className="group relative bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border-2 border-secondary-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left w-full"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-secondary-900 group-hover:text-blue-700 transition-colors">
                  Empleados
                </h3>
              </div>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="group relative bg-white p-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg border-2 border-secondary-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 text-left w-full"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-secondary-900 group-hover:text-purple-700 transition-colors">
                  Reportes
                </h3>
              </div>
            </button>
          </div>

          {/* Acceso rápido a alertas */}
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
                    {overdueReservations.length > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {overdueReservations.length} vencidas
                      </span>
                    )}
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
  )
}

export default Dashboard