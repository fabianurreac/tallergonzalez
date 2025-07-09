import { useEffect } from 'react'
import { useQRScanner } from '../../hooks/useQRScanner'

const QRScannerModal = ({ isOpen, onClose, onScanSuccess, title = "Escanear Código QR" }) => {
  const {
    isScanning,
    error,
    cameras,
    selectedCamera,
    startScanner,
    stopScanner,
    switchCamera,
    setError
  } = useQRScanner()

  useEffect(() => {
    if (isOpen) {
      // Iniciar escáner cuando se abre el modal
      const handleScanSuccess = (decodedText, decodedResult) => {
        onScanSuccess(decodedText, decodedResult)
        handleClose()
      }

      const handleScanError = (errorMessage) => {
        console.warn('Error de escaneo:', errorMessage)
      }

      startScanner(handleScanSuccess, handleScanError)
    } else {
      // Detener escáner cuando se cierra el modal
      stopScanner()
    }

    return () => {
      stopScanner()
    }
  }, [isOpen, selectedCamera])

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  const handleCameraChange = (cameraId) => {
    const handleScanSuccess = (decodedText, decodedResult) => {
      onScanSuccess(decodedText, decodedResult)
      handleClose()
    }

    const handleScanError = (errorMessage) => {
      console.warn('Error de escaneo:', errorMessage)
    }

    switchCamera(cameraId, handleScanSuccess, handleScanError)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <h3 className="text-lg font-medium text-secondary-900">
              {title}
            </h3>
            <button
              onClick={handleClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Selector de cámara */}
            {cameras.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Seleccionar Cámara:
                </label>
                <select
                  value={selectedCamera || ''}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {cameras.map((camera) => (
                    <option key={camera.id} value={camera.id}>
                      {camera.label || `Cámara ${camera.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Área del escáner */}
            <div className="mb-4">
              <div 
                id="qr-reader" 
                className="w-full h-64 bg-black rounded-lg flex items-center justify-center overflow-hidden"
              >
                {!isScanning && !error && (
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-sm opacity-75">Iniciando cámara...</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instrucciones */}
              {isScanning && !error && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Instrucciones</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Apunta la cámara hacia el código QR del empleado. El escaneo se realizará automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-4 border-t border-secondary-200 space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScannerModal