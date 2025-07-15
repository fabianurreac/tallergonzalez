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

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
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

          {/* Estado de reservas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <DoughnutChart
              data={reservationsStats}
              title="Estado de Reservas"
              labelKey="estado"
              valueKey="total"
            />
          </div>
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

        {/* Footer del reporte */}
        <div className="text-center text-sm text-secondary-500 border-t border-secondary-200 pt-6 print:block hidden">
          <p>
            Sistema de Gestión de Inventario - Taller Automotriz
          </p>
          <p>
            Generado automáticamente el {new Date().toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Reports