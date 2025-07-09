import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const ToolDetailsModal = ({ isOpen, onClose, tool }) => {
  const [reservationHistory, setReservationHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && tool) {
      fetchReservationHistory()
    }
  }, [isOpen, tool])

  const fetchReservationHistory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          empleados (nombre_completo, cargo)
        `)
        .eq('id_herramienta', tool.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching reservation history:', error)
        return
      }

      setReservationHistory(data || [])
    } catch (error) {
      console.error('Error fetching reservation history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (estado) => {
    const badges = {
      disponible: 'badge-success',
      reservada: 'badge-warning'
    }
    return badges[estado] || 'badge-info'
  }

  const getConditionBadge = (condicion) => {
    const badges = {
      bueno: 'badge-success',
      deterioro: 'badge-warning',
      malo: 'badge-danger'
    }
    return badges[condicion] || 'badge-info'
  }

  const getReservationStatusBadge = (estado) => {
    const badges = {
      reservada: 'badge-warning',
      devuelta: 'badge-success'
    }
    return badges[estado] || 'badge-info'
  }

  if (!isOpen || !tool) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container">
        <div className="modal-content">
          <div 
            className="modal-panel max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white">
              {/* Header */}
              <div className="px-6 py-4 border-b border-secondary-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-secondary-900">
                    Detalles de Herramienta
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información principal */}
                  <div>
                    <div className="space-y-6">
                      {/* Imagen */}
                      <div className="text-center">
                        <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden bg-secondary-100 flex items-center justify-center">
                          {tool.imagen ? (
                            <img
                              src={tool.imagen}
                              alt={tool.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${tool.imagen ? 'hidden' : ''}`}>
                            <svg className="w-24 h-24 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Información básica */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-medium text-secondary-900 mb-3">
                            Información General
                          </h4>
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-sm font-medium text-secondary-500">Nombre</dt>
                              <dd className="text-sm text-secondary-900">{tool.nombre}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-secondary-500">Serial</dt>
                              <dd className="font-mono text-sm text-secondary-900">{tool.serial}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-secondary-500">Categoría</dt>
                              <dd className="text-sm text-secondary-900">{tool.categoria}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-secondary-500">Estado</dt>
                              <dd>
                                <span className={`badge ${getStatusBadge(tool.estado)}`}>
                                  {tool.estado}
                                </span>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-secondary-500">Condición</dt>
                              <dd>
                                <span className={`badge ${getConditionBadge(tool.condicion)}`}>
                                  {tool.condicion}
                                </span>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-secondary-500">Fecha de Compra</dt>
                              <dd className="text-sm text-secondary-900">{formatDate(tool.fecha_compra)}</dd>
                            </div>
                          </dl>
                        </div>

                        {tool.descripcion && (
                          <div>
                            <h4 className="text-sm font-medium text-secondary-500 mb-2">Descripción</h4>
                            <p className="text-sm text-secondary-900 bg-secondary-50 p-3 rounded-md">
                              {tool.descripcion}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Historial de reservas */}
                  <div>
                    <h4 className="text-lg font-medium text-secondary-900 mb-4">
                      Historial de Reservas
                    </h4>

                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="bg-secondary-50 p-4 rounded-lg animate-pulse">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reservationHistory.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
                        {reservationHistory.map((reservation) => (
                          <div key={reservation.id} className="bg-secondary-50 p-4 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="font-medium text-secondary-900">
                                    {reservation.empleados?.nombre_completo}
                                  </h5>
                                  <span className={`badge ${getReservationStatusBadge(reservation.estado)}`}>
                                    {reservation.estado}
                                  </span>
                                </div>
                                <p className="text-sm text-secondary-600 mb-1">
                                  {reservation.empleados?.cargo}
                                </p>
                                <div className="text-xs text-secondary-500 space-y-1">
                                  <p>Reservado: {formatDate(reservation.fecha_reserva)}</p>
                                  <p>Devolución estimada: {formatDate(reservation.fecha_devolucion_estimada)}</p>
                                  {reservation.fecha_devolucion_real && (
                                    <p>Devuelto: {formatDate(reservation.fecha_devolucion_real)}</p>
                                  )}
                                </div>
                                {reservation.condicion && (
                                  <div className="mt-2">
                                    <span className="text-xs text-secondary-500">Condición al devolver: </span>
                                    <span className={`badge text-xs ${getConditionBadge(reservation.condicion)}`}>
                                      {reservation.condicion}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-secondary-900">Sin historial</h3>
                        <p className="mt-1 text-sm text-secondary-500">
                          Esta herramienta no ha sido reservada aún.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-secondary-500">
                    <p>Creado: {formatDate(tool.created_at)}</p>
                    {tool.updated_at !== tool.created_at && (
                      <p>Actualizado: {formatDate(tool.updated_at)}</p>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolDetailsModal