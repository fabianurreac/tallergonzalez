import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://llouainqhmwnntzhrzop.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsb3VhaW5xaG13bm50emhyem9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDE0NDIsImV4cCI6MjA2ODIxNzQ0Mn0.sG3FhN-J9JAvz2qAHDDWUn6iXsxnjhb6_JpKp4itaVg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Roles de usuario
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ALMACENISTA: 'almacenista'
}

// Estados de herramientas
export const TOOL_STATES = {
  DISPONIBLE: 'disponible',
  RESERVADA: 'reservada'
}

// Condiciones de herramientas
export const TOOL_CONDITIONS = {
  BUENO: 'bueno',
  MALO: 'malo',
  DETERIORO: 'deterioro'
}

// Categorías de herramientas
export const TOOL_CATEGORIES = [
  'Limpieza',
  'Eléctrica',
  'Herramientas y equipos',
  'Análisis',
  'Protección',
  'Embellecimiento',
  'Latonería y pintura'
]

// Estados de reservas
export const RESERVATION_STATES = {
  RESERVADA: 'reservada',
  DEVUELTA: 'devuelta'
}

// Configuración para la aplicación
export const APP_CONFIG = {
  name: 'Sistema de Gestión de Inventario',
  version: '1.0.0',
  logo: '/logo.png',
  theme: {
    primary: 'red', // Rojo como color principal
    secondary: 'gray' // Gris como color secundario
  }
}

// Helper functions para validaciones
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password) => {
  return password && password.length >= 6
}

export const getDisplayRole = (role) => {
  switch (role) {
    case USER_ROLES.SUPERADMIN:
      return 'Super Administrador'
    case USER_ROLES.ALMACENISTA:
      return 'Almacenista'
    default:
      return 'Usuario'
  }
}

export const getDisplayState = (state) => {
  switch (state) {
    case TOOL_STATES.DISPONIBLE:
      return 'Disponible'
    case TOOL_STATES.RESERVADA:
      return 'Reservada'
    default:
      return state
  }
}

export const getDisplayCondition = (condition) => {
  switch (condition) {
    case TOOL_CONDITIONS.BUENO:
      return 'Bueno'
    case TOOL_CONDITIONS.MALO:
      return 'Malo'
    case TOOL_CONDITIONS.DETERIORO:
      return 'En Deterioro'
    default:
      return condition
  }
}

// Función para formatear fechas
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para generar códigos QR únicos
export const generateQRCode = (prefix = 'EMP') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`.toUpperCase()
}

// Función para generar seriales únicos
export const generateSerial = (prefix = 'TOOL') => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${prefix}_${timestamp}_${random}`.toUpperCase()
}