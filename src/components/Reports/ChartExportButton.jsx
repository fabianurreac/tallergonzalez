import { useState } from 'react'
import { exportChartToImage } from '../../utils/exportUtils'

const ChartExportButton = ({
  chartContainerId,
  chartTitle = 'Gráfico',
  size = 'sm',
  position = 'top-right',
  className = ''
}) => {
  const [exporting, setExporting] = useState(false)
  const [showFormats, setShowFormats] = useState(false)

  const handleExport = async (format = 'png') => {
    setExporting(true)
    setShowFormats(false)
    
    try {
      const result = await exportChartToImage(chartContainerId, chartTitle, format)
      
      if (result.success) {
        // Mostrar notificación sutil
        console.log(`Gráfico exportado: ${result.fileName}`)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('Error al exportar gráfico:', error)
      alert(`Error al exportar: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  }

  const positionClasses = {
    'top-right': 'absolute top-2 right-2',
    'top-left': 'absolute top-2 left-2',
    'bottom-right': 'absolute bottom-2 right-2',
    'bottom-left': 'absolute bottom-2 left-2',
    'inline': 'relative'
  }

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <div className="relative">
        {/* Botón principal */}
        <button
          onClick={() => showFormats ? setShowFormats(false) : handleExport('png')}
          onContextMenu={(e) => {
            e.preventDefault()
            setShowFormats(!showFormats)
          }}
          disabled={exporting}
          className={`
            ${sizeClasses[size]}
            bg-white hover:bg-secondary-50 text-secondary-600 hover:text-secondary-800
            border border-secondary-200 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            transition-all duration-200 hover:shadow-md
            disabled:opacity-50 disabled:cursor-not-allowed
            group relative z-10
          `}
          title={`Exportar ${chartTitle} (click derecho para más opciones)`}
        >
          {exporting ? (
            <svg className="animate-spin text-secondary-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="text-secondary-500 group-hover:text-secondary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>

        {/* Menú de formatos */}
        {showFormats && !exporting && (
          <>
            {/* Overlay para cerrar */}
            <div 
              className="fixed inset-0 z-5"
              onClick={() => setShowFormats(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full mt-1 right-0 bg-white border border-secondary-200 rounded-md shadow-lg z-20 min-w-max">
              <div className="py-1">
                <div className="px-3 py-2 text-xs font-medium text-secondary-500 border-b border-secondary-200">
                  Exportar como:
                </div>
                
                <button
                  onClick={() => handleExport('png')}
                  className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  PNG (Recomendado)
                </button>
                
                <button
                  onClick={() => handleExport('jpg')}
                  className="w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  JPG (Menor tamaño)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChartExportButton