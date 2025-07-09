import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import QRScanner from '../ui/QRScanner'

const NewReservationModal = ({ isOpen, onClose, onSuccess, availableTools, employees }) => {
  const [formData, setFormData] = useState({
    id_herramienta: '',
    id_empleado: '',
    fecha_devolucion_estimada: '',
    condicion: 'bueno'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Limpiar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        id_herramienta: '',
        id_empleado: '',
        fecha_devolucion_estimada: '',
        condicion: 'bueno'
      })
      setSelectedTool(null)
      setSelectedEmployee(null)
      setError('')
      setShowQRScanner(false)
    }
  }, [isOpen])

  // Actualizar herramienta seleccionada
  useEffect(() => {
    if (formData.id_herramienta) {
      const tool = availableTools.find(t => t.id === formData.id_herramienta)
      setSelectedTool(tool)
    } else {
      setSelectedTool(null)
    }
  }, [formData.id_herramienta, availableTools])

  // Actualizar empleado seleccionado
  useEffect(() => {
    if (formData.id_empleado) {
      const employee = employees.find(e => e.id === formData.id_empleado)
      setSelectedEmployee(employee)
    } else {
      setSelectedEmployee(null)
    }
  }, [formData.id_empleado, employees])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleQRScan = (qrCode) => {
    // Buscar empleado por código QR
    const employee = employees.find(emp => emp.qr_code === qrCode)
    
    if (employee) {
      setFormData(prev => ({
        ...prev,
        id_empleado: employee.id
      }))
      setShowQRScanner(false)
      setError('')
    } else {
      setError('Código QR de empleado no válido')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validaciones
      if (!formData.id_herramienta || !formData.id_empleado || !formData.fecha_devolucion_estimada) {
        setError('Todos los campos son obligatorios')
        return
      }

      // Verificar que la fecha de devolución sea futura
      const today = new Date()
      const returnDate = new Date(formData.fecha_devolucion_estimada)
      if (returnDate <= today) {
        setError('La fecha de devolución debe ser posterior a hoy')
        return
      }

      // Crear la reserva
      const { data: reservation, error: reservationError } = await supabase
        .from('reservas')
        .insert([{
          id_herramienta: formData.id_herramienta,
          id_empleado: formData.id_empleado,
          fecha_devolucion_estimada: formData.fecha_devolucion_estimada,
          condicion: formData.condicion,
          estado: 'reservada'
        }])
        .select()
        .single()

      if (reservationError) throw reservationError

      // Actualizar el estado de la herramienta a reservada
      const { error: toolError } = await supabase
        .from('herramientas')
        .update({ estado: 'reservada' })
        .eq('id', formData.id_herramienta)

      if (toolError) throw toolError

      onSuccess()
      
    } catch (error) {
      console.error('Error creating reservation:', error)
      setError(error.message || 'Error al crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
                  Nueva Reserva
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selección de herramienta */}
                <div className="md:col-span-2">
                  <label htmlFor="id_herramienta" className="block text-sm font-medium text-secondary-700 mb-2">
                    Herramienta *
                  </label>
                  <select
                    id="id_herramienta"
                    name="id_herramienta"
                    value={formData.id_herramienta}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccionar herramienta...</option>
                    {availableTools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.nombre} - {tool.serial} ({tool.categoria})
                      </option>
                    ))}
                  </select>

                  {/* Vista previa de herramienta seleccionada */}
                  {selectedTool && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {selectedTool.imagen ? (
                            <img
                              className="h-16 w-16 rounded object-cover"
                              src={selectedTool.imagen}
                              alt={selectedTool.nombre}
                              onError={(e) => {
                                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEwyMCAzMkw0NCAzMkwzMiA0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+"
                              }}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded bg-secondary-200 flex items-center justify-center">
                              <svg className="h-8 w-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-blue-900">{selectedTool.nombre}</h4>
                          <p className="text-sm text-blue-700">Serial: {selectedTool.serial}</p>
                          <p className="text-sm text-blue-600">Categoría: {selectedTool.categoria}</p>
                          {selectedTool.descripcion && (
                            <p className="text-sm text-blue-600 mt-1">{selectedTool.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selección de empleado */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="id_empleado" className="block text-sm font-medium text-secondary-700">
                      Empleado *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      Escanear QR
                    </button>
                  </div>
                  
                  <select
                    id="id_empleado"
                    name="id_empleado"
                    value={formData.id_empleado}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Seleccionar empleado...</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.nombre_completo} - {employee.cargo} (ID: {employee.identificacion})
                      </option>
                    ))}
                  </select>

                  {/* Vista previa de empleado seleccionado */}
                  {selectedEmployee && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                            <span className="text-lg font-medium text-green-800">
                              {selectedEmployee.nombre_completo.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-green-900">{selectedEmployee.nombre_completo}</h4>
                          <p className="text-sm text-green-700">Cargo: {selectedEmployee.cargo}</p>
                          <p className="text-sm text-green-600">ID: {selectedEmployee.identificacion}</p>
                          {selectedEmployee.telefono && (
                            <p className="text-sm text-green-600">Teléfono: {selectedEmployee.telefono}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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
                    min={new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16)} // Mínimo mañana
                    className="block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Condición inicial */}
                <div>
                  <label htmlFor="condicion" className="block text-sm font-medium text-secondary-700 mb-2">
                    Condición inicial
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
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading || !formData.id_herramienta || !formData.id_empleado}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </div>
                ) : (
                  'Crear Reserva'
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

      {/* Modal del escáner QR */}
      {showQRScanner && (
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
          title="Escanear QR del Empleado"
          subtitle="Enfoque el código QR del empleado para asignarlo automáticamente"
        />
      )}
    </div>
  )
}

export default NewReservationModal