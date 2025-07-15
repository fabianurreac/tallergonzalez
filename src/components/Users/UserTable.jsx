import { useState } from 'react'

const UserTable = ({ 
  users, 
  currentUserId, 
  onEdit, 
  onDelete, 
  onResetPassword, 
  onToggleStatus 
}) => {
  const [actionLoading, setActionLoading] = useState({})

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadge = (rol) => {
    switch (rol) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            🔑 Super Admin
          </span>
        )
      case 'almacenista':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            📦 Almacenista
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
            {rol}
          </span>
        )
    }
  }

  const getStatusBadge = (activo) => {
    return activo ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ❌ Inactivo
      </span>
    )
  }

  const handleAction = async (actionId, actionFn) => {
    setActionLoading(prev => ({ ...prev, [actionId]: true }))
    try {
      await actionFn()
    } finally {
      setActionLoading(prev => ({ ...prev, [actionId]: false }))
    }
  }

  const isCurrentUser = (userId) => userId === currentUserId

  if (!users || users.length === 0) {
    return null
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-secondary-200">
        <h3 className="text-lg leading-6 font-medium text-secondary-900">
          Usuarios Administradores
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-secondary-500">
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Usuario
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Rol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Fecha de creación
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Última actualización
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                {/* Usuario */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {user.nombre ? user.nombre.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {user.nombre || 'Sin nombre'}
                        {isCurrentUser(user.id) && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-secondary-500">{user.email}</div>
                    </div>
                  </div>
                </td>

                {/* Rol */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.rol)}
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.activo)}
                </td>

                {/* Fecha de creación */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {formatDate(user.created_at)}
                </td>

                {/* Última actualización */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {user.updated_at ? formatDate(user.updated_at) : 'N/A'}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {/* Botón Editar */}
                    <button
                      onClick={() => onEdit(user)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      title="Editar usuario"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Botón Resetear Contraseña */}
                    <button
                      onClick={() => handleAction(
                        `reset-${user.id}`, 
                        () => onResetPassword(user.id, user.email)
                      )}
                      disabled={actionLoading[`reset-${user.id}`]}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors disabled:opacity-50"
                      title="Resetear contraseña"
                    >
                      {actionLoading[`reset-${user.id}`] ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2L4.257 9.257a6 6 0 119.486-9.486L15 1z" />
                        </svg>
                      )}
                    </button>

                    {/* Botón Activar/Desactivar */}
                    <button
                      onClick={() => handleAction(
                        `toggle-${user.id}`, 
                        () => onToggleStatus(user.id, user.activo)
                      )}
                      disabled={actionLoading[`toggle-${user.id}`] || isCurrentUser(user.id)}
                      className={`p-1 rounded transition-colors disabled:opacity-50 ${
                        user.activo 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      title={isCurrentUser(user.id) ? 'No puedes cambiar tu propio estado' : (user.activo ? 'Desactivar usuario' : 'Activar usuario')}
                    >
                      {actionLoading[`toggle-${user.id}`] ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : user.activo ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => handleAction(
                        `delete-${user.id}`, 
                        () => onDelete(user.id, user.email)
                      )}
                      disabled={actionLoading[`delete-${user.id}`] || isCurrentUser(user.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors disabled:opacity-50"
                      title={isCurrentUser(user.id) ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                    >
                      {actionLoading[`delete-${user.id}`] ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con información */}
      <div className="bg-secondary-50 px-4 py-3 border-t border-secondary-200">
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <div className="flex items-center space-x-4">
            <span>Total: {users.length} usuarios</span>
            <span>•</span>
            <span>Activos: {users.filter(u => u.activo).length}</span>
            <span>•</span>
            <span>Super Admins: {users.filter(u => u.rol === 'superadmin').length}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2L4.257 9.257a6 6 0 119.486-9.486L15 1z" />
              </svg>
              Reset
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activar/Desactivar
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserTable