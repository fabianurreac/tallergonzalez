import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const StatsCards = () => {
  const [stats, setStats] = useState({
    totalTools: 0,
    availableTools: 0,
    reservedTools: 0,
    totalEmployees: 0,
    activeReservations: 0,
    overdueReservations: 0,
    alertsCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Estadísticas de herramientas
      const { data: toolsData, error: toolsError } = await supabase
        .from('herramientas')
        .select('estado')

      if (toolsError) {
        console.error('Error fetching tools:', toolsError)
      }

      // Estadísticas de empleados
      const { count: employeesCount, error: employeesError } = await supabase
        .from('empleados')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      if (employeesError) {
        console.error('Error fetching employees:', employeesError)
      }

      // Reservas activas (para calcular vencidas también)
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservas')
        .select('estado, fecha_devolucion_estimada')
        .eq('estado', 'reservada')

      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError)
      }

      // Alertas sin leer
      const { count: alertsCount, error: alertsError } = await supabase
        .from('alertas')
        .select('*', { count: 'exact', head: true })
        .eq('leida', false)

      if (alertsError) {
        console.error('Error fetching alerts:', alertsError)
      }

      // Procesar estadísticas de herramientas
      const totalTools = toolsData?.length || 0
      const availableTools = toolsData?.filter(tool => tool.estado === 'disponible').length || 0
      const reservedTools = toolsData?.filter(tool => tool.estado === 'reservada').length || 0

      // Calcular reservas vencidas
      const now = new Date()
      const overdueReservations = reservationsData?.filter(reservation => {
        const dueDate = new Date(reservation.fecha_devolucion_estimada)
        return dueDate < now
      }).length || 0

      const activeReservations = reservationsData?.length || 0

      setStats({
        totalTools,
        availableTools,
        reservedTools,
        totalEmployees: employeesCount || 0,
        activeReservations,
        overdueReservations,
        alertsCount: alertsCount || 0
      })

    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    {
      name: 'Total Herramientas',
      value: stats.totalTools,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Disponibles',
      value: stats.availableTools,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Reservadas',
      value: stats.reservedTools,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Empleados',
      value: stats.totalEmployees,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Reservas Activas',
      value: stats.activeReservations,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      name: 'Reservas Vencidas',
      value: stats.overdueReservations,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      isAlert: stats.overdueReservations > 0
    },
    {
      name: 'Alertas',
      value: stats.alertsCount,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      isAlert: stats.alertsCount > 0
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary-200 rounded"></div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-secondary-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <div 
          key={stat.name} 
          className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-all duration-200 ${
            stat.isAlert ? 'ring-2 ring-red-200 shadow-red-100' : ''
          }`}
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${stat.bgColor} rounded-md flex items-center justify-center ${
                  stat.isAlert ? 'animate-pulse' : ''
                }`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium truncate ${
                    stat.isAlert ? 'text-red-700' : 'text-secondary-500'
                  }`}>
                    {stat.name}
                    {stat.isAlert && (
                      <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        !
                      </span>
                    )}
                  </dt>
                  <dd className={`text-lg font-medium ${
                    stat.isAlert ? 'text-red-900' : 'text-secondary-900'
                  }`}>
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
            
            {/* Indicador adicional para alertas */}
            {stat.isAlert && (
              <div className="mt-2 text-xs text-red-600 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Requiere atención
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards