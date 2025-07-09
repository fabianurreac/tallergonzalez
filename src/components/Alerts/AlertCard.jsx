import { useState } from 'react'
import { useAlerts } from '../../hooks/useAlerts'

const AlertCard = ({ alert }) => {
  const { markAsRead, deleteAlert } = useAlerts()
  const [loading, setLoading] = useState(false)

  const getAlertIcon = (motivo) => {
    if (motivo.toLowerCase().includes('deterioro')) {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      )
    } else if (motivo.toLowerCase().includes('vencimiento')) {
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

  const getPriorityColor = (motivo) => {
    if (motivo.toLowerCase().includes('deterioro')) {
      return 'border-l-red-500 bg-red-50'
    } else if (motivo.toLowerCase().includes('vencimiento')) {
      return 'border-l-yellow-500 bg-yellow-50'
    } else if (motivo.toLowerCase().includes('mantenimiento')) {
      return 'border-l-blue-500 bg-blue-50'
    } else {
      return 'border-l-secondary-300 bg-white'
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

  const handleMarkAsRead = async () => {
    if (alert.leida) return
    
    setLoading(true)
    const success = await markAsRead(alert.id)
    if (!success) {
      console.error('Error al marcar como leída')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta alerta?')) return
    
    setLoading(true)
    const success = await deleteAlert(alert.id)
    if (!success) {
      console.error('Error al eliminar la alerta')
    }
    setLoading(false)
  }

  return (
    <div className={`border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ${getPriorityColor(alert.motivo)} ${!alert.leida ? 'ring-2 ring-primary-200' : ''}`}>
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Icono de la alerta */}
          {getAlertIcon(alert.motivo)}

          {/* Contenido de la alerta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-secondary-900">
                  {alert.herramientas?.nombre || 'Herramienta no encontrada'}
                </h3>
                {!alert.leida && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Nuevo
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-secondary-500">
                  {formatDate(alert.fecha_creacion)}
                </span>
              </div>
            </div>

            <p className="mt-1 text-sm text-secondary-700">
              {alert.motivo}
            </p>

            {alert.herramientas && (
              <div className="mt-2 flex items-center space-x-4 text-xs text-secondary-500">
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {alert.herramientas.categoria}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.herramientas.estado === 'disponible' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.herramientas.estado}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  alert.herramientas.condicion === 'bueno' 
                    ? 'bg-green-100 text-green-800' 
                    : alert.herramientas.condicion === 'deterioro'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.herramientas.condicion}
                </span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col space-y-2">
            {!alert.leida && (
              <button
                onClick={handleMarkAsRead}
                disabled={loading}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span className="ml-1">Marcar leída</span>
              </button>
            )}
            
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              <span className="ml-1">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertCard