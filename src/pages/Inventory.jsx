import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, TOOL_CATEGORIES, TOOL_STATES, TOOL_CONDITIONS } from '../config/supabase'
import ToolModal from '../components/Inventory/ToolModal'
import ToolFilters from '../components/Inventory/ToolFilters'
import ToolCard from '../components/Inventory/ToolCard'
import ToolTable from '../components/Inventory/ToolTable'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const Inventory = () => {
  const { hasPermission } = useAuth()
  const [tools, setTools] = useState([])
  const [filteredTools, setFilteredTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    estado: '',
    condicion: ''
  })
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    reservadas: 0,
    deterioro: 0
  })

  useEffect(() => {
    fetchTools()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tools, searchTerm, filters])

  const fetchTools = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('herramientas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tools:', error)
        return
      }

      setTools(data || [])
      updateStats(data || [])
    } catch (error) {
      console.error('Error fetching tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (toolsData) => {
    const total = toolsData.length
    const disponibles = toolsData.filter(tool => tool.estado === 'disponible').length
    const reservadas = toolsData.filter(tool => tool.estado === 'reservada').length
    const deterioro = toolsData.filter(tool => tool.condicion === 'deterioro').length

    setStats({ total, disponibles, reservadas, deterioro })
  }

  const applyFilters = () => {
    let filtered = tools

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.serial.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtros por categoría, estado y condición
    if (filters.category) {
      filtered = filtered.filter(tool => tool.categoria === filters.category)
    }
    if (filters.estado) {
      filtered = filtered.filter(tool => tool.estado === filters.estado)
    }
    if (filters.condicion) {
      filtered = filtered.filter(tool => tool.condicion === filters.condicion)
    }

    setFilteredTools(filtered)
  }

  const handleCreateTool = () => {
    setSelectedTool(null)
    setModalOpen(true)
  }

  const handleEditTool = (tool) => {
    setSelectedTool(tool)
    setModalOpen(true)
  }

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta herramienta?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('herramientas')
        .delete()
        .eq('id', toolId)

      if (error) {
        console.error('Error deleting tool:', error)
        alert('Error al eliminar la herramienta')
        return
      }

      // Actualizar la lista local
      const updatedTools = tools.filter(tool => tool.id !== toolId)
      setTools(updatedTools)
      updateStats(updatedTools)

      alert('Herramienta eliminada exitosamente')
    } catch (error) {
      console.error('Error deleting tool:', error)
      alert('Error inesperado al eliminar la herramienta')
    }
  }

  const handleSaveTool = async (toolData) => {
    try {
      if (selectedTool) {
        // Actualizar herramienta existente
        const { data, error } = await supabase
          .from('herramientas')
          .update(toolData)
          .eq('id', selectedTool.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating tool:', error)
          alert('Error al actualizar la herramienta')
          return
        }

        // Actualizar la lista local
        const updatedTools = tools.map(tool =>
          tool.id === selectedTool.id ? data : tool
        )
        setTools(updatedTools)
        updateStats(updatedTools)

        alert('Herramienta actualizada exitosamente')
      } else {
        // Crear nueva herramienta
        const { data, error } = await supabase
          .from('herramientas')
          .insert([toolData])
          .select()
          .single()

        if (error) {
          console.error('Error creating tool:', error)
          alert('Error al crear la herramienta')
          return
        }

        // Agregar a la lista local
        const updatedTools = [data, ...tools]
        setTools(updatedTools)
        updateStats(updatedTools)

        alert('Herramienta creada exitosamente')
      }

      setModalOpen(false)
      setSelectedTool(null)
    } catch (error) {
      console.error('Error saving tool:', error)
      alert('Error inesperado al guardar la herramienta')
    }
  }

  if (loading) {
    return <LoadingSpinner text="Cargando inventario..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Inventario de Herramientas
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Gestiona las herramientas del taller
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          {/* Botones de vista */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === 'table'
                  ? 'bg-primary-100 text-primary-700 border-primary-300'
                  : 'bg-white text-secondary-700 border-secondary-300 hover:bg-secondary-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Botón crear */}
          {hasPermission('almacenista') && (
            <button
              onClick={handleCreateTool}
              className="btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nueva Herramienta
            </button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-secondary-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-50 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">Disponibles</dt>
                  <dd className="text-lg font-medium text-secondary-900">{stats.disponibles}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-50 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">Reservadas</dt>
                  <dd className="text-lg font-medium text-secondary-900">{stats.reservadas}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-50 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">En Deterioro</dt>
                  <dd className="text-lg font-medium text-secondary-900">{stats.deterioro}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <ToolFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        categories={TOOL_CATEGORIES}
        states={Object.values(TOOL_STATES)}
        conditions={Object.values(TOOL_CONDITIONS)}
      />

      {/* Lista de herramientas */}
      {filteredTools.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No hay herramientas</h3>
          <p className="mt-1 text-sm text-secondary-500">
            {tools.length === 0 ? 'Comienza creando una nueva herramienta.' : 'No se encontraron herramientas con los filtros aplicados.'}
          </p>
          {hasPermission('almacenista') && tools.length === 0 && (
            <div className="mt-6">
              <button
                onClick={handleCreateTool}
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Herramienta
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onEdit={handleEditTool}
              onDelete={handleDeleteTool}
              hasPermission={hasPermission}
            />
          ))}
        </div>
      ) : (
        <ToolTable
          tools={filteredTools}
          onEdit={handleEditTool}
          onDelete={handleDeleteTool}
          hasPermission={hasPermission}
        />
      )}

      {/* Modal para crear/editar herramienta */}
      {modalOpen && (
        <ToolModal
          tool={selectedTool}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedTool(null)
          }}
          onSave={handleSaveTool}
          categories={TOOL_CATEGORIES}
          states={Object.values(TOOL_STATES)}
          conditions={Object.values(TOOL_CONDITIONS)}
        />
      )}
    </div>
  )
}

export default Inventory