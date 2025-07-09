import { supabase } from '../config/supabase'

export const reportsService = {
  // Estadísticas generales del sistema
  async getGeneralStats() {
    try {
      const [
        { count: totalTools },
        { count: totalEmployees },
        { count: totalReservations },
        { count: activeReservations },
        { count: alertsCount }
      ] = await Promise.all([
        supabase.from('herramientas').select('*', { count: 'exact', head: true }),
        supabase.from('empleados').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'reservada'),
        supabase.from('alertas').select('*', { count: 'exact', head: true }).eq('leida', false)
      ])

      return {
        totalTools: totalTools || 0,
        totalEmployees: totalEmployees || 0,
        totalReservations: totalReservations || 0,
        activeReservations: activeReservations || 0,
        alertsCount: alertsCount || 0
      }
    } catch (error) {
      console.error('Error fetching general stats:', error)
      return null
    }
  },

  // Top 10 herramientas más usadas
  async getTopTools(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('reporte_herramientas_mas_usadas')
        .select('*')
        .order('total_reservas', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching top tools:', error)
      return []
    }
  },

  // Top 10 empleados más activos
  async getTopEmployees(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('reporte_empleados_mas_activos')
        .select('*')
        .order('total_reservas', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching top employees:', error)
      return []
    }
  },

  // Distribución de herramientas por categoría
  async getToolsByCategory() {
    try {
      const { data, error } = await supabase
        .from('herramientas')
        .select('categoria')

      if (error) throw error

      const categoryCount = {}
      data.forEach(tool => {
        categoryCount[tool.categoria] = (categoryCount[tool.categoria] || 0) + 1
      })

      return Object.entries(categoryCount).map(([categoria, count]) => ({
        categoria,
        count
      }))
    } catch (error) {
      console.error('Error fetching tools by category:', error)
      return []
    }
  },

  // Estado de herramientas (disponible, reservada)
  async getToolsStatus() {
    try {
      const { data, error } = await supabase
        .from('herramientas')
        .select('estado')

      if (error) throw error

      const statusCount = {
        disponible: 0,
        reservada: 0
      }

      data.forEach(tool => {
        statusCount[tool.estado] = (statusCount[tool.estado] || 0) + 1
      })

      return [
        { estado: 'Disponible', count: statusCount.disponible },
        { estado: 'Reservada', count: statusCount.reservada }
      ]
    } catch (error) {
      console.error('Error fetching tools status:', error)
      return []
    }
  },

  // Condición de herramientas (bueno, malo, deterioro)
  async getToolsCondition() {
    try {
      const { data, error } = await supabase
        .from('herramientas')
        .select('condicion')

      if (error) throw error

      const conditionCount = {
        bueno: 0,
        malo: 0,
        deterioro: 0
      }

      data.forEach(tool => {
        conditionCount[tool.condicion] = (conditionCount[tool.condicion] || 0) + 1
      })

      return [
        { condicion: 'Bueno', count: conditionCount.bueno },
        { condicion: 'Malo', count: conditionCount.malo },
        { condicion: 'Deterioro', count: conditionCount.deterioro }
      ]
    } catch (error) {
      console.error('Error fetching tools condition:', error)
      return []
    }
  },

  // Reservas por mes (últimos 12 meses)
  async getReservationsByMonth() {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('fecha_reserva')
        .gte('fecha_reserva', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      const monthlyData = {}
      const months = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ]

      // Inicializar últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
        monthlyData[monthKey] = 0
      }

      // Contar reservas por mes
      data.forEach(reservation => {
        const date = new Date(reservation.fecha_reserva)
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++
        }
      })

      return Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      }))
    } catch (error) {
      console.error('Error fetching reservations by month:', error)
      return []
    }
  },

  // Promedio de calificaciones por herramienta
  async getAverageRatings() {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select(`
          calificacion,
          herramientas (nombre)
        `)

      if (error) throw error

      const ratingsData = {}
      data.forEach(rating => {
        const toolName = rating.herramientas?.nombre
        if (toolName) {
          if (!ratingsData[toolName]) {
            ratingsData[toolName] = { total: 0, count: 0 }
          }
          ratingsData[toolName].total += rating.calificacion
          ratingsData[toolName].count += 1
        }
      })

      return Object.entries(ratingsData)
        .map(([toolName, data]) => ({
          herramienta: toolName,
          promedio: (data.total / data.count).toFixed(1),
          totalCalificaciones: data.count
        }))
        .sort((a, b) => b.promedio - a.promedio)
        .slice(0, 10)
    } catch (error) {
      console.error('Error fetching average ratings:', error)
      return []
    }
  },

  // Alertas por tipo de motivo
  async getAlertsByType() {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select('motivo')

      if (error) throw error

      const alertTypes = {}
      data.forEach(alert => {
        alertTypes[alert.motivo] = (alertTypes[alert.motivo] || 0) + 1
      })

      return Object.entries(alertTypes).map(([tipo, count]) => ({
        tipo,
        count
      }))
    } catch (error) {
      console.error('Error fetching alerts by type:', error)
      return []
    }
  },

  // Estadísticas de devoluciones (a tiempo vs tarde)
  async getReturnStats() {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('fecha_devolucion_estimada, fecha_devolucion_real')
        .not('fecha_devolucion_real', 'is', null)

      if (error) throw error

      let onTime = 0
      let late = 0

      data.forEach(reservation => {
        const estimatedDate = new Date(reservation.fecha_devolucion_estimada)
        const actualDate = new Date(reservation.fecha_devolucion_real)
        
        if (actualDate <= estimatedDate) {
          onTime++
        } else {
          late++
        }
      })

      return [
        { categoria: 'A tiempo', count: onTime },
        { categoria: 'Tarde', count: late }
      ]
    } catch (error) {
      console.error('Error fetching return stats:', error)
      return []
    }
  },

  // Generar reporte completo en formato PDF (datos para exportar)
  async getCompleteReport() {
    try {
      const [
        generalStats,
        topTools,
        topEmployees,
        toolsByCategory,
        toolsStatus,
        toolsCondition,
        reservationsByMonth,
        averageRatings,
        alertsByType,
        returnStats
      ] = await Promise.all([
        this.getGeneralStats(),
        this.getTopTools(),
        this.getTopEmployees(),
        this.getToolsByCategory(),
        this.getToolsStatus(),
        this.getToolsCondition(),
        this.getReservationsByMonth(),
        this.getAverageRatings(),
        this.getAlertsByType(),
        this.getReturnStats()
      ])

      return {
        generalStats,
        topTools,
        topEmployees,
        toolsByCategory,
        toolsStatus,
        toolsCondition,
        reservationsByMonth,
        averageRatings,
        alertsByType,
        returnStats,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error generating complete report:', error)
      return null
    }
  }
}