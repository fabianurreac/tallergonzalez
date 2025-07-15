const AlertsStats = ({ stats }) => {
  const statsCards = [
    {
      name: 'Total de Alertas',
      value: stats.total || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
        </svg>
      ),
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Alertas Pendientes',
      value: stats.pendientes || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Alertas Críticas',
      value: stats.criticas || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      pulse: (stats.criticas || 0) > 0
    },
    {
      name: 'Alertas Urgentes',
      value: stats.urgentes || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      pulse: (stats.urgentes || 0) > 0
    },
    {
      name: 'Alertas Resueltas',
      value: stats.resueltas || 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    }
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-secondary-900">Estadísticas de Alertas</h3>
        <p className="text-sm text-secondary-500">Resumen del estado actual de las alertas del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => (
          <div 
            key={index} 
            className={`relative overflow-hidden bg-white p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              stat.pulse ? 'border-red-200 animate-pulse-slow' : 'border-secondary-200'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <div className={`${stat.color.replace('bg-', 'text-')} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>

            {/* Indicador visual para alertas críticas/urgentes */}
            {stat.pulse && stat.value > 0 && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Distribución por tipo */}
      {stats.porTipo && Object.keys(stats.porTipo).length > 0 && (
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <h4 className="text-sm font-medium text-secondary-900 mb-3">Distribución por Tipo</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.porTipo).map(([tipo, cantidad]) => {
              if (cantidad === 0) return null

              const formatTipo = (tipo) => {
                switch (tipo) {
                  case 'herramienta_atrasada': return 'Herramientas Atrasadas'
                  case 'herramienta_deterioro': return 'Deterioro de Herramientas'
                  case 'inventario_bajo': return 'Inventario Bajo'
                  case 'general': return 'General'
                  default: return tipo
                }
              }

              const getTypeIcon = (tipo) => {
                switch (tipo) {
                  case 'herramienta_atrasada':
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  case 'herramienta_deterioro':
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    )
                  case 'inventario_bajo':
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )
                  default:
                    return (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                }
              }

              const getTypeColor = (tipo) => {
                switch (tipo) {
                  case 'herramienta_atrasada': return 'text-red-600 bg-red-50'
                  case 'herramienta_deterioro': return 'text-orange-600 bg-orange-50'
                  case 'inventario_bajo': return 'text-blue-600 bg-blue-50'
                  default: return 'text-gray-600 bg-gray-50'
                }
              }

              return (
                <div key={tipo} className={`flex items-center justify-between p-3 rounded-md ${getTypeColor(tipo)}`}>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(tipo)}
                    <span className="text-sm font-medium">{formatTipo(tipo)}</span>
                  </div>
                  <span className="text-sm font-bold">{cantidad}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mensaje de estado general */}
      <div className="mt-6 pt-6 border-t border-secondary-200">
        <div className={`p-4 rounded-md ${
          (stats.criticas || 0) > 0 
            ? 'bg-red-50 border border-red-200' 
            : (stats.urgentes || 0) > 0
              ? 'bg-orange-50 border border-orange-200'
              : (stats.pendientes || 0) > 0
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {(stats.criticas || 0) > 0 ? (
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (stats.urgentes || 0) > 0 ? (
                <svg className="h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (stats.pendientes || 0) > 0 ? (
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                (stats.criticas || 0) > 0 
                  ? 'text-red-800' 
                  : (stats.urgentes || 0) > 0
                    ? 'text-orange-800'
                    : (stats.pendientes || 0) > 0
                      ? 'text-yellow-800'
                      : 'text-green-800'
              }`}>
                {(stats.criticas || 0) > 0 
                  ? 'Atención Inmediata Requerida' 
                  : (stats.urgentes || 0) > 0
                    ? 'Alertas Urgentes Pendientes'
                    : (stats.pendientes || 0) > 0
                      ? 'Alertas Pendientes de Revisión'
                      : 'Sistema en Estado Óptimo'
                }
              </h3>
              <div className={`mt-2 text-sm ${
                (stats.criticas || 0) > 0 
                  ? 'text-red-700' 
                  : (stats.urgentes || 0) > 0
                    ? 'text-orange-700'
                    : (stats.pendientes || 0) > 0
                      ? 'text-yellow-700'
                      : 'text-green-700'
              }`}>
                {(stats.criticas || 0) > 0 
                  ? `Hay ${stats.criticas} alerta${stats.criticas > 1 ? 's' : ''} crítica${stats.criticas > 1 ? 's' : ''} que requieren atención inmediata.`
                  : (stats.urgentes || 0) > 0
                    ? `Hay ${stats.urgentes} alerta${stats.urgentes > 1 ? 's' : ''} urgente${stats.urgentes > 1 ? 's' : ''} pendiente${stats.urgentes > 1 ? 's' : ''}.`
                    : (stats.pendientes || 0) > 0
                      ? `Hay ${stats.pendientes} alerta${stats.pendientes > 1 ? 's' : ''} pendiente${stats.pendientes > 1 ? 's' : ''} de revisión.`
                      : 'No hay alertas pendientes. El sistema está funcionando correctamente.'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertsStats