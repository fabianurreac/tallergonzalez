const ToolTable = ({ tools, onEdit, onDelete, hasPermission }) => {
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
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNyAxNUwyMCAyMEwyNSAxNkwyOSAyMkgxNUwxNyAxNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxMiIgcj0iMiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K"
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Herramienta
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Serial
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Condición
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Fecha Compra
              </th>
              {hasPermission('almacenista') && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={tool.imagen || ''}
                        alt={tool.nombre}
                        onError={handleImageError}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {tool.nombre}
                      </div>
                      {tool.descripcion && (
                        <div className="text-sm text-secondary-500 truncate max-w-xs">
                          {tool.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {tool.categoria}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-secondary-900">
                  {tool.serial}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(tool.estado)}`}>
                    {tool.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionBadgeClass(tool.condicion)}`}>
                    {tool.condicion}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                  {formatDate(tool.fecha_compra)}
                </td>
                {hasPermission('almacenista') && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(tool)}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded"
                        title="Editar herramienta"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(tool.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Eliminar herramienta"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ToolTable