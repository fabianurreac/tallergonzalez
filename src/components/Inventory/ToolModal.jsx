import { useState, useEffect } from 'react'

const ToolModal = ({ tool, isOpen, onClose, onSave, categories, states, conditions }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: '',
    categoria: '',
    serial: '',
    fecha_compra: '',
    estado: 'disponible',
    condicion: 'bueno'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tool) {
      setFormData({
        nombre: tool.nombre || '',
        descripcion: tool.descripcion || '',
        imagen: tool.imagen || '',
        categoria: tool.categoria || '',
        serial: tool.serial || '',
        fecha_compra: tool.fecha_compra || '',
        estado: tool.estado || 'disponible',
        condicion: tool.condicion || 'bueno'
      })
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        imagen: '',
        categoria: '',
        serial: '',
        fecha_compra: '',
        estado: 'disponible',
        condicion: 'bueno'
      })
    }
    setErrors({})
  }, [tool, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es obligatoria'
    }

    if (!formData.serial.trim()) {
      newErrors.serial = 'El serial es obligatorio'
    }

    if (formData.fecha_compra && new Date(formData.fecha_compra) > new Date()) {
      newErrors.fecha_compra = 'La fecha de compra no puede ser futura'
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
      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        fecha_compra: formData.fecha_compra || null
      }

      await onSave(dataToSend)
    } catch (error) {
      console.error('Error saving tool:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA2NUw5NSA3NUwxMDUgNjNMMTIzIDgzSDc3TDg3IDY1WiIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSI5MCIgY3k9IjUwIiByPSI1IiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjEyIj5TaW4gaW1hZ2VuPC90ZXh0Pgo8L3N2Zz4K"
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

        {/* Centrar modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
                    {tool ? 'Editar Herramienta' : 'Nueva Herramienta'}
                  </h3>

                  <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-secondary-700">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                          errors.nombre ? 'border-red-300' : 'border-secondary-300'
                        }`}
                        placeholder="Ej. Llave inglesa 12mm"
                      />
                      {errors.nombre && (
                        <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                      )}
                    </div>

                    {/* Descripción */}
                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-secondary-700">
                        Descripción
                      </label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        rows={3}
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Descripción detallada de la herramienta..."
                      />
                    </div>

                    {/* URL de imagen */}
                    <div>
                      <label htmlFor="imagen" className="block text-sm font-medium text-secondary-700">
                        URL de imagen
                      </label>
                      <input
                        type="url"
                        id="imagen"
                        name="imagen"
                        value={formData.imagen}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                      {/* Vista previa de imagen */}
                      {formData.imagen && (
                        <div className="mt-2">
                          <img
                            src={formData.imagen}
                            alt="Vista previa"
                            className="h-20 w-20 object-cover rounded-md"
                            onError={handleImageError}
                          />
                        </div>
                      )}
                    </div>

                    {/* Grid para campos en línea */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Categoría */}
                      <div>
                        <label htmlFor="categoria" className="block text-sm font-medium text-secondary-700">
                          Categoría *
                        </label>
                        <select
                          id="categoria"
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            errors.categoria ? 'border-red-300' : 'border-secondary-300'
                          }`}
                        >
                          <option value="">Seleccionar...</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.categoria && (
                          <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
                        )}
                      </div>

                      {/* Serial */}
                      <div>
                        <label htmlFor="serial" className="block text-sm font-medium text-secondary-700">
                          Serial *
                        </label>
                        <input
                          type="text"
                          id="serial"
                          name="serial"
                          value={formData.serial}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono ${
                            errors.serial ? 'border-red-300' : 'border-secondary-300'
                          }`}
                          placeholder="SN123456"
                        />
                        {errors.serial && (
                          <p className="mt-1 text-sm text-red-600">{errors.serial}</p>
                        )}
                      </div>
                    </div>

                    {/* Segunda fila del grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* Estado */}
                      <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-secondary-700">
                          Estado
                        </label>
                        <select
                          id="estado"
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          {states.map((estado) => (
                            <option key={estado} value={estado}>
                              {estado.charAt(0).toUpperCase() + estado.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Condición */}
                      <div>
                        <label htmlFor="condicion" className="block text-sm font-medium text-secondary-700">
                          Condición
                        </label>
                        <select
                          id="condicion"
                          name="condicion"
                          value={formData.condicion}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          {conditions.map((condicion) => (
                            <option key={condicion} value={condicion}>
                              {condicion.charAt(0).toUpperCase() + condicion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Fecha de compra */}
                      <div>
                        <label htmlFor="fecha_compra" className="block text-sm font-medium text-secondary-700">
                          Fecha compra
                        </label>
                        <input
                          type="date"
                          id="fecha_compra"
                          name="fecha_compra"
                          value={formData.fecha_compra}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split('T')[0]}
                          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                            errors.fecha_compra ? 'border-red-300' : 'border-secondary-300'
                          }`}
                        />
                        {errors.fecha_compra && (
                          <p className="mt-1 text-sm text-red-600">{errors.fecha_compra}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm ${
                  loading
                    ? 'bg-secondary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
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
                  tool ? 'Actualizar' : 'Crear'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
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

export default ToolModal