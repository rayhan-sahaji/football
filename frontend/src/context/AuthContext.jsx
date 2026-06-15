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
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
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
    const text = await res.text()
    if (!res.ok || !text) {
      throw new Error(text ? JSON.parse(text).error : 'Server is waking up, please try again')
    }
    const { token: newToken } = JSON.parse(text)
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
