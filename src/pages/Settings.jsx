import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAlerts } from '../hooks/useAlerts'
import { supabase } from '../config/supabase'

const Settings = () => {
  const { user, userRole, isSuperAdmin } = useAuth()
  const { showNotification } = useAlerts()
  const [settings, setSettings] = useState({
    notifications: {
      email_alerts: true,
      browser_notifications: true,
      daily_reports: false,
      maintenance_alerts: true
    },
    preferences: {
      theme: 'light',
      language: 'es',
      items_per_page: 10,
      auto_refresh: true
    },
    system: {
      backup_frequency: 'daily',
      retention_days: 30,
      log_level: 'info'
    }
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('notifications')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // En una implementación real, cargarías las configuraciones desde la base de datos
      // Por ahora usamos configuraciones por defecto
      console.log('Configuraciones cargadas')
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Aquí guardarías las configuraciones en la base de datos
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulación
      
      showNotification({
        type: 'success',
        title: 'Configuración guardada',
        message: 'Los cambios se han aplicado correctamente',
        duration: 3000
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar la configuración',
        duration: 5000
      })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
    { id: 'preferences', name: 'Preferencias', icon: '⚙️' },
    ...(isSuperAdmin() ? [{ id: 'system', name: 'Sistema', icon: '🖥️' }] : [])
  ]

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Configuración de Notificaciones
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-secondary-900">Alertas por Email</h4>
              <p className="text-sm text-secondary-500">Recibir notificaciones importantes por correo</p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('notifications', 'email_alerts', !settings.notifications.email_alerts)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.notifications.email_alerts ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notifications.email_alerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-secondary-900">Notificaciones del Navegador</h4>
              <p className="text-sm text-secondary-500">Mostrar notificaciones en tiempo real</p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('notifications', 'browser_notifications', !settings.notifications.browser_notifications)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.notifications.browser_notifications ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notifications.browser_notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-secondary-900">Reportes Diarios</h4>
              <p className="text-sm text-secondary-500">Recibir resumen diario de actividades</p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('notifications', 'daily_reports', !settings.notifications.daily_reports)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.notifications.daily_reports ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notifications.daily_reports ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-secondary-900">Alertas de Mantenimiento</h4>
              <p className="text-sm text-secondary-500">Notificar cuando las herramientas necesiten mantenimiento</p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('notifications', 'maintenance_alerts', !settings.notifications.maintenance_alerts)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.notifications.maintenance_alerts ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.notifications.maintenance_alerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Preferencias de Usuario
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700">
              Tema
            </label>
            <select
              value={settings.preferences.theme}
              onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
              className="mt-1 input-field"
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700">
              Idioma
            </label>
            <select
              value={settings.preferences.language}
              onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
              className="mt-1 input-field"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700">
              Elementos por página
            </label>
            <select
              value={settings.preferences.items_per_page}
              onChange={(e) => handleSettingChange('preferences', 'items_per_page', parseInt(e.target.value))}
              className="mt-1 input-field"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-secondary-900">Actualización Automática</h4>
              <p className="text-sm text-secondary-500">Refrescar datos automáticamente</p>
            </div>
            <button
              type="button"
              onClick={() => handleSettingChange('preferences', 'auto_refresh', !settings.preferences.auto_refresh)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                settings.preferences.auto_refresh ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.preferences.auto_refresh ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-secondary-900 mb-4">
          Configuración del Sistema
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700">
              Frecuencia de Respaldo
            </label>
            <select
              value={settings.system.backup_frequency}
              onChange={(e) => handleSettingChange('system', 'backup_frequency', e.target.value)}
              className="mt-1 input-field"
            >
              <option value="hourly">Cada hora</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700">
              Días de Retención
            </label>
            <select
              value={settings.system.retention_days}
              onChange={(e) => handleSettingChange('system', 'retention_days', parseInt(e.target.value))}
              className="mt-1 input-field"
            >
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={365}>1 año</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700">
              Nivel de Logs
            </label>
            <select
              value={settings.system.log_level}
              onChange={(e) => handleSettingChange('system', 'log_level', e.target.value)}
              className="mt-1 input-field"
            >
              <option value="error">Error</option>
              <option value="warn">Advertencia</option>
              <option value="info">Información</option>
              <option value="debug">Debug</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotificationsTab()
      case 'preferences':
        return renderPreferencesTab()
      case 'system':
        return renderSystemTab()
      default:
        return renderNotificationsTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Configuración
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Personaliza tu experiencia y gestiona las configuraciones del sistema
          </p>
        </div>
      </div>

      {/* Tabs y contenido */}
      <div className="bg-white shadow rounded-lg">
        {/* Tab headers */}
        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Footer con botón de guardar */}
        <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </div>
            ) : (
              'Guardar Configuración'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings