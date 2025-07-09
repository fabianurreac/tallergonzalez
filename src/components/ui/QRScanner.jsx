import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

const QRScanner = ({ isOpen, onClose, onScan, title = "Escáner QR", subtitle = "Enfoque el código QR para escanearlo" }) => {
  const scannerRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [hasCamera, setHasCamera] = useState(true)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [cameras, setCameras] = useState([])

  useEffect(() => {
    if (isOpen) {
      checkCameraPermissions()
    }

    return () => {
      stopScanning()
    }
  }, [isOpen])

  const checkCameraPermissions = async () => {
    try {
      setError('')
      
      // Primero solicitar permisos explícitamente
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Cámara trasera preferida
        } 
      })
      
      // Si llegamos aquí, tenemos permisos
      setPermissionGranted(true)
      
      // Detener el stream temporal
      stream.getTracks().forEach(track => track.stop())
      
      // Obtener lista de cámaras disponibles
      await getCameras()
      
    } catch (err) {
      console.error('Camera permission error:', err)
      setPermissionGranted(false)
      setHasCamera(false)
      
      if (err.name === 'NotAllowedError') {
        setError('Permisos de cámara denegados. Por favor, permita el acceso a la cámara y actualice la página.')
      } else if (err.name === 'NotFoundError') {
        setError('No se encontraron cámaras disponibles en este dispositivo.')
      } else if (err.name === 'NotSupportedError') {
        setError('El navegador no soporta el acceso a la cámara. Use HTTPS o un navegador compatible.')
      } else {
        setError('Error al acceder a la cámara. Verifique que esté conectada y funcionando.')
      }
    }
  }

  const getCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras()
      setCameras(devices)
      setHasCamera(devices.length > 0)
      
      if (devices.length === 0) {
        setError('No se encontraron cámaras disponibles')
      }
    } catch (err) {
      console.error('Error getting cameras:', err)
      setError('Error al obtener lista de cámaras')
    }
  }

  const startScanning = async () => {
    if (!permissionGranted || cameras.length === 0) {
      await checkCameraPermissions()
      return
    }

    try {
      setScanning(true)
      setError('')

      // Crear instancia del escáner
      const html5QrCode = new Html5Qrcode("qr-scanner")
      scannerRef.current = html5QrCode

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      // Usar la primera cámara disponible (o la trasera si está disponible)
      const cameraId = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment')
      )?.id || cameras[0]?.id

      if (!cameraId) {
        throw new Error('No se pudo seleccionar una cámara')
      }

      // Iniciar el escaneo
      await html5QrCode.start(
        cameraId,
        config,
        (decodedText, decodedResult) => {
          // Éxito al escanear
          console.log(`QR Code scanned: ${decodedText}`, decodedResult)
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Errores menores de escaneo - no mostrar
          // Solo logear para debug
          // console.log(`QR scan error: ${errorMessage}`)
        }
      )

    } catch (err) {
      console.error('Error starting QR scanner:', err)
      setScanning(false)
      
      if (err.message.includes('Permission')) {
        setError('Permisos de cámara requeridos. Haga clic en "Permitir" cuando se solicite.')
      } else if (err.message.includes('NotFoundError')) {
        setError('Cámara no encontrada. Verifique que esté conectada.')
      } else {
        setError(`Error al inicializar el escáner: ${err.message}`)
      }
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        if (state === Html5QrcodeScannerState.SCANNING) {
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear()
            scannerRef.current = null
          }).catch(err => {
            console.warn('Error stopping scanner:', err)
            scannerRef.current = null
          })
        } else {
          scannerRef.current.clear()
          scannerRef.current = null
        }
      } catch (error) {
        console.warn('Error checking scanner state:', error)
        scannerRef.current = null
      }
    }
    setScanning(false)
  }

  const handleClose = () => {
    stopScanning()
    onClose()
  }

  const requestCameraPermission = async () => {
    try {
      setError('')
      await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' 
        } 
      })
      setPermissionGranted(true)
      await getCameras()
    } catch (error) {
      console.error('Permission request failed:', error)
      setError('Permisos de cámara requeridos. Verifique la configuración del navegador.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-secondary-900">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-secondary-500">
                  {subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="bg-white rounded-md text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                    {!permissionGranted && (
                      <button
                        onClick={requestCameraPermission}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Solicitar Permisos
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Información HTTPS */}
            {window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> El escáner QR requiere HTTPS para funcionar correctamente en producción.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scanner container */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-md">
                {scanning && !error && (
                  <div className="mb-4 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-800">
                      <svg className="animate-pulse w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v1.5h16V5a2 2 0 00-2-2H4zm16 4.5H0V15a2 2 0 002 2h16a2 2 0 002-2V7.5zM5.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                      </svg>
                      Cámara activa - Enfoque el código QR
                    </div>
                  </div>
                )}

                {/* QR Scanner element */}
                <div 
                  id="qr-scanner" 
                  className="w-full mx-auto"
                  style={{ 
                    minHeight: permissionGranted && hasCamera && !error ? '300px' : 'auto'
                  }}
                />

                {/* Botón para iniciar escáner */}
                {!scanning && permissionGranted && hasCamera && !error && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-16 w-16 text-secondary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <button
                      onClick={startScanning}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Iniciar Escáner
                    </button>
                  </div>
                )}

                {/* Estado inicial - solicitar permisos */}
                {!permissionGranted && !error && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-16 w-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <h4 className="text-lg font-medium text-secondary-900 mb-2">Permisos de Cámara Requeridos</h4>
                    <p className="text-sm text-secondary-500 mb-4">
                      Para escanear códigos QR necesitamos acceso a su cámara
                    </p>
                    <button
                      onClick={requestCameraPermission}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Permitir Acceso a Cámara
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            {scanning && !error && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Instrucciones:</h4>
                    <div className="mt-1 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Mantenga el código QR dentro del marco cuadrado</li>
                        <li>Asegúrese de tener buena iluminación</li>
                        <li>El escaneo se realizará automáticamente</li>
                        <li>Mantenga la cámara estable y enfocada</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-secondary-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleClose}
              className="w-full inline-flex justify-center rounded-md border border-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
            {scanning && (
              <button
                type="button"
                onClick={stopScanning}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm"
              >
                Detener Escáner
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner