import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, USER_ROLES } from '../config/supabase'

const Login = () => {
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'almacenista'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar si ya hay una sesión activa
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/dashboard')
      }
    }
    checkSession()
  }, [navigate])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Todos los campos son obligatorios')
      return false
    }

    if (mode === 'register') {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        setError(error.message === 'Invalid login credentials' ? 
          'Credenciales incorrectas' : error.message)
        return
      }

      if (data.user) {
        // Verificar rol del usuario
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          setError('Error al verificar permisos de usuario')
          return
        }

        navigate('/dashboard')
      }
    } catch (err) {
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
      // Registrar usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            rol: formData.rol
          }
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Insertar en tabla usuarios personalizada
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: data.user.id,
              email: formData.email,
              rol: formData.rol
            }
          ])

        if (insertError) {
          setError('Error al crear perfil de usuario')
          return
        }

        setSuccess('Administrador registrado exitosamente. Verifica tu email para confirmar la cuenta.')
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          rol: 'almacenista'
        })
      }
    } catch (err) {
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
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Se ha enviado un email con instrucciones para restablecer tu contraseña')
      setFormData({ ...formData, email: '', password: '' })
    } catch (err) {
      setError('Error al enviar email de recuperación')
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
      rol: 'almacenista'
    })
    setError('')
    setSuccess('')
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    resetForm()
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
        return 'Te enviaremos un enlace para restablecer tu contraseña'
      default:
        return 'Ingresa a tu cuenta para continuar'
    }
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

        {/* TABS DE NAVEGACIÓN - AQUÍ ESTÁN LAS 3 OPCIONES */}
        <div className="flex space-x-1 bg-secondary-200 p-1 rounded-lg">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-white text-secondary-900 shadow'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              mode === 'register'
                ? 'bg-white text-secondary-900 shadow'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            Registro Admin
          </button>
          <button
            onClick={() => switchMode('forgot')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
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
            {/* EMAIL - SIEMPRE VISIBLE */}
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="admin@taller.com"
              />
            </div>

            {/* PASSWORD - SOLO EN LOGIN Y REGISTER */}
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
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* CONFIRMAR PASSWORD - SOLO EN REGISTER */}
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
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* ROL - SOLO EN REGISTER - SOLO ADMINISTRADORES */}
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
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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

          {/* MENSAJES DE ERROR Y ÉXITO */}
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
                  <div className="mt-2 text-sm text-red-700">{error}</div>
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
                  <div className="mt-2 text-sm text-green-700">{success}</div>
                </div>
              </div>
            </div>
          )}

          {/* BOTÓN DE SUBMIT DINÁMICO */}
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
                  {mode === 'register' ? 'Registrando...' : mode === 'forgot' ? 'Enviando...' : 'Iniciando...'}
                </div>
              ) : (
                <>
                  {mode === 'register' ? '👨‍💼 Registrar Administrador' : 
                   mode === 'forgot' ? '📧 Enviar Email de Recuperación' : 
                   '🔐 Iniciar Sesión'}
                </>
              )}
            </button>
          </div>

          {/* CREDENCIALES DE PRUEBA - SOLO EN LOGIN */}
          {mode === 'login' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-secondary-50 text-secondary-500">
                    Credenciales de Prueba
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-center text-xs text-secondary-600 bg-secondary-100 p-3 rounded-md">
                <p><strong>🔑 Super Administrador:</strong> admin@taller.com / admin123</p>
                <p><strong>📦 Almacenista:</strong> almacen@taller.com / almacen123</p>
              </div>
            </div>
          )}

          {/* INFORMACIÓN ADICIONAL SEGÚN EL MODO */}
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
                <strong>📧 Información:</strong> Recibirás un email con un enlace seguro para 
                restablecer tu contraseña. Verifica tu bandeja de spam si no lo encuentras.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login