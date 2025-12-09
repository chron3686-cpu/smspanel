import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  role: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('novatext-token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const res = await fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (res.ok && data.success) {
        setUser(data.user)
      } else {
        localStorage.removeItem('novatext-token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('novatext-token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await res.json()
      
      if (res.ok && data.success) {
        localStorage.setItem('novatext-token', data.token)
        setToken(data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    localStorage.removeItem('novatext-token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// API helper with auth token
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('novatext-token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }
  
  const res = await fetch(url, { ...options, headers })
  
  if (res.status === 401) {
    localStorage.removeItem('novatext-token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  
  return res
}
