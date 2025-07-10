import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userRole, loading, initialized, hasPermission } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se inicializa o está cargando
  if (!initialized || loading) {
    return <LoadingSpinner text="Verificando permisos..." />
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si se requiere un rol específico, verificar permisos
  if (requiredRole && !hasPermission(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-secondary-900">
              Acceso Denegado
            </h3>
            <p className="mt-2 text-sm text-secondary-600">
              No tienes permisos para acceder a esta página.
            </p>
            <p className="mt-1 text-xs text-secondary-500">
              Rol requerido: {requiredRole} | Tu rol: {userRole || 'Sin rol'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Si todo está bien, mostrar el contenido
  return children
}

export default ProtectedRoute