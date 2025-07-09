import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import QRCode from 'qrcode'

const EmployeeForm = ({ isOpen, onClose, employee = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    identificacion: '',
    cargo: ''
  })
  const [qrCodeData, setQrCodeData] = useState('')
  const [qrCodeImage, setQrCodeImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const cargos = [
    'Mecánico General',
    'Especialista en Motor',
    'Técnico Eléctrico',
    'Latonero',
    'Pintor',
    'Técnico en Frenos',
    'Especialista en Transmisión',
    'Supervisor',
    'Jefe de Taller',
    'Auxiliar de Taller'
  ]

  useEffect(() => {
    if (employee) {
      setFormData({
        nombre_completo: employee.nombre_completo || '',
        telefono: employee.telefono || '',
        identificacion: employee.identificacion || '',
        cargo: employee.cargo || ''
      })
      setQrCodeData(employee.qr_code || '')
      if (employee.qr_code) {
        generateQRImage(employee.qr_code)
      }
    } else {
      // Limpiar formulario para nuevo empleado
      setFormData({
        nombre_completo: '',
        telefono: '',
        identificacion: '',
        cargo: ''
      })
      setQrCodeData('')
      setQrCodeImage('')
    }
    setErrors({})
  }, [employee, isOpen])

  // Generar QR automáticamente cuando se llena la identificación
  useEffect(() => {
    if (formData.identificacion && formData.nombre_completo && !employee) {
      generateQRCode()
    }
  }, [formData.identificacion, formData.nombre_completo, employee])

  const generateQRCode = async () => {
    try {
      // Crear un objeto con información del empleado
      const employeeData = {
        identificacion: formData.identificacion,
        nombre: formData.nombre_completo,
        timestamp: new Date().getTime()
      }
      
      // Convertir a string JSON para el QR
      const qrString = JSON.stringify(employeeData)
      setQrCodeData(qrString)
      
      // Generar imagen del QR
      await generateQRImage(qrString)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const generateQRImage = async (data) => {
    try {
      const qrImageUrl = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeImage(qrImageUrl)
    } catch (error) {
      console.error('Error generating QR image:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre_completo.trim()) {
      newErrors.nombre_completo = 'El nombre completo es requerido'
    }

    if (!formData.identificacion.trim()) {
      newErrors.identificacion = 'La identificación es requerida'
    } else if (!/^\d+$/.test(formData.identificacion)) {
      newErrors.identificacion = 'La identificación debe contener solo números'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos'
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'El cargo es requerido'
    }

    if (!qrCodeData && !employee) {
      newErrors.qr_code = 'Error generando código QR'
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
      const employeeDataToSave = {
        ...formData,
        qr_code: qrCodeData
      }

      let result
      if (employee) {
        // Actualizar empleado existente
        result = await supabase
          .from('empleados')
          .update(employeeDataToSave)
          .eq('id', employee.id)
      } else {
        // Verificar que la identificación no exista
        const { data: existingEmployee } = await supabase
          .from('empleados')
          .select('id')
          .eq('identificacion', formData.identificacion)
          .single()

        if (existingEmployee) {
          setErrors({ identificacion: 'Ya existe un empleado con esta identificación' })
          setLoading(false)
          return
        }

        // Crear nuevo empleado
        result = await supabase
          .from('empleados')
          .insert([employeeDataToSave])
      }

      if (result.error) {
        console.error('Error saving employee:', result.error)
        if (result.error.code === '23505') {
          setErrors({ identificacion: 'Ya existe un empleado con esta identificación' })
        } else {
          alert('Error al guardar empleado: ' + result.error.message)
        }
        return
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving employee:', error)
      alert('Error inesperado al guardar empleado')
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
    
    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-secondary-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900">
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda - Formulario */}
            <div className="space-y-4">
              <div>
                <label htmlFor="nombre_completo" className="block text-sm font-medium text-secondary-700">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  name="nombre_completo"
                  value={formData.nombre_completo}
                  onChange={handleInputChange}
                  className={`mt-1 input-field ${errors.nombre_completo ? 'input-error' : ''}`}
                  placeholder="Ej: Juan Pérez García"
                />
                {errors.nombre_completo && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre_completo}</p>
                )}
              </div>

              <div>
                <label htmlFor="identificacion" className="block text-sm font-medium text-secondary-700">
                  Identificación *
                </label>
                <input
                  type="text"
                  id="identificacion"
                  name="identificacion"
                  value={formData.identificacion}
                  onChange={handleInputChange}
                  className={`mt-1 input-field ${errors.identificacion ? 'input-error' : ''}`}
                  placeholder="Ej: 1234567890"
                  disabled={!!employee} // No permitir editar identificación en modo edición
                />
                {errors.identificacion && (
                  <p className="mt-1 text-sm text-red-600">{errors.identificacion}</p>
                )}
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-secondary-700">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className={`mt-1 input-field ${errors.telefono ? 'input-error' : ''}`}
                  placeholder="Ej: 3001234567"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
              </div>

              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-secondary-700">
                  Cargo *
                </label>
                <select
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className={`mt-1 input-field ${errors.cargo ? 'input-error' : ''}`}
                >
                  <option value="">Seleccionar cargo</option>
                  {cargos.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
                </select>
                {errors.cargo && (
                  <p className="mt-1 text-sm text-red-600">{errors.cargo}</p>
                )}
              </div>
            </div>

            {/* Columna derecha - Código QR */}
            <div className="flex flex-col items-center justify-center p-4 bg-secondary-50 rounded-lg">
              <h4 className="text-sm font-medium text-secondary-700 mb-4">
                Código QR del Empleado
              </h4>
              
              {qrCodeImage ? (
                <div className="text-center">
                  <img 
                    src={qrCodeImage} 
                    alt="Código QR del empleado"
                    className="w-48 h-48 border-2 border-secondary-200 rounded-lg"
                  />
                  <p className="mt-2 text-xs text-secondary-500">
                    Se genera automáticamente
                  </p>
                </div>
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-secondary-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="mt-2 text-sm text-secondary-500">
                      Completa los datos para generar el QR
                    </p>
                  </div>
                </div>
              )}
              
              {errors.qr_code && (
                <p className="mt-2 text-sm text-red-600">{errors.qr_code}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {employee ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                employee ? 'Actualizar Empleado' : 'Crear Empleado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeForm