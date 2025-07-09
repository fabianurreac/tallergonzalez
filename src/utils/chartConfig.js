import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

// Configuraciones por defecto para gráficas
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: 'Inter',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#dc2626',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      titleFont: {
        family: 'Inter',
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        family: 'Inter',
        size: 12
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11
        },
        color: '#6b7280'
      }
    },
    y: {
      grid: {
        color: '#f3f4f6'
      },
      ticks: {
        font: {
          family: 'Inter',
          size: 11
        },
        color: '#6b7280'
      }
    }
  }
}

// Colores consistentes para las gráficas
export const chartColors = {
  primary: '#dc2626',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  gradient: {
    primary: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  }
}

// Configuración específica para gráficas de barras
export const barChartOptions = {
  ...defaultChartOptions,
  scales: {
    ...defaultChartOptions.scales,
    y: {
      ...defaultChartOptions.scales.y,
      beginAtZero: true
    }
  }
}

// Configuración específica para gráficas de dona/pie
export const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          family: 'Inter',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#dc2626',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
}

// Configuración específica para gráficas de línea
export const lineChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    filler: {
      propagate: false
    }
  },
  scales: {
    ...defaultChartOptions.scales,
    y: {
      ...defaultChartOptions.scales.y,
      beginAtZero: true
    }
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6
    },
    line: {
      tension: 0.3
    }
  }
}

// Función para generar colores aleatorios pero consistentes
export const generateColors = (count) => {
  const colors = [
    chartColors.primary,
    chartColors.info,
    chartColors.success,
    chartColors.warning,
    chartColors.purple,
    chartColors.pink,
    chartColors.indigo,
    chartColors.danger
  ]
  
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

// Función para crear degradados
export const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  return gradient
}