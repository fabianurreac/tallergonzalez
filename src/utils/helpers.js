/**
 * Funciones de utilidad para la aplicación
 */

// Formateo de fechas
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'No disponible'
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  
  return new Date(dateString).toLocaleDateString('es-ES', defaultOptions)
}

export const formatDateTime = (dateString) => {
  if (!dateString) return 'No disponible'
  
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'No disponible'
  
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60
  }
  
  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      return `hace ${interval} ${unit}${interval > 1 ? (unit === 'mes' ? 'es' : 's') : ''}`
    }
  }
  
  return 'hace unos segundos'
}

// Validaciones
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[\+]?[1-9][\d]{0,15}$/
  return re.test(phone.replace(/\s/g, ''))
}

export const validateRequired = (value) => {
  return value && value.trim().length > 0
}

// Formateo de texto
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Formateo de números
export const formatCurrency = (amount, currency = 'COP') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatNumber = (number) => {
  return new Intl.NumberFormat('es-ES').format(number)
}

// Estados y condiciones
export const getStatusBadgeClass = (status) => {
  const statusClasses = {
    disponible: 'badge-success',
    reservada: 'badge-warning',
    mantenimiento: 'badge-info',
    fuera_servicio: 'badge-danger',
    bueno: 'badge-success',
    malo: 'badge-danger',
    deterioro: 'badge-warning'
  }
  
  return statusClasses[status] || 'badge-info'
}

export const getStatusText = (status) => {
  const statusTexts = {
    disponible: 'Disponible',
    reservada: 'Reservada',
    mantenimiento: 'En Mantenimiento',
    fuera_servicio: 'Fuera de Servicio',
    bueno: 'Bueno',
    malo: 'Malo',
    deterioro: 'En Deterioro'
  }
  
  return statusTexts[status] || status
}

// Manejo de archivos
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generadores
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

export const generateQRText = (employeeId, employeeName) => {
  return `EMP_${employeeId}_${slugify(employeeName)}_${Date.now()}`
}

// Validación de roles
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    superadmin: 3,
    almacenista: 2,
    usuario: 1
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// Utilidades de array
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key]
    if (!result[group]) {
      result[group] = []
    }
    result[group].push(item)
    return result
  }, {})
}

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true
      
      const itemValue = item[key]
      if (typeof itemValue === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      
      return itemValue === value
    })
  })
}

// Utilidades de Local Storage
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('Error saving to localStorage:', error)
    return false
  }
}

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Error removing from localStorage:', error)
    return false
  }
}

// Utilidades de URL y navegación
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value)
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  
  for (const [key, value] of params.entries()) {
    result[key] = value
  }
  
  return result
}

// Utilidades de colores para gráficas
export const getChartColors = (count) => {
  const colors = [
    '#dc2626', // red-600
    '#ea580c', // orange-600
    '#d97706', // amber-600
    '#ca8a04', // yellow-600
    '#65a30d', // lime-600
    '#16a34a', // green-600
    '#059669', // emerald-600
    '#0d9488', // teal-600
    '#0891b2', // cyan-600
    '#0284c7', // sky-600
    '#2563eb', // blue-600
    '#4f46e5', // indigo-600
    '#7c3aed', // violet-600
    '#9333ea', // purple-600
    '#c026d3', // fuchsia-600
    '#db2777', // pink-600
    '#e11d48'  // rose-600
  ]
  
  return colors.slice(0, count)
}

// Utilidades de exportación
export const downloadCSV = (data, filename) => {
  const csvContent = convertToCSV(data)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const convertToCSV = (data) => {
  if (!data || !data.length) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      return typeof value === 'string' ? `"${value}"` : value
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
}

export const downloadJSON = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Utilidades de copiar al portapapeles
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      document.body.removeChild(textArea)
      console.error('Error copying to clipboard:', fallbackError)
      return false
    }
  }
}

// Utilidades de debounce y throttle
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Utilidades de imagen
export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      const { width, height } = img
      
      // Calcular nuevas dimensiones manteniendo proporción
      let newWidth = width
      let newHeight = height
      
      if (width > height) {
        if (width > maxWidth) {
          newHeight = (height * maxWidth) / width
          newWidth = maxWidth
        }
      } else {
        if (height > maxHeight) {
          newWidth = (width * maxHeight) / height
          newHeight = maxHeight
        }
      }
      
      canvas.width = newWidth
      canvas.height = newHeight
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Convertir a blob
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Utilidades de formularios
export const getFormData = (form) => {
  const formData = new FormData(form)
  const data = {}
  
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      // Si ya existe, convertir a array
      if (Array.isArray(data[key])) {
        data[key].push(value)
      } else {
        data[key] = [data[key], value]
      }
    } else {
      data[key] = value
    }
  }
  
  return data
}

export const resetForm = (form) => {
  if (form && typeof form.reset === 'function') {
    form.reset()
  }
}

// Utilidades de notificaciones del navegador
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones')
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  
  return false
}

export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options
    })
  }
  return null
}

// Utilidades de error handling
export const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.message) {
    return error.message
  }
  
  if (error.error_description) {
    return error.error_description
  }
  
  return 'Ocurrió un error inesperado'
}

// Utilidades de loading states
export const createLoadingState = () => {
  return {
    loading: false,
    error: null,
    data: null
  }
}

export const setLoading = (state, loading) => {
  return {
    ...state,
    loading,
    error: loading ? null : state.error
  }
}

export const setError = (state, error) => {
  return {
    ...state,
    loading: false,
    error
  }
}

export const setData = (state, data) => {
  return {
    ...state,
    loading: false,
    error: null,
    data
  }
}

// Constantes útiles
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^[0-9]+$/,
  alphaWithSpaces: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

export const DATE_FORMATS = {
  SHORT: 'short',
  LONG: 'long',
  NUMERIC: 'numeric',
  FULL: 'full'
}