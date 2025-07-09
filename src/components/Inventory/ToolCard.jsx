const ToolCard = ({ tool, onEdit, onDelete, hasPermission }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-800'
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'bueno':
        return 'bg-green-100 text-green-800'
      case 'malo':
        return 'bg-red-100 text-red-800'
      case 'deterioro':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA2NUw5NSA3NUwxMDUgNjNMMTIzIDgzSDc3TDg3IDY1WiIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSI5MCIgY3k9IjUwIiByPSI1IiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjEyIj5TaW4gaW1hZ2VuPC90ZXh0Pgo8L3N2Zz4K"
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-secondary-200 hover:shadow-md transition-shadow duration-200">
      {/* Imagen */}
      <div className="aspect-w-16 aspect-h-9 bg-secondary-100">
        <img
          src={tool.imagen || ''}
          alt={tool.nombre}
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Header con nombre y badges */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-medium text-secondary-900 truncate pr-2">
            {tool.nombre}
          </h3>
          <div className="flex flex-col space-y-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(tool.estado)}`}>
              {tool.estado}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionBadgeClass(tool.condicion)}`}>
              {tool.condicion}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {tool.descripcion && (
          <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
            {tool.descripcion}
          </p>
        )}

        {/* Detalles */}
        <div className="space-y-2 text-sm text-secondary-600">
          <div className="flex justify-between">
            <span className="font-medium">Categoría:</span>
            <span>{tool.categoria}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Serial:</span>
            <span className="font-mono text-xs">{tool.serial}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Fecha compra:</span>
            <span>{formatDate(tool.fecha_compra)}</span>
          </div>
        </div>

        {/* Acciones */}
        {hasPermission('almacenista') && (
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => onEdit(tool)}
              className="flex-1 px-3 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              onClick={() => onDelete(tool.id)}
              className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ToolCard