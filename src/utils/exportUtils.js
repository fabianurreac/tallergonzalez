import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { format } from 'date-fns' // ✅ CORREGIDO - solo format
import { es } from 'date-fns/locale' // ✅ CORREGIDO - es desde locale

// Configuración de jsPDF para español
const configPDF = {
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
}

// Función principal para exportar reportes completos a PDF
export const exportReportToPDF = async (reportData, title = 'Reporte de Inventario') => {
  try {
    const doc = new jsPDF(configPDF)
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20

    // Logo y header
    addPDFHeader(doc, title, yPosition)
    yPosition = 60

    // Estadísticas generales
    if (reportData.generalStats) {
      yPosition = addGeneralStats(doc, reportData.generalStats, yPosition)
    }

    // Top 10 Herramientas
    if (reportData.topTools && reportData.topTools.length > 0) {
      yPosition = addTopToolsTable(doc, reportData.topTools, yPosition, pageHeight)
    }

    // Top 10 Empleados
    if (reportData.topEmployees && reportData.topEmployees.length > 0) {
      yPosition = addTopEmployeesTable(doc, reportData.topEmployees, yPosition, pageHeight)
    }

    // Distribución por categorías
    if (reportData.toolsByCategory && reportData.toolsByCategory.length > 0) {
      yPosition = addCategoryDistribution(doc, reportData.toolsByCategory, yPosition, pageHeight)
    }

    // Estado y condición de herramientas
    if (reportData.toolsStatus && reportData.toolsCondition) {
      yPosition = addToolStatusAndCondition(doc, reportData.toolsStatus, reportData.toolsCondition, yPosition, pageHeight)
    }

    // Footer
    addPDFFooter(doc, pageHeight)

    // Guardar
    const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
    doc.save(fileName)
    
    return { success: true, fileName }
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    return { success: false, error: error.message }
  }
}

// Función para exportar a Excel
export const exportReportToExcel = (reportData, title = 'Reporte de Inventario') => {
  try {
    const wb = XLSX.utils.book_new()

    // Hoja 1: Resumen General
    if (reportData.generalStats) {
      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total de Herramientas', reportData.generalStats.totalTools || 0],
        ['Total de Empleados', reportData.generalStats.totalEmployees || 0],
        ['Total de Reservas', reportData.generalStats.totalReservations || 0],
        ['Reservas Activas', reportData.generalStats.activeReservations || 0],
        ['Alertas Pendientes', reportData.generalStats.alertsCount || 0]
      ]
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen General')
    }

    // Hoja 2: Top Herramientas
    if (reportData.topTools && reportData.topTools.length > 0) {
      const toolsData = [
        ['Posición', 'Herramienta', 'Categoría', 'Total Reservas', 'Calificación Promedio'],
        ...reportData.topTools.map((tool, index) => [
          index + 1,
          tool.nombre || '-',
          tool.categoria || '-',
          tool.total_reservas || 0,
          tool.calificacion_promedio ? parseFloat(tool.calificacion_promedio).toFixed(1) : '-'
        ])
      ]
      const toolsWs = XLSX.utils.aoa_to_sheet(toolsData)
      XLSX.utils.book_append_sheet(wb, toolsWs, 'Top Herramientas')
    }

    // Hoja 3: Top Empleados
    if (reportData.topEmployees && reportData.topEmployees.length > 0) {
      const employeesData = [
        ['Posición', 'Empleado', 'Cargo', 'Total Reservas', 'Calificación Promedio'],
        ...reportData.topEmployees.map((emp, index) => [
          index + 1,
          emp.nombre_completo || '-',
          emp.cargo || '-',
          emp.total_reservas || 0,
          emp.calificacion_promedio ? parseFloat(emp.calificacion_promedio).toFixed(1) : '-'
        ])
      ]
      const employeesWs = XLSX.utils.aoa_to_sheet(employeesData)
      XLSX.utils.book_append_sheet(wb, employeesWs, 'Top Empleados')
    }

    // Hoja 4: Distribución por Categorías
    if (reportData.toolsByCategory && reportData.toolsByCategory.length > 0) {
      const categoriesData = [
        ['Categoría', 'Cantidad de Herramientas', 'Porcentaje'],
        ...reportData.toolsByCategory.map(cat => {
          const total = reportData.toolsByCategory.reduce((sum, c) => sum + (c.count || 0), 0)
          const percentage = total > 0 ? ((cat.count || 0) / total * 100).toFixed(1) : '0.0'
          return [
            cat.categoria || '-',
            cat.count || 0,
            `${percentage}%`
          ]
        })
      ]
      const categoriesWs = XLSX.utils.aoa_to_sheet(categoriesData)
      XLSX.utils.book_append_sheet(wb, categoriesWs, 'Por Categorías')
    }

    // Hoja 5: Estado de Herramientas
    if (reportData.toolsStatus && reportData.toolsStatus.length > 0) {
      const statusData = [
        ['Estado', 'Cantidad', 'Porcentaje'],
        ...reportData.toolsStatus.map(status => {
          const total = reportData.toolsStatus.reduce((sum, s) => sum + (s.count || 0), 0)
          const percentage = total > 0 ? ((status.count || 0) / total * 100).toFixed(1) : '0.0'
          return [
            status.estado || '-',
            status.count || 0,
            `${percentage}%`
          ]
        })
      ]
      const statusWs = XLSX.utils.aoa_to_sheet(statusData)
      XLSX.utils.book_append_sheet(wb, statusWs, 'Estado Herramientas')
    }

    // Hoja 6: Condición de Herramientas
    if (reportData.toolsCondition && reportData.toolsCondition.length > 0) {
      const conditionData = [
        ['Condición', 'Cantidad', 'Porcentaje'],
        ...reportData.toolsCondition.map(condition => {
          const total = reportData.toolsCondition.reduce((sum, c) => sum + (c.count || 0), 0)
          const percentage = total > 0 ? ((condition.count || 0) / total * 100).toFixed(1) : '0.0'
          return [
            condition.condicion || '-',
            condition.count || 0,
            `${percentage}%`
          ]
        })
      ]
      const conditionWs = XLSX.utils.aoa_to_sheet(conditionData)
      XLSX.utils.book_append_sheet(wb, conditionWs, 'Condición Herramientas')
    }

    // Hoja 7: Tendencias Mensuales
    if (reportData.reservationsByMonth && reportData.reservationsByMonth.length > 0) {
      const monthlyData = [
        ['Mes', 'Cantidad de Reservas'],
        ...reportData.reservationsByMonth.map(month => [
          month.month || '-',
          month.count || 0
        ])
      ]
      const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyData)
      XLSX.utils.book_append_sheet(wb, monthlyWs, 'Tendencias Mensuales')
    }

    // Hoja 8: Información del Reporte
    const infoData = [
      ['Campo', 'Valor'],
      ['Título del Reporte', title],
      ['Fecha de Generación', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })],
      ['Sistema', 'Gestión de Inventario v1.0.0'],
      ['Empresa', 'Taller Automotriz'],
      ['Total de Hojas', wb.SheetNames.length.toString()]
    ]
    const infoWs = XLSX.utils.aoa_to_sheet(infoData)
    XLSX.utils.book_append_sheet(wb, infoWs, 'Información')

    // Guardar archivo
    const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    return { success: true, fileName }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return { success: false, error: error.message }
  }
}

// Función para exportar contenedor completo como imagen
export const exportReportToImage = async (containerId = 'reports-container', title = 'Reporte de Inventario', imageFormat = 'png') => {
  try {
    const element = document.getElementById(containerId)
    if (!element) {
      // Si no encuentra el contenedor específico, tomar todo el contenido principal
      const fallbackElement = document.querySelector('[data-reports-content]') || 
                             document.querySelector('.space-y-6') ||
                             document.querySelector('main > div')
      
      if (!fallbackElement) {
        throw new Error('No se encontró el contenedor para exportar. Asegúrate de tener un elemento con ID "reports-container"')
      }
      
      return await captureElementAsImage(fallbackElement, title, imageFormat)
    }
    
    return await captureElementAsImage(element, title, imageFormat)
  } catch (error) {
    console.error('Error exporting to image:', error)
    return { success: false, error: error.message }
  }
}

// Función para exportar gráfico específico como imagen
export const exportChartToImage = async (chartContainerId, title = 'Gráfico', imageFormat = 'png') => {
  try {
    const element = document.getElementById(chartContainerId) || 
                   document.querySelector(`[data-chart="${chartContainerId}"]`) ||
                   document.querySelector(`.${chartContainerId}`)
    
    if (!element) {
      throw new Error(`No se encontró el gráfico con ID: ${chartContainerId}`)
    }
    
    return await captureElementAsImage(element, title, imageFormat)
  } catch (error) {
    console.error('Error exporting chart to image:', error)
    return { success: false, error: error.message }
  }
}

// Función auxiliar para capturar elemento como imagen
const captureElementAsImage = async (element, title, imageFormat) => {
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: 1920,
    windowHeight: 1080
  })
  
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, `image/${imageFormat}`, 0.9)
  })
  
  const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.${imageFormat}`
  saveAs(blob, fileName)
  
  return { success: true, fileName }
}

// Funciones auxiliares para PDF

const addPDFHeader = (doc, title, yPosition) => {
  const pageWidth = doc.internal.pageSize.width
  
  // Logo (base64 SVG)
  const logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNEQzI2MjYiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI0ZGRkZGRiI+CjxwYXRoIGQ9Ik0xNiA4SDh2NGg2djZoLTJ2NGgtMnY2aDhWOGg4em0tNCAwdjRoNFY4aC00eiIvPgo8L3N2Zz4KPC9zdmc+'
  
  try {
    doc.addImage(logoBase64, 'SVG', 20, yPosition, 20, 20)
  } catch (error) {
    console.warn('No se pudo agregar el logo:', error)
  }
  
  // Título principal
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Gestión de Inventario - Taller Automotriz', 50, yPosition + 10)
  
  // Subtítulo
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text(title, 50, yPosition + 20)
  
  // Fecha
  doc.setFontSize(10)
  doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 50, yPosition + 30)
  
  // Línea separadora
  doc.setLineWidth(0.5)
  doc.line(20, yPosition + 40, pageWidth - 20, yPosition + 40)
}

const addGeneralStats = (doc, stats, yPosition) => {
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Estadísticas Generales', 20, yPosition)
  
  const statsData = [
    ['Métrica', 'Valor'],
    ['Total de Herramientas', (stats.totalTools || 0).toString()],
    ['Total de Empleados', (stats.totalEmployees || 0).toString()],
    ['Total de Reservas', (stats.totalReservations || 0).toString()],
    ['Reservas Activas', (stats.activeReservations || 0).toString()],
    ['Alertas Pendientes', (stats.alertsCount || 0).toString()]
  ]
  
  doc.autoTable({
    startY: yPosition + 10,
    head: [statsData[0]],
    body: statsData.slice(1),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  })
  
  return doc.lastAutoTable.finalY + 20
}

const addTopToolsTable = (doc, topTools, yPosition, pageHeight) => {
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Top 10 Herramientas Más Utilizadas', 20, yPosition)
  
  const toolsData = [
    ['#', 'Herramienta', 'Categoría', 'Reservas', 'Calificación'],
    ...topTools.slice(0, 10).map((tool, index) => [
      (index + 1).toString(),
      tool.nombre || '-',
      tool.categoria || '-',
      (tool.total_reservas || 0).toString(),
      tool.calificacion_promedio ? parseFloat(tool.calificacion_promedio).toFixed(1) : '-'
    ])
  ]
  
  doc.autoTable({
    startY: yPosition + 10,
    head: [toolsData[0]],
    body: toolsData.slice(1),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 50 }, 2: { cellWidth: 40 } },
    margin: { left: 20, right: 20 }
  })
  
  return doc.lastAutoTable.finalY + 20
}

const addTopEmployeesTable = (doc, topEmployees, yPosition, pageHeight) => {
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Top 10 Empleados Más Activos', 20, yPosition)
  
  const employeesData = [
    ['#', 'Empleado', 'Cargo', 'Reservas', 'Calificación'],
    ...topEmployees.slice(0, 10).map((emp, index) => [
      (index + 1).toString(),
      emp.nombre_completo || '-',
      emp.cargo || '-',
      (emp.total_reservas || 0).toString(),
      emp.calificacion_promedio ? parseFloat(emp.calificacion_promedio).toFixed(1) : '-'
    ])
  ]
  
  doc.autoTable({
    startY: yPosition + 10,
    head: [employeesData[0]],
    body: employeesData.slice(1),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 60 }, 2: { cellWidth: 40 } },
    margin: { left: 20, right: 20 }
  })
  
  return doc.lastAutoTable.finalY + 20
}

const addCategoryDistribution = (doc, categories, yPosition, pageHeight) => {
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = 20
  }
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Distribución por Categorías', 20, yPosition)
  
  const total = categories.reduce((sum, cat) => sum + (cat.count || 0), 0)
  const categoriesData = [
    ['Categoría', 'Cantidad', 'Porcentaje'],
    ...categories.map(cat => {
      const percentage = total > 0 ? ((cat.count || 0) / total * 100).toFixed(1) : '0.0'
      return [
        cat.categoria || '-',
        (cat.count || 0).toString(),
        `${percentage}%`
      ]
    })
  ]
  
  doc.autoTable({
    startY: yPosition + 10,
    head: [categoriesData[0]],
    body: categoriesData.slice(1),
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 }
  })
  
  return doc.lastAutoTable.finalY + 20
}

const addToolStatusAndCondition = (doc, toolsStatus, toolsCondition, yPosition, pageHeight) => {
  if (yPosition > pageHeight - 100) {
    doc.addPage()
    yPosition = 20
  }
  
  // Estado de herramientas
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Estado de Herramientas:', 20, yPosition)
  
  let currentY = yPosition + 10
  toolsStatus.forEach(status => {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`• ${status.estado}: ${status.count} herramientas`, 25, currentY)
    currentY += 8
  })
  
  // Condición de herramientas
  currentY += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Condición de Herramientas:', 20, currentY)
  
  currentY += 10
  toolsCondition.forEach(condition => {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`• ${condition.condicion}: ${condition.count} herramientas`, 25, currentY)
    currentY += 8
  })
  
  return currentY + 20
}

const addPDFFooter = (doc, pageHeight) => {
  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Sistema de Gestión de Inventario v1.0.0', 20, footerY)
  doc.text(`Página 1`, doc.internal.pageSize.width - 40, footerY)
}

// Función para exportar JSON mejorado (mantener compatibilidad)
export const exportReportToJSON = (reportData, title = 'Reporte de Inventario') => {
  try {
    const exportData = {
      title,
      generatedAt: new Date().toISOString(),
      generatedBy: 'Sistema de Gestión de Inventario v1.0.0',
      data: reportData,
      summary: {
        totalSections: Object.keys(reportData).length,
        hasGeneralStats: !!reportData.generalStats,
        hasTopTools: !!(reportData.topTools && reportData.topTools.length > 0),
        hasTopEmployees: !!(reportData.topEmployees && reportData.topEmployees.length > 0),
        hasCategories: !!(reportData.toolsByCategory && reportData.toolsByCategory.length > 0)
      }
    }
    
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return { success: true, fileName: a.download }
  } catch (error) {
    console.error('Error exporting to JSON:', error)
    return { success: false, error: error.message }
  }
}

// Funciones de utilidad para formateo
export const formatDateUtil = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '-'
  return format(new Date(date), formatString, { locale: es })
}

export const formatNumber = (number, decimals = 0) => {
  if (number == null || isNaN(number)) return '-'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '-'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value, total) => {
  if (!value || !total || total === 0) return '0.0%'
  return `${((value / total) * 100).toFixed(1)}%`
}

// Exportar todo como default para compatibilidad
export default {
  exportReportToPDF,
  exportReportToExcel,
  exportReportToImage,
  exportChartToImage,
  exportReportToJSON,
  formatDateUtil,
  formatNumber,
  formatCurrency,
  formatPercentage
}