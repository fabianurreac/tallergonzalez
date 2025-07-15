import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase, USER_ROLES } from '../config/supabase'

const Login = () => {
  const [mode, setMode] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'almacenista',
    nombre: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const { user, loading: authLoading, login, initialized } = useAuth()

  // ✅ Solo redirigir cuando esté inicializado y haya usuario
  useEffect(() => {
    if (initialized && user) {
      console.log('Usuario ya autenticado, redirigiendo...')
      navigate('/dashboard', { replace: true })
    }
  }, [initialized, user, navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    if (!formData.email || (mode !== 'forgot' && !formData.password)) {
      setError('Todos los campos son obligatorios')
      return false
    }

    if (mode === 'register') {
      if (!formData.nombre) {
        setError('El nombre es obligatorio')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return false
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return false
      }
    }

    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      console.log('Iniciando login para:', formData.email)
      
      const result = await login(formData.email.trim(), formData.password)
      
      console.log('Resultado del login:', result)
      
      if (result.success) {
        console.log('Login exitoso, usuario:', result.user)
        // La redirección se maneja en el useEffect
      } else {
        setError(result.error || 'Credenciales incorrectas')
      }
    } catch (err) {
      console.error('Error inesperado en login:', err)
      setError('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', formData.email.trim())
        .single()

      if (existingUser) {
        setError('Ya existe un usuario con ese email')
        setLoading(false)
        return
      }

      // Insertar nuevo administrador
      const { data, error: insertError } = await supabase
        .from('usuarios')
        .insert([
          {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            rol: formData.rol,
            nombre: formData.nombre.trim(),
            activo: true
          }
        ])
        .select()

      if (insertError) {
        console.error('Error al insertar usuario:', insertError)
        setError('Error al crear el administrador. Intenta nuevamente.')
        setLoading(false)
        return
      }

      setSuccess(`✅ Administrador ${formData.rol} registrado exitosamente. Ya puedes iniciar sesión.`)
      
      // Limpiar formulario
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        rol: 'almacenista',
        nombre: ''
      })

      // Cambiar automáticamente al modo login después de 3 segundos
      setTimeout(() => {
        setSuccess('')
        switchMode('login')
      }, 3000)

    } catch (err) {
      console.error('Error inesperado en registro:', err)
      setError('Error inesperado al registrar administrador')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!formData.email) {
      setError('Ingresa tu email para recuperar la contraseña')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verificar si el usuario existe
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('email, nombre, rol')
        .eq('email', formData.email.trim())
        .eq('activo', true)
        .single()

      if (error || !userData) {
        setError('No se encontró un usuario activo con ese email')
        setLoading(false)
        return
      }

      // Generar token temporal para reset
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

      // Crear registro de token de reset
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .upsert([
          {
            email: formData.email.trim(),
            token: resetToken,
            expires_at: expiresAt.toISOString(),
            used: false
          }
        ])

      if (tokenError) {
        console.log('Token error (tabla no existe):', tokenError)
        setSuccess(`📧 Solicitud de recuperación registrada para ${formData.email}. 
                   Contacta al administrador del sistema con esta información:
                   Email: ${formData.email}
                   Fecha: ${new Date().toLocaleString()}
                   Token: ${resetToken}`)
      } else {
        setSuccess(`📧 Se ha generado un token de recuperación. 
                   Contacta al administrador del sistema con este token: ${resetToken}
                   (Válido por 24 horas)`)
      }

      setFormData({ ...formData, email: '', password: '' })
    } catch (err) {
      console.error('Error inesperado en recuperación:', err)
      setError('Error al procesar recuperación de contraseña')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    switch (mode) {
      case 'login':
        return handleLogin(e)
      case 'register':
        return handleRegister(e)
      case 'forgot':
        return handleForgotPassword(e)
      default:
        return handleLogin(e)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      rol: 'almacenista',
      nombre: ''
    })
    setError('')
    setSuccess('')
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    resetForm()
  }

  const fillTestCredentials = (type) => {
    if (type === 'admin') {
      setFormData({
        ...formData,
        email: 'admin@taller.com',
        password: 'admin123'
      })
    } else {
      setFormData({
        ...formData,
        email: 'almacen@taller.com',
        password: 'almacen123'
      })
    }
  }

  const getModeTitle = () => {
    switch (mode) {
      case 'login':
        return 'Iniciar Sesión'
      case 'register':
        return 'Registrar Administrador'
      case 'forgot':
        return 'Recuperar Contraseña'
      default:
        return 'Iniciar Sesión'
    }
  }

  const getModeDescription = () => {
    switch (mode) {
      case 'login':
        return 'Ingresa a tu cuenta para continuar'
      case 'register':
        return 'Crear nueva cuenta de administrador'
      case 'forgot':
        return 'Te ayudaremos a recuperar el acceso a tu cuenta'
      default:
        return 'Ingresa a tu cuenta para continuar'
    }
  }

  // ✅ Mostrar loading solo mientras se inicializa la auth
  if (authLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg className="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-secondary-600 text-sm font-medium">Iniciando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Logo Taller" 
              className="h-20 w-auto"
              onError={(e) => {
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNEQzI2MjYiLz4KPHN2ZyB4PSIyMCIgeT0iMjAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iI0ZGRkZGRiI+CjxwYXRoIGQ9Ik0zMiAxNkgxNnY4aDEydjEyaC00djhIOHYxMmgxMnYtOGg0djEyaDE2VjE2SDE2ek0yNCAxNnY4aDhWMTZoLTh6Ii8+Cjwvc3ZnPgo8L3N2Zz4="
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            {getModeTitle()}
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            {getModeDescription()}
          </p>
        </div>

        {/* TABS DE NAVEGACIÓN */}
        <div className="flex space-x-1 bg-secondary-200 p-1 rounded-lg">
          <button
            onClick={() => switchMode('login')}
            disabled={loading}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
              mode === 'login'
                ? 'bg-white text-secondary-900 shadow'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => switchMode('register')}
            disabled={loading}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
              mode === 'register'
                ? 'bg-white text-secondary-900 shadow'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Registro Admin
          </button>
          <button
            onClick={() => switchMode('forgot')}
            disabled={loading}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
              mode === 'forgot'
                ? 'bg-white text-secondary-900 shadow'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Recuperar
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* EMAIL */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50"
                placeholder="admin@taller.com"
              />
            </div>

            {/* NOMBRE - SOLO EN REGISTER */}
            {mode === 'register' && (
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-secondary-700">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50"
                  placeholder="Juan Pérez"
                />
              </div>
            )}

            {/* PASSWORD */}
            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* CONFIRMAR PASSWORD */}
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* ROL */}
            {mode === 'register' && (
              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-secondary-700">
                  Rol de Administrador
                </label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm disabled:opacity-50"
                >
                  <option value="almacenista">Almacenista</option>
                  <option value="superadmin">Super Administrador</option>
                </select>
                <p className="mt-1 text-xs text-secondary-500">
                  {formData.rol === 'superadmin' 
                    ? '🔑 Acceso completo a todas las funciones del sistema'
                    : '📦 Acceso a gestión de inventario y reservas'
                  }
                </p>
              </div>
            )}
          </div>

          {/* MENSAJES */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700 whitespace-pre-line">{error}</div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">¡Éxito!</h3>
                  <div className="mt-2 text-sm text-green-700 whitespace-pre-line">{success}</div>
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN SUBMIT */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading 
                  ? 'bg-secondary-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              } transition-colors duration-200`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'register' ? 'Registrando...' : mode === 'forgot' ? 'Procesando...' : 'Iniciando sesión...'}
                </div>
              ) : (
                <>
                  {mode === 'register' ? '👨‍💼 Registrar Administrador' : 
                   mode === 'forgot' ? '🔑 Solicitar Recuperación' : 
                   '🔐 Iniciar Sesión'}
                </>
              )}
            </button>
          </div>

          
          {/* INFORMACIÓN ADICIONAL */}
          {mode === 'register' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-xs text-blue-800">
                <strong>ℹ️ Nota:</strong> Solo se pueden registrar cuentas de administrador. 
                Los empleados regulares se gestionan desde el módulo de empleados.
              </p>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-md">
              <p className="text-xs text-yellow-800">
                <strong>🔑 Información:</strong> Se generará un token de recuperación que deberás 
                proporcionar al administrador del sistema para restablecer tu contraseña de forma segura.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login