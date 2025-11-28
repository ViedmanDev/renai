"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          console.log("🚀 User inicial desde localStorage:", parsed.name);
          return parsed;
        } catch (err) {
          console.error("❌ Error parseando user inicial:", err);
          return null;
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔄 checkAuth iniciado");

      const token = localStorage.getItem("token");
      if (!token) {
        console.log(" No hay token");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          console.log("🟢 Usuario del backend:", data.user.name);

          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          console.error(" Error verificando:", data);
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error(" Error checkAuth:", err);
      } finally {
        setLoading(false);
        console.log("✔ checkAuth completado");
      }
    };

    checkAuth();
  }, [API_URL]);
  const value = {
    user,
    setUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
