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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Solo ejecutar una vez al inicializar
    if (initialized) return

    const initializeAuth = async () => {
      try {
        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setUser(null)
          setUserRole(null)
        } else if (session?.user) {
          setUser(session.user)
          // Obtener rol del usuario
          await fetchUserRole(session.user.id)
        } else {
          setUser(null)
          setUserRole(null)
        }
        
        setInitialized(true)
        setLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
        setUserRole(null)
        setInitialized(true)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [initialized])

  useEffect(() => {
    // Escuchar cambios en la autenticación solo después de inicializar
    if (!initialized) return

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null)
          setUserRole(null)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
            await fetchUserRole(session.user.id)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [initialized])

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        setUserRole(null)
        return
      }

      setUserRole(data?.rol || null)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole(null)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
      
      // Limpiar estado local
      setUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
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
    initialized,
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