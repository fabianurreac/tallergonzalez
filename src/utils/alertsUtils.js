import { supabase } from '../config/supabase'

// Tipos de alertas predefinidos
export const ALERT_TYPES = {
  DETERIORO: 'deterioro',
  VENCIMIENTO: 'vencimiento',
  MANTENIMIENTO: 'mantenimiento',
  RESERVA_VENCIDA: 'reserva_vencida',
  STOCK_BAJO: 'stock_bajo'
}

// Prioridades de alertas
export const ALERT_PRIORITIES = {
  LOW: 'baja',
  MEDIUM: 'media',
  HIGH: 'alta',
  CRITICAL: 'critica'
}

// Función para crear alertas automáticamente
export const createAutomaticAlert = async (toolId, reason, priority = ALERT_PRIORITIES.MEDIUM) => {
  try {
    const alertData = {
      id_herramienta: toolId,
      motivo: reason,
      prioridad: priority,
      fecha_creacion: new Date().toISOString(),
      leida: false
    }

    const { data, error } = await supabase
      .from('alertas')
      .insert([alertData])
      .select()
      .single()

    if (error) {
      console.error('Error creating automatic alert:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating automatic alert:', error)
    return null
  }
}

// Función para verificar condiciones de deterioro y crear alertas
export const checkToolConditionAlerts = async (toolId, oldCondition, newCondition) => {
  if (oldCondition !== newCondition && newCondition === 'deterioro') {
    await createAutomaticAlert(
      toolId,
      'Herramienta en estado de deterioro detectado',
      ALERT_PRIORITIES.HIGH
    )
  } else if (oldCondition !== newCondition && newCondition === 'malo') {
    await createAutomaticAlert(
      toolId,
      'Herramienta en mal estado detectada',
      ALERT_PRIORITIES.MEDIUM
    )
  }
}

// Función para verificar reservas vencidas
export const checkOverdueReservations = async () => {
  try {
    const now = new Date()
    const { data: overdueReservations, error } = await supabase
      .from('reservas')
      .select(`
        *,
        herramientas (id, nombre),
        empleados (nombre_completo)
      `)
      .eq('estado', 'reservada')
      .lt('fecha_devolucion_estimada', now.toISOString())

    if (error) {
      console.error('Error checking overdue reservations:', error)
      return
    }

    for (const reservation of overdueReservations || []) {
      // Verificar si ya existe una alerta para esta reserva vencida
      const { data: existingAlert } = await supabase
        .from('alertas')
        .select('id')
        .eq('id_herramienta', reservation.id_herramienta)
        .ilike('motivo', '%reserva vencida%')
        .eq('leida', false)

      if (!existingAlert || existingAlert.length === 0) {
        await createAutomaticAlert(
          reservation.id_herramienta,
          `Reserva vencida - ${reservation.empleados?.nombre_completo} debe devolver la herramienta`,
          ALERT_PRIORITIES.HIGH
        )
      }
    }
  } catch (error) {
    console.error('Error checking overdue reservations:', error)
  }
}

// Función para verificar herramientas que necesitan mantenimiento
export const checkMaintenanceAlerts = async () => {
  try {
    // Obtener herramientas que han sido reservadas muchas veces (más de 10 veces)
    const { data: heavyUsageTools, error } = await supabase
      .from('reporte_herramientas_mas_usadas')
      .select('*')
      .gte('total_reservas', 10)

    if (error) {
      console.error('Error checking maintenance alerts:', error)
      return
    }

    for (const tool of heavyUsageTools || []) {
      // Verificar si ya existe una alerta de mantenimiento
      const { data: existingAlert } = await supabase
        .from('alertas')
        .select('id')
        .eq('id_herramienta', tool.id)
        .ilike('motivo', '%mantenimiento%')
        .eq('leida', false)

      if (!existingAlert || existingAlert.length === 0) {
        await createAutomaticAlert(
          tool.id,
          `Herramienta requiere mantenimiento preventivo - Uso intensivo detectado (${tool.total_reservas} reservas)`,
          ALERT_PRIORITIES.MEDIUM
        )
      }
    }
  } catch (error) {
    console.error('Error checking maintenance alerts:', error)
  }
}

// Función para limpiar alertas obsoletas
export const cleanupOldAlerts = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { error } = await supabase
      .from('alertas')
      .delete()
      .eq('leida', true)
      .lt('fecha_creacion', cutoffDate.toISOString())

    if (error) {
      console.error('Error cleaning up old alerts:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error cleaning up old alerts:', error)
    return false
  }
}

// Función para obtener estadísticas de alertas
export const getAlertsStats = async () => {
  try {
    const { data: allAlerts, error } = await supabase
      .from('alertas')
      .select('motivo, leida, fecha_creacion')

    if (error) {
      console.error('Error getting alerts stats:', error)
      return null
    }

    const stats = {
      total: allAlerts.length,
      unread: allAlerts.filter(a => !a.leida).length,
      deterioro: allAlerts.filter(a => a.motivo.toLowerCase().includes('deterioro')).length,
      vencimiento: allAlerts.filter(a => a.motivo.toLowerCase().includes('vencimiento')).length,
      mantenimiento: allAlerts.filter(a => a.motivo.toLowerCase().includes('mantenimiento')).length,
      today: allAlerts.filter(a => {
        const today = new Date().toDateString()
        const alertDate = new Date(a.fecha_creacion).toDateString()
        return today === alertDate
      }).length
    }

    return stats
  } catch (error) {
    console.error('Error getting alerts stats:', error)
    return null
  }
}

// Función para formatear mensajes de alerta
export const formatAlertMessage = (type, toolName, additionalInfo = '') => {
  const messages = {
    [ALERT_TYPES.DETERIORO]: `La herramienta "${toolName}" presenta deterioro y requiere atención inmediata`,
    [ALERT_TYPES.VENCIMIENTO]: `La reserva de "${toolName}" ha vencido${additionalInfo ? ` - ${additionalInfo}` : ''}`,
    [ALERT_TYPES.MANTENIMIENTO]: `La herramienta "${toolName}" requiere mantenimiento preventivo${additionalInfo ? ` - ${additionalInfo}` : ''}`,
    [ALERT_TYPES.RESERVA_VENCIDA]: `Reserva vencida: "${toolName}"${additionalInfo ? ` - ${additionalInfo}` : ''}`,
    [ALERT_TYPES.STOCK_BAJO]: `Stock bajo: "${toolName}"${additionalInfo ? ` - ${additionalInfo}` : ''}`
  }

  return messages[type] || `Alerta para la herramienta "${toolName}"`
}

// Función para enviar notificaciones por email (simulada)
export const sendEmailNotification = async (alertData) => {
  try {
    // Esta función simula el envío de email
    // En producción, aquí integrarías con un servicio como SendGrid, AWS SES, etc.
    console.log('Enviando notificación por email:', {
      to: 'admin@taller.com',
      subject: 'Nueva Alerta del Sistema',
      body: `Se ha generado una nueva alerta: ${alertData.motivo}`,
      priority: alertData.prioridad || ALERT_PRIORITIES.MEDIUM
    })

    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return true
  } catch (error) {
    console.error('Error sending email notification:', error)
    return false
  }
}

// Función para crear alerta con notificación
export const createAlertWithNotification = async (toolId, reason, priority = ALERT_PRIORITIES.MEDIUM, sendEmail = false) => {
  try {
    const alert = await createAutomaticAlert(toolId, reason, priority)
    
    if (alert && sendEmail && priority === ALERT_PRIORITIES.HIGH) {
      await sendEmailNotification(alert)
    }
    
    return alert
  } catch (error) {
    console.error('Error creating alert with notification:', error)
    return null
  }
}

// Función para programar verificaciones automáticas
export const scheduleAutomaticChecks = () => {
  // Verificar reservas vencidas cada 30 minutos
  setInterval(checkOverdueReservations, 30 * 60 * 1000)
  
  // Verificar mantenimiento necesario cada 6 horas
  setInterval(checkMaintenanceAlerts, 6 * 60 * 60 * 1000)
  
  // Limpiar alertas antiguas una vez al día
  setInterval(() => cleanupOldAlerts(30), 24 * 60 * 60 * 1000)
}

// Función para exportar alertas a CSV
export const exportAlertsToCSV = (alerts) => {
  try {
    const headers = ['Fecha', 'Herramienta', 'Categoría', 'Motivo', 'Estado', 'Prioridad']
    
    const csvContent = [
      headers.join(','),
      ...alerts.map(alert => [
        new Date(alert.fecha_creacion).toLocaleDateString('es-ES'),
        alert.herramientas?.nombre || 'N/A',
        alert.herramientas?.categoria || 'N/A',
        `"${alert.motivo}"`,
        alert.leida ? 'Leída' : 'No leída',
        alert.prioridad || 'Media'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `alertas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    return true
  } catch (error) {
    console.error('Error exporting alerts to CSV:', error)
    return false
  }
}

// Función para agrupar alertas por categoría
export const groupAlertsByCategory = (alerts) => {
  return alerts.reduce((groups, alert) => {
    let category = 'otros'
    
    if (alert.motivo.toLowerCase().includes('deterioro')) {
      category = 'deterioro'
    } else if (alert.motivo.toLowerCase().includes('vencimiento') || alert.motivo.toLowerCase().includes('vencida')) {
      category = 'vencimiento'
    } else if (alert.motivo.toLowerCase().includes('mantenimiento')) {
      category = 'mantenimiento'
    }
    
    if (!groups[category]) {
      groups[category] = []
    }
    
    groups[category].push(alert)
    return groups
  }, {})
}

// Función para calcular métricas de rendimiento
export const calculateAlertMetrics = (alerts) => {
  const now = new Date()
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return {
    total: alerts.length,
    unread: alerts.filter(a => !a.leida).length,
    last24Hours: alerts.filter(a => new Date(a.fecha_creacion) >= last24Hours).length,
    last7Days: alerts.filter(a => new Date(a.fecha_creacion) >= last7Days).length,
    last30Days: alerts.filter(a => new Date(a.fecha_creacion) >= last30Days).length,
    avgResponseTime: calculateAverageResponseTime(alerts),
    byPriority: {
      critical: alerts.filter(a => a.prioridad === ALERT_PRIORITIES.CRITICAL).length,
      high: alerts.filter(a => a.prioridad === ALERT_PRIORITIES.HIGH).length,
      medium: alerts.filter(a => a.prioridad === ALERT_PRIORITIES.MEDIUM).length,
      low: alerts.filter(a => a.prioridad === ALERT_PRIORITIES.LOW).length
    }
  }
}

// Función auxiliar para calcular tiempo promedio de respuesta
const calculateAverageResponseTime = (alerts) => {
  const readAlerts = alerts.filter(a => a.leida && a.fecha_lectura)
  
  if (readAlerts.length === 0) return 0
  
  const totalTime = readAlerts.reduce((sum, alert) => {
    const created = new Date(alert.fecha_creacion)
    const read = new Date(alert.fecha_lectura)
    return sum + (read - created)
  }, 0)
  
  return Math.round(totalTime / readAlerts.length / (1000 * 60)) // En minutos
}

// Función para validar datos de alerta
export const validateAlertData = (alertData) => {
  const errors = []
  
  if (!alertData.id_herramienta) {
    errors.push('ID de herramienta es requerido')
  }
  
  if (!alertData.motivo || alertData.motivo.trim().length < 10) {
    errors.push('El motivo debe tener al menos 10 caracteres')
  }
  
  if (alertData.prioridad && !Object.values(ALERT_PRIORITIES).includes(alertData.prioridad)) {
    errors.push('Prioridad no válida')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export default {
  ALERT_TYPES,
  ALERT_PRIORITIES,
  createAutomaticAlert,
  checkToolConditionAlerts,
  checkOverdueReservations,
  checkMaintenanceAlerts,
  cleanupOldAlerts,
  getAlertsStats,
  formatAlertMessage,
  sendEmailNotification,
  createAlertWithNotification,
  scheduleAutomaticChecks,
  exportAlertsToCSV,
  groupAlertsByCategory,
  calculateAlertMetrics,
  validateAlertData
}