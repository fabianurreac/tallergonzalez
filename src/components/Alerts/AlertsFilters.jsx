import { useState } from 'react'

const AlertsFilters = ({ onFilterChange, totalAlerts, unreadAlerts }) => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filters = [
    {
      id: 'all',
      name: 'Todas',
      count: totalAlerts,
      color: 'bg-secondary-100 text-secondary-800'
    },
    {
      id: 'unread',
      name: 'No leídas',
      count: unreadAlerts,
      color: 'bg-primary-100 text-primary-800'
    },
    {
      id: 'deterioro',
      name: 'Deterioro',
      count: 0, // Se calculará dinámicamente
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'vencimiento',
      name: 'Vencimiento',
      count: 0, // Se calculará dinámicamente
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'mantenimiento',
      name: 'Mantenimiento',
      count: 0, // Se calculará dinámicamente
      color: 'bg-blue-100 text-blue-800'
    }
  ]

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId)
    onFilterChange({ type: filterId, search: searchTerm })
  }

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value
    setSearchTerm(newSearchTerm)
    onFilterChange({ type: activeFilter, search: newSearchTerm })
  }

  const clearFilters = () => {
    setActiveFilter('all')
    setSearchTerm('')
    onFilterChange({ type: 'all', search: '' })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex flex-col space-y-4">
        {/* Título y acciones */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-secondary-900">
            Filtrar Alertas
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar en alertas..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => {
                  setSearchTerm('')
                  onFilterChange({ type: activeFilter, search: '' })
                }}
                className="text-secondary-400 hover:text-secondary-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Filtros por categoría */}
        <div>
          <label className="text-sm font-medium text-secondary-700 mb-2 block">
            Categorías
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter.id)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeFilter === filter.id
                    ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-200'
                    : filter.color
                } hover:opacity-80`}
              >
                {filter.name}
                {filter.count > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-50">
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros por estado */}
        <div>
          <label className="text-sm font-medium text-secondary-700 mb-2 block">
            Acciones rápidas
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterClick('unread')}
              className="inline-flex items-center px-3 py-1 border border-primary-300 rounded-md text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5M9 17H4l3.5-3.5M12 3v18" />
              </svg>
              Solo no leídas
            </button>
            
            <button
              onClick={() => handleFilterClick('deterioro')}
              className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Urgentes
            </button>
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {(activeFilter !== 'all' || searchTerm) && (
          <div className="bg-secondary-50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <span className="text-sm text-secondary-700">
                  {activeFilter !== 'all' && (
                    <span className="font-medium">
                      Filtro: {filters.find(f => f.id === activeFilter)?.name}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="font-medium">
                      {activeFilter !== 'all' ? ' | ' : ''}Búsqueda: "{searchTerm}"
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-xs text-secondary-500 hover:text-secondary-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertsFilters