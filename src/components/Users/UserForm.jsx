import { useState, useEffect } from 'react'

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'almacenista'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        confirmPassword: '',
        rol: user.rol || 'almacenista'
      })
    } else {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        rol: 'almacenista'
      })
    }
    setErrors({})
  }, [user])

  const validateForm = () => {
    const newErrors = {}

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    // Validar contraseña solo para usuarios nuevos
    if (!user) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida'
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma la contraseña'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    // Validar rol
    if (!formData.rol) {
      newErrors.rol = 'El rol es requerido'
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
      const success = await onSubmit(formData)
      if (success) {
        // El componente padre maneja el cierre del formulario
      }
    } catch (error) {
      console.error('Error en formulario:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-secondary-900 mb-4">
          {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={user} // No permitir cambiar email en edición
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.email 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-secondary-300'
              } ${user ? 'bg-secondary-50 text-secondary-500' : ''}`}
              placeholder="usuario@ejemplo.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Contraseña - Solo para usuarios nuevos */}
          {!user && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.password 
                      ? 'border-red-300 text-red-900 placeholder-red-300' 
                      : 'border-secondary-300'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.confirmPassword 
                      ? 'border-red-300 text-red-900 placeholder-red-300' 
                      : 'border-secondary-300'
                  }`}
                  placeholder="Repite la contraseña"
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </>
          )}

          {/* Rol */}
          <div>
            <label htmlFor="rol" className="block text-sm font-medium text-secondary-700">
              Rol *
            </label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.rol 
                  ? 'border-red-300 text-red-900' 
                  : 'border-secondary-300'
              }`}
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="almacenista">Almacenista</option>
              <option value="superadmin">Super Administrador</option>
            </select>
            {errors.rol && (
              <p className="mt-1 text-sm text-red-600">{errors.rol}</p>
            )}
            <p className="mt-1 text-xs text-secondary-500">
              <strong>Almacenista:</strong> Puede gestionar inventario, reservas y empleados.<br/>
              <strong>Super Administrador:</strong> Acceso completo incluyendo gestión de usuarios.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {user ? 'Actualizando...' : 'Creando...'}
                </div>
              ) : (
                user ? 'Actualizar Usuario' : 'Crear Usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm