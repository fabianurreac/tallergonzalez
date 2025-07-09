import { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'

const EmployeeSelector = ({ selectedEmployee, onEmployeeSelect }) => {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [employees, searchTerm])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('nombre_completo')

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees)
      return
    }

    const filtered = employees.filter(employee =>
      employee.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.identificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredEmployees(filtered)
  }

  const handleEmployeeSelect = (employee) => {
    onEmployeeSelect(employee)
    setSearchTerm('')
    setShowDropdown(false)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowDropdown(value.length > 0)
    
    // Si se borra el input, deseleccionar empleado
    if (!value && selectedEmployee) {
      onEmployeeSelect(null)
    }
  }

  const handleInputFocus = () => {
    if (!selectedEmployee) {
      setShowDropdown(true)
    }
  }

  const handleClearSelection = () => {
    onEmployeeSelect(null)
    setSearchTerm('')
    setShowDropdown(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-secondary-200 rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={selectedEmployee ? selectedEmployee.nombre_completo : searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Buscar empleado por nombre, ID, cargo..."
          className="input-field pr-10"
          readOnly={!!selectedEmployee}
        />
        
        {/* Icono de búsqueda o limpiar */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {selectedEmployee ? (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown de empleados */}
      {showDropdown && !selectedEmployee && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-secondary-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredEmployees.length > 0 ? (
            <ul className="py-1">
              {filteredEmployees.map((employee) => (
                <li key={employee.id}>
                  <button
                    type="button"
                    onClick={() => handleEmployeeSelect(employee)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary-50 focus:bg-secondary-50 focus:outline-none transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-secondary-900 truncate">
                          {employee.nombre_completo}
                        </div>
                        <div className="text-sm text-secondary-600">
                          {employee.cargo}
                        </div>
                        <div className="text-xs text-secondary-500">
                          ID: {employee.identificacion}
                          {employee.telefono && ` • Tel: ${employee.telefono}`}
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {employee.nombre_completo.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center">
              <svg className="mx-auto h-8 w-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-secondary-900">
                No se encontraron empleados
              </h3>
              <p className="mt-1 text-sm text-secondary-500">
                {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay empleados registrados.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* Información adicional */}
      {employees.length === 0 && !loading && (
        <div className="mt-2 text-sm text-secondary-500">
          No hay empleados registrados en el sistema.
        </div>
      )}

      {employees.length > 0 && !loading && (
        <div className="mt-2 text-xs text-secondary-500">
          {employees.length} empleado{employees.length !== 1 ? 's' : ''} disponible{employees.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

export default EmployeeSelector