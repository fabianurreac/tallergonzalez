import { Bar } from 'react-chartjs-2'
import { barChartOptions, generateColors } from '../../utils/chartConfig'

const BarChart = ({ 
  data, 
  title = "Gráfica de Barras",
  labelKey = "label",
  valueKey = "value",
  height = 400,
  showValues = true,
  color = null
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Sin datos</h3>
          <p className="mt-1 text-sm text-secondary-500">No hay información disponible para mostrar.</p>
        </div>
      </div>
    )
  }

  const labels = data.map(item => item[labelKey])
  const values = data.map(item => item[valueKey])
  const colors = color ? Array(data.length).fill(color) : generateColors(data.length)

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: colors.map(color => `${color}20`), // 20% opacity
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }

  const options = {
    ...barChartOptions,
    plugins: {
      ...barChartOptions.plugins,
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
        ...barChartOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y
            return `${context.dataset.label}: ${value}`
          }
        }
      },
      datalabels: showValues ? {
        display: true,
        color: '#374151',
        font: {
          weight: 'bold',
          size: 11
        },
        anchor: 'end',
        align: 'top',
        formatter: (value) => value
      } : false
    }
  }

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default BarChart