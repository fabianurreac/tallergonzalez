import { useRef } from 'react'

const QRModal = ({ employee, isOpen, onClose }) => {
  const printRef = useRef()

  if (!isOpen || !employee) return null

  const handlePrint = () => {
    const printContent = printRef.current
    const originalContent = document.body.innerHTML

    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload() // Recargar para restaurar el estado original
  }

  const handleDownload = () => {
    if (!employee.qr_code) return

    // Crear un link temporal para descargar
    const link = document.createElement('a')
    link.href = employee.qr_code
    link.download = `qr_${employee.identificacion}_${employee.nombre_completo.replace(/\s+/g, '_')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyToClipboard = async () => {
    try {
      // Convertir base64 a blob
      const response = await fetch(employee.qr_code)
      const blob = await response.blob()
      
      // Copiar al portapapeles
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      
      alert('Código QR copiado al portapapeles')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert('Error al copiar al portapapeles')
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-secondary-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={onClose}>
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-secondary-200">
              <h3 className="text-lg font-medium text-secondary-900">
                Código QR - {employee.nombre_completo}
              </h3>
              <button
                onClick={onClose}
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del QR */}
            <div ref={printRef} className="py-6">
              <div className="text-center">
                {/* Información del empleado */}
                <div className="mb-6">
                  <h4 className="text-xl font-semibold text-secondary-900 mb-2">
                    {employee.nombre_completo}
                  </h4>
                  <div className="space-y-1 text-sm text-secondary-600">
                    <p><span className="font-medium">ID:</span> {employee.identificacion}</p>
                    <p><span className="font-medium">Cargo:</span> {employee.cargo}</p>
                    {employee.telefono && (
                      <p><span className="font-medium">Teléfono:</span> {employee.telefono}</p>
                    )}
                  </div>
                </div>

                {/* Código QR */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border-2 border-secondary-200">
                    <img 
                      src={employee.qr_code} 
                      alt={`Código QR de ${employee.nombre_completo}`}
                      className="w-48 h-48 mx-auto"
                    />
                    <p className="mt-3 text-xs text-secondary-500 text-center">
                      Escanea este código para reservar herramientas
                    </p>
                  </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Instrucciones de uso
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Use este código QR para identificarse al reservar herramientas</li>
                          <li>Presente el código al almacenista o use el escáner del sistema</li>
                          <li>Mantenga el código legible y protegido</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-secondary-200">
              <button
                onClick={handlePrint}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              
              <button
                onClick={handleDownload}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar
              </button>
              
              <button
                onClick={handleCopyToClipboard}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default QRModal