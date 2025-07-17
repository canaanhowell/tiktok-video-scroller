'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, type User } from '@/services/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string, userType: 'consumer' | 'creator') => Promise<void>
  signUp: (email: string, password: string, name: string, userType: 'consumer' | 'creator') => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.log('Auth service not implemented yet, user will be null')
        setUser(null)
        // Don't set error for service not implemented
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signIn = async (email: string, password: string, userType: 'consumer' | 'creator') => {
    try {
      setError(null)
      setLoading(true)
      
      let loggedInUser: User
      if (userType === 'consumer') {
        loggedInUser = await authService.loginConsumer({ email, password })
      } else {
        loggedInUser = await authService.loginCreator({ email, password })
      }
      
      setUser(loggedInUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, userType: 'consumer' | 'creator') => {
    try {
      setError(null)
      setLoading(true)
      
      const userData = { email, password, name, userType }
      let newUser: User
      
      if (userType === 'consumer') {
        newUser = await authService.registerConsumer(userData)
      } else {
        newUser = await authService.registerCreator(userData)
      }
      
      setUser(newUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await authService.logout()
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}