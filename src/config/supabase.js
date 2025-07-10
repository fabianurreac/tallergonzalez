import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fzccxxncpdjblilzhpul.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6Y2N4eG5jcGRqYmxpbHpocHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NzU0NTQsImV4cCI6MjA2NzM1MTQ1NH0.Xrks8EaeP0hEMhTAuBu-k83yLpsJSSj-MAeWZBxcYJw'


// Para pruebas, usar estas credenciales temporales:
// URL: https://xyzcompany.supabase.co  
// ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emNvbXBhbnkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc1NzIwMCwiZXhwIjoyMDE0MzMzMjAwfQ.sample_key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Configuración de autenticación
export const authConfig = {
  redirectTo: `${window.location.origin}/dashboard`,
  appearance: {
    theme: 'light',
    variables: {
      default: {
        colors: {
          brand: '#dc2626',
          brandAccent: '#b91c1c',
        },
      },
    },
  },
}

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