import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../config/supabase'
import UserForm from '../components/Users/UserForm'
import UserTable from '../components/Users/UserTable'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const UserManagement = () => {
  const { isSuperAdmin } = useAuth()
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

      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, rol, created_at, updated_at')
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

  const handleCreateUser = async (userData) => {
    try {
      setError('')
      setSuccess('')

      // Crear usuario usando signUp de Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            rol: userData.rol
          }
        }
      })

      if (error) {
        setError('Error al crear usuario: ' + error.message)
        return false
      }

      if (data.user) {
        // Insertar en la tabla usuarios personalizada
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([{
            id: data.user.id,
            email: userData.email,
            rol: userData.rol
          }])

        if (insertError) {
          setError('Usuario creado pero error al guardar rol: ' + insertError.message)
          return false
        }

        setSuccess(`Usuario creado exitosamente. Se ha enviado un email de confirmación a ${userData.email}`)
        setShowForm(false)
        fetchUsers()
        return true
      }

    } catch (err) {
      console.error('Error al crear usuario:', err)
      setError('Error inesperado al crear usuario: ' + err.message)
      return false
    }
  }

  const handleUpdateUser = async (userId, userData) => {
    try {
      setError('')
      setSuccess('')

      // Actualizar solo el rol en la tabla usuarios
      const { error } = await supabase
        .from('usuarios')
        .update({ rol: userData.rol })
        .eq('id', userId)

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
      setError('Error inesperado al actualizar usuario: ' + err.message)
      return false
    }
  }

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userEmail}? Esta acción no se puede deshacer.`)) {
      return
    }

    try {
      setError('')
      setSuccess('')

      // Primero eliminar de la tabla usuarios personalizada
      const { error: deleteError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId)

      if (deleteError) {
        setError('Error al eliminar usuario: ' + deleteError.message)
        return
      }

      // Nota: Para eliminar completamente de auth.users se necesita Service Role Key
      // Por ahora solo eliminamos de la tabla usuarios personalizada
      setSuccess(`Usuario ${userEmail} eliminado de la aplicación (el registro en auth permanece)`)
      fetchUsers()

    } catch (err) {
      console.error('Error al eliminar usuario:', err)
      setError('Error inesperado al eliminar usuario: ' + err.message)
    }
  }

  const handleResetPassword = async (userId, userEmail) => {
    try {
      setError('')
      setSuccess('')

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setError('Error al enviar email de recuperación: ' + error.message)
        return
      }

      setSuccess(`Email de recuperación enviado a ${userEmail}`)

    } catch (err) {
      console.error('Error al enviar email de recuperación:', err)
      setError('Error inesperado al enviar email de recuperación: ' + err.message)
    }
  }

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

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
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => {
              clearMessages()
              fetchUsers()
            }}
            className="px-4 py-2 border border-secondary-300 rounded-md text-sm font-medium bg-white text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          <button
            onClick={() => {
              setEditingUser(null)
              setShowForm(true)
              clearMessages()
            }}
            className="ml-3 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Usuario
          </button>
        </div>
      </div>

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
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={clearMessages}
                  className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
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
              <h3 className="text-sm font-medium text-green-800">Éxito</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={clearMessages}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            clearMessages()
          }}
        />
      )}

      <UserTable
        users={users}
        onEdit={(user) => {
          setEditingUser(user)
          setShowForm(true)
          clearMessages()
        }}
        onDelete={handleDeleteUser}
        onResetPassword={handleResetPassword}
      />

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No hay usuarios</h3>
          <p className="mt-1 text-sm text-secondary-500">
            Comienza creando un nuevo usuario administrador.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
            >
              Crear Usuario
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement