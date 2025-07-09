import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState(null)
  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState(null)
  const scannerRef = useRef(null)
  const html5QrcodeRef = useRef(null)

  // Obtener cámaras disponibles
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras()
        setCameras(devices)
        
        // Seleccionar cámara trasera por defecto si está disponible
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('trasera') ||
          device.label.toLowerCase().includes('rear')
        )
        
        setSelectedCamera(backCamera ? backCamera.id : devices[0]?.id)
      } catch (err) {
        console.error('Error obteniendo cámaras:', err)
        setError('No se pudieron obtener las cámaras disponibles')
      }
    }

    getCameras()
  }, [])

  // Inicializar escáner
  const startScanner = async (onScanSuccess, onScanError) => {
    if (!selectedCamera) {
      setError('No hay cámara seleccionada')
      return false
    }

    try {
      setError(null)
      setIsScanning(true)

      // Crear instancia del escáner
      html5QrcodeRef.current = new Html5Qrcode('qr-reader')

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false
      }

      await html5QrcodeRef.current.start(
        selectedCamera,
        config,
        (decodedText, decodedResult) => {
          console.log('QR Code escaneado:', decodedText)
          onScanSuccess && onScanSuccess(decodedText, decodedResult)
        },
        (errorMessage) => {
          // Ignorar errores de escaneo continuo
          if (!errorMessage.includes('NotFoundException')) {
            console.warn('Error de escaneo:', errorMessage)
            onScanError && onScanError(errorMessage)
          }
        }
      )

      return true
    } catch (err) {
      console.error('Error iniciando escáner:', err)
      setError('Error al inicializar la cámara: ' + err.message)
      setIsScanning(false)
      return false
    }
  }

  // Detener escáner
  const stopScanner = async () => {
    try {
      if (html5QrcodeRef.current && isScanning) {
        await html5QrcodeRef.current.stop()
        html5QrcodeRef.current.clear()
        html5QrcodeRef.current = null
      }
    } catch (err) {
      console.error('Error deteniendo escáner:', err)
    } finally {
      setIsScanning(false)
      setError(null)
    }
  }

  // Cambiar cámara
  const switchCamera = async (cameraId, onScanSuccess, onScanError) => {
    if (isScanning) {
      await stopScanner()
    }
    
    setSelectedCamera(cameraId)
    
    // Pequeño delay para asegurar que el escáner anterior se detuvo
    setTimeout(() => {
      startScanner(onScanSuccess, onScanError)
    }, 100)
  }

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return {
    isScanning,
    error,
    cameras,
    selectedCamera,
    startScanner,
    stopScanner,
    switchCamera,
    setError
  }
}