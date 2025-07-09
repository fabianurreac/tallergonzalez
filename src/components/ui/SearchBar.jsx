import { useState } from 'react'

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className = "",
  showClearButton = true,
  onClear,
  disabled = false 
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    onChange('')
    if (onClear) {
      onClear()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className={`h-5 w-5 transition-colors duration-200 ${
            isFocused ? 'text-primary-500' : 'text-secondary-400'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full pl-10 pr-12 py-2 border border-secondary-300 rounded-md 
          placeholder-secondary-400 focus:outline-none focus:ring-primary-500 
          focus:border-primary-500 sm:text-sm transition-colors duration-200
          ${disabled ? 'bg-secondary-50 cursor-not-allowed' : 'bg-white'}
          ${isFocused ? 'ring-1 ring-primary-500' : ''}
        `}
      />
      
      {showClearButton && value && !disabled && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={handleClear}
            className="text-secondary-400 hover:text-secondary-600 focus:outline-none focus:text-secondary-600 transition-colors duration-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      )}
      
      {/* Indicador de resultados */}
      {value && (
        <div className="absolute top-full left-0 mt-1 text-xs text-secondary-500">
          Buscando: "{value}"
        </div>
      )}
    </div>
  )
}

export default SearchBar