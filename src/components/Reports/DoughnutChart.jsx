import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const DoughnutChart = ({ data, title, labelKey, valueKey }) => {
  const colors = [
    '#DC2626', // Rojo
    '#7C3AED', // Púrpura
    '#059669', // Verde
    '#D97706', // Naranja
    '#DC2626', // Azul
    '#EC4899', // Rosa
    '#6B7280', // Gris
  ]

  const chartData = {
    labels: data.map(item => item[labelKey] || 'Sin datos'),
    datasets: [
      {
        data: data.map(item => item[valueKey] || 0),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color),
        borderWidth: 2,
        hoverOffset: 8,
        cutout: '60%',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          generateLabels: function(chart) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0]
                const value = dataset.data[i]
                const total = dataset.data.reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  pointStyle: 'circle',
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
          family: 'Inter, sans-serif'
        },
        color: '#374151',
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          family: 'Inter, sans-serif'
        },
        bodyFont: {
          size: 12,
          family: 'Inter, sans-serif'
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }

  // Calcular total para mostrar en el centro
  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-300">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Sin datos</h3>
          <p className="mt-1 text-sm text-secondary-500">No hay información para mostrar en el gráfico.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full relative">
      <Doughnut data={chartData} options={options} />
      
      {/* Número total en el centro */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary-900">{total}</div>
          <div className="text-sm text-secondary-600">Total</div>
        </div>
      </div>
    </div>
  )
}

export default DoughnutChart