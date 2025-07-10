import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../config/supabase'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')

    if (type === 'recovery' && accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Error estableciendo sesión:', error)
          setError('Enlace inválido o expirado.')
        }
        setValidatingToken(false)
      })
    } else {
      setError('Enlace de recuperación inválido.')
      setValidatingToken(false)
    }
  }, [searchParams])

  const validateForm = () => {
    if (!password.trim()) return setError('La nueva contraseña es obligatoria'), false
    if (password.length < 6) return setError('Debe tener al menos 6 caracteres'), false
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden'), false
    return true
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password.trim()
      })

      if (error) {
        console.error('Error actualizando contraseña:', error)
        setError('No se pudo actualizar la contraseña.')
        return
      }

      if (data?.user) {
        console.log('Contraseña actualizada')
        setSuccess(true)

        // Cerrar sesión por seguridad
        await supabase.auth.signOut()

        setTimeout(() => {
          try {
            navigate('/login', { replace: true })
          } catch (navErr) {
            console.error('Error redireccionando:', navErr)
          }
        }, 3000)
      }
    } catch (err) {
      console.error('Error inesperado:', err)
      setError('Error inesperado al actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div>
          <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-secondary-600">Validando enlace de recuperación...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6">
        <div className="bg-white shadow rounded p-6 max-w-md w-full">
          <div className="h-12 w-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-800">¡Contraseña actualizada!</h2>
          <p className="mt-2 text-sm text-gray-600">Serás redirigido al login en unos segundos.</p>
          <button onClick={() => navigate('/login')} className="mt-6 text-blue-600 hover:underline">
            Ir al login ahora
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleResetPassword} className="bg-white shadow-md p-6 rounded-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center">Restablecer contraseña</h2>

        <input
          type="password"
          name="password"
          placeholder="Nueva contraseña"
          required
          minLength={6}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          disabled={loading}
          className="input"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar nueva contraseña"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setError('')
          }}
          disabled={loading}
          className="input"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            disabled={loading}
            className="text-sm text-gray-600 hover:text-black"
          >
            ← Volver al login
          </button>
        </div>
      </form>
    </div>
  )
}

export default ResetPassword