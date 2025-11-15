"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import "./login.css";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const { login } = useAuth();

  // Estados de error
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });

  // Validar email en tiempo real
  const validateEmail = (value) => {
    if (!value) {
      return "El email es requerido";
    }
    if (!value.includes("@")) {
      return "El email debe contener @";
    }
    if (!value.includes(".")) {
      return "El email debe tener un dominio válido";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "El formato del email no es válido";
    }
    return "";
  };

  // Validar contraseña en tiempo real
  const validatePassword = (value) => {
    if (!value) {
      return "La contraseña es requerida";
    }
    if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    return "";
  };

  // Manejar cambio de email
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Validar solo si el campo ya fue tocado
    if (errors.email || value) {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value),
        general: "" // Limpiar error general al escribir
      }));
    }
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    // Validar solo si el campo ya fue tocado
    if (errors.password || value) {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(value),
        general: "" // Limpiar error general al escribir
      }));
    }
  };

  // Validar todo el formulario
  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
      general: ""
    });

    return !emailError && !passwordError;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validar formulario antes de enviar
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    const result = await login(email, password);

    if (result.success) {
      router.push(redirectTo);
    } else {
      // Manejar errores específicos del backend
      const errorMessage = result.message || "Error al iniciar sesión";

      // Detectar tipo de error
      if (errorMessage.toLowerCase().includes("usuario no encontrado") ||
        errorMessage.toLowerCase().includes("no encontrado")) {
        setErrors(prev => ({
          ...prev,
          email: "No existe una cuenta con este email"
        }));
      } else if (errorMessage.toLowerCase().includes("contraseña") ||
        errorMessage.toLowerCase().includes("incorrecta")) {
        setErrors(prev => ({
          ...prev,
          password: "La contraseña es incorrecta"
        }));
      } else {
        // Error general (problemas de conexión, etc.)
        setErrors(prev => ({
          ...prev,
          general: errorMessage
        }));
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Login</h2>

      <form className="login-form" onSubmit={handleLogin} noValidate>

        {/* Error general (problemas de conexión, servidor, etc.) */}
        {errors.general && (
          <div style={{
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "16px",
            color: "#c33"
          }}>
            <strong>Error:</strong> {errors.general}
          </div>
        )}

        {/* Campo Email */}
        <div style={{ marginBottom: "4px" }}>Email</div>
        <div className="input-wrapper">
          <input
            type="email"
            placeholder="Ingresa tu email"
            className={`input-field ${errors.email ? "input-error" : ""}`}
            value={email}
            onChange={handleEmailChange}
            disabled={loading}
            style={{
              borderColor: errors.email ? "#f44336" : undefined
            }}
          />
          <i className="material-symbols-rounded">mail</i>
        </div>
        {errors.email && (
          <div style={{
            color: "#f44336",
            fontSize: "13px",
            marginTop: "4px",
            marginBottom: "12px"
          }}>
            {errors.email}
          </div>
        )}

        {/* Campo Contraseña */}
        <div style={{ marginBottom: "4px", marginTop: "12px" }}>Contraseña</div>
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className={`input-field ${errors.password ? "input-error" : ""}`}
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            style={{
              borderColor: errors.password ? "#f44336" : undefined
            }}
          />
          <i className="material-symbols-rounded">lock</i>
        </div>
        {errors.password && (
          <div style={{
            color: "#f44336",
            fontSize: "13px",
            marginTop: "4px",
            marginBottom: "12px"
          }}>
            {errors.password}
          </div>
        )}

        <button
          className="login-button"
          type="submit"
          disabled={loading}
          style={{
            marginTop: "16px"
          }}
        >
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
        <button 
          className="social-button"
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
          }}
          type="button"
        >
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