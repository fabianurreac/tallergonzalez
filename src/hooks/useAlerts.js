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

  useEffect(() => {
    if (user) {
      fetchAlerts()
      subscribeToAlerts()
    }
  }, [user])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('alertas')
        .select(`
          *,
          herramientas (
            id,
            nombre,
            categoria,
            condicion
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching alerts:', error)
        return
      }

      setAlerts(data || [])
      
      // Contar alertas no leídas
      const unread = data?.filter(alert => !alert.leida).length || 0
      setUnreadCount(unread)

    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
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
      // Obtener datos completos de la nueva alerta
      const { data, error } = await supabase
        .from('alertas')
        .select(`
          *,
          herramientas (
            id,
            nombre,
            categoria,
            condicion
          )
        `)
        .eq('id', newAlert.id)
        .single()

      if (error) {
        console.error('Error fetching new alert details:', error)
        return
      }

      // Agregar a la lista de alertas
      setAlerts(prev => [data, ...prev])
      setUnreadCount(prev => prev + 1)

      // Mostrar notificación
      showNotification({
        type: 'warning',
        title: 'Nueva Alerta',
        message: `${data.motivo} - Herramienta: ${data.herramientas?.nombre}`,
        duration: 5000
      })

    } catch (error) {
      console.error('Error handling new alert:', error)
    }
  }

  const handleUpdateAlert = (updatedAlert) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === updatedAlert.id 
          ? { ...alert, ...updatedAlert }
          : alert
      )
    )

    // Si se marcó como leída, actualizar contador
    if (updatedAlert.leida) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const handleDeleteAlert = (deletedAlert) => {
    setAlerts(prev => prev.filter(alert => alert.id !== deletedAlert.id))
    
    // Si la alerta eliminada no estaba leída, actualizar contador
    if (!deletedAlert.leida) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

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

      if (error) {
        console.error('Error marking all alerts as read:', error)
        return false
      }

      setUnreadCount(0)
      setAlerts(prev => 
        prev.map(alert => ({ ...alert, leida: true }))
      )

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

  const getAlertsByType = (tipo) => {
    return alerts.filter(alert => 
      alert.motivo.toLowerCase().includes(tipo.toLowerCase())
    )
  }

  const getUnreadAlerts = () => {
    return alerts.filter(alert => !alert.leida)
  }

  const getAlertsByTool = (toolId) => {
    return alerts.filter(alert => alert.id_herramienta === toolId)
  }

  const value = {
    alerts,
    unreadCount,
    loading,
    notification,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    createAlert,
    showNotification,
    hideNotification,
    getAlertsByType,
    getUnreadAlerts,
    getAlertsByTool
  }

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  )
}

export default useAlerts