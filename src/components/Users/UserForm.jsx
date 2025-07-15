import { useState, useEffect } from 'react'
import { USER_ROLES } from '../../config/supabase'

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    rol: 'almacenista'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Llenar formulario si estamos editando
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        confirmPassword: '',
        nombre: user.nombre || '',
        rol: user.rol || 'almacenista'
      })
    } else {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        nombre: '',
        rol: 'almacenista'
      })
    }
    setErrors({})
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    // Validar contraseña solo si es nuevo usuario o si se está cambiando
    if (!user) {
      // Nuevo usuario - contraseña obligatoria
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria'
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    } else {
      // Usuario existente - contraseña opcional
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden'
      }
    }

    // Validar rol
    if (!Object.values(USER_ROLES).includes(formData.rol)) {
      newErrors.rol = 'Rol inválido'
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
      const submitData = {
        email: formData.email.trim(),
        nombre: formData.nombre.trim(),
        rol: formData.rol
      }

      // Solo incluir password si no está vacío
      if (formData.password.trim()) {
        submitData.password = formData.password
      }

      const success = await onSubmit(submitData)
      
      if (success) {
        // Resetear formulario si es creación exitosa
        if (!user) {
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            nombre: '',
            rol: 'almacenista'
          })
        }
      }
    } catch (error) {
      console.error('Error en formulario:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-secondary-900">
          {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h3>
        <p className="mt-1 text-sm text-secondary-500">
          {user 
            ? 'Modifica la información del usuario administrador.' 
            : 'Crear una nueva cuenta de administrador para el sistema.'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.email 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-secondary-300'
              }`}
              placeholder="admin@empresa.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-secondary-700">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              disabled={loading}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.nombre 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-secondary-300'
              }`}
              placeholder="Juan Pérez"
            />
            {errors.nombre && (
              <p className="mt-2 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
              Contraseña {user ? '(opcional)' : '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.password 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-secondary-300'
              }`}
              placeholder={user ? 'Dejar vacío para mantener actual' : '••••••••'}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
            {!user && (
              <p className="mt-1 text-xs text-secondary-500">Mínimo 6 caracteres</p>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
              Confirmar contraseña {user ? '(opcional)' : '*'}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                errors.confirmPassword 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-secondary-300'
              }`}
              placeholder={user ? 'Confirmar nueva contraseña' : '••••••••'}
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Rol */}
        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-secondary-700">
            Rol de administrador *
          </label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleInputChange}
            disabled={loading}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
              errors.rol 
                ? 'border-red-300 text-red-900' 
                : 'border-secondary-300'
            }`}
          >
            <option value="almacenista">Almacenista</option>
            <option value="superadmin">Super Administrador</option>
          </select>
          {errors.rol && (
            <p className="mt-2 text-sm text-red-600">{errors.rol}</p>
          )}
          <div className="mt-2 text-xs text-secondary-500">
            {formData.rol === 'superadmin' ? (
              <span className="text-red-600">
                🔑 Acceso completo: gestión de usuarios, empleados, inventario y configuración
              </span>
            ) : (
              <span className="text-blue-600">
                📦 Acceso estándar: gestión de inventario, empleados y reservas
              </span>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
  )
}

export default UserForm