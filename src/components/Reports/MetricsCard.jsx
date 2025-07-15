const MetricsCard = ({ 
  title, 
  value, 
  description, 
  color = 'blue', 
  icon,
  trend = null,
  onClick = null 
}) => {
  // Mapeo de colores
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      icon: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-600'
    },
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      icon: 'text-gray-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      icon: 'text-indigo-600'
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      icon: 'text-pink-600'
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  // Formatear el valor
  const formatValue = (val) => {
    if (val === null || val === undefined) return '0'
    if (typeof val === 'number') {
      // Si es un número grande, usar notación compacta
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M'
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K'
      }
      return val.toLocaleString()
    }
    return String(val)
  }

  return (
    <div 
      className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer hover:bg-gray-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center">
          {/* Icono */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${colors.bg} rounded-md flex items-center justify-center`}>
              <div className={colors.icon}>
                {icon || (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-secondary-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-secondary-900">
                  {formatValue(value)}
                </div>
                
                {/* Tendencia (opcional) */}
                {trend && (
                  <div className="ml-2 flex items-baseline text-sm">
                    {trend.direction === 'up' ? (
                      <svg className="flex-shrink-0 self-center h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : trend.direction === 'down' ? (
                      <svg className="flex-shrink-0 self-center h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="flex-shrink-0 self-center h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className={`ml-1 ${
                      trend.direction === 'up' ? 'text-green-600' : 
                      trend.direction === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {trend.value}
                    </span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>

        {/* Descripción */}
        {description && (
          <div className="mt-3">
            <p className="text-xs text-secondary-500">
              {description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricsCard