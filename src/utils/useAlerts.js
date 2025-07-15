import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from './useAuth'

const AlertsContext = createContext({})

export const useAlerts = () => {
  const context = useContext(AlertsContext)
  if (!context) {
    throw new Error('useAlerts debe ser usado dentro de AlertsProvider')
  }
  return context
}

export const AlertsProvider = ({ children }) => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  const [stats, setStats] = useState({
    total_alertas: 0,
    alertas_pendientes: 0,
    alertas_resueltas: 0,
    alertas_criticas: 0,
    alertas_urgentes: 0,
    alertas_por_tipo: {}
  })

  useEffect(() => {
    if (user) {
      fetchAlerts()
      fetchAlertsStats()
      subscribeToAlerts()
    }
  }, [user])

  const fetchAlerts = async (filters = {}) => {
    try {
      setLoading(true)
      
      // Usar la vista optimizada para obtener datos completos
      let query = supabase
        .from('vista_alertas_activas')
        .select('*')

      // Aplicar filtros
      if (filters.prioridad) {
        query = query.eq('prioridad', filters.prioridad)
      }
      
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      
      if (filters.resuelto !== undefined) {
        query = query.eq('resuelto', filters.resuelto)
      }

      // Ordenar por prioridad y fecha
      query = query.order('created_at', { ascending: false })
      
      const { data, error } = await query.limit(100)

      if (error) {
        console.error('Error fetching alerts:', error)
        return []
      }

      setAlerts(data || [])
      
      // Contar alertas no leídas (pendientes y no resueltas)
      const unread = data?.filter(alert => !alert.leida && !alert.resuelto).length || 0
      setUnreadCount(unread)

      return data || []
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchAlertsStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_alertas_stats')

      if (error) {
        console.error('Error fetching alerts stats:', error)
        return
      }
      
      setStats(data?.[0] || {
        total_alertas: 0,
        alertas_pendientes: 0,
        alertas_resueltas: 0,
        alertas_criticas: 0,
        alertas_urgentes: 0,
        alertas_por_tipo: {}
      })
    } catch (error) {
      console.error('Error fetching alerts stats:', error)
    }
  }

  const subscribeToAlerts = () => {
    const subscription = supabase
      .channel('alertas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alertas'
        },
        (payload) => {
          console.log('Alert change received:', payload)
          
          if (payload.eventType === 'INSERT') {
            handleNewAlert(payload.new)
          } else if (payload.eventType === 'UPDATE') {
            handleUpdateAlert(payload.new)
          } else if (payload.eventType === 'DELETE') {
            handleDeleteAlert(payload.old)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const handleNewAlert = async (newAlert) => {
    try {
      // Obtener datos completos de la nueva alerta desde la vista
      const { data, error } = await supabase
        .from('vista_alertas_activas')
        .select('*')
        .eq('id', newAlert.id)
        .single()

      if (error) {
        console.error('Error fetching new alert details:', error)
        return
      }

      // Agregar a la lista de alertas
      setAlerts(prev => [data, ...prev])
      setUnreadCount(prev => prev + 1)

      // Determinar tipo de notificación según prioridad
      const notificationType = data.prioridad === 'critica' ? 'error' : 
                              data.prioridad === 'urgente' ? 'warning' : 'info'

      // Mostrar notificación con emoji según prioridad
      const emoji = data.prioridad === 'critica' ? '🚨' : 
                    data.prioridad === 'urgente' ? '⚠️' : 
                    data.prioridad === 'alta' ? '⚡' : 'ℹ️'

      showNotification({
        type: notificationType,
        title: `${emoji} Nueva Alerta ${data.prioridad.toUpperCase()}`,
        message: `${data.motivo}`,
        duration: data.prioridad === 'critica' ? 10000 : 5000,
        actions: data.prioridad === 'critica' ? [
          {
            label: 'Ver Detalles',
            action: () => window.location.href = '/alerts'
          }
        ] : undefined
      })

      // Actualizar estadísticas
      fetchAlertsStats()

    } catch (error) {
      console.error('Error handling new alert:', error)
    }
  }

  const handleUpdateAlert = async (updatedAlert) => {
    // Actualizar en la lista local
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === updatedAlert.id 
          ? { ...alert, ...updatedAlert }
          : alert
      )
    )

    // Si se marcó como leída o resuelta, actualizar contador
    if (updatedAlert.leida || updatedAlert.resuelto) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Si se resolvió, mostrar notificación de éxito
    if (updatedAlert.resuelto && !alerts.find(a => a.id === updatedAlert.id)?.resuelto) {
      showNotification({
        type: 'success',
        title: '✅ Alerta Resuelta',
        message: 'La alerta ha sido marcada como resuelta exitosamente.',
        duration: 3000
      })
    }

    // Actualizar estadísticas
    fetchAlertsStats()
  }

  const handleDeleteAlert = (deletedAlert) => {
    setAlerts(prev => prev.filter(alert => alert.id !== deletedAlert.id))
    
    // Si la alerta eliminada no estaba leída, actualizar contador
    if (!deletedAlert.leida && !deletedAlert.resuelto) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Actualizar estadísticas
    fetchAlertsStats()
  }

  // Funciones existentes mejoradas
  const markAsRead = async (alertId) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ leida: true })
        .eq('id', alertId)

      if (error) {
        console.error('Error marking alert as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking alert as read:', error)
      return false
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('alertas')
        .update({ leida: true })
        .eq('leida', false)
        .eq('resuelto', false)

      if (error) {
        console.error('Error marking all alerts as read:', error)
        return false
      }

      setUnreadCount(0)
      setAlerts(prev => 
        prev.map(alert => ({ ...alert, leida: true }))
      )

      showNotification({
        type: 'success',
        title: '✅ Alertas Marcadas',
        message: 'Todas las alertas han sido marcadas como leídas.',
        duration: 3000
      })

      return true
    } catch (error) {
      console.error('Error marking all alerts as read:', error)
      return false
    }
  }

  const deleteAlert = async (alertId) => {
    try {
      const { error } = await supabase
        .from('alertas')
        .delete()
        .eq('id', alertId)

      if (error) {
        console.error('Error deleting alert:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting alert:', error)
      return false
    }
  }

  const createAlert = async (alertData) => {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .insert([alertData])
        .select()
        .single()

      if (error) {
        console.error('Error creating alert:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating alert:', error)
      return null
    }
  }

  // Nuevas funciones para el sistema automático de alertas
  const resolveAlert = async (alertId, resolvedBy = null) => {
    try {
      const { data, error } = await supabase.rpc('resolver_alerta', {
        alerta_id: alertId,
        resuelto_por_id: resolvedBy
      })

      if (error) {
        console.error('Error resolving alert:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error resolving alert:', error)
      return { success: false, error: error.message }
    }
  }

  const generateAutomaticAlerts = async () => {
    try {
      const { data, error } = await supabase.rpc('ejecutar_sistema_alertas')

      if (error) {
        console.error('Error generating automatic alerts:', error)
        return { success: false, error: error.message }
      }
      
      // Refrescar alertas y estadísticas después de generar nuevas
      await Promise.all([fetchAlerts(), fetchAlertsStats()])
      
      return { success: true, message: data }
    } catch (error) {
      console.error('Error generating automatic alerts:', error)
      return { success: false, error: error.message }
    }
  }

  const createManualAlert = async (alertData) => {
    try {
      const { data, error } = await supabase.rpc('crear_alerta_manual', {
        p_id_herramienta: alertData.idHerramienta,
        p_motivo: alertData.motivo,
        p_tipo: alertData.tipo || 'manual',
        p_prioridad: alertData.prioridad || 'media',
        p_id_empleado_relacionado: alertData.idEmpleado || null
      })

      if (error) {
        console.error('Error creating manual alert:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, alertId: data }
    } catch (error) {
      console.error('Error creating manual alert:', error)
      return { success: false, error: error.message }
    }
  }

  const getAlertCountsByPriority = async () => {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select('prioridad')
        .eq('resuelto', false)

      if (error) throw error

      const counts = data?.reduce((acc, alert) => {
        acc[alert.prioridad] = (acc[alert.prioridad] || 0) + 1
        return acc
      }, {}) || {}

      return {
        critica: counts.critica || 0,
        urgente: counts.urgente || 0,
        alta: counts.alta || 0,
        media: counts.media || 0,
        baja: counts.baja || 0
      }
    } catch (error) {
      console.error('Error fetching alert counts by priority:', error)
      return {
        critica: 0,
        urgente: 0,
        alta: 0,
        media: 0,
        baja: 0
      }
    }
  }

  // Funciones de notificación mejoradas
  const showNotification = (notificationData) => {
    setNotification(notificationData)
    
    // Auto-ocultar notificación después del tiempo especificado
    if (notificationData.duration) {
      setTimeout(() => {
        setNotification(null)
      }, notificationData.duration)
    }
  }

  const hideNotification = () => {
    setNotification(null)
  }

  // Funciones de filtrado y búsqueda mejoradas
  const getAlertsByType = (tipo) => {
    return alerts.filter(alert => alert.tipo === tipo)
  }

  const getUnreadAlerts = () => {
    return alerts.filter(alert => !alert.leida && !alert.resuelto)
  }

  const getCriticalAlerts = () => {
    return alerts.filter(alert => 
      alert.prioridad === 'critica' && !alert.resuelto
    )
  }

  const getUrgentAlerts = () => {
    return alerts.filter(alert => 
      (alert.prioridad === 'critica' || alert.prioridad === 'urgente') && !alert.resuelto
    )
  }

  const getAlertsByTool = (toolId) => {
    return alerts.filter(alert => alert.id_herramienta === toolId)
  }

  const getAlertsByEmployee = (employeeId) => {
    return alerts.filter(alert => alert.id_empleado_relacionado === employeeId)
  }

  const searchAlerts = (searchTerm) => {
    const term = searchTerm.toLowerCase()
    return alerts.filter(alert => 
      alert.motivo.toLowerCase().includes(term) ||
      alert.herramienta_nombre?.toLowerCase().includes(term) ||
      alert.empleado_nombre?.toLowerCase().includes(term) ||
      alert.tipo.toLowerCase().includes(term)
    )
  }

  // Función para obtener alertas activas con filtros
  const getActiveAlerts = async (filters = {}) => {
    return await fetchAlerts({ ...filters, resuelto: false })
  }

  // Función para obtener estadísticas de alertas
  const getAlertsStats = () => {
    return stats
  }

  const value = {
    // Estado
    alerts,
    unreadCount,
    loading,
    notification,
    stats,
    
    // Funciones principales
    fetchAlerts,
    fetchAlertsStats,
    
    // Funciones de lectura
    markAsRead,
    markAllAsRead,
    
    // Funciones CRUD
    deleteAlert,
    createAlert,
    
    // Funciones del sistema automático
    resolveAlert,
    generateAutomaticAlerts,
    createManualAlert,
    getAlertCountsByPriority,
    getActiveAlerts,
    getAlertsStats,
    
    // Funciones de notificación
    showNotification,
    hideNotification,
    
    // Funciones de filtrado y búsqueda
    getAlertsByType,
    getUnreadAlerts,
    getCriticalAlerts,
    getUrgentAlerts,
    getAlertsByTool,
    getAlertsByEmployee,
    searchAlerts
  }

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  )
}

export default useAlerts