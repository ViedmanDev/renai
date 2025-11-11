"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/project";

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("El email no es válido");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    

    try {
      console.log("API_URL ES:", API_URL);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        document.cookie = "auth=1; path=/"; // útil si luego usas middleware
        // redirige a donde quieras:
        router.push(redirectTo); // o '/admin' o '/project'
      } else {
        alert(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Login</h2>

      <form className="login-form" onSubmit={handleLogin}>
        Email
        <div className="input-wrapper">
          <input
            type="email"
            placeholder="Ingresa tu email"
            className="input-field"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <i className="material-symbols-rounded">mail</i>
        </div>
        Contraseña
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className="input-field"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <i className="material-symbols-rounded">lock</i>
        </div>
        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
        <a href="#" className="forgot-pass-link">
          Olvidé mi contraseña
        </a>
      </form>

      <p>
        ¿No tienes cuenta? <Link href="/auth/register">Crea una aquí</Link>
      </p>

      <p className="separator">
        <span>or</span>
      </p>

      <div className="social-login">
        <button className="social-button">
          <img src="/google-icon.png" alt="" className="social-icon" />
          Continue con Google
        </button>
        <br />
        <button className="social-button social-apple">
          <img src="/logo-apple.png" alt="" className="social-icon" />
          Continue con Apple
        </button>
      </div>
    </div>
  );
}
