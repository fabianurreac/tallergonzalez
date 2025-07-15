import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../config/supabase'
import UserForm from '../components/Users/UserForm'
import UserTable from '../components/Users/UserTable'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const UserManagement = () => {
  const { isSuperAdmin, user: currentUser } = useAuth() // ✅ Obtener usuario actual
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isSuperAdmin()) {
      fetchUsers()
    }
  }, [isSuperAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      // ✅ Consulta directa a la tabla usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, rol, nombre, activo, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) {
        setError('Error al cargar usuarios: ' + error.message)
        return
      }

      setUsers(data || [])
    } catch (err) {
      console.error('Error inesperado al cargar usuarios:', err)
      setError('Error inesperado al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Función para crear usuario directamente en la tabla
  const handleCreateUser = async (userData) => {
    try {
      setError('')
      setSuccess('')

      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', userData.email.trim())
        .single()

      if (existingUser) {
        setError('Ya existe un usuario con ese email')
        return false
      }

      // Crear nuevo usuario
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            email: userData.email.trim(),
            password: userData.password,
            rol: userData.rol,
            nombre: userData.nombre?.trim() || null,
            activo: true
          }
        ])
        .select()

      if (error) {
        setError('Error al crear usuario: ' + error.message)
        return false
      }

      setSuccess('Usuario creado exitosamente')
      setShowForm(false)
      setEditingUser(null)
      fetchUsers()
      return true
    } catch (err) {
      console.error('Error al crear usuario:', err)
      setError('Error inesperado al crear usuario')
      return false
    }
  }

  // ✅ Función para actualizar usuario
  const handleUpdateUser = async (userId, userData) => {
    try {
      setError('')
      setSuccess('')

      // Verificar si el email ya existe en otro usuario
      if (userData.email) {
        const { data: existingUser } = await supabase
          .from('usuarios')
          .select('id, email')
          .eq('email', userData.email.trim())
          .neq('id', userId)
          .single()

        if (existingUser) {
          setError('Ya existe otro usuario con ese email')
          return false
        }
      }

      // Preparar datos de actualización
      const updateData = {
        email: userData.email?.trim(),
        rol: userData.rol,
        nombre: userData.nombre?.trim() || null,
        activo: userData.activo !== undefined ? userData.activo : true,
        updated_at: new Date().toISOString()
      }

      // Solo incluir password si se proporciona
      if (userData.password && userData.password.trim() !== '') {
        updateData.password = userData.password
      }

      const { data, error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', userId)
        .select()

      if (error) {
        setError('Error al actualizar usuario: ' + error.message)
        return false
      }

      setSuccess('Usuario actualizado exitosamente')
      setShowForm(false)
      setEditingUser(null)
      fetchUsers()
      return true
    } catch (err) {
      console.error('Error al actualizar usuario:', err)
      setError('Error inesperado al actualizar usuario')
      return false
    }
  }

  // ✅ Función para eliminar usuario
  const handleDeleteUser = async (userId, userEmail) => {
    // Prevenir que el super admin se elimine a sí mismo
    if (currentUser?.id === userId) {
      setError('No puedes eliminar tu propia cuenta')
      return
    }

    if (!confirm(`¿Estás seguro de eliminar al usuario ${userEmail}?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    try {
      setError('')
      setSuccess('')

      // ✅ Eliminación directa de la tabla usuarios
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId)

      if (error) {
        setError('Error al eliminar usuario: ' + error.message)
        return
      }

      setSuccess(`Usuario ${userEmail} eliminado exitosamente`)
      fetchUsers()
    } catch (err) {
      console.error('Error al eliminar usuario:', err)
      setError('Error inesperado al eliminar usuario')
    }
  }

  // ✅ Función para generar token de recuperación de contraseña
  const handleResetPassword = async (userId, userEmail) => {
    try {
      setError('')
      setSuccess('')

      // Generar token de recuperación
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

      // Guardar token en la tabla de reset
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .upsert([
          {
            email: userEmail,
            token: resetToken,
            expires_at: expiresAt.toISOString(),
            used: false
          }
        ])

      if (tokenError) {
        console.log('Error guardando token (tabla no existe):', tokenError)
        // Si la tabla no existe, mostrar token directamente
        setSuccess(`Token de recuperación generado para ${userEmail}:\n\n${resetToken}\n\n(Válido por 24 horas)\n\nComparte este token con el usuario para que pueda recuperar su contraseña.`)
      } else {
        setSuccess(`Token de recuperación generado para ${userEmail}:\n\n${resetToken}\n\n(Válido por 24 horas)`)
      }
    } catch (err) {
      console.error('Error al generar token de recuperación:', err)
      setError('Error al generar token de recuperación')
    }
  }

  // ✅ Función para activar/desactivar usuario
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setError('')
      setSuccess('')

      const newStatus = !currentStatus
      
      const { error } = await supabase
        .from('usuarios')
        .update({ 
          activo: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        setError('Error al cambiar estado del usuario: ' + error.message)
        return
      }

      setSuccess(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`)
      fetchUsers()
    } catch (err) {
      console.error('Error al cambiar estado:', err)
      setError('Error inesperado al cambiar estado del usuario')
    }
  }

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  if (!isSuperAdmin()) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Acceso Restringido</h3>
          <p className="mt-1 text-sm text-secondary-500">
            Solo los super administradores pueden gestionar usuarios.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner text="Cargando usuarios..." />
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-secondary-900 sm:text-3xl sm:truncate">
            Gestión de Usuarios
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Administrar usuarios administradores del sistema
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium bg-white text-secondary-700 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button
            onClick={() => {
              setEditingUser(null)
              setShowForm(true)
              setError('')
              setSuccess('')
            }}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Mensajes de error y éxito */}
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

      {/* Formulario de usuario */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser
            ? (data) => handleUpdateUser(editingUser.id, data)
            : handleCreateUser
          }
          onCancel={() => {
            setEditingUser(null)
            setShowForm(false)
            setError('')
            setSuccess('')
          }}
        />
      )}

      {/* Tabla de usuarios */}
      <UserTable
        users={users}
        currentUserId={currentUser?.id} // ✅ Pasar ID del usuario actual
        onEdit={(user) => {
          setEditingUser(user)
          setShowForm(true)
          setError('')
          setSuccess('')
        }}
        onDelete={handleDeleteUser}
        onResetPassword={handleResetPassword}
        onToggleStatus={handleToggleUserStatus} // ✅ Nueva función
      />

      {/* Estado vacío */}
      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No hay usuarios</h3>
          <p className="mt-1 text-sm text-secondary-500">Comienza creando un nuevo usuario administrador.</p>
          <div className="mt-6">
            <button
              onClick={() => {
                setShowForm(true)
                setError('')
                setSuccess('')
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
            >
              Crear Primer Usuario
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Información</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Solo se pueden crear cuentas de administrador desde aquí</li>
                <li>Los empleados se gestionan desde el módulo de empleados</li>
                <li>Los tokens de recuperación son válidos por 24 horas</li>
                <li>No puedes eliminar tu propia cuenta</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserManagement