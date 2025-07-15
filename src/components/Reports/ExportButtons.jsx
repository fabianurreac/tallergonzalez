import { useState } from 'react'
import { 
  exportReportToPDF, 
  exportReportToExcel, 
  exportReportToImage,
  exportReportToJSON 
} from '../../utils/exportUtils'

const ExportButtons = ({ reportData, containerId = 'reports-container' }) => {
  const [exporting, setExporting] = useState({
    pdf: false,
    excel: false,
    image: false,
    json: false
  })

  const setExportingState = (type, value) => {
    setExporting(prev => ({ ...prev, [type]: value }))
  }

  const handleExportPDF = async () => {
    try {
      setExportingState('pdf', true)
      
      const result = await exportReportToPDF(reportData, 'Reporte de Inventario')
      
      if (result.success) {
        // Mostrar notificación de éxito (opcional)
        console.log(`PDF exportado exitosamente: ${result.fileName}`)
      } else {
        alert(`Error al exportar PDF: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error inesperado al exportar PDF')
    } finally {
      setExportingState('pdf', false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setExportingState('excel', true)
      
      const result = exportReportToExcel(reportData, 'Reporte de Inventario')
      
      if (result.success) {
        console.log(`Excel exportado exitosamente: ${result.fileName}`)
      } else {
        alert(`Error al exportar Excel: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Error inesperado al exportar Excel')
    } finally {
      setExportingState('excel', false)
    }
  }

  const handleExportImage = async () => {
    try {
      setExportingState('image', true)
      
      const result = await exportReportToImage(containerId, 'Reporte de Inventario', 'png')
      
      if (result.success) {
        console.log(`Imagen exportada exitosamente: ${result.fileName}`)
      } else {
        alert(`Error al exportar imagen: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Error exporting image:', error)
      alert('Error inesperado al exportar imagen')
    } finally {
      setExportingState('image', false)
    }
  }

  const handleExportJSON = async () => {
    try {
      setExportingState('json', true)
      
      const result = exportReportToJSON(reportData, 'Reporte de Inventario')
      
      if (result.success) {
        console.log(`JSON exportado exitosamente: ${result.fileName}`)
      } else {
        alert(`Error al exportar JSON: ${result.error}`)
      }
      
    } catch (error) {
      console.error('Error exporting JSON:', error)
      alert('Error inesperado al exportar JSON')
    } finally {
      setExportingState('json', false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Botón PDF */}
      <button
        onClick={handleExportPDF}
        disabled={exporting.pdf}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          exporting.pdf 
            ? 'bg-red-400 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
        } transition-colors duration-200`}
      >
        {exporting.pdf ? (
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
        {exporting.pdf ? 'Generando PDF...' : 'Exportar PDF'}
      </button>

      {/* Botón Excel */}
      <button
        onClick={handleExportExcel}
        disabled={exporting.excel}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          exporting.excel 
            ? 'bg-green-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        } transition-colors duration-200`}
      >
        {exporting.excel ? (
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        {exporting.excel ? 'Generando Excel...' : 'Exportar Excel'}
      </button>

      {/* Botón Imagen */}
      <button
        onClick={handleExportImage}
        disabled={exporting.image}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
          exporting.image 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        } transition-colors duration-200`}
      >
        {exporting.image ? (
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
        {exporting.image ? 'Capturando...' : 'Exportar Imagen'}
      </button>

      {/* Botón JSON (opcional - para datos en bruto) */}
      <button
        onClick={handleExportJSON}
        disabled={exporting.json}
        className={`inline-flex items-center px-3 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
          exporting.json ? 'opacity-50 cursor-not-allowed' : ''
        } transition-colors duration-200`}
      >
        {exporting.json ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-secondary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )}
        {exporting.json ? 'Exportando...' : 'JSON'}
      </button>
    </div>
  )
}

export default ExportButtons