"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import "./page.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  // Estados de error
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: ""
  });

  // Validar nombre
  const validateName = (value) => {
    if (!value || value.trim().length === 0) {
      return "El nombre es requerido";
    }
    if (value.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    if (value.trim().length > 50) {
      return "El nombre no puede tener más de 50 caracteres";
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      return "El nombre solo puede contener letras y espacios";
    }
    return "";
  };

  // Validar email
  const validateEmail = (value) => {
    if (!value) {
      return "El email es requerido";
    }
    if (!value.includes("@")) {
      return "El email debe contener @";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "El formato del email no es válido";
    }
    if (value.length > 100) {
      return "El email es demasiado largo";
    }
    return "";
  };

  // Validar contraseña
  const validatePassword = (value) => {
    if (!value) {
      return "La contraseña es requerida";
    }
    if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (value.length > 100) {
      return "La contraseña es demasiado larga";
    }
    // Validar complejidad
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    if (!hasLetter) {
      return "La contraseña debe contener al menos una letra";
    }
    if (!hasNumber) {
      return "La contraseña debe contener al menos un número";
    }
    
    // Contraseñas comunes débiles
    const weakPasswords = ['123456', 'password', 'qwerty', '111111', 'abc123'];
    if (weakPasswords.includes(value.toLowerCase())) {
      return "Esta contraseña es demasiado común y débil";
    }
    
    return "";
  };

  // Validar confirmación de contraseña
  const validateConfirmPassword = (value, passwordValue) => {
    if (!value) {
      return "Debes confirmar tu contraseña";
    }
    if (value !== passwordValue) {
      return "Las contraseñas no coinciden";
    }
    return "";
  };

  // Manejar cambios con validación en tiempo real
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (errors.name || value) {
      setErrors(prev => ({ ...prev, name: validateName(value), general: "" }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email || value) {
      setErrors(prev => ({ ...prev, email: validateEmail(value), general: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password || value) {
      setErrors(prev => ({ 
        ...prev, 
        password: validatePassword(value),
        confirmPassword: confirmPassword ? validateConfirmPassword(confirmPassword, value) : "",
        general: ""
      }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (errors.confirmPassword || value) {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: validateConfirmPassword(value, password),
        general: ""
      }));
    }
  };

  // Validar todo el formulario
  const validateForm = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
      general: ""
    });

    return !nameError && !emailError && !passwordError && !confirmPasswordError;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "" });

    const result = await register(name.trim(), email.toLowerCase().trim(), password);

    if (result.success) {
      alert("✅ Usuario registrado correctamente. Redirigiendo...");
      router.push("/");
    } else {
      // Manejar errores específicos del backend
      const errorMessage = result.message || "Error al registrar usuario";
      
      if (errorMessage.toLowerCase().includes("ya existe")) {
        setErrors(prev => ({
          ...prev,
          email: "Este email ya está registrado"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: errorMessage
        }));
      }
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2 className="form-title">Crear cuenta</h2>

      <form className="register-form" onSubmit={handleRegister} noValidate>
        
        {/* Error general */}
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

        {/* Campo Nombre */}
        <div style={{ marginBottom: "4px" }}>Nombre completo</div>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            className={`input-field ${errors.name ? "input-error" : ""}`}
            value={name}
            onChange={handleNameChange}
            disabled={loading}
            style={{
              borderColor: errors.name ? "#f44336" : undefined
            }}
          />
        </div>
        {errors.name && (
          <div style={{
            color: "#f44336",
            fontSize: "13px",
            marginTop: "4px",
            marginBottom: "12px"
          }}>
            {errors.name}
          </div>
        )}

        {/* Campo Email */}
        <div style={{ marginBottom: "4px", marginTop: "12px" }}>Email</div>
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
            placeholder="Mínimo 6 caracteres (letras y números)"
            className={`input-field ${errors.password ? "input-error" : ""}`}
            value={password}
            onChange={handlePasswordChange}
            disabled={loading}
            style={{
              borderColor: errors.password ? "#f44336" : undefined
            }}
          />
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

        {/* Campo Confirmar Contraseña */}
        <div style={{ marginBottom: "4px", marginTop: "12px" }}>Confirmar contraseña</div>
        <div className="input-wrapper">
          <input
            type="password"
            placeholder="Repite tu contraseña"
            className={`input-field ${errors.confirmPassword ? "input-error" : ""}`}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            disabled={loading}
            style={{
              borderColor: errors.confirmPassword ? "#f44336" : undefined
            }}
          />
        </div>
        {errors.confirmPassword && (
          <div style={{
            color: "#f44336",
            fontSize: "13px",
            marginTop: "4px",
            marginBottom: "12px"
          }}>
            {errors.confirmPassword}
          </div>
        )}

        <button 
          className="register-button" 
          type="submit" 
          disabled={loading}
          style={{
            marginTop: "16px"
          }}
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
}