import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, clearToken, decodeUserFromToken, getToken, setToken } from '../api/client'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function initialUser(): User | null {
  const token = getToken()
  return token ? decodeUserFromToken(token) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.login({ username, password })
      setToken(res.token)
      setUser(decodeUserFromToken(res.token))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.register({ username, email, password })
      setToken(res.token)
      const decoded = decodeUserFromToken(res.token)
      setUser(decoded ? { ...decoded, email } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, error, login, register, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
