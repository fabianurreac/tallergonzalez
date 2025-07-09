import { useState, useEffect } from 'react'
import { USER_ROLES } from '../../config/supabase'

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rol: USER_ROLES.ALMACENISTA
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const isEdit = !!user

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        confirmPassword: '',
        rol: user.rol
      })
    } else {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        rol: USER_ROLES.ALMACENISTA
      })
    }
    setErrors({})
  }, [user])

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

  const validateForm = () => {
    const newErrors = {}

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    // Validar contraseña solo para usuarios nuevos
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria'
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
      newErrors.rol = 'El rol es obligatorio'
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
        // Limpiar formulario solo si es exitoso
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          rol: USER_ROLES.ALMACENISTA
        })
        setErrors({})
      }
    } catch (error) {
      console.error('Error in form submission:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.SUPERADMIN:
        return 'Super Administrador'
      case USER_ROLES.ALMACENISTA:
        return 'Almacenista'
      default:
        return role
    }
  }

  const getRoleDescription = (role) => {
    switch (role) {
      case USER_ROLES.SUPERADMIN:
        return 'Acceso completo a todas las funciones del sistema'
      case USER_ROLES.ALMACENISTA:
        return 'Gestión de inventario, herramientas, empleados y reservas'
      default:
        return ''
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-secondary-900">
            {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          <button
            onClick={onCancel}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isEdit} // No permitir cambiar email en edición
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                } ${isEdit ? 'bg-secondary-50 cursor-not-allowed' : ''}`}
                placeholder="usuario@taller.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {isEdit && (
                <p className="mt-1 text-xs text-secondary-500">
                  El email no se puede modificar después de crear el usuario
                </p>
              )}
            </div>

            {/* Contraseña - Solo para nuevo usuario */}
            {!isEdit && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                    }`}
                    placeholder="Repite la contraseña"
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
                Rol de usuario
              </label>
              <select
                name="rol"
                id="rol"
                value={formData.rol}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.rol
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
              >
                <option value={USER_ROLES.ALMACENISTA}>
                  {getRoleDisplayName(USER_ROLES.ALMACENISTA)}
                </option>
                <option value={USER_ROLES.SUPERADMIN}>
                  {getRoleDisplayName(USER_ROLES.SUPERADMIN)}
                </option>
              </select>
              {errors.rol && (
                <p className="mt-1 text-sm text-red-600">{errors.rol}</p>
              )}
              <p className="mt-1 text-sm text-secondary-500">
                {getRoleDescription(formData.rol)}
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-4 py-2 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                loading
                  ? 'bg-secondary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  {isEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm