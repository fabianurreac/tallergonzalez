import { useState } from 'react'

const AlertCard = ({ alert, onMarkAsRead, onDelete }) => {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const getAlertIcon = (motivo) => {
    if (motivo.toLowerCase().includes('deterioro')) {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      )
    } else if (motivo.toLowerCase().includes('vencimiento') || motivo.toLowerCase().includes('retraso') || motivo.toLowerCase().includes('atrasada')) {
      return (
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    } else if (motivo.toLowerCase().includes('mantenimiento')) {
      return (
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      )
    } else {
      return (
        <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )
    }
  }

  const getPriorityLevel = (motivo) => {
    if (motivo.toLowerCase().includes('crítico') || motivo.toLowerCase().includes('critica')) {
      return 'critica'
    } else if (motivo.toLowerCase().includes('urgente')) {
      return 'urgente'
    } else if (motivo.toLowerCase().includes('deterioro')) {
      return 'alta'
    } else if (motivo.toLowerCase().includes('retraso') || motivo.toLowerCase().includes('atrasada')) {
      return 'media'
    } else {
      return 'baja'
    }
  }

  const getPriorityColor = (motivo) => {
    const priority = getPriorityLevel(motivo)
    
    switch (priority) {
      case 'critica':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        }
      case 'urgente':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-800',
          badge: 'bg-orange-100 text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700'
        }
      case 'alta':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        }
      case 'media':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800',
          button: 'bg-gray-600 hover:bg-gray-700'
        }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }

  const formatPriority = (motivo) => {
    const priority = getPriorityLevel(motivo)
    switch (priority) {
      case 'critica': return 'CRÍTICA'
      case 'urgente': return 'URGENTE'
      case 'alta': return 'Alta'
      case 'media': return 'Media'
      case 'baja': return 'Baja'
      default: return 'Normal'
    }
  }

  const getAlertType = (motivo) => {
    if (motivo.toLowerCase().includes('deterioro')) return 'Deterioro de Herramienta'
    if (motivo.toLowerCase().includes('retraso') || motivo.toLowerCase().includes('atrasada')) return 'Herramienta Atrasada'
    if (motivo.toLowerCase().includes('mantenimiento')) return 'Mantenimiento'
    if (motivo.toLowerCase().includes('inventario')) return 'Inventario Bajo'
    return 'Alerta General'
  }

  const handleMarkAsRead = async () => {
    if (alert.leida) return
    
    setLoading(true)
    try {
      if (onMarkAsRead) {
        await onMarkAsRead(alert.id)
      }
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta alerta?')) return
    
    setLoading(true)
    try {
      if (onDelete) {
        await onDelete(alert.id)
      }
    } catch (error) {
      console.error('Error al eliminar la alerta:', error)
    } finally {
      setLoading(false)
    }
  }

  const colors = getPriorityColor(alert.motivo)
  const priority = getPriorityLevel(alert.motivo)

  return (
    <div className={`bg-white border ${colors.border} ${colors.bg} rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
      !alert.leida ? 'ring-2 ring-primary-200' : ''
    } ${priority === 'critica' || priority === 'urgente' ? 'animate-pulse-slow' : ''}`}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Icono de la alerta */}
            {getAlertIcon(alert.motivo)}

            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                  {formatPriority(alert.motivo)}
                </span>
                
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                  {getAlertType(alert.motivo)}
                </span>

                {!alert.leida && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Nueva
                  </span>
                )}
              </div>

              <h3 className={`text-sm font-medium ${colors.text} mb-2`}>
                {alert.motivo}
              </h3>

              <div className="text-sm text-secondary-600 space-y-1">
                {alert.herramientas && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-medium">Herramienta:</span>
                    <span className="ml-1">{alert.herramientas.nombre}</span>
                  </div>
                )}

                {alert.herramientas?.categoria && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">Categoría:</span>
                    <span className="ml-1">{alert.herramientas.categoria}</span>
                  </div>
                )}
              </div>

              {alert.herramientas && (
                <div className="mt-3 flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    alert.herramientas.estado === 'disponible' 
                      ? 'bg-green-100 text-green-800' 
                      : alert.herramientas.estado === 'reservada'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    Estado: {alert.herramientas.estado}
                  </span>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    alert.herramientas.condicion === 'bueno' 
                      ? 'bg-green-100 text-green-800' 
                      : alert.herramientas.condicion === 'deterioro'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Condición: {alert.herramientas.condicion}
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center text-xs text-secondary-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getTimeAgo(alert.fecha_creacion)}
                <span className="mx-2">•</span>
                {formatDate(alert.fecha_creacion)}
              </div>

              {/* Botón para expandir información adicional */}
              {alert.herramientas && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center"
                >
                  {expanded ? 'Ocultar detalles' : 'Ver detalles'}
                  <svg 
                    className={`w-3 h-3 ml-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {expanded && alert.herramientas && (
                <div className="mt-3 p-3 bg-secondary-50 rounded-md">
                  <h4 className="text-xs font-medium text-secondary-900 mb-2">Información detallada:</h4>
                  <div className="space-y-1 text-xs text-secondary-600">
                    <p><span className="font-medium">ID:</span> {alert.id}</p>
                    <p><span className="font-medium">Herramienta ID:</span> {alert.id_herramienta}</p>
                    <p><span className="font-medium">Fecha de creación:</span> {formatDate(alert.fecha_creacion)}</p>
                    <p><span className="font-medium">Estado de lectura:</span> {alert.leida ? 'Leída' : 'No leída'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex-shrink-0 flex flex-col space-y-2 ml-4">
            {!alert.leida && (
              <button
                onClick={handleMarkAsRead}
                disabled={loading}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${colors.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Marcando...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Marcar leída
                  </>
                )}
              </button>
            )}
            
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Barra de prioridad en la parte inferior */}
      <div className={`h-1 ${colors.bg} opacity-50`}></div>
    </div>
  )
}

export default AlertCard