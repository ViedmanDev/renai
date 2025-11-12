"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const setUserFromToken = async (token) => {
  try {
    const res = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error verificando token:", error);
    return false;
  }
};

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    
    if (!token) {
      setLoading(false)
      return
    }

    try {
      // Verificar token con el backend
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        // Token inválido o expirado
        logout()
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        document.cookie = "auth=1; path=/"
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message || "Error al iniciar sesión" }
      }
    } catch (error) {
      console.error("Error en login:", error)
      return { success: false, message: "Error de conexión al backend" }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
    setUser(null)
    router.push("/auth/login")
  }

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        document.cookie = "auth=1; path=/"
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, message: data.message || "Error al registrarse" }
      }
    } catch (error) {
      console.error("Error en registro:", error)
      return { success: false, message: "Error de conexión al backend" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        setUserFromToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}