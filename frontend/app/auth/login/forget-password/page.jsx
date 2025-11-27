"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmailIcon from "@mui/icons-material/Email";
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import "./page.css";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const validateEmail = (value) => {
    if (!value) return "El email es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Email inválido";
    return "";
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      setStep(2);

      // Mostrar URL en consola en modo desarrollo (si el backend retorna resetUrl)
      if (data.resetUrl) console.log("URL de recuperación:", data.resetUrl);
    } catch (err) {
      console.error("Error sending forgot-password:", err);
      setError("Error de conexión. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contenedor-olvido-contra">
      <div className="tarjeta-olvido-contra">
        <IconButton
          className="volver-icon-button"
          onClick={() => router.push('/auth/login')}
          aria-label="volver al login"
        >
          <ArrowBackIosNewIcon className="volver-icon" />
        </IconButton>

        <h2 className="titulo-formulario">Recuperar contraseña</h2>

        {step === 1 ? (
          <form className="formulario" onSubmit={handleEmailSubmit}>
            Correo
            <div className="contenedor-input">
              <input
                type="email"
                placeholder="Ingresa tu email"
                className="campo-input"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
              />
              <i className="material-symbols-rounded">mail</i>
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="form-actions">
              <button className="boton-principal" type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </form>
        ) : (
          <div className="etapa-recuperacion-outer">
            <div className="etapa-recuperacion-card">
              <div className="email-icon-circle">
                <EmailIcon className="email-icon" />
              </div>

              <h3>¡Correo enviado!</h3>

              <p className="etapa-text">Revisa tu consola del navegador para obtener el enlace de recuperación (modo desarrollo).</p>

              <p className="etapa-subtext">El enlace expira en 1 hora.</p>

              <button className="boton-principal" onClick={() => router.push('/auth/login')}>Volver</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
