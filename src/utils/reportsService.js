import { supabase } from '../config/supabase'

export const reportsService = {
  // Obtener estadísticas generales
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
      console.error('Error getting general stats:', error)
      return {
        totalTools: 0,
        totalEmployees: 0,
        totalReservations: 0,
        activeReservations: 0,
        alertsCount: 0
      }
    }
  },

  // Obtener top herramientas más usadas
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
      console.error('Error getting top tools:', error)
      return []
    }
  },

  // Obtener top empleados más activos
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
      console.error('Error getting top employees:', error)
      return []
    }
  },

  // Obtener distribución de herramientas por categoría
  async getToolsByCategory() {
    try {
      const { data, error } = await supabase
        .from('herramientas')
        .select('categoria')

      if (error) throw error

      const categoryCount = {}
      data?.forEach(tool => {
        categoryCount[tool.categoria] = (categoryCount[tool.categoria] || 0) + 1
      })

      return Object.entries(categoryCount).map(([categoria, count]) => ({
        categoria,
        count
      }))
    } catch (error) {
      console.error('Error getting tools by category:', error)
      return []
    }
  },

  // Obtener estado de herramientas
  async getToolsStatus() {
    try {
      const { data, error } = await supabase
        .from('herramientas')
        .select('estado')

      if (error) throw error

      const statusCount = {}
      data?.forEach(tool => {
        statusCount[tool.estado] = (statusCount[tool.estado] || 0) + 1
      })

      return Object.entries(statusCount).map(([estado, count]) => ({
        estado,
        count
      }))
    } catch (error) {
      console.error('Error getting tools status:', error)
      return []
    }
  },

  // Obtener condición de herramientas
  async getToolsCondition() {
    try {
      const { data, error } = await supabase
        .from('herramientas')
        .select('condicion')

      if (error) throw error

      const conditionCount = {}
      data?.forEach(tool => {
        conditionCount[tool.condicion] = (conditionCount[tool.condicion] || 0) + 1
      })

      return Object.entries(conditionCount).map(([condicion, count]) => ({
        condicion,
        count
      }))
    } catch (error) {
      console.error('Error getting tools condition:', error)
      return []
    }
  },

  // Obtener reservas por mes (últimos 12 meses)
  async getReservationsByMonth() {
    try {
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

      const { data, error } = await supabase
        .from('reservas')
        .select('fecha_reserva')
        .gte('fecha_reserva', twelveMonthsAgo.toISOString())
        .order('fecha_reserva', { ascending: true })

      if (error) throw error

      // Procesar datos por mes
      const monthlyData = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        const monthName = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
        
        const count = data?.filter(item => 
          item.fecha_reserva.startsWith(monthKey)
        ).length || 0
        
        monthlyData.push({
          month: monthName,
          count
        })
      }

      return monthlyData
    } catch (error) {
      console.error('Error getting reservations by month:', error)
      return []
    }
  },

  // Obtener calificaciones promedio
  async getAverageRatings() {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select(`
          calificacion,
          herramientas (nombre)
        `)

      if (error) throw error

      const ratings = {}
      data?.forEach(rating => {
        const toolName = rating.herramientas?.nombre
        if (toolName) {
          if (!ratings[toolName]) {
            ratings[toolName] = { total: 0, count: 0 }
          }
          ratings[toolName].total += rating.calificacion
          ratings[toolName].count += 1
        }
      })

      return Object.entries(ratings).map(([tool, data]) => ({
        tool,
        averageRating: data.count > 0 ? (data.total / data.count).toFixed(1) : 0,
        totalRatings: data.count
      })).sort((a, b) => b.averageRating - a.averageRating)
    } catch (error) {
      console.error('Error getting average ratings:', error)
      return []
    }
  },

  // Obtener alertas por tipo
  async getAlertsByType() {
    try {
      const { data, error } = await supabase
        .from('alertas')
        .select('motivo')

      if (error) throw error

      const alertTypes = {}
      data?.forEach(alert => {
        // Categorizar alertas por palabras clave en el motivo
        let tipo = 'Otros'
        if (alert.motivo.toLowerCase().includes('deterioro')) {
          tipo = 'Deterioro'
        } else if (alert.motivo.toLowerCase().includes('reserva')) {
          tipo = 'Reservas'
        } else if (alert.motivo.toLowerCase().includes('devolucion')) {
          tipo = 'Devoluciones'
        } else if (alert.motivo.toLowerCase().includes('mantenimiento')) {
          tipo = 'Mantenimiento'
        }

        alertTypes[tipo] = (alertTypes[tipo] || 0) + 1
      })

      return Object.entries(alertTypes).map(([tipo, count]) => ({
        tipo,
        count
      }))
    } catch (error) {
      console.error('Error getting alerts by type:', error)
      return []
    }
  },

  // Obtener estadísticas de devoluciones
  async getReturnStats() {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('fecha_devolucion_estimada, fecha_devolucion_real')
        .not('fecha_devolucion_real', 'is', null)

      if (error) throw error

      const stats = {
        'A Tiempo': 0,
        'Tarde': 0,
        'Temprano': 0
      }

      data?.forEach(reserva => {
        const estimada = new Date(reserva.fecha_devolucion_estimada)
        const real = new Date(reserva.fecha_devolucion_real)

        if (real <= estimada) {
          const diffDays = Math.ceil((estimada - real) / (1000 * 60 * 60 * 24))
          if (diffDays === 0) {
            stats['A Tiempo']++
          } else {
            stats['Temprano']++
          }
        } else {
          stats['Tarde']++
        }
      })

      return Object.entries(stats).map(([categoria, count]) => ({
        categoria,
        count
      }))
    } catch (error) {
      console.error('Error getting return stats:', error)
      return []
    }
  },

  // Obtener reporte completo
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
        this.getTopTools(10),
        this.getTopEmployees(10),
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
      console.error('Error getting complete report:', error)
      return {
        generalStats: null,
        topTools: [],
        topEmployees: [],
        toolsByCategory: [],
        toolsStatus: [],
        toolsCondition: [],
        reservationsByMonth: [],
        averageRatings: [],
        alertsByType: [],
        returnStats: []
      }
    }
  }
}

export default reportsService