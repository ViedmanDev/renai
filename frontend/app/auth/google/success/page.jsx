"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        alert("Error al autenticar con Google");
        router.push("/auth/login");
        return;
      }

      if (token) {
        // Guardar token en localStorage
        localStorage.setItem("token", token);
        document.cookie = "auth=1; path=/";

        // Verificar token y obtener datos del usuario
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (res.ok) {
            console.log("Usuario autenticado:", data.user);
            router.push("/");
          } else {
            console.error("Error en verificación:", data);
            alert("Error al verificar la sesión");
            router.push("/auth/login");
          }
        } catch (err) {
          console.error("Error verificando token:", err);
          alert("Error al verificar la sesión");
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
    };

    handleAuth();
  }, [searchParams, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #5e35b1",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p>Autenticando con Google...</p>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
