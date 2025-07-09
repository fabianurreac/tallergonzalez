import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, USER_ROLES } from '../config/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser(session.user)
        await fetchUserRole(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchUserRole(session.user.id)
        } else {
          setUser(null)
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return
      }

      setUserRole(data?.rol)
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isSuperAdmin = () => userRole === USER_ROLES.SUPERADMIN
  const isAlmacenista = () => userRole === USER_ROLES.ALMACENISTA
  const hasPermission = (requiredRole) => {
    if (requiredRole === USER_ROLES.SUPERADMIN) {
      return isSuperAdmin()
    }
    return isAlmacenista() || isSuperAdmin()
  }

  const value = {
    user,
    userRole,
    loading,
    signOut,
    isSuperAdmin,
    isAlmacenista,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default useAuth