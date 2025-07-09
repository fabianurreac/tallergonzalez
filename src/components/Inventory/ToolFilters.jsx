const ToolFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  categories,
  states,
  conditions
}) => {
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      category: '',
      estado: '',
      condicion: ''
    })
  }

  const hasActiveFilters = searchTerm || filters.category || filters.estado || filters.condicion

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por categoría */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-secondary-700 mb-1">
              Categoría
            </label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label htmlFor="estado-filter" className="block text-sm font-medium text-secondary-700 mb-1">
              Estado
            </label>
            <select
              id="estado-filter"
              value={filters.estado}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Todos los estados</option>
              {states.map((estado) => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por condición */}
          <div>
            <label htmlFor="condicion-filter" className="block text-sm font-medium text-secondary-700 mb-1">
              Condición
            </label>
            <select
              id="condicion-filter"
              value={filters.condicion}
              onChange={(e) => handleFilterChange('condicion', e.target.value)}
              className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="">Todas las condiciones</option>
              {conditions.map((condicion) => (
                <option key={condicion} value={condicion}>
                  {condicion.charAt(0).toUpperCase() + condicion.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolFilters