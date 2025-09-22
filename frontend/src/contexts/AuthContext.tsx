"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "axios"

interface User {
  id: string
  name: string
  email: string
  role: "FARMER" | "DISTRIBUTOR" | "RETAILER" | "CONSUMER"
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Configure axios defaults
  useEffect(() => {
    const savedToken = localStorage.getItem("farmchain_token")
    if (savedToken) {
      setToken(savedToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      localStorage.setItem("farmchain_token", newToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed")
    }
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await axios.post("/api/auth/register", { name, email, password, role })
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      localStorage.setItem("farmchain_token", newToken)
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed")
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("farmchain_token")
    delete axios.defaults.headers.common["Authorization"]
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
