import { useState } from 'react'

const UserTable = ({ users, onEdit, onDelete, onResetPassword }) => {
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

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
    const badges = {
      superadmin: 'bg-purple-100 text-purple-800',
      almacenista: 'bg-blue-100 text-blue-800'
    }

    const labels = {
      superadmin: 'Super Admin',
      almacenista: 'Almacenista'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[rol] || 'bg-gray-100 text-gray-800'}`}>
        {labels[rol] || rol}
      </span>
    )
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    )
  }

  if (users.length === 0) {
    return null
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 border-b border-secondary-200">
        <h3 className="text-lg leading-6 font-medium text-secondary-900">
          Usuarios del Sistema
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-secondary-500">
          {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th
                scope="col"
                onClick={() => handleSort('email')}
                className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  <SortIcon column="email" />
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('rol')}
                className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Rol</span>
                  <SortIcon column="rol" />
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('created_at')}
                className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Creado</span>
                  <SortIcon column="created_at" />
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('updated_at')}
                className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider cursor-pointer hover:bg-secondary-100 transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Modificado</span>
                  <SortIcon column="updated_at" />
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {sortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-secondary-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-secondary-900">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.rol)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                  {formatDate(user.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* Botón Editar */}
                    <button
                      onClick={() => onEdit(user)}
                      className="text-primary-600 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50 transition-colors"
                      title="Editar usuario"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Botón Reset Password */}
                    <button
                      onClick={() => onResetPassword(user.id, user.email)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded-md hover:bg-yellow-50 transition-colors"
                      title="Restablecer contraseña"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </button>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => onDelete(user.id, user.email)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Eliminar usuario"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  )
}

export default UserTable