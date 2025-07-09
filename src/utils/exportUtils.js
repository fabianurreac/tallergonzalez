import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { reportsService } from '../utils/reportsService'
import BarChart from '../components/Reports/BarChart'
import DoughnutChart from '../components/Reports/DoughnutChart'
import LineChart from '../components/Reports/LineChart'
import MetricsCard from '../components/Reports/MetricsCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Reports = () => {
  const { hasPermission } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState({
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
  })
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (hasPermission('almacenista')) {
      loadReportData()
    }
  }, [hasPermission])

  const loadReportData = async () => {
    try {
      setLoading(true)
      const data = await reportsService.getCompleteReport()
      
      if (data) {
        setReportData(data)
      }
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReportData()
    setRefreshing(false)
  }

  const exportReport = async () => {
    try {
      const data = await reportsService.getCompleteReport()
      const jsonString = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-inventario-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (!hasPermission('almacenista')) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-secondary-900">Acceso restringido</h3>
        <p className="mt-1 text-sm text-secondary-500">No tienes permisos para ver los reportes.</p>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner text="Cargando reportes..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Reportes y Estadísticas
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Análisis completo del inventario y uso de herramientas
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary"
          >
            <svg className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={exportReport}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Filtros de período */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-secondary-700">Período:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">Todo el tiempo</option>
            <option value="year">Último año</option>
            <option value="month">Último mes</option>
            <option value="week">Última semana</option>
          </select>
        </div>
      </div>

      {/* Métricas generales */}
      {reportData.generalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricsCard
            title="Total Herramientas"
            value={reportData.generalStats.totalTools}
            description="Inventario total"
            color="blue"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <MetricsCard
            title="Empleados"
            value={reportData.generalStats.totalEmployees}
            description="Personal registrado"
            color="green"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            }
          />
          <MetricsCard
            title="Reservas Totales"
            value={reportData.generalStats.totalReservations}
            description="Histórico de reservas"
            color="purple"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <MetricsCard
            title="Reservas Activas"
            value={reportData.generalStats.activeReservations}
            description="En uso actualmente"
            color="yellow"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
          <MetricsCard
            title="Alertas Pendientes"
            value={reportData.generalStats.alertsCount}
            description="Requieren atención"
            color="red"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            }
          />
        </div>
      )}

      {/* Grid de gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Herramientas más usadas */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Herramientas Más Utilizadas
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Top 10 por número de reservas
            </p>
          </div>
          <div className="card-body" id="reports-container">
            <BarChart
              data={reportData.topTools.map(tool => ({
                label: tool.nombre,
                value: tool.total_reservas
              }))}
              title=""
              height={350}
              color="#dc2626"
            />
          </div>
        </div>

        {/* Estado de herramientas */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Estado de Herramientas
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Disponibilidad actual
            </p>
          </div>
          <div className="card-body">
            <DoughnutChart
              data={reportData.toolsStatus.map(status => ({
                label: status.estado,
                value: status.count
              }))}
              title=""
              height={350}
            />
          </div>
        </div>

        {/* Distribución por categorías */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Distribución por Categorías
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Inventario por tipo de herramienta
            </p>
          </div>
          <div className="card-body">
            <BarChart
              data={reportData.toolsByCategory.map(category => ({
                label: category.categoria,
                value: category.count
              }))}
              title=""
              height={350}
              color="#3b82f6"
            />
          </div>
        </div>

        {/* Condición de herramientas */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Condición de Herramientas
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Estado físico del inventario
            </p>
          </div>
          <div className="card-body">
            <DoughnutChart
              data={reportData.toolsCondition.map(condition => ({
                label: condition.condicion,
                value: condition.count
              }))}
              title=""
              height={350}
            />
          </div>
        </div>
      </div>

      {/* Gráfica de tendencias - Reservas por mes */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg leading-6 font-medium text-secondary-900">
            Tendencia de Reservas
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            Evolución mensual de las reservas (últimos 12 meses)
          </p>
        </div>
        <div className="card-body">
          <LineChart
            data={reportData.reservationsByMonth.map(month => ({
              label: month.month,
              value: month.count
            }))}
            title=""
            height={400}
            color="#10b981"
          />
        </div>
      </div>

      {/* Grid de estadísticas adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top empleados más activos */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Empleados Más Activos
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Top 10 por número de reservas
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {reportData.topEmployees.slice(0, 10).map((employee, index) => (
                <div key={employee.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index < 3 ? 'bg-primary-500' : 'bg-secondary-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-secondary-900">
                        {employee.nombre_completo}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {employee.cargo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary-900">
                      {employee.total_reservas} reservas
                    </p>
                    {employee.calificacion_promedio && (
                      <p className="text-xs text-secondary-500">
                        ⭐ {parseFloat(employee.calificacion_promedio).toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estadísticas de devoluciones */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Puntualidad en Devoluciones
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Cumplimiento de fechas estimadas
            </p>
          </div>
          <div className="card-body">
            <DoughnutChart
              data={reportData.returnStats.map(stat => ({
                label: stat.categoria,
                value: stat.count
              }))}
              title=""
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Alertas por tipo */}
      {reportData.alertsByType.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-secondary-900">
              Distribución de Alertas
            </h3>
            <p className="mt-1 text-sm text-secondary-500">
              Tipos de alertas generadas en el sistema
            </p>
          </div>
          <div className="card-body">
            <BarChart
              data={reportData.alertsByType.map(alert => ({
                label: alert.tipo,
                value: alert.count
              }))}
              title=""
              height={300}
              color="#ef4444"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports