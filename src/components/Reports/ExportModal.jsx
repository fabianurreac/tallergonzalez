import { useState } from 'react'
import { handleExport } from '../../utils/exportUtils'

const ExportModal = ({ isOpen, onClose, reportData }) => {
  const [selectedFormat, setSelectedFormat] = useState('json')
  const [customFilename, setCustomFilename] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportResult, setExportResult] = useState(null)

  const exportFormats = [
    {
      id: 'json',
      name: 'JSON',
      description: 'Formato de datos estructurado',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Hoja de cálculo compatible',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Múltiples hojas de cálculo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'text',
      name: 'Texto',
      description: 'Reporte legible en texto plano',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Documento imprimible',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  const handleExportClick = async () => {
    try {
      setExporting(true)
      setExportResult(null)

      const filename = customFilename.trim() || 'reporte-inventario'
      const result = await handleExport(selectedFormat, reportData, filename)
      
      setExportResult(result)
      
      if (result.success) {
        setTimeout(() => {
          onClose()
          setExportResult(null)
          setCustomFilename('')
        }, 2000)
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: error.message
      })
    } finally {
      setExporting(false)
    }
  }

  const resetModal = () => {
    setSelectedFormat('json')
    setCustomFilename('')
    setExportResult(null)
    setExporting(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={resetModal}>
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900">
                  Exportar Reporte
                </h3>
                <button
                  type="button"
                  onClick={resetModal}
                  className="text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {/* Selección de formato */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Selecciona el formato de exportación
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exportFormats.map((format) => (
                    <label
                      key={format.id}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                        selectedFormat === format.id
                          ? 'bg-primary-50 border-primary-200 text-primary-900'
                          : 'bg-white border-secondary-300 text-secondary-900 hover:bg-secondary-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.id}
                        checked={selectedFormat === format.id}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 ${
                          selectedFormat === format.id ? 'text-primary-600' : 'text-secondary-400'
                        }`}>
                          {format.icon}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium">
                            {format.name}
                          </div>
                          <div className="text-xs text-secondary-500">
                            {format.description}
                          </div>
                        </div>
                      </div>
                      {selectedFormat === format.id && (
                        <div className="absolute -inset-px rounded-lg border-2 border-primary-500 pointer-events-none" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Nombre del archivo */}
              <div className="mb-6">
                <label htmlFor="filename" className="block text-sm font-medium text-secondary-700 mb-2">
                  Nombre del archivo (opcional)
                </label>
                <input
                  type="text"
                  id="filename"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="reporte-inventario"
                  className="input-field"
                />
                <p className="mt-2 text-xs text-secondary-500">
                  Se agregará automáticamente la fecha y extensión correspondiente
                </p>
              </div>

              {/* Resultado de exportación */}
              {exportResult && (
                <div className={`mb-4 p-4 rounded-md ${
                  exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      {exportResult.success ? (
                        <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        exportResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {exportResult.success ? '¡Éxito!' : 'Error'}
                      </p>
                      <p className={`text-sm ${
                        exportResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {exportResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-secondary-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetModal}
                className="btn-secondary"
                disabled={exporting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExportClick}
                disabled={exporting || !reportData}
                className="btn-primary"
              >
                {exporting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Exportando...
                  </div>
                ) : (
                  'Exportar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportModal