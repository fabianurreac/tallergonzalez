import { useState } from 'react'
import { USER_ROLES } from '../../config/supabase'

const UserTable = ({ users, onEdit, onDelete, onResetPassword }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.rol === roleFilter
    return matchesSearch && matchesRole
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleDisplayName = (role) => {
    switch (role) {
      case USER_ROLES.SUPERADMIN:
        return 'Super Admin'
      case USER_ROLES.ALMACENISTA:
        return 'Almacenista'
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case USER_ROLES.SUPERADMIN:
        return 'bg-purple-100 text-purple-800'
      case USER_ROLES.ALMACENISTA:
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-secondary-100 text-secondary-800'
    }
  }

  const getStatusBadge = (user) => {
    if (user.auth_error) {
      return <span className="badge bg-red-100 text-red-800">Error Auth</span>
    }
    
    if (user.email_confirmed) {
      return <span className="badge bg-green-100 text-green-800">Activo</span>
    } else {
      return <span className="badge bg-yellow-100 text-yellow-800">Pendiente</span>
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header con filtros */}
      <div className="px-6 py-4 border-b border-secondary-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Buscador */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Filtro por rol */}
          <div className="flex items-center space-x-3">
            <label htmlFor="roleFilter" className="text-sm font-medium text-secondary-700">
              Filtrar por rol:
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block border-secondary-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="all">Todos</option>
              <option value={USER_ROLES.SUPERADMIN}>Super Admin</option>
              <option value={USER_ROLES.ALMACENISTA}>Almacenista</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-3 text-sm text-secondary-500">
          Mostrando {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      {/* Tabla */}
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
                Último acceso
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Creado
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-secondary-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {user.email}
                      </div>
                      <div className="text-sm text-secondary-500">
                        ID: {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.rol)}`}>
                    {getRoleDisplayName(user.rol)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {formatDate(user.last_sign_in)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Botón Editar */}
                    <button
                      onClick={() => onEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                      title="Editar usuario"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Botón Reset Password */}
                    <button
                      onClick={() => onResetPassword(user.id, user.email)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50"
                      title="Restablecer contraseña"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => onDelete(user.id, user.email)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                      title="Eliminar usuario"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estado vacío cuando no hay resultados de búsqueda */}
      {filteredUsers.length === 0 && users.length > 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">Sin resultados</h3>
          <p className="mt-1 text-sm text-secondary-500">
            No se encontraron usuarios que coincidan con tu búsqueda.
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
              }}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserTable