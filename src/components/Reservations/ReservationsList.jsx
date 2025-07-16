const ReservationsList = ({ 
  reservations, 
  onEdit, 
  onDelete, 
  onReturn, 
  hasPermission,
  isReservationOverdue,
  getDaysOverdue 
}) => {

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (estado) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (estado) {
      case 'reservada':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'devuelta':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-secondary-100 text-secondary-800`
    }
  }

  const getConditionBadge = (condicion) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    
    switch (condicion) {
      case 'bueno':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'deterioro':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'malo':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-secondary-100 text-secondary-800`
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No hay reservas</h3>
          <p className="mt-1 text-sm text-secondary-500">
            No se encontraron reservas con los filtros aplicados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-secondary-900">
          Lista de Reservas ({reservations.length})
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-secondary-500">
          Gestiona todas las reservas de herramientas del taller
        </p>
      </div>
      
      <div className="border-t border-secondary-200">
        <div className="divide-y divide-secondary-200">
          {reservations.map((reservation) => {
            const isOverdue = isReservationOverdue && isReservationOverdue(reservation)
            const daysOverdue = getDaysOverdue && getDaysOverdue(reservation)
            
            return (
              <div
                key={reservation.id}
                className={`p-6 hover:bg-secondary-50 transition-colors duration-150 ${
                  isOverdue ? 'bg-red-50 border-l-4 border-red-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Imagen de la herramienta */}
                    <div className="flex-shrink-0">
                      {reservation.herramientas?.imagen ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={reservation.herramientas.imagen}
                          alt={reservation.herramientas?.nombre}
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEgzNlYzNkgyOFY0NEgyMFYyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-secondary-100 flex items-center justify-center">
                          <svg className="h-8 w-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Información de la reserva */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`text-lg font-medium ${isOverdue ? 'text-red-900' : 'text-secondary-900'} truncate`}>
                            {reservation.herramientas?.nombre}
                          </h4>
                          <p className={`text-sm ${isOverdue ? 'text-red-700' : 'text-secondary-600'} flex items-center mt-1`}>
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {reservation.empleados?.nombre_completo}
                            <span className="ml-2 text-xs">({reservation.empleados?.cargo})</span>
                          </p>
                        </div>

                        {/* Badges de estado */}
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex space-x-2">
                            <span className={getStatusBadge(reservation.estado)}>
                              {reservation.estado === 'reservada' ? 'Reservada' : 'Devuelta'}
                            </span>
                            <span className={getConditionBadge(reservation.condicion)}>
                              {reservation.condicion}
                            </span>
                          </div>
                          
                          {/* Indicador de vencimiento */}
                          {isOverdue && (
                            <div className="flex items-center text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Vencida ({daysOverdue} día{daysOverdue !== 1 ? 's' : ''})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className={`font-medium ${isOverdue ? 'text-red-700' : 'text-secondary-700'}`}>Categoría:</span>
                          <p className={isOverdue ? 'text-red-600' : 'text-secondary-600'}>{reservation.herramientas?.categoria}</p>
                        </div>
                        
                        <div>
                          <span className={`font-medium ${isOverdue ? 'text-red-700' : 'text-secondary-700'}`}>Serial:</span>
                          <p className={`font-mono text-xs ${isOverdue ? 'text-red-600' : 'text-secondary-600'}`}>{reservation.herramientas?.serial}</p>
                        </div>
                        
                        <div>
                          <span className={`font-medium ${isOverdue ? 'text-red-700' : 'text-secondary-700'}`}>Fecha Reserva:</span>
                          <p className={isOverdue ? 'text-red-600' : 'text-secondary-600'}>{formatDate(reservation.fecha_reserva)}</p>
                        </div>
                        
                        <div>
                          <span className={`font-medium ${isOverdue ? 'text-red-700' : 'text-secondary-700'}`}>
                            {reservation.estado === 'devuelta' ? 'Fecha Devolución:' : 'Fecha Estimada:'}
                          </span>
                          <p className={`${isOverdue ? 'text-red-600 font-semibold' : 'text-secondary-600'}`}>
                            {reservation.fecha_devolucion_real 
                              ? formatDate(reservation.fecha_devolucion_real)
                              : formatDate(reservation.fecha_devolucion_estimada)
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  {hasPermission('almacenista') && (
                    <div className="ml-6 flex-shrink-0 flex space-x-2">
                      {reservation.estado === 'reservada' && (
                        <button
                          onClick={() => onReturn(reservation.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Devolver
                        </button>
                      )}
                      
                      <button
                        onClick={() => onEdit(reservation)}
                        className="inline-flex items-center px-3 py-2 border border-secondary-300 text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      
                      <button
                        onClick={() => onDelete(reservation)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ReservationsList