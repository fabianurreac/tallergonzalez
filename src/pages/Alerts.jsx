import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, unread, read

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError('')
      
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
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError('Error al cargar las alertas')
    } finally {
      setLoading(false)
    }
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

  const getFilteredAlerts = () => {
    if (!alerts || alerts.length === 0) return []
    
    switch (filter) {
      case 'unread':
        return alerts.filter(alert => !alert.leida)
      case 'read':
        return alerts.filter(alert => alert.leida)
      default:
        return alerts
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

  const getAlertIcon = (motivo) => {
    if (motivo.toLowerCase().includes('deterioro')) {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      )
    }
    
    return (
      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
        </svg>
      </div>
    )
  }

  const filteredAlerts = getFilteredAlerts()
  const unreadCount = alerts ? alerts.filter(alert => !alert.leida).length : 0

  if (loading) {
    return <LoadingSpinner text="Cargando alertas..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Alertas
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} sin leer
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Notificaciones y alertas del sistema
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={fetchAlerts}
            className="inline-flex items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
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

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-secondary-200">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'Todas', count: alerts.length },
              { key: 'unread', label: 'Sin leer', count: unreadCount },
              { key: 'read', label: 'Leídas', count: alerts.length - unreadCount }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === filterOption.key
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de alertas */}
        <div className="divide-y divide-secondary-200">
          {error && (
            <div className="p-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900">No hay alertas</h3>
              <p className="mt-1 text-sm text-secondary-500">
                {filter === 'unread' 
                  ? 'No tienes alertas sin leer' 
                  : filter === 'read' 
                    ? 'No tienes alertas leídas'
                    : 'No se han generado alertas aún'
                }
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-secondary-50 transition-colors ${
                  !alert.leida ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {getAlertIcon(alert.motivo)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !alert.leida ? 'text-secondary-900' : 'text-secondary-700'
                      }`}>
                        {alert.motivo}
                      </p>
                      {!alert.leida && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Nueva
                        </span>
                      )}
                    </div>
                    
                    {alert.herramientas && (
                      <p className="text-sm text-secondary-600 mt-1">
                        Herramienta: <span className="font-medium">{alert.herramientas.nombre}</span>
                        {alert.herramientas.categoria && (
                          <span className="text-secondary-500"> - {alert.herramientas.categoria}</span>
                        )}
                      </p>
                    )}
                    
                    <p className="text-xs text-secondary-500 mt-2">
                      {formatDate(alert.fecha_creacion)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!alert.leida && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        title="Marcar como leída"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                      title="Eliminar alerta"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
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