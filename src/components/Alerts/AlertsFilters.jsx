import { useState, useEffect } from 'react'

const AlertsFilters = ({
  selectedFilter,
  setSelectedFilter,
  selectedPriority,
  setSelectedPriority,
  selectedType,
  setSelectedType,
  searchTerm,
  setSearchTerm,
  onReset,
  alertsCount,
  alerts = [], // Array de alertas para calcular conteos
  stats = {} // Estadísticas generales
}) => {
  const [filterCounts, setFilterCounts] = useState({})

  // Calcular conteos dinámicamente
  useEffect(() => {
    if (alerts.length > 0) {
      const counts = {
        all: alerts.length,
        unread: alerts.filter(alert => !alert.leida).length,
        critical: alerts.filter(alert => 
          alert.prioridad === 'critica' || alert.prioridad === 'urgente'
        ).length,
        overdue: alerts.filter(alert => alert.tipo === 'herramienta_atrasada').length,
        deterioro: alerts.filter(alert => alert.tipo === 'herramienta_deterioro').length,
        inventario: alerts.filter(alert => alert.tipo === 'inventario_bajo').length,
        critica: alerts.filter(alert => alert.prioridad === 'critica').length,
        urgente: alerts.filter(alert => alert.prioridad === 'urgente').length,
        alta: alerts.filter(alert => alert.prioridad === 'alta').length,
        media: alerts.filter(alert => alert.prioridad === 'media').length,
        baja: alerts.filter(alert => alert.prioridad === 'baja').length
      }
      setFilterCounts(counts)
    }
  }, [alerts])

  const quickFilters = [
    {
      id: 'all',
      name: 'Todas las alertas',
      icon: '📋',
      count: filterCounts.all || alertsCount,
      color: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200'
    },
    {
      id: 'unread',
      name: 'No leídas',
      icon: '📢',
      count: filterCounts.unread || stats.pendientes,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    },
    {
      id: 'critical',
      name: 'Críticas y urgentes',
      icon: '🚨',
      count: filterCounts.critical || (stats.criticas || 0) + (stats.urgentes || 0),
      color: 'bg-red-100 text-red-800 hover:bg-red-200',
      pulse: (filterCounts.critical || 0) > 0
    },
    {
      id: 'overdue',
      name: 'Herramientas atrasadas',
      icon: '⏰',
      count: filterCounts.overdue || 0,
      color: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    }
  ]

  const priorityOptions = [
    { value: 'all', label: 'Todas las prioridades', count: filterCounts.all || 0 },
    { 
      value: 'critica', 
      label: 'Crítica', 
      color: 'text-red-600',
      count: filterCounts.critica || stats.criticas || 0
    },
    { 
      value: 'urgente', 
      label: 'Urgente', 
      color: 'text-orange-600',
      count: filterCounts.urgente || stats.urgentes || 0
    },
    { 
      value: 'alta', 
      label: 'Alta', 
      color: 'text-yellow-600',
      count: filterCounts.alta || 0
    },
    { 
      value: 'media', 
      label: 'Media', 
      color: 'text-blue-600',
      count: filterCounts.media || 0
    },
    { 
      value: 'baja', 
      label: 'Baja', 
      color: 'text-gray-600',
      count: filterCounts.baja || 0
    }
  ]

  const typeOptions = [
    { 
      value: 'all', 
      label: 'Todos los tipos',
      count: filterCounts.all || 0
    },
    { 
      value: 'herramienta_atrasada', 
      label: 'Herramientas atrasadas',
      icon: '⏰',
      count: filterCounts.overdue || 0
    },
    { 
      value: 'herramienta_deterioro', 
      label: 'Deterioro de herramientas',
      icon: '⚠️',
      count: filterCounts.deterioro || 0
    },
    { 
      value: 'inventario_bajo', 
      label: 'Inventario bajo',
      icon: '📦',
      count: filterCounts.inventario || 0
    },
    { 
      value: 'general', 
      label: 'General',
      icon: '📝',
      count: alerts.filter(alert => alert.tipo === 'general').length || 0
    }
  ]

  const hasActiveFilters = selectedFilter !== 'all' || selectedPriority !== 'all' || selectedType !== 'all' || searchTerm !== ''

  const handleQuickFilter = (filterId) => {
    // Resetear otros filtros al usar filtros rápidos
    setSelectedPriority('all')
    setSelectedType('all')
    
    switch (filterId) {
      case 'critical':
        setSelectedFilter('all')
        setSelectedPriority('critica')
        break
      case 'overdue':
        setSelectedFilter('all')
        setSelectedType('herramienta_atrasada')
        break
      case 'unread':
        setSelectedFilter('unread')
        break
      default:
        setSelectedFilter(filterId)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-secondary-900">Filtros de Alertas</h3>
          <p className="text-sm text-secondary-500">
            {alertsCount || 0} alerta{(alertsCount || 0) !== 1 ? 's' : ''} {hasActiveFilters ? 'filtrada' + ((alertsCount || 0) !== 1 ? 's' : '') : 'total' + ((alertsCount || 0) !== 1 ? 'es' : '')}
          </p>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Búsqueda */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-2">
            Buscar en alertas
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Buscar por herramienta, empleado o motivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-secondary-400 hover:text-secondary-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filtros rápidos */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-3">
            Filtros rápidos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleQuickFilter(filter.id)}
                className={`relative inline-flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  (selectedFilter === filter.id || 
                   (filter.id === 'critical' && (selectedPriority === 'critica' || selectedPriority === 'urgente')) ||
                   (filter.id === 'overdue' && selectedType === 'herramienta_atrasada') ||
                   (filter.id === 'unread' && selectedFilter === 'unread'))
                    ? 'bg-primary-100 text-primary-800 border-2 border-primary-300 ring-2 ring-primary-200'
                    : `${filter.color} border-2 border-transparent`
                } ${filter.pulse ? 'animate-pulse' : ''}`}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-base">{filter.icon}</span>
                  <span>{filter.name}</span>
                </div>
                {(filter.count || 0) > 0 && (
                  <span className={`ml-2 inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold ${
                    filter.id === 'critical' ? 'bg-red-600 text-white' : 'bg-white bg-opacity-70'
                  }`}>
                    {filter.count}
                  </span>
                )}
                
                {filter.pulse && (filter.count || 0) > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros detallados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Filtro por prioridad */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-secondary-700 mb-2">
              Filtrar por prioridad
            </label>
            <select
              id="priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count > 0 ? `(${option.count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por tipo */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-secondary-700 mb-2">
              Filtrar por tipo de alerta
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon ? `${option.icon} ` : ''}{option.label} {option.count > 0 ? `(${option.count})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Acciones rápidas adicionales */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-3">
            Acciones rápidas
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedFilter('unread')
                setSelectedPriority('all')
                setSelectedType('all')
              }}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                selectedFilter === 'unread'
                  ? 'border-primary-300 text-primary-700 bg-primary-50'
                  : 'border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
              </svg>
              Solo no leídas
            </button>

            <button
              onClick={() => {
                setSelectedFilter('all')
                setSelectedPriority('critica')
                setSelectedType('all')
              }}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                selectedPriority === 'critica'
                  ? 'border-red-300 text-red-700 bg-red-50'
                  : 'border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Solo críticas
            </button>

            <button
              onClick={() => {
                setSelectedFilter('all')
                setSelectedPriority('all')
                setSelectedType('herramienta_atrasada')
              }}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                selectedType === 'herramienta_atrasada'
                  ? 'border-orange-300 text-orange-700 bg-orange-50'
                  : 'border-secondary-300 text-secondary-700 bg-white hover:bg-secondary-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Herramientas atrasadas
            </button>
          </div>
        </div>

        {/* Indicadores visuales de filtros activos */}
        {hasActiveFilters && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Filtros activos:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Estado: {quickFilters.find(f => f.id === selectedFilter)?.name || selectedFilter}
                      <button
                        onClick={() => setSelectedFilter('all')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {selectedPriority !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Prioridad: {priorityOptions.find(p => p.value === selectedPriority)?.label}
                      <button
                        onClick={() => setSelectedPriority('all')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {selectedType !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Tipo: {typeOptions.find(t => t.value === selectedType)?.label}
                      <button
                        onClick={() => setSelectedType('all')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Búsqueda: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda de prioridades */}
        <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
          <h4 className="text-sm font-medium text-secondary-900 mb-3">Leyenda de prioridades:</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-red-600 font-medium">Crítica</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-orange-600 font-medium">Urgente</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-yellow-600 font-medium">Alta</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-blue-600 font-medium">Media</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
              <span className="text-gray-600 font-medium">Baja</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertsFilters