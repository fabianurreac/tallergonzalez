import { Line } from 'react-chartjs-2'
import { lineChartOptions, chartColors, createGradient } from '../../utils/chartConfig'

const LineChart = ({ 
  data, 
  title = "Gráfica de Líneas",
  labelKey = "label",
  valueKey = "value",
  height = 400,
  fill = true,
  tension = 0.3,
  color = chartColors.primary
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Sin datos</h3>
          <p className="mt-1 text-sm text-secondary-500">No hay información disponible para mostrar.</p>
        </div>
      </div>
    )
  }

  const labels = data.map(item => item[labelKey])
  const values = data.map(item => item[valueKey])

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        borderColor: color,
        backgroundColor: fill ? `${color}20` : 'transparent',
        borderWidth: 3,
        fill: fill,
        tension: tension,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3
      }
    ]
  }

  const options = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      title: {
        display: !!title,
        text: title,
        font: {
          family: 'Inter',
          size: 16,
          weight: 'bold'
        },
        color: '#374151',
        padding: 20
      },
      tooltip: {
        ...lineChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y
            return `${context.dataset.label}: ${value}`
          }
        }
      }
    }
  }

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <Line data={chartData} options={options} />
    </div>
  )
}

export default LineChart