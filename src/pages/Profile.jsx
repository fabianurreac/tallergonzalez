import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAlerts } from '../hooks/useAlerts'
import { supabase } from '../config/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Profile = () => {
  const { user, userRole } = useAuth()
  const { showNotification } = useAlerts()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    email: '',
    nombre_completo: '',
    telefono: '',
    cargo: ''
  })

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Cargar datos del usuario desde la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error loading user data:', userError)
      }

      setProfileData({
        email: user.email || '',
        nombre_completo: userData?.nombre_completo || '',
        telefono: userData?.telefono || '',
        cargo: userData?.cargo || ''
      })

    } catch (error) {
      console.error('Error loading profile:', error)
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar la información del perfil',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)

      // Actualizar datos en la tabla usuarios
      const { error: updateError } = await supabase
        .from('usuarios')
        .upsert({
          id: user.id,
          email: profileData.email,
          nombre_completo: profileData.nombre_completo,
          telefono: profileData.telefono,
          cargo: profileData.cargo,
          rol: userRole
        }, {
          onConflict: 'id'
        })

      if (updateError) {
        throw updateError
      }

      showNotification({
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Los cambios se han guardado correctamente',
        duration: 3000
      })

    } catch (error) {
      console.error('Error saving profile:', error)
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el perfil',
        duration: 5000
      })
    } finally {
      setSaving(false)
    }
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'superadmin':
        return 'Super Administrador'
      case 'almacenista':
        return 'Almacenista'
      default:
        return 'Usuario'
    }
  }

  if (loading) {
    return <LoadingSpinner text="Cargando perfil..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Mi Perfil
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la cuenta */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Información de la Cuenta
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-900">
                      {profileData.nombre_completo || 'Sin nombre'}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {getRoleDisplayName(userRole)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-secondary-200 pt-4">
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Email</dt>
                      <dd className="text-sm text-secondary-900">{user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Rol</dt>
                      <dd className="text-sm text-secondary-900">{getRoleDisplayName(userRole)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-secondary-500">Última conexión</dt>
                      <dd className="text-sm text-secondary-900">
                        {user?.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'No disponible'
                        }
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de edición */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">
                Editar Información Personal
              </h3>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled
                      className="mt-1 input-field bg-secondary-50 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-secondary-500">
                      El email no se puede modificar
                    </p>
                  </div>

                  <div>
                    <label htmlFor="nombre_completo" className="block text-sm font-medium text-secondary-700">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="nombre_completo"
                      id="nombre_completo"
                      value={profileData.nombre_completo}
                      onChange={handleInputChange}
                      className="mt-1 input-field"
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-secondary-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      id="telefono"
                      value={profileData.telefono}
                      onChange={handleInputChange}
                      className="mt-1 input-field"
                      placeholder="Ingresa tu número de teléfono"
                    />
                  </div>

                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium text-secondary-700">
                      Cargo
                    </label>
                    <input
                      type="text"
                      name="cargo"
                      id="cargo"
                      value={profileData.cargo}
                      onChange={handleInputChange}
                      className="mt-1 input-field"
                      placeholder="Ingresa tu cargo"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={loadProfile}
                    className="btn-secondary"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? (
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
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de seguridad */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Configuración de Seguridad
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Cambio de Contraseña
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Para cambiar tu contraseña, contacta al administrador del sistema
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Sesiones Activas
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Tu sesión actual está protegida y activa
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile