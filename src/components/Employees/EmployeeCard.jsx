import { useState } from 'react'
import QRCode from 'qrcode'

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  const [qrImageUrl, setQrImageUrl] = useState(null)
  const [showQRModal, setShowQRModal] = useState(false)

  const generateQRImage = async (qrData) => {
    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrImageUrl(url)
      setShowQRModal(true)
    } catch (error) {
      console.error('Error generating QR image:', error)
      alert('Error al generar código QR')
    }
  }

  const handlePrintQR = () => {
    if (qrImageUrl) {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Código QR - ${employee.nombre_completo}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
                text-align: center;
                background: white;
              }
              .qr-container {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                border: 2px solid #ddd;
                border-radius: 10px;
              }
              .qr-image {
                width: 250px;
                height: 250px;
                margin: 20px auto;
                display: block;
              }
              .employee-info {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>Código QR de Empleado</h2>
              <img src="${qrImageUrl}" alt="Código QR" class="qr-image" />
              <div class="employee-info">
                <h3>${employee.nombre_completo}</h3>
                <p><strong>ID:</strong> ${employee.identificacion}</p>
                <p><strong>Cargo:</strong> ${employee.cargo}</p>
                <p><strong>Teléfono:</strong> ${employee.telefono}</p>
              </div>
              <div class="no-print" style="margin-top: 30px;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; cursor: pointer;">
                  Imprimir
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                  Cerrar
                </button>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  const downloadQR = () => {
    if (qrImageUrl) {
      const link = document.createElement('a')
      link.download = `QR_${employee.nombre_completo.replace(/\s+/g, '_')}_${employee.identificacion}.png`
      link.href = qrImageUrl
      link.click()
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          {/* Header con avatar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-lg">
                  {employee.nombre_completo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-secondary-900">
                  {employee.nombre_completo}
                </h3>
                <p className="text-sm text-secondary-600">{employee.cargo}</p>
              </div>
            </div>
            
            {/* Dropdown de acciones */}
            <div className="relative group">
              <button className="p-2 rounded-full hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => onEdit(employee)}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    Editar empleado
                  </button>
                  <button
                    onClick={() => generateQRImage(employee.qr_code)}
                    className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    Ver código QR
                  </button>
                  <button
                    onClick={() => onDelete(employee)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Eliminar empleado
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Información del empleado */}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-6 0" />
              </svg>
              <span className="text-secondary-600">ID: {employee.identificacion}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-secondary-600">{employee.telefono}</span>
            </div>
            
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-secondary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-secondary-600">
                Creado: {new Date(employee.created_at).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>

          {/* Botón para ver QR */}
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <button
              onClick={() => generateQRImage(employee.qr_code)}
              className="w-full flex items-center justify-center px-4 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Ver Código QR
            </button>
          </div>
        </div>
      </div>

      {/* Modal del código QR */}
      {showQRModal && (
        <div className="fixed inset-0 bg-secondary-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-secondary-900">
                  Código QR - {employee.nombre_completo}
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 text-center">
              {qrImageUrl && (
                <img 
                  src={qrImageUrl} 
                  alt="Código QR del empleado"
                  className="w-64 h-64 mx-auto border-2 border-secondary-200 rounded-lg"
                />
              )}
              
              <div className="mt-4 space-y-2">
                <p className="text-sm text-secondary-600">
                  <strong>Empleado:</strong> {employee.nombre_completo}
                </p>
                <p className="text-sm text-secondary-600">
                  <strong>ID:</strong> {employee.identificacion}
                </p>
                <p className="text-sm text-secondary-600">
                  <strong>Cargo:</strong> {employee.cargo}
                </p>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={downloadQR}
                  className="flex-1 btn-secondary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar
                </button>
                <button
                  onClick={handlePrintQR}
                  className="flex-1 btn-primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EmployeeCard