import { TOOL_CATEGORIES } from '../../config/supabase'

const CategoryFilter = ({ value, onChange, className = "" }) => {
  const categories = [
    { value: 'all', label: 'Todas las categorías', count: null },
    ...TOOL_CATEGORIES.map(category => ({
      value: category,
      label: category,
      count: null
    }))
  ]

  const getCategoryIcon = (category) => {
    const icons = {
      'all': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      'Limpieza': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      'Eléctrica': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      'Herramientas y equipos': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'Análisis': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'Protección': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      'Embellecimiento': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v1.586a1 1 0 00.293.707l5.414 5.414a1 1 0 001.414 0l3.586-3.586a1 1 0 000-1.414L16.293 6.293a1 1 0 00-.707-.293H15V5a2 2 0 00-2-2H9a2 2 0 00-2 2v12a4 4 0 01-4 4z" />
        </svg>
      ),
      'Latonería y pintura': (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    }

    return icons[category] || icons['all']
  }

  const getCategoryColor = (category, isSelected) => {
    if (isSelected) {
      return 'bg-primary-100 text-primary-700 border-primary-300'
    }

    const colors = {
      'all': 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50',
      'Limpieza': 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
      'Eléctrica': 'bg-white text-yellow-700 border-yellow-200 hover:bg-yellow-50',
      'Herramientas y equipos': 'bg-white text-green-700 border-green-200 hover:bg-green-50',
      'Análisis': 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50',
      'Protección': 'bg-white text-red-700 border-red-200 hover:bg-red-50',
      'Embellecimiento': 'bg-white text-pink-700 border-pink-200 hover:bg-pink-50',
      'Latonería y pintura': 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
    }

    return colors[category] || colors['all']
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Selector dropdown (para móvil) */}
      <div className="md:hidden">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Botones de filtro (para desktop) */}
      <div className="hidden md:flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = value === category.value
          return (
            <button
              key={category.value}
              onClick={() => onChange(category.value)}
              className={`
                inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md
                transition-colors duration-200 focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-primary-500
                ${getCategoryColor(category.value, isSelected)}
              `}
            >
              {getCategoryIcon(category.value)}
              <span className="ml-2">{category.label}</span>
              {category.count !== null && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  isSelected 
                    ? 'bg-primary-200 text-primary-800' 
                    : 'bg-secondary-200 text-secondary-600'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Indicador de filtro activo */}
      {value !== 'all' && (
        <div className="flex items-center text-sm text-secondary-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filtrando por: <span className="font-medium ml-1">{value}</span>
          <button
            onClick={() => onChange('all')}
            className="ml-2 text-primary-600 hover:text-primary-800 underline"
          >
            Quitar filtro
          </button>
        </div>
      )}
    </div>
  )
}

export default CategoryFilter