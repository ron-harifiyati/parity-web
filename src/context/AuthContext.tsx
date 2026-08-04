import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError, clearToken, decodeUserFromToken, getToken, setToken } from '../api/client'
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
  updateProfile: (body: {
    username?: string
    email?: string
    currentPassword?: string
    newPassword?: string
  }) => Promise<void>
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

  // The JWT only carries {id, username} — hydrate the email (and anything
  // else) from the API once, on load, for a session restored from storage.
  useEffect(() => {
    if (!getToken()) return
    api.getMe().then(setUser).catch(() => {})
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await api.login({ username, password })
      setToken(res.token)
      setUser(decodeUserFromToken(res.token))
      const me = await api.getMe()
      setUser(me)
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

  const updateProfile = async (body: {
    username?: string
    email?: string
    currentPassword?: string
    newPassword?: string
  }) => {
    setError(null)
    try {
      const updated = await api.updateMe(body)
      setUser(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update profile')
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, error, login, register, logout, clearError, updateProfile }}
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
