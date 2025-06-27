"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiService, type AuthRequest, type RegisterRequest } from "@/lib/api"

interface AuthContextType {
  isAuthenticated: boolean
  login: (credentials: AuthRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (credentials: AuthRequest) => {
    try {
      const response = await apiService.login(credentials)
      localStorage.setItem("token", response.token)
      localStorage.setItem("refreshToken", response.refreshToken)
      setIsAuthenticated(true)
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      await apiService.register(data)
      // After registration, automatically log in
      await login({ usernameOrEmail: data.email, password: data.password })
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
