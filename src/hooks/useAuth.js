import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { supabase } from '../config/supabase'

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
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // ✅ Función para verificar sesión sin causar bucles
  const checkStoredSession = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem('taller_user')
      
      if (!savedUser) {
        setLoading(false)
        setInitialized(true)
        return
      }

      const userData = JSON.parse(savedUser)
      
      // Verificar que el usuario aún existe y está activo
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, rol, nombre, activo')
        .eq('id', userData.id)
        .eq('activo', true)
        .single()

      if (error || !data) {
        // Usuario no encontrado o inactivo, limpiar sesión
        console.log('Usuario no encontrado o inactivo, limpiando sesión')
        localStorage.removeItem('taller_user')
        setUser(null)
      } else {
        // Usuario válido
        const validUser = {
          id: data.id,
          email: data.email,
          rol: data.rol,
          nombre: data.nombre
        }
        setUser(validUser)
        // Actualizar localStorage con datos frescos
        localStorage.setItem('taller_user', JSON.stringify(validUser))
      }
    } catch (error) {
      console.error('Error verificando sesión:', error)
      localStorage.removeItem('taller_user')
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, []) // ✅ Sin dependencias para evitar bucles

  // ✅ Efecto que solo se ejecuta una vez al montar
  useEffect(() => {
    checkStoredSession()
  }, [checkStoredSession])

  // ✅ Función de login mejorada
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)
      
      console.log('Intentando login con:', email)
      
      // Consultar usuario en la base de datos
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('password', password)
        .eq('activo', true)
        .single()

      if (error) {
        console.error('Error en consulta de login:', error)
        return { 
          success: false, 
          error: 'Credenciales incorrectas o usuario inactivo' 
        }
      }

      if (!data) {
        console.log('No se encontró usuario con esas credenciales')
        return { 
          success: false, 
          error: 'Credenciales incorrectas' 
        }
      }

      console.log('Usuario encontrado:', data.email, 'Rol:', data.rol)

      // Guardar usuario en estado y localStorage
      const userData = {
        id: data.id,
        email: data.email,
        rol: data.rol,
        nombre: data.nombre
      }

      setUser(userData)
      localStorage.setItem('taller_user', JSON.stringify(userData))
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Error inesperado en login:', error)
      return { 
        success: false, 
        error: 'Error al conectar con el servidor' 
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ Función de logout mejorada
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('taller_user')
    console.log('Sesión cerrada')
  }, [])

  // ✅ Función para actualizar usuario
  const updateUser = useCallback((updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData }
    setUser(newUserData)
    localStorage.setItem('taller_user', JSON.stringify(newUserData))
  }, [user])

  // ✅ Funciones de permisos
  const isSuperAdmin = useCallback(() => user?.rol === 'superadmin', [user?.rol])
  const isAlmacenista = useCallback(() => user?.rol === 'almacenista', [user?.rol])
  
  const hasPermission = useCallback((requiredRole) => {
    if (!user) return false
    if (requiredRole === 'superadmin') {
      return user.rol === 'superadmin'
    }
    return user.rol === 'almacenista' || user.rol === 'superadmin'
  }, [user])

  // ✅ Valor del contexto estable
  const value = {
    user,
    loading,
    initialized,
    login,
    logout,
    updateUser,
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