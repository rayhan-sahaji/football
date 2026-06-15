import { createContext, useContext, useState, useEffect } from 'react'
import { getApiUrl } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetch(getApiUrl('/api/auth/verify'), {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => setLoading(false))
      .catch(() => {
        localStorage.removeItem('admin_token')
        setToken(null)
        setLoading(false)
      })
  }, [token])

  const login = async (password) => {
    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }
    const { token: newToken } = await res.json()
    localStorage.setItem('admin_token', newToken)
    setToken(newToken)
  }

  const logout = async () => {
    try {
      await fetch(getApiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { /* */ }
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, loading, login, logout, isAuthenticated: !!token && !loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
