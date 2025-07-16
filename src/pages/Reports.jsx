import { useAuth } from '../hooks/useAuth'
import useReports from '../hooks/useReports'
import ExportButtons from '../components/Reports/ExportButtons'
import BarChart from '../components/Reports/BarChart'
import LineChart from '../components/Reports/LineChart'
import DoughnutChart from '../components/Reports/DoughnutChart'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Reports = () => {
  const { user } = useAuth()
  const {
    // Datos para gráficos
    toolsStats,
    employeesStats,
    categoriesStats,
    monthlyStats,
    reservationsStats,
    
    // Datos para exportación
    generalStats,
    overdueReservationsData,
    alertsData,
    loading,
    error,
    refreshData,
    getExportData
  } = useReports()

  if (loading) {
    return <LoadingSpinner text="Generando reportes..." />
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Error al cargar reportes</h3>
          <p className="mt-1 text-sm text-secondary-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={refreshData}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Calcular días promedio de vencimiento
  const getAverageOverdueDays = () => {
    if (!overdueReservationsData || overdueReservationsData.length === 0) return 0
    const totalDays = overdueReservationsData.reduce((sum, reservation) => {
      const daysOverdue = Math.ceil((new Date() - new Date(reservation.fecha_devolucion_estimada)) / (1000 * 60 * 60 * 24))
      return sum + daysOverdue
    }, 0)
    return Math.round(totalDays / overdueReservationsData.length)
  }

  // Preparar datos para gráfico de alertas por tipo
  const alertsByType = alertsData.reduce((acc, alert) => {
    const type = alert.motivo?.toLowerCase().includes('deterioro') ? 'Deterioro' : 
                alert.motivo?.toLowerCase().includes('vencida') ? 'Vencidas' : 'General'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const alertsStatsForChart = Object.entries(alertsByType).map(([tipo, total]) => ({
    tipo,
    total
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Reportes y Estadísticas
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Análisis detallado del uso de herramientas y actividad del taller
            {generalStats.overdueReservations > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {generalStats.overdueReservations} reservas vencidas
              </span>
            )}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={refreshData}
            className="inline-flex items-center px-4 py-2 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          
          {/* Botones de exportación */}
          <ExportButtons 
            reportData={getExportData()}
            containerId="reports-container"
          />
        </div>
      </div>

      {/* Alerta de reservas vencidas */}
      {generalStats.overdueReservations > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Atención: {generalStats.overdueReservations} reserva{generalStats.overdueReservations !== 1 ? 's' : ''} vencida{generalStats.overdueReservations !== 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Se detectaron reservas que no han sido devueltas a tiempo. 
                  Promedio de retraso: {getAverageOverdueDays()} días. 
                  Revisa la sección de reservas vencidas para más detalles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido del reporte - Contenedor principal para exportación */}
      <div id="reports-container" data-reports-content className="space-y-8">
        {/* Header del reporte para exportación */}
        <div className="text-center mb-8 print:block hidden">
          <h1 className="text-3xl font-bold text-secondary-900">
            Reporte de Inventario - Taller Automotriz
          </h1>
          <p className="text-secondary-600 mt-2">
            Generado el {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} por {user?.nombre || user?.email}
          </p>
          {generalStats.overdueReservations > 0 && (
            <p className="text-red-600 mt-1 font-medium">
              ⚠️ Incluye {generalStats.overdueReservations} reserva{generalStats.overdueReservations !== 1 ? 's' : ''} vencida{generalStats.overdueReservations !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Estadísticas principales en cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Total Herramientas
                    </dt>
                    <dd className="text-lg font-medium text-secondary-900">
                      {generalStats.totalTools}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Empleados Activos
                    </dt>
                    <dd className="text-lg font-medium text-secondary-900">
                      {generalStats.totalEmployees}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Total Reservas
                    </dt>
                    <dd className="text-lg font-medium text-secondary-900">
                      {generalStats.totalReservations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Reservas Activas
                    </dt>
                    <dd className="text-lg font-medium text-secondary-900">
                      {generalStats.activeReservations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Nueva card para reservas vencidas */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Reservas Vencidas
                    </dt>
                    <dd className="text-lg font-medium text-red-900">
                      {generalStats.overdueReservations}
                    </dd>
                    {generalStats.overdueReservations > 0 && (
                      <dt className="text-xs text-red-600 mt-1">
                        Promedio: {getAverageOverdueDays()} días
                      </dt>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-secondary-500 truncate">
                      Alertas Activas
                    </dt>
                    <dd className="text-lg font-medium text-secondary-900">
                      {generalStats.alertsCount}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 10 Herramientas más usadas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <BarChart
              data={toolsStats.slice(0, 10)}
              title="Top 10 Herramientas Más Utilizadas"
              labelKey="nombre"
              valueKey="total_reservas"
              color="#DC2626"
            />
          </div>

          {/* Top 10 Empleados más activos */}
          <div className="bg-white p-6 rounded-lg shadow">
            <BarChart
              data={employeesStats.slice(0, 10)}
              title="Top 10 Empleados Más Activos"
              labelKey="nombre_completo"
              valueKey="total_reservas"
              color="#059669"
            />
          </div>
        </div>

        {/* Gráficos de distribución */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribución por categorías */}
          <div className="bg-white p-6 rounded-lg shadow">
            <DoughnutChart
              data={categoriesStats}
              title="Distribución por Categorías"
              labelKey="categoria"
              valueKey="total"
            />
          </div>

          {/* Estado de reservas (incluyendo vencidas) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <DoughnutChart
              data={reservationsStats}
              title="Estado de Reservas"
              labelKey="estado"
              valueKey="total"
            />
          </div>
        </div>

        {/* Nuevos gráficos de alertas y vencidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribución de alertas por tipo */}
          <div className="bg-white p-6 rounded-lg shadow">
            <DoughnutChart
              data={alertsStatsForChart}
              title="Distribución de Alertas por Tipo"
              labelKey="tipo"
              valueKey="total"
            />
          </div>

          {/* Tendencia mensual */}
          <div className="bg-white p-6 rounded-lg shadow">
            <LineChart
              data={monthlyStats}
              title="Tendencia Mensual de Reservas"
              labelKey="mes"
              valueKey="total"
              color="#7C3AED"
            />
          </div>
        </div>

        {/* Tablas de datos detallados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tabla de herramientas */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Herramientas Top
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Herramienta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Reservas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {toolsStats.slice(0, 10).map((tool, index) => (
                    <tr key={index} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                        {tool.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {tool.total_reservas || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {tool.calificacion_promedio ? parseFloat(tool.calificacion_promedio).toFixed(1) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de empleados */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-secondary-200">
              <h3 className="text-lg leading-6 font-medium text-secondary-900">
                Empleados Top
              </h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Reservas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Calificación
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {employeesStats.slice(0, 10).map((employee, index) => (
                    <tr key={index} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                        {employee.nombre_completo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {employee.total_reservas || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                        {employee.calificacion_promedio ? parseFloat(employee.calificacion_promedio).toFixed(1) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Nueva tabla de reservas vencidas */}
        {overdueReservationsData && overdueReservationsData.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden border-l-4 border-red-400">
            <div className="px-6 py-4 border-b border-secondary-200 bg-red-50">
              <h3 className="text-lg leading-6 font-medium text-red-900">
                Reservas Vencidas ({overdueReservationsData.length})
              </h3>
              <p className="text-sm text-red-700">
                Herramientas que no han sido devueltas a tiempo
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-red-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Herramienta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Días Vencida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Fecha Límite
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {overdueReservationsData.map((reservation, index) => {
                    const daysOverdue = Math.ceil((new Date() - new Date(reservation.fecha_devolucion_estimada)) / (1000 * 60 * 60 * 24))
                    return (
                      <tr key={index} className="hover:bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-900">
                          {reservation.empleados?.nombre_completo}
                          <div className="text-xs text-red-600">{reservation.empleados?.cargo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-800">
                          {reservation.herramientas?.nombre}
                          <div className="text-xs text-red-600">{reservation.herramientas?.categoria}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-900 font-semibold">
                          {daysOverdue} día{daysOverdue !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-800">
                          {new Date(reservation.fecha_devolucion_estimada).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer del reporte */}
        <div className="text-center text-sm text-secondary-500 border-t border-secondary-200 pt-6 print:block hidden">
          <p>
            Sistema de Gestión de Inventario - Taller Automotriz
          </p>
          <p>
            Generado automáticamente el {new Date().toLocaleString('es-ES')}
          </p>
          {generalStats.overdueReservations > 0 && (
            <p className="text-red-600 mt-1">
              ⚠️ Reporte incluye {generalStats.overdueReservations} reserva{generalStats.overdueReservations !== 1 ? 's' : ''} vencida{generalStats.overdueReservations !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports