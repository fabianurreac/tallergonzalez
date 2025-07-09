import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../hooks/useAuth'
import ReservationsList from '../components/Reservations/ReservationsList'
import NewReservationModal from '../components/Reservations/NewReservationModal'
import EditReservationModal from '../components/Reservations/EditReservationModal'
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal'

const Reservations = () => {
  const { hasPermission } = useAuth()
  const [reservations, setReservations] = useState([])
  const [availableTools, setAvailableTools] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchReservations(),
        fetchAvailableTools(),
        fetchEmployees()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from('reservas')
      .select(`
        *,
        empleados (
          id,
          nombre_completo,
          cargo,
          identificacion
        ),
        herramientas (
          id,
          nombre,
          categoria,
          serial,
          imagen
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reservations:', error)
      return
    }

    setReservations(data || [])
  }

  const fetchAvailableTools = async () => {
    const { data, error } = await supabase
      .from('herramientas')
      .select('*')
      .eq('estado', 'disponible')
      .order('nombre')

    if (error) {
      console.error('Error fetching available tools:', error)
      return
    }

    setAvailableTools(data || [])
  }

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('empleados')
      .select('*')
      .order('nombre_completo')

    if (error) {
      console.error('Error fetching employees:', error)
      return
    }

    setEmployees(data || [])
  }

  const handleNewReservation = () => {
    setShowNewModal(true)
  }

  const handleEditReservation = (reservation) => {
    setSelectedReservation(reservation)
    setShowEditModal(true)
  }

  const handleDeleteReservation = (reservation) => {
    setSelectedReservation(reservation)
    setShowDeleteModal(true)
  }

  const handleReturnTool = async (reservationId) => {
    try {
      const reservation = reservations.find(r => r.id === reservationId)
      if (!reservation) return

      // Actualizar la reserva como devuelta
      const { error: reservationError } = await supabase
        .from('reservas')
        .update({
          estado: 'devuelta',
          fecha_devolucion_real: new Date().toISOString()
        })
        .eq('id', reservationId)

      if (reservationError) throw reservationError

      // Cambiar el estado de la herramienta a disponible
      const { error: toolError } = await supabase
        .from('herramientas')
        .update({ estado: 'disponible' })
        .eq('id', reservation.id_herramienta)

      if (toolError) throw toolError

      // Refrescar datos
      await fetchData()
      
    } catch (error) {
      console.error('Error returning tool:', error)
      alert('Error al devolver la herramienta')
    }
  }

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true)
      
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', selectedReservation.id)

      if (error) throw error

      // Si la reserva estaba activa, liberar la herramienta
      if (selectedReservation.estado === 'reservada') {
        await supabase
          .from('herramientas')
          .update({ estado: 'disponible' })
          .eq('id', selectedReservation.id_herramienta)
      }

      await fetchData()
      setShowDeleteModal(false)
      setSelectedReservation(null)
      
    } catch (error) {
      console.error('Error deleting reservation:', error)
      alert('Error al eliminar la reserva')
    } finally {
      setDeleteLoading(false)
    }
  }

  const onReservationCreated = async () => {
    await fetchData()
    setShowNewModal(false)
  }

  const onReservationUpdated = async () => {
    await fetchData()
    setShowEditModal(false)
  }

  // Filtrar reservas
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.empleados?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.herramientas?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.herramientas?.serial?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || reservation.estado === filterStatus

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-16 bg-secondary-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Gestión de Reservas
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Administra las reservas de herramientas del taller
          </p>
        </div>
        {hasPermission('almacenista') && (
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleNewReservation}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Reserva
            </button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-2">
                Buscar reservas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Empleado, herramienta o serial..."
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-secondary-700 mb-2">
                Filtrar por estado
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">Todos los estados</option>
                <option value="reservada">Reservadas</option>
                <option value="devuelta">Devueltas</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Total Reservas</p>
                  <p className="text-xl font-semibold text-blue-900">{reservations.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Activas</p>
                  <p className="text-xl font-semibold text-yellow-900">
                    {reservations.filter(r => r.estado === 'reservada').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Herramientas Disponibles</p>
                  <p className="text-xl font-semibold text-green-900">{availableTools.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      <ReservationsList
        reservations={filteredReservations}
        onEdit={handleEditReservation}
        onDelete={handleDeleteReservation}
        onReturn={handleReturnTool}
        hasPermission={hasPermission}
      />

      {/* Modales */}
      {showNewModal && (
        <NewReservationModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSuccess={onReservationCreated}
          availableTools={availableTools}
          employees={employees}
        />
      )}

      {showEditModal && selectedReservation && (
        <EditReservationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={onReservationUpdated}
          reservation={selectedReservation}
          availableTools={availableTools}
          employees={employees}
        />
      )}

      {showDeleteModal && selectedReservation && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Eliminar Reserva"
          message={`¿Estás seguro de que deseas eliminar la reserva de ${selectedReservation.herramientas?.nombre} para ${selectedReservation.empleados?.nombre_completo}?`}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

export default Reservations