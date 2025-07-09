import { useState, useEffect } from 'react'
import { reportsService } from '../../utils/reportsService'
import DoughnutChart from '../Reports/DoughnutChart'
import BarChart from '../Reports/BarChart'

const DashboardCharts = () => {
  const [chartsData, setChartsData] = useState({
    toolsStatus: [],
    topTools: [],
    toolsByCategory: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartsData()
  }, [])

  const loadChartsData = async () => {
    try {
      setLoading(true)
      
      const [toolsStatus, topTools, toolsByCategory] = await Promise.all([
        reportsService.getToolsStatus(),
        reportsService.getTopTools(5), // Solo top 5 para dashboard
        reportsService.getToolsByCategory()
      ])

      setChartsData({
        toolsStatus,
        topTools,
        toolsByCategory
      })
    } catch (error) {
      console.error('Error loading charts data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-white shadow rounded-lg animate-pulse">
            <div className="p-6">
              <div className="h-4 bg-secondary-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-secondary-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Estado de herramientas */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">
            Estado de Herramientas
          </h3>
          <p className="text-sm text-secondary-500">
            Disponibilidad actual
          </p>
        </div>
        <div className="p-6">
          <DoughnutChart
            data={chartsData.toolsStatus.map(status => ({
              label: status.estado,
              value: status.count
            }))}
            height={250}
            showTotal={true}
          />
        </div>
      </div>

      {/* Top 5 herramientas */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">
            Top 5 Herramientas
          </h3>
          <p className="text-sm text-secondary-500">
            Más utilizadas
          </p>
        </div>
        <div className="p-6">
          <BarChart
            data={chartsData.topTools.map(tool => ({
              label: tool.nombre.length > 15 ? tool.nombre.substring(0, 15) + '...' : tool.nombre,
              value: tool.total_reservas
            }))}
            height={250}
            color="#dc2626"
            showValues={true}
          />
        </div>
      </div>

      {/* Distribución por categorías */}
      <div className="bg-white shadow rounded-lg lg:col-span-2 xl:col-span-1">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">
            Por Categorías
          </h3>
          <p className="text-sm text-secondary-500">
            Distribución del inventario
          </p>
        </div>
        <div className="p-6">
          <DoughnutChart
            data={chartsData.toolsByCategory.map(category => ({
              label: category.categoria.length > 20 ? category.categoria.substring(0, 20) + '...' : category.categoria,
              value: category.count
            }))}
            height={250}
            showTotal={true}
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardCharts