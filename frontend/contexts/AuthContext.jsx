"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        logout();
      }
    } catch (e) {
      console.error("Error verificando sesión:", e);
      logout();
    } finally {
      setLoading(false);
    }
  };


  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        document.cookie = "auth=1; path=/";
        setUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message || "Error al iniciar sesión" };
    } catch (e) {
      return { success: false, message: "Error de conexión" };
    }
  };


  const loginWithGoogle = (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    document.cookie = "auth=1; path=/";

    setUser(user);
  };


  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    setUser(null);
    router.push("/auth/login");
  };


  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        document.cookie = "auth=1; path=/";
        setUser(data.user);
        return { success: true };
      }

      return { success: false, message: data.message || "Error al registrarse" };
    } catch (e) {
      return { success: false, message: "Error de conexión" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,            
        login,
        loginWithGoogle,    
        logout,
        register,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usar AuthProvider");
  return ctx;
}
