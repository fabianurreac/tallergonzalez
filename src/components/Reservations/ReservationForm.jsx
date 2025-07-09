import { useState } from 'react'
import { supabase } from '../../config/supabase'

const ReservationForm = ({ selectedTool, selectedEmployee, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    fecha_devolucion_estimada: '',
    observaciones: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0]
  
  // Calcular fecha máxima (30 días desde hoy)
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateString = maxDate.toISOString().split('T')[0]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fecha_devolucion_estimada) {
      newErrors.fecha_devolucion_estimada = 'La fecha de devolución es obligatoria'
    } else {
      const selectedDate = new Date(formData.fecha_devolucion_estimada)
      const todayDate = new Date(today)
      
      if (selectedDate < todayDate) {
        newErrors.fecha_devolucion_estimada = 'La fecha debe ser hoy o posterior'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Crear la reserva
      const reservationData = {
        id_empleado: selectedEmployee.id,
        id_herramienta: selectedTool.id,
        fecha_devolucion_estimada: formData.fecha_devolucion_estimada,
        estado: 'reservada',
        condicion: selectedTool.condicion // Heredar condición actual de la herramienta
      }

      const { data: reservationResult, error: reservationError } = await supabase
        .from('reservas')
        .insert([reservationData])
        .select()
        .single()

      if (reservationError) {
        throw reservationError
      }

      // Actualizar estado de la herramienta a 'reservada'
      const { error: toolError } = await supabase
        .from('herramientas')
        .update({ estado: 'reservada' })
        .eq('id', selectedTool.id)

      if (toolError) {
        throw toolError
      }

      // Mostrar mensaje de éxito
      alert(`✅ Reserva creada exitosamente!\n\n` +
            `Herramienta: ${selectedTool.nombre}\n` +
            `Empleado: ${selectedEmployee.nombre_completo}\n` +
            `Fecha de devolución: ${new Date(formData.fecha_devolucion_estimada).toLocaleDateString('es-ES')}\n` +
            `ID de reserva: ${reservationResult.id}`)

      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess(reservationResult)
      }

    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('Error al crear la reserva: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  if (!selectedTool || !selectedEmployee) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Información incompleta</h3>
          <p className="mt-1 text-sm text-secondary-500">
            Selecciona una herramienta y un empleado para continuar con la reserva
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-secondary-900 mb-6">
        Confirmar Reserva
      </h3>

      {/* Resumen de la reserva */}
      <div className="bg-secondary-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-secondary-900 mb-3">Resumen de la Reserva</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información de la herramienta */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-secondary-700 uppercase tracking-wide">Herramienta</h5>
            <div className="flex items-center space-x-3">
              <img
                src={selectedTool.imagen || '/placeholder-tool.png'}
                alt={selectedTool.nombre}
                className="w-12 h-12 rounded-md object-cover bg-secondary-200"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgzMlYyNEgxNlYxNlpNMjAgMjBIMjhWMjBIMjBWMjBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo="
                }}
              />
              <div>
                <p className="text-sm font-medium text-secondary-900">{selectedTool.nombre}</p>
                <p className="text-xs text-secondary-600">Serial: {selectedTool.serial}</p>
                <p className="text-xs text-secondary-600">Categoría: {selectedTool.categoria}</p>
              </div>
            </div>
          </div>

          {/* Información del empleado */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-secondary-700 uppercase tracking-wide">Empleado</h5>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-500 rounded-md flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {selectedEmployee.nombre_completo.split(' ').map(name => name.charAt(0)).join('').substring(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">{selectedEmployee.nombre_completo}</p>
                <p className="text-xs text-secondary-600">{selectedEmployee.cargo}</p>
                <p className="text-xs text-secondary-600">ID: {selectedEmployee.identificacion}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fecha de devolución */}
        <div>
          <label htmlFor="fecha_devolucion_estimada" className="block text-sm font-medium text-secondary-700 mb-1">
            Fecha de devolución estimada *
          </label>
          <input
            type="date"
            id="fecha_devolucion_estimada"
            name="fecha_devolucion_estimada"
            value={formData.fecha_devolucion_estimada}
            onChange={handleInputChange}
            min={today}
            max={maxDateString}
            className={`input-field ${errors.fecha_devolucion_estimada ? 'input-error' : ''}`}
            required
          />
          {errors.fecha_devolucion_estimada && (
            <p className="mt-1 text-sm text-red-600">{errors.fecha_devolucion_estimada}</p>
          )}
          <p className="mt-1 text-xs text-secondary-500">
            Máximo 30 días desde hoy
          </p>
        </div>

        {/* Observaciones */}
        <div>
          <label htmlFor="observaciones" className="block text-sm font-medium text-secondary-700 mb-1">
            Observaciones (opcional)
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows={3}
            value={formData.observaciones}
            onChange={handleInputChange}
            placeholder="Notas adicionales sobre la reserva..."
            className="input-field resize-none"
          />
          <p className="mt-1 text-xs text-secondary-500">
            Máximo 500 caracteres
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información importante
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>La herramienta se marcará como "reservada" inmediatamente</li>
                  <li>El empleado es responsable del cuidado de la herramienta</li>
                  <li>La devolución debe realizarse en la fecha estimada</li>
                  <li>Se generará una alerta si la herramienta no se devuelve a tiempo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-secondary-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </div>
            ) : (
              'Confirmar Reserva'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReservationForm