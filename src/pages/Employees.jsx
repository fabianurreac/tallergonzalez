import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../hooks/useAuth'
import EmployeeCard from '../components/Employees/EmployeeCard'
import EmployeeForm from '../components/Employees/EmployeeForm'

const Employees = () => {
  const { hasPermission } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCargo, setFilterCargo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)

  const cargos = [
    'Mecánico General',
    'Especialista en Motor',
    'Técnico Eléctrico',
    'Latonero',
    'Pintor',
    'Técnico en Frenos',
    'Especialista en Transmisión',
    'Supervisor',
    'Jefe de Taller',
    'Auxiliar de Taller'
  ]

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching employees:', error)
        alert('Error al cargar empleados')
        return
      }

      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      alert('Error inesperado al cargar empleados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEmployee = () => {
    setSelectedEmployee(null)
    setShowModal(true)
  }

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee)
    setDeleteConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!employeeToDelete) return

    try {
      const { error } = await supabase
        .from('empleados')
        .delete()
        .eq('id', employeeToDelete.id)

      if (error) {
        console.error('Error deleting employee:', error)
        alert('Error al eliminar empleado: ' + error.message)
        return
      }

      await fetchEmployees()
      setDeleteConfirmModal(false)
      setEmployeeToDelete(null)
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Error inesperado al eliminar empleado')
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.identificacion.includes(searchTerm) ||
                         employee.telefono.includes(searchTerm)
    
    const matchesCargo = filterCargo === '' || employee.cargo === filterCargo

    return matchesSearch && matchesCargo
  })

  if (!hasPermission('almacenista')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-secondary-900">Sin permisos</h2>
        <p className="text-secondary-600 mt-2">No tienes permisos para acceder a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-secondary-900 sm:text-3xl sm:truncate">
            Gestión de Empleados
          </h2>
          <p className="mt-1 text-sm text-secondary-500">
            Administra los empleados del taller y sus códigos QR
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={handleCreateEmployee}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Empleado
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-1">
              Buscar empleados
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
                className="input-field pl-10"
                placeholder="Buscar por nombre, identificación o teléfono..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="filterCargo" className="block text-sm font-medium text-secondary-700 mb-1">
              Filtrar por cargo
            </label>
            <select
              id="filterCargo"
              value={filterCargo}
              onChange={(e) => setFilterCargo(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los cargos</option>
              {cargos.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total</p>
                <p className="text-lg font-semibold text-blue-900">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Encontrados</p>
                <p className="text-lg font-semibold text-green-900">{filteredEmployees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Cargos</p>
                <p className="text-lg font-semibold text-purple-900">
                  {new Set(employees.map(e => e.cargo)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">Con QR</p>
                <p className="text-lg font-semibold text-yellow-900">
                  {employees.filter(e => e.qr_code).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de empleados */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow animate-pulse">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary-200 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-secondary-200 rounded w-full"></div>
                  <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                </div>
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <div className="h-8 bg-secondary-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-secondary-900">
            {searchTerm || filterCargo ? 'No se encontraron empleados' : 'No hay empleados registrados'}
          </h3>
          <p className="mt-1 text-sm text-secondary-500">
            {searchTerm || filterCargo ? 
              'Intenta cambiar los filtros de búsqueda.' : 
              'Comienza creando tu primer empleado.'
            }
          </p>
          {!searchTerm && !filterCargo && (
            <div className="mt-6">
              <button
                onClick={handleCreateEmployee}
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear primer empleado
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulario */}
      <EmployeeForm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-secondary-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-secondary-900">
                    Eliminar empleado
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-secondary-500">
                      ¿Estás seguro de que quieres eliminar a <strong>{employeeToDelete?.nombre_completo}</strong>? 
                      Esta acción no se puede deshacer y también eliminará todas las reservas asociadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-secondary-50 flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger"
              >
                Eliminar empleado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees