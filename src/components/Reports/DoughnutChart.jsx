import { Doughnut } from 'react-chartjs-2'
import { doughnutChartOptions, generateColors } from '../../utils/chartConfig'

const DoughnutChart = ({ 
  data, 
  title = "Gráfica de Dona",
  labelKey = "label",
  valueKey = "value",
  height = 400,
  showTotal = true,
  centerText = null
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Sin datos</h3>
          <p className="mt-1 text-sm text-secondary-500">No hay información disponible para mostrar.</p>
        </div>
      </div>
    )
  }

  const labels = data.map(item => item[labelKey])
  const values = data.map(item => item[valueKey])
  const total = values.reduce((sum, value) => sum + value, 0)
  const colors = generateColors(data.length)

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 10
      }
    ]
  }

  const options = {
    ...doughnutChartOptions,
    plugins: {
      ...doughnutChartOptions.plugins,
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
      }
    }
  }

  return (
    <div className="relative w-full">
      <div style={{ height: `${height}px` }} className="w-full">
        <Doughnut data={chartData} options={options} />
      </div>
      
      {/* Centro de la dona con información adicional */}
      {(showTotal || centerText) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {showTotal && (
              <>
                <div className="text-2xl font-bold text-secondary-900">{total}</div>
                <div className="text-sm text-secondary-500">Total</div>
              </>
            )}
            {centerText && (
              <div className="text-lg font-semibold text-secondary-700">{centerText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DoughnutChart