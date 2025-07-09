import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export const useQRScanner = (onScanSuccess, onScanError) => {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const html5QrcodeScannerRef = useRef(null)

  const startScanning = async () => {
    try {
      setError(null)
      setScanning(true)

      // Configuración del escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [Html5QrcodeScanner.SCAN_TYPE_CAMERA]
      }

      // Crear instancia del escáner
      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      )

      // Callbacks
      const onScanSuccessCallback = (decodedText, decodedResult) => {
        console.log('QR Code detected:', decodedText)
        onScanSuccess(decodedText, decodedResult)
        stopScanning()
      }

      const onScanErrorCallback = (error) => {
        // Solo mostrar errores críticos, ignorar errores de "no QR found"
        if (!error.includes('NotFoundException')) {
          console.warn('QR Code scan error:', error)
          onScanError && onScanError(error)
        }
      }

      // Iniciar el escáner
      html5QrcodeScannerRef.current.render(
        onScanSuccessCallback,
        onScanErrorCallback
      )

    } catch (err) {
      console.error('Error starting QR scanner:', err)
      setError('Error al iniciar el escáner: ' + err.message)
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    try {
      if (html5QrcodeScannerRef.current) {
        await html5QrcodeScannerRef.current.clear()
        html5QrcodeScannerRef.current = null
      }
      setScanning(false)
      setError(null)
    } catch (err) {
      console.error('Error stopping QR scanner:', err)
      setError('Error al detener el escáner')
      setScanning(false)
    }
  }

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  return {
    scanning,
    error,
    startScanning,
    stopScanning,
    scannerRef
  }
}