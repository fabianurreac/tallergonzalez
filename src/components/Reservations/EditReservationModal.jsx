import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const EditReservationModal = ({ isOpen, onClose, onSuccess, reservation, availableTools, employees }) => {
  const [formData, setFormData] = useState({
    fecha_devolucion_estimada: '',
    fecha_devolucion_real: '',
    estado: '',
    condicion: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && reservation) {
      setFormData({
        fecha_devolucion_estimada: reservation.fecha_devolucion_estimada ? 
          new Date(reservation.fecha_devolucion_estimada).toISOString().slice(0, 16) : '',
        fecha_devolucion_real: reservation.fecha_devolucion_real ? 
          new Date(reservation.fecha_devolucion_real).toISOString().slice(0, 16) : '',
        estado: reservation.estado || '',
        condicion: reservation.condicion || ''
      })
      setError('')
    }
  }, [isOpen, reservation])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validaciones
      if (!formData.fecha_devolucion_estimada) {
        setError('La fecha de devolución estimada es obligatoria')
        return
      }

      // Si el estado cambia a devuelta, verificar fecha real
      if (formData.estado === 'devuelta' && !formData.fecha_devolucion_real) {
        setFormData(prev => ({
          ...prev,
          fecha_devolucion_real: new Date().toISOString().slice(0, 16)
        }))
      }

      // Preparar datos para actualizar
      const updateData = {
        fecha_devolucion_estimada: formData.fecha_devolucion_estimada,
        estado: formData.estado,
        condicion: formData.condicion
      }

      // Solo incluir fecha_devolucion_real si hay valor
      if (formData.fecha_devolucion_real) {
        updateData.fecha_devolucion_real = formData.fecha_devolucion_real
      }

      // Actualizar la reserva
      const { error: reservationError } = await supabase
        .from('reservas')
        .update(updateData)
        .eq('id', reservation.id)

      if (reservationError) throw reservationError

      // Si el estado cambió, actualizar el estado de la herramienta
      if (formData.estado !== reservation.estado) {
        const toolStatus = formData.estado === 'devuelta' ? 'disponible' : 'reservada'
        
        const { error: toolError } = await supabase
          .from('herramientas')
          .update({ estado: toolStatus })
          .eq('id', reservation.id_herramienta)

        if (toolError) throw toolError
      }

      onSuccess()
      
    } catch (error) {
      console.error('Error updating reservation:', error)
      setError(error.message || 'Error al actualizar la reserva')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !reservation) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  Editar Reserva
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-white rounded-md text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de la reserva */}
              <div className="mb-6 bg-secondary-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-secondary-900 mb-3">Información de la Reserva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-600">Herramienta:</p>
                    <p className="font-medium text-secondary-900">{reservation.herramientas?.nombre}</p>
                    <p className="text-xs text-secondary-500">Serial: {reservation.herramientas?.serial}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Empleado:</p>
                    <p className="font-medium text-secondary-900">{reservation.empleados?.nombre_completo}</p>
                    <p className="text-xs text-secondary-500">{reservation.empleados?.cargo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Fecha de Reserva:</p>
                    <p className="font-medium text-secondary-900">{formatDate(reservation.fecha_reserva)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">Estado Actual:</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reservation.estado === 'reservada' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {reservation.estado === 'reservada' ? 'Reservada' : 'Devuelta'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulario de edición */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fecha de devolución estimada */}
                <div>
                  <label htmlFor="fecha_devolucion_estimada" className="block text-sm font-medium text-secondary-700 mb-2">
                    Fecha de devolución estimada *
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha_devolucion_estimada"
                    name="fecha_devolucion_estimada"
                    value={formData.fecha_devolucion_estimada}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Fecha de devolución real */}
                <div>
                  <label htmlFor="fecha_devolucion_real" className="block text-sm font-medium text-secondary-700 mb-2">
                    Fecha de devolución real
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha_devolucion_real"
                    name="fecha_devolucion_real"
                    value={formData.fecha_devolucion_real}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="mt-1 text-xs text-secondary-500">
                    Se llena automáticamente al cambiar el estado a "Devuelta"
                  </p>
                </div>

                {/* Estado */}
                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-secondary-700 mb-2">
                    Estado de la reserva *
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="reservada">Reservada</option>
                    <option value="devuelta">Devuelta</option>
                  </select>
                </div>

                {/* Condición */}
                <div>
                  <label htmlFor="condicion" className="block text-sm font-medium text-secondary-700 mb-2">
                    Condición de la herramienta
                  </label>
                  <select
                    id="condicion"
                    name="condicion"
                    value={formData.condicion}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="bueno">Bueno</option>
                    <option value="malo">Malo</option>
                    <option value="deterioro">Deterioro</option>
                  </select>
                  <p className="mt-1 text-xs text-secondary-500">
                    Estado en que se encuentra la herramienta
                  </p>
                </div>
              </div>

              {/* Información adicional si está devuelta */}
              {formData.estado === 'devuelta' && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-800">Herramienta devuelta</h4>
                      <p className="mt-1 text-sm text-green-700">
                        Al guardar los cambios, la herramienta estará disponible para nuevas reservas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </div>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditReservationModal