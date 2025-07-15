import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const useReports = () => {
  const [data, setData] = useState({
    // Datos para gráficos (mantener compatibilidad)
    toolsStats: [],
    employeesStats: [],
    categoriesStats: [],
    monthlyStats: [],
    
    // Datos estructurados para exportUtils
    generalStats: {
      totalTools: 0,
      totalEmployees: 0,
      totalReservations: 0,
      activeReservations: 0,
      alertsCount: 0
    },
    topTools: [],
    topEmployees: [],
    toolsByCategory: [],
    toolsStatus: [],
    toolsCondition: [],
    reservationsByMonth: [],
    
    loading: true,
    error: null
  })

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // 1. Estadísticas generales
      const [
        { data: toolsData, error: toolsError },
        { count: employeesCount, error: employeesError },
        { count: totalReservationsCount, error: totalReservationsError },
        { count: activeReservationsCount, error: activeReservationsError },
        { count: alertsCount, error: alertsError }
      ] = await Promise.all([
        supabase.from('herramientas').select('estado, condicion, categoria'),
        supabase.from('empleados').select('*', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('reservas').select('*', { count: 'exact', head: true }),
        supabase.from('reservas').select('*', { count: 'exact', head: true }).eq('estado', 'reservada'),
        supabase.from('alertas').select('*', { count: 'exact', head: true }).eq('leida', false)
      ])

      if (toolsError) throw toolsError
      if (employeesError) throw employeesError
      if (totalReservationsError) throw totalReservationsError
      if (activeReservationsError) throw activeReservationsError
      if (alertsError) throw alertsError

      // 2. Top herramientas más usadas
      const { data: topToolsData, error: topToolsError } = await supabase
        .from('reporte_herramientas_mas_usadas')
        .select('*')
        .order('total_reservas', { ascending: false })
        .limit(10)

      if (topToolsError) throw topToolsError

      // 3. Top empleados más activos
      const { data: topEmployeesData, error: topEmployeesError } = await supabase
        .from('reporte_empleados_mas_activos')
        .select('*')
        .order('total_reservas', { ascending: false })
        .limit(10)

      if (topEmployeesError) throw topEmployeesError

      // 4. Reservas por mes (últimos 12 meses)
      const { data: monthlyReservationsData, error: monthlyError } = await supabase
        .from('reservas')
        .select('fecha_reserva')
        .gte('fecha_reserva', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

      if (monthlyError) throw monthlyError

      // Procesar datos

      // Estadísticas generales
      const generalStats = {
        totalTools: toolsData?.length || 0,
        totalEmployees: employeesCount || 0,
        totalReservations: totalReservationsCount || 0,
        activeReservations: activeReservationsCount || 0,
        alertsCount: alertsCount || 0
      }

      // Distribución por categorías
      const categoriesCount = {}
      toolsData?.forEach(tool => {
        categoriesCount[tool.categoria] = (categoriesCount[tool.categoria] || 0) + 1
      })

      const toolsByCategory = Object.entries(categoriesCount).map(([categoria, count]) => ({
        categoria,
        count
      }))

      // También para gráficos (mantener compatibilidad)
      const categoriesStats = toolsByCategory.map(item => ({
        categoria: item.categoria,
        total: item.count
      }))

      // Estado de herramientas
      const statusCount = {}
      toolsData?.forEach(tool => {
        statusCount[tool.estado] = (statusCount[tool.estado] || 0) + 1
      })

      const toolsStatus = Object.entries(statusCount).map(([estado, count]) => ({
        estado: estado === 'disponible' ? 'Disponible' : 'Reservada',
        count
      }))

      // Condición de herramientas
      const conditionCount = {}
      toolsData?.forEach(tool => {
        conditionCount[tool.condicion] = (conditionCount[tool.condicion] || 0) + 1
      })

      const toolsCondition = Object.entries(conditionCount).map(([condicion, count]) => ({
        condicion: condicion === 'bueno' ? 'Bueno' : condicion === 'malo' ? 'Malo' : 'Deterioro',
        count
      }))

      // Reservas por mes
      const monthlyCount = {}
      monthlyReservationsData?.forEach(reserva => {
        const date = new Date(reserva.fecha_reserva)
        const monthKey = date.toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short' 
        })
        monthlyCount[monthKey] = (monthlyCount[monthKey] || 0) + 1
      })

      const reservationsByMonth = Object.entries(monthlyCount)
        .map(([month, count]) => ({ month, count }))
        .slice(-12) // Últimos 12 meses

      // También para gráficos (mantener compatibilidad)
      const monthlyStats = reservationsByMonth.map(item => ({
        mes: item.month,
        total: item.count
      }))

      // Estado de reservas para gráficos
      const reservationsStats = toolsStatus.map(item => ({
        estado: item.estado,
        total: item.count
      }))

      // Actualizar estado
      setData({
        // Para gráficos (compatibilidad)
        toolsStats: topToolsData || [],
        employeesStats: topEmployeesData || [],
        categoriesStats,
        monthlyStats,
        reservationsStats,
        
        // Para exportUtils
        generalStats,
        topTools: topToolsData || [],
        topEmployees: topEmployeesData || [],
        toolsByCategory,
        toolsStatus,
        toolsCondition,
        reservationsByMonth,
        
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Error fetching reports data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }

  const refreshData = () => {
    fetchReportsData()
  }

  // Función para obtener datos formateados para exportación
  const getExportData = () => {
    return {
      generalStats: data.generalStats,
      topTools: data.topTools,
      topEmployees: data.topEmployees,
      toolsByCategory: data.toolsByCategory,
      toolsStatus: data.toolsStatus,
      toolsCondition: data.toolsCondition,
      reservationsByMonth: data.reservationsByMonth
    }
  }

  return { 
    ...data, 
    refreshData,
    getExportData
  }
}

export default useReports