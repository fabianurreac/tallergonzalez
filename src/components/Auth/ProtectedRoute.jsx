import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userRole, loading, hasPermission } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner text="Verificando permisos..." />
  }

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si se requiere un rol específico, verificar permisos
  if (requiredRole) {
    if (!hasPermission(requiredRole)) {
      return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
                Acceso Denegado
              </h2>
              <p className="mt-2 text-sm text-secondary-600">
                No tienes permisos suficientes para acceder a esta página.
              </p>
              <div className="mt-6 space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Permisos Insuficientes
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          Tu rol actual: <strong>{userRole === 'superadmin' ? 'Super Administrador' : 'Almacenista'}</strong>
                        </p>
                        <p>
                          Rol requerido: <strong>{requiredRole === 'superadmin' ? 'Super Administrador' : 'Almacenista'}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.history.back()}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Volver
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Ir al Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  // Si todas las verificaciones pasan, renderizar los children
  return children
}

export default ProtectedRoute