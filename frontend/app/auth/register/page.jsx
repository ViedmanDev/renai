"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; //  Usar contexto
import "./login.css";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  
  const { login } = useAuth(); // Hook del contexto

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

    // ✅ Ahora usamos la función del contexto (que ya tiene el try/catch)
    const result = await login(email, password);

    if (result.success) {
      router.push(redirectTo);
    } else {
      alert(result.message);
    }

    setLoading(false);
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
        ¿No tienes cuenta? <Link href="/auth/login/register">Crea una aquí</Link>
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