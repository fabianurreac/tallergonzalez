import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [overdueReservations, setOverdueReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, unread, read, overdue

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      
      await Promise.all([
        fetchAlerts(),
        fetchOverdueReservations()
      ])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from('alertas')
      .select(`
        *,
        herramientas (
          nombre,
          categoria,
          estado,
          condicion
        )
      `)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      throw error
    }

    setAlerts(data || [])
  }

  const fetchOverdueReservations = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        empleados (
          nombre_completo,
          cargo,
          identificacion
        ),
        herramientas (
          nombre,
          categoria,
          serial
        )
      `)
      .eq('estado', 'reservada')
      .order('fecha_devolucion_estimada', { ascending: true })

    if (error) {
      throw error
    }

    // Filtrar solo las reservas vencidas
    const now = new Date()
    const overdue = (data || []).filter(reservation => {
      const dueDate = new Date(reservation.fecha_devolucion_estimada)
      return dueDate < now
    })

    setOverdueReservations(overdue)
  }

  const generateOverdueAlert = async (reservationId) => {
    try {
      const reservation = overdueReservations.find(r => r.id === reservationId)
      if (!reservation) return

      const daysOverdue = getDaysOverdue(reservation)
      
      const { error } = await supabase
        .from('alertas')
        .insert({
          id_herramienta: reservation.id_herramienta,
          motivo: `Reserva vencida: ${reservation.herramientas?.nombre} no devuelta por ${reservation.empleados?.nombre_completo} (${daysOverdue} días de retraso)`,
          fecha_creacion: new Date().toISOString(),
          leida: false
        })

      if (error) {
        throw error
      }

      // Recargar alertas
      await fetchAlerts()
    } catch (err) {
      console.error('Error generating overdue alert:', err)
    }
  }

  const generateAllOverdueAlerts = async () => {
    try {
      const alertsToCreate = overdueReservations.map(reservation => {
        const daysOverdue = getDaysOverdue(reservation)
        return {
          id_herramienta: reservation.id_herramienta,
          motivo: `Reserva vencida: ${reservation.herramientas?.nombre} no devuelta por ${reservation.empleados?.nombre_completo} (${daysOverdue} días de retraso)`,
          fecha_creacion: new Date().toISOString(),
          leida: false
        }
      })

      if (alertsToCreate.length === 0) return

      const { error } = await supabase
        .from('alertas')
        .insert(alertsToCreate)

      if (error) {
        throw error
      }

      // Recargar alertas
      await fetchAlerts()
    } catch (err) {
      console.error('Error generating overdue alerts:', err)
    }
  }

  const getDaysOverdue = (reservation) => {
    const now = new Date()
    const dueDate = new Date(reservation.fecha_devolucion_estimada)
    const diffTime = Math.abs(now - dueDate)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const markAsRead = async (alertId) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ leida: true })
        .eq('id', alertId)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, leida: true } : alert
      ))
    } catch (err) {
      console.error('Error marking alert as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(alert => !alert.leida)
      
      if (unreadAlerts.length === 0) return

      const { error } = await supabase
        .from('alertas')
        .update({ leida: true })
        .in('id', unreadAlerts.map(alert => alert.id))

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setAlerts(alerts.map(alert => ({ ...alert, leida: true })))
    } catch (err) {
      console.error('Error marking all alerts as read:', err)
    }
  }

  const deleteAlert = async (alertId) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .delete()
        .eq('id', alertId)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setAlerts(alerts.filter(alert => alert.id !== alertId))
    } catch (err) {
      console.error('Error deleting alert:', err)
    }
  }

  const getFilteredItems = () => {
    const allItems = []
    
    if (filter === 'all' || filter === 'unread' || filter === 'read') {
      // Agregar alertas normales
      const filteredAlerts = alerts.filter(alert => {
        if (filter === 'unread') return !alert.leida
        if (filter === 'read') return alert.leida
        return true
      }).map(alert => ({ ...alert, type: 'alert' }))
      
      allItems.push(...filteredAlerts)
    }
    
    if (filter === 'all' || filter === 'overdue') {
      // Agregar reservas vencidas
      const overdueItems = overdueReservations.map(reservation => ({
        ...reservation,
        type: 'overdue',
        fecha_creacion: reservation.fecha_devolucion_estimada,
        motivo: `Reserva vencida: ${reservation.herramientas?.nombre} no devuelta por ${reservation.empleados?.nombre_completo}`,
        leida: false
      }))
      
      allItems.push(...overdueItems)
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    return allItems.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
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

  const getAlertIcon = (item) => {
    if (item.type === 'overdue') {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    }
    
    if (item.motivo?.toLowerCase().includes('deterioro')) {
      return (
        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      )
    }
    
    return (
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
        </svg>
      </div>
    )
  }

  const filteredItems = getFilteredItems()
  const unreadCount = alerts.filter(alert => !alert.leida).length
  const overdueCount = overdueReservations.length

  if (loading) {
    return <LoadingSpinner text="Cargando alertas..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Alertas y Notificaciones
            <div className="mt-1 flex space-x-2">
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {unreadCount} sin leer
                </span>
              )}
              {overdueCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {overdueCount} vencidas
                </span>
              )}
            </div>
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Notificaciones del sistema y reservas vencidas
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          
          {overdueCount > 0 && (
            <button
              onClick={generateAllOverdueAlerts}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Crear alertas para vencidas
            </button>
          )}
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      {/* Alertas de reservas vencidas */}
      {overdueCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                ¡Atención! {overdueCount} reserva{overdueCount !== 1 ? 's' : ''} vencida{overdueCount !== 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Hay {overdueCount} reserva{overdueCount !== 1 ? 's' : ''} que no {overdueCount !== 1 ? 'han' : 'ha'} sido devuelta{overdueCount !== 1 ? 's' : ''} a tiempo. 
                  {' '}Puedes crear alertas permanentes para hacer seguimiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-secondary-200">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'Todas', count: alerts.length + overdueCount },
              { key: 'unread', label: 'Sin leer', count: unreadCount },
              { key: 'read', label: 'Leídas', count: alerts.length - unreadCount },
              { key: 'overdue', label: 'Vencidas', count: overdueCount }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === filterOption.key
                    ? filterOption.key === 'overdue' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-primary-100 text-primary-700'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de alertas y reservas vencidas */}
        <div className="divide-y divide-secondary-200">
          {error && (
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No hay elementos</h3>
              <p className="mt-1 text-sm text-secondary-500">
                {filter === 'unread' 
                  ? 'No tienes alertas sin leer' 
                  : filter === 'read' 
                    ? 'No tienes alertas leídas'
                    : filter === 'overdue'
                      ? 'No hay reservas vencidas'
                      : 'No se han generado alertas aún'
                }
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className={`p-4 hover:bg-secondary-50 transition-colors ${
                  item.type === 'overdue' 
                    ? 'bg-red-50 border-l-4 border-red-400' 
                    : !item.leida 
                      ? 'bg-blue-50' 
                      : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {getAlertIcon(item)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        item.type === 'overdue' 
                          ? 'text-red-900' 
                          : !item.leida 
                            ? 'text-secondary-900' 
                            : 'text-secondary-700'
                      }`}>
                        {item.motivo}
                      </p>
                      <div className="flex space-x-2">
                        {item.type === 'overdue' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {getDaysOverdue(item)} días vencida
                          </span>
                        )}
                        {item.type === 'alert' && !item.leida && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Nueva
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {item.type === 'overdue' ? (
                      <div className="text-sm text-red-700 mt-1">
                        <p>
                          <span className="font-medium">Empleado:</span> {item.empleados?.nombre_completo} ({item.empleados?.cargo})
                        </p>
                        <p>
                          <span className="font-medium">Herramienta:</span> {item.herramientas?.nombre} - {item.herramientas?.categoria}
                        </p>
                        <p>
                          <span className="font-medium">Serial:</span> {item.herramientas?.serial}
                        </p>
                        <p>
                          <span className="font-medium">Fecha límite:</span> {formatDate(item.fecha_devolucion_estimada)}
                        </p>
                      </div>
                    ) : (
                      item.herramientas && (
                        <p className="text-sm text-secondary-600 mt-1">
                          Herramienta: <span className="font-medium">{item.herramientas.nombre}</span>
                          {item.herramientas.categoria && (
                            <span className="text-secondary-500"> - {item.herramientas.categoria}</span>
                          )}
                        </p>
                      )
                    )}
                    
                    <p className="text-xs text-secondary-500 mt-2">
                      {item.type === 'overdue' ? 'Vencida el ' : 'Creada el '}{formatDate(item.fecha_creacion)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.type === 'overdue' && (
                      <button
                        onClick={() => generateOverdueAlert(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        title="Crear alerta permanente"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                    
                    {item.type === 'alert' && !item.leida && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Marcar como leída"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    
                    {item.type === 'alert' && (
                      <button
                        onClick={() => deleteAlert(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                        title="Eliminar alerta"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Alerts